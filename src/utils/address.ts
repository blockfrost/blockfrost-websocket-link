import { ADDRESS_GAP_LIMIT } from '../constants';
import * as Addresses from '../types/address';
import { blockfrostAPI } from '../utils/blockfrostAPI';
import { Responses } from '@blockfrost/blockfrost-js';
import BigNumber from 'bignumber.js';
import {
  Bip32PublicKey,
  BaseAddress,
  NetworkInfo,
  RewardAddress,
  StakeCredential,
} from '@emurgo/cardano-serialization-lib-nodejs';

export const deriveAddress = (
  publicKey: string,
  addressIndex: number,
  type: number,
): { address: string; path: string } => {
  const networkId = blockfrostAPI.apiUrl.includes('mainnet')
    ? NetworkInfo.mainnet().network_id()
    : NetworkInfo.testnet().network_id();

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

export const deriveStakeAddress = (publicKey: string): string => {
  const accountKey = Bip32PublicKey.from_bytes(Buffer.from(publicKey, 'hex'));
  const stakeKey = accountKey.derive(2).derive(0);
  const rewardAddr = RewardAddress.new(
    NetworkInfo.mainnet().network_id(),
    StakeCredential.from_keyhash(stakeKey.to_raw_key().hash()),
  )
    .to_address()
    .to_bech32();

  return rewardAddr;
};

export const discoverAddresses = async (
  publicKey: string,
  type: Addresses.Type,
): Promise<Addresses.Result[]> => {
  let addressDiscoveredCount = 0;
  let lastEmptyCount = 0;
  let addressCount = 0;

  const result: Addresses.Result[] = [];

  while (lastEmptyCount < ADDRESS_GAP_LIMIT) {
    const promisesBundle: Addresses.Bundle = [];

    for (let i = addressDiscoveredCount; i < addressDiscoveredCount + ADDRESS_GAP_LIMIT; i++) {
      const { address, path } = deriveAddress(publicKey, addressCount, type);
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
              console.log('error', error);
              console.log('error JSON.stringify', JSON.stringify(error));
            }
          }),
      ),
    );

    addressDiscoveredCount++;
  }

  const sortedResult = result.sort((item1, item2) => {
    const path1 = parseInt(item1.path.split('/').slice(-1)[0], 10);
    const path2 = parseInt(item2.path.split('/').slice(-1)[0], 10);

    return path1 - path2;
  });

  return sortedResult;
};

export const addressesToBalances = async (
  addresses: { address: string; data: Responses['address_content'] | 'empty' }[],
): Promise<Addresses.Balance[]> => {
  const balances: Addresses.Balance[] = [];

  addresses.map(address => {
    const addressData = address.data;
    if (addressData === 'empty') return;

    addressData.amount.map(amountItem => {
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
): Promise<
  { address: string; path: string; data: Responses['address_utxo_content'] | 'empty' }[]
> => {
  const promisesBundle: {
    address: string;
    path: string;
    promise: Promise<Responses['address_utxo_content']>;
  }[] = [];

  const result: {
    address: string;
    path: string;
    data: Responses['address_utxo_content'] | 'empty';
  }[] = [];

  addresses.map(item => {
    if (item.data === 'empty') return;

    const promise = blockfrostAPI.addressesUtxosAll(item.address);
    promisesBundle.push({ address: item.address, path: item.path, promise });
  });

  await Promise.all(
    promisesBundle.map(p =>
      p.promise
        .then(data => {
          result.push({ address: p.address, data, path: p.path });
        })
        .catch(error => {
          console.log(error);
          console.log('error JSON.stringify', JSON.stringify(error));
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
    promise: Promise<Responses['address_txs_content']>;
  }[] = [];

  addresses.map(item => {
    if (item.data === 'empty') return;

    const promise = blockfrostAPI.addressesTxs(item.address, {
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
          console.log(error);
          console.log('error JSON.stringify', JSON.stringify(error));
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

  utxos.map(utxo => {
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
          console.log(error);
          console.log('error JSON.stringify', JSON.stringify(error));
        }),
    ),
  );

  return result;
};

export const addressesToTxIds = async (
  addresses: Addresses.Result[],
): Promise<{ address: string; data: string[] }[]> => {
  const promisesBundle: {
    address: string;
    promise: Promise<string[]>;
  }[] = [];

  addresses.map(item => {
    if (item.data === 'empty') return;

    const promise = blockfrostAPI.addressesTxsAll(item.address);
    promisesBundle.push({ address: item.address, promise });
  });

  const result: { address: string; data: string[] }[] = [];

  await Promise.all(
    promisesBundle.map(p =>
      p.promise
        .then(data => {
          result.push({ address: p.address, data });
        })
        .catch(error => {
          console.log(error);
          console.log('error JSON.stringify', JSON.stringify(error));
        }),
    ),
  );

  return result;
};

export const getAddressesData = async (
  addresses: Addresses.Result[],
): Promise<Addresses.AddressData[]> => {
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
