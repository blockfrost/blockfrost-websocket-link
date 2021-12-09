import { ADDRESS_GAP_LIMIT } from '../constants';
import * as Addresses from '../types/address';
import { getNetworkId } from '../utils/common';
import { blockfrostAPI } from '../utils/blockfrostAPI';
import { BlockfrostServerError, Responses } from '@blockfrost/blockfrost-js';
import BigNumber from 'bignumber.js';
import memoizee from 'memoizee';
import {
  Bip32PublicKey,
  BaseAddress,
  RewardAddress,
  StakeCredential,
} from '@emurgo/cardano-serialization-lib-nodejs';
import { transformAsset } from './asset';

const deriveAddress = (
  publicKey: string,
  addressIndex: number,
  type: number,
): { address: string; path: string } => {
  const networkId = getNetworkId();
  const accountKey = Bip32PublicKey.from_bytes(Buffer.from(publicKey, 'hex'));
  const utxoPubKey = accountKey.derive(type).derive(addressIndex);
  const stakeKey = accountKey.derive(2).derive(0);
  const baseAddr = BaseAddress.new(
    networkId,
    StakeCredential.from_keyhash(utxoPubKey.to_raw_key().hash()),
    StakeCredential.from_keyhash(stakeKey.to_raw_key().hash()),
  );

  return {
    address: baseAddr.to_address().to_bech32(),
    path: `m/1852'/1815'/i'/${type}/${addressIndex}`,
  };
};

export const memoizedDeriveAddress = memoizee(deriveAddress, {
  maxAge: 30 * 60 * 1000, // 30 mins
  primitive: true,
});

const deriveStakeAddress = (publicKey: string): string => {
  const accountKey = Bip32PublicKey.from_bytes(Buffer.from(publicKey, 'hex'));
  const networkId = getNetworkId();
  const stakeKey = accountKey.derive(2).derive(0);
  const rewardAddr = RewardAddress.new(
    networkId,
    StakeCredential.from_keyhash(stakeKey.to_raw_key().hash()),
  )
    .to_address()
    .to_bech32();

  return rewardAddr;
};

export const memoizedDeriveStakeAddress = memoizee(deriveStakeAddress, {
  maxAge: 30 * 60 * 1000, // 30 mins
  primitive: true,
});

export const discoverAddresses = async (
  publicKey: string,
  type: Addresses.Type,
  accountEmpty?: boolean,
): Promise<Addresses.Address[]> => {
  if (accountEmpty) {
    // just derive first ADDRESS_GAP_LIMIT and treat them as empty addresses
    const addresses: { address: string; path: string }[] = [];
    for (let i = 0; i < ADDRESS_GAP_LIMIT; i++) {
      const { address, path } = memoizedDeriveAddress(publicKey, i, type);
      addresses.push({ address, path });
    }
    return addresses.map(addr => ({ address: addr.address, data: 'empty', path: addr.path }));
  }

  let lastEmptyCount = 0;
  let addressCount = 0;

  const result: Addresses.Address[] = [];

  while (lastEmptyCount < ADDRESS_GAP_LIMIT) {
    const promisesBundle: Addresses.Bundle = [];

    for (let i = 0; i < ADDRESS_GAP_LIMIT; i++) {
      const { address, path } = memoizedDeriveAddress(publicKey, addressCount, type);
      addressCount++;
      const promise = blockfrostAPI.addresses(address);
      promisesBundle.push({ address, promise, path });
    }

    await Promise.all(
      promisesBundle.map(p =>
        p.promise
          .then(data => {
            result.push({ address: p.address, path: p.path, data });
            lastEmptyCount = 0;
          })
          .catch(error => {
            lastEmptyCount++;
            if (error.status_code === 404) {
              result.push({ address: p.address, data: 'empty', path: p.path });
            } else {
              throw error;
            }
          }),
      ),
    );
  }

  const sortedResult = result.sort((item1, item2) => {
    const path1 = parseInt(item1.path.split('/').slice(-1)[0], 10);
    const path2 = parseInt(item2.path.split('/').slice(-1)[0], 10);

    return path1 - path2;
  });

  return sortedResult;
};

export const addressesToBalances = (
  addresses: { address: string; data: Responses['address_content'] | 'empty' }[],
): Addresses.Balance[] => {
  const balances: Addresses.Balance[] = [];

  addresses.forEach(address => {
    const addressData = address.data;
    if (addressData === 'empty') return;

    addressData.amount.forEach(amountItem => {
      if (amountItem.quantity && amountItem.unit) {
        const balanceRow = balances.find(balanceResult => balanceResult.unit === amountItem.unit);

        if (!balanceRow) {
          balances.push({
            unit: amountItem.unit,
            quantity: amountItem.quantity,
          });
        } else {
          balanceRow.quantity = new BigNumber(balanceRow.quantity)
            .plus(amountItem.quantity)
            .toString();
        }
      }
    });
  });

  return balances;
};
export const addressesToUtxos = async (
  addresses: { address: string; path: string; data: Responses['address_content'] | 'empty' }[],
): Promise<{ address: string; path: string; data: Addresses.TransformedUtxo[] | 'empty' }[]> => {
  const promisesBundle: {
    address: string;
    path: string;
    promise: Promise<Responses['address_utxo_content']>;
  }[] = [];

  const result: {
    address: string;
    path: string;
    data: Addresses.TransformedUtxo[] | 'empty';
  }[] = [];

  addresses.forEach(item => {
    if (item.data === 'empty') return;

    const promise = blockfrostAPI.addressesUtxosAll(item.address);
    promisesBundle.push({ address: item.address, path: item.path, promise });
  });

  await Promise.all(
    promisesBundle.map(p =>
      p.promise
        .then(data => {
          result.push({
            address: p.address,
            data: data.map(utxo => ({
              ...utxo,
              amount: utxo.amount.map(asset => transformAsset(asset)),
            })),
            path: p.path,
          });
        })
        .catch(error => {
          throw error;
        }),
    ),
  );

  return result;
};

export const isAccountEmpty = async (
  addresses: { address: string; data: Responses['address_content'] | 'empty' }[],
): Promise<boolean> => {
  const promisesBundle: {
    address: string;
    promise: Promise<Responses['address_transactions_content']>;
  }[] = [];

  addresses.forEach(item => {
    if (item.data === 'empty') return;

    const promise = blockfrostAPI.addressesTransactions(item.address, {
      page: 1,
      count: 1,
    });
    promisesBundle.push({ address: item.address, promise });
  });

  const result = await Promise.all(
    promisesBundle.map(p =>
      p.promise
        .then(data => {
          return data;
        })
        .catch(error => {
          throw error;
        }),
    ),
  );

  return result.flat().length === 0;
};

export const utxosWithBlocks = async (
  utxos: Addresses.UtxosWithBlocksParams,
): Promise<Addresses.UtxosWithBlockResponse[]> => {
  const promisesBundle: Addresses.UtxosWithBlocksBundle[] = [];
  const result: Addresses.UtxosWithBlockResponse[] = [];

  utxos.forEach(utxo => {
    if (utxo.data === 'empty') return;

    utxo.data.map(utxoData => {
      const promise = blockfrostAPI.blocks(utxoData.block);
      promisesBundle.push({ address: utxo.address, path: utxo.path, utxoData, promise });
    });
  });

  await Promise.all(
    promisesBundle.map(p =>
      p.promise
        .then(data => {
          result.push({
            address: p.address,
            path: p.path,
            utxoData: p.utxoData,
            blockInfo: data,
          });
        })
        .catch(error => {
          throw error;
        }),
    ),
  );

  return result;
};

export const addressesToTxIds = async (
  addresses: Addresses.Address[],
): Promise<{ address: string; data: Responses['address_transactions_content'] }[]> => {
  const promisesBundle: {
    address: string;
    promise: Promise<Responses['address_transactions_content']>;
  }[] = [];

  addresses.forEach(item => {
    if (item.data === 'empty') return;

    const promise = blockfrostAPI.addressesTransactionsAll(item.address);
    promisesBundle.push({ address: item.address, promise });
  });

  const result: {
    address: string;
    data: Responses['address_transactions_content'];
  }[] = [];

  await Promise.all(
    promisesBundle.map(p =>
      p.promise
        .then(data => {
          result.push({ address: p.address, data });
        })
        .catch(error => {
          throw error;
        }),
    ),
  );

  return result;
};

export const getAddressesData = async (
  addresses: Addresses.Address[],
  emptyAccount?: boolean,
): Promise<Addresses.AddressData[]> => {
  if (emptyAccount) {
    return addresses.map(addr => ({
      address: addr.address,
      path: addr.path,
      transfers: 0,
      received: '0',
      sum: '0',
    }));
  }
  const promises = addresses.map(addr =>
    blockfrostAPI.addressesTotal(addr.address).catch(error => {
      if (error.status_code === 404) {
        return {
          address: addr.address,
          path: addr.path,
          tx_count: 0,
          received_sum: [{ unit: 'lovelace', quantity: '0' }],
          sent_sum: [{ unit: 'lovelace', quantity: '0' }],
        };
      } else {
        throw Error(error);
      }
    }),
  );
  const responses = await Promise.all(promises);
  return addresses.map(addr => {
    const response = responses.find(r => r.address === addr.address);
    if (!response) throw Error('Failed getAddressData');

    return {
      address: addr.address,
      path: addr.path,
      transfers: response.tx_count,
      received: response.received_sum.find(b => b.unit === 'lovelace')?.quantity ?? '0',
      sent: response.sent_sum.find(b => b.unit === 'lovelace')?.quantity ?? '0',
    };
  });
};

export const getStakingData = async (stakeAddress: string): Promise<Addresses.StakingData> => {
  try {
    const stakeAddressData = await blockfrostAPI.accounts(stakeAddress);
    return {
      rewards: stakeAddressData.withdrawable_amount,
      isActive: stakeAddressData.active,
      poolId: stakeAddressData.pool_id,
    };
  } catch (error) {
    if (error instanceof BlockfrostServerError) {
      if (error.status_code === 404) {
        return {
          rewards: '0',
          isActive: false,
          poolId: null,
        };
      }
    }
    throw error;
  }
};

export const getStakingAccountTotal = async (
  stakeAddress: string,
): Promise<Responses['account_addresses_total']> => {
  try {
    const total = await blockfrostAPI.accountsAddressesTotal(stakeAddress);
    return total;
  } catch (error) {
    if (error instanceof BlockfrostServerError) {
      if (error.status_code === 404) {
        return {
          stake_address: stakeAddress,
          received_sum: [],
          sent_sum: [],
          tx_count: 0,
        };
      }
    }
    throw error;
  }
};

export const filterUtxoByAddress = (addresses: string[], utxos: Responses['tx_content_utxo'][]) => {
  // Returns utxos that contain given addresses in their inputs or outputs
  const result: { address: string; utxo: Responses['tx_content_utxo'] }[] = [];

  for (const utxo of utxos) {
    const inputAddresses = utxo.inputs.map(i => i.address);
    const outputAddresses = utxo.outputs.map(o => o.address);
    const utxoAddresses = [...inputAddresses, ...outputAddresses];

    for (const utxoAddress of utxoAddresses) {
      if (addresses.includes(utxoAddress)) {
        result.push({ address: utxoAddress, utxo });
      }
    }
  }
  return result;
};
