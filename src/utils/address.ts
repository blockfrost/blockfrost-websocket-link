import { ADDRESS_GAP_LIMIT } from '../constants/config.js';
import * as Addresses from '../types/address.js';
import { blockfrostAPI } from '../utils/blockfrost-api.js';
import {
  BlockfrostServerError,
  deriveAddress as sdkDeriveAddress,
  Responses,
} from '@blockfrost/blockfrost-js';
import memoizee from 'memoizee';
import { getAssetData, transformAsset } from './asset.js';
import { limiter } from './limiter.js';

export const deriveAddress = (
  publicKey: string,
  type: number,
  addressIndex: number,
  isTestnet: boolean,
): { address: string; path: string } => {
  const { address } = sdkDeriveAddress(
    publicKey,
    type,
    addressIndex,
    isTestnet ? 'preview' : 'mainnet',
  );
  const purpose = 1852;

  return {
    address: address,
    path: `m/${purpose}'/1815'/i'/${type}/${addressIndex}`,
  };
};

export const memoizedDeriveAddress = memoizee(deriveAddress, {
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

    for (let index = 0; index < ADDRESS_GAP_LIMIT; index++) {
      const { address, path } = memoizedDeriveAddress(
        publicKey,
        type,
        index,
        blockfrostAPI.options.network !== 'mainnet',
      );

      addresses.push({ address, path });
    }
    return addresses.map(addr => ({ address: addr.address, data: 'empty', path: addr.path }));
  }

  let lastEmptyCount = 0;
  let addressCount = 0;

  const result: Addresses.Address[] = [];

  while (lastEmptyCount < ADDRESS_GAP_LIMIT) {
    const promisesBundle: Addresses.Bundle = [];

    for (let index = 0; index < ADDRESS_GAP_LIMIT; index++) {
      const { address, path } = memoizedDeriveAddress(
        publicKey,
        type,
        addressCount,
        blockfrostAPI.options.network !== 'mainnet',
      );

      addressCount++;
      const promise = limiter(() => blockfrostAPI.addresses(address));

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
    // eslint-disable-next-line unicorn/prefer-at
    const path1 = Number.parseInt(item1.path.split('/').slice(-1)[0], 10);
    // eslint-disable-next-line unicorn/prefer-at
    const path2 = Number.parseInt(item2.path.split('/').slice(-1)[0], 10);

    return path1 - path2;
  });

  return sortedResult;
};

export const addressesToUtxos = async (
  addresses: { address: string; path: string; data: Responses['address_content'] | 'empty' }[],
): Promise<{ address: string; path: string; data: Addresses.TransformedUtxo[] | 'empty' }[]> => {
  const promises = addresses.map(item =>
    item.data === 'empty'
      ? []
      : limiter(() =>
          // change batchSize to fetch only 1 page at a time (each page has 100 utxos)
          blockfrostAPI.addressesUtxosAll(item.address, { batchSize: 1 }).catch(error => {
            if (error instanceof BlockfrostServerError && error.status_code === 404) {
              return [];
            } else {
              throw error;
            }
          }),
        ),
  );

  const allUtxos = await Promise.all(promises);

  const assets = new Set<string>();

  for (const addressUtxos of allUtxos) {
    for (const utxo of addressUtxos) {
      for (const a of utxo.amount) {
        if (a.unit !== 'lovelace') {
          assets.add(a.unit);
        }
      }
    }
  }

  const tokenMetadata = await Promise.all([...assets].map(a => getAssetData(a)));

  return addresses.map((addr, index) => ({
    address: addr.address,
    data: allUtxos[index].map(utxo => ({
      ...utxo,
      amount: utxo.amount.map(asset =>
        transformAsset(
          asset,
          tokenMetadata.find(m => m?.asset),
        ),
      ),
    })),
    path: addr.path,
  }));
};

export const utxosWithBlocks = async (
  utxos: Addresses.UtxosWithBlocksParameters,
): Promise<Addresses.UtxosWithBlockResponse[]> => {
  const promisesBundle: Promise<Addresses.UtxosWithBlockResponse>[] = [];

  for (const utxo of utxos) {
    if (utxo.data === 'empty') {
      continue;
    }

    for (const utxoData of utxo.data) {
      const promise = limiter(() =>
        blockfrostAPI.blocks(utxoData.block).then(blockData => ({
          address: utxo.address,
          path: utxo.path,
          utxoData: utxoData,
          blockInfo: blockData,
        })),
      );

      promisesBundle.push(promise);
    }
  }

  const result = await Promise.all(promisesBundle);

  return result;
};

export const addressesToTxIds = async (
  addresses: Addresses.Address[],
): Promise<{ address: string; data: Responses['address_transactions_content'] }[]> => {
  const promisesBundle: Promise<{
    address: string;
    data: Responses['address_transactions_content'];
  }>[] = [];

  for (const { address, data: status } of addresses) {
    if (status === 'empty') {
      continue;
    }

    const promise = limiter(() =>
      // 1 page (100 txs) per address at a time should be more efficient default value
      // compared to fetching 10 pages (1000 txs) per address
      blockfrostAPI
        .addressesTransactionsAll(address, { batchSize: 1 })
        .then(data => ({ address, data }))
        .catch(error => {
          if (error instanceof BlockfrostServerError && error.status_code === 404) {
            return { address, data: [] };
          } else {
            throw error;
          }
        }),
    );

    promisesBundle.push(promise);
  }

  const result = await Promise.all(promisesBundle);

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
    limiter(() =>
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
          throw new Error(error);
        }
      }),
    ),
  );
  const responses = await Promise.all(promises);

  return addresses.map(addr => {
    const response = responses.find(r => r.address === addr.address);

    if (!response) {
      throw new Error('Failed getAddressData');
    }

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
    const stakeAddressData = await limiter(() => blockfrostAPI.accounts(stakeAddress));
    const { drep_id } = stakeAddressData;
    const drepData = drep_id
      ? await limiter(() => blockfrostAPI.governance.drepsById(drep_id))
      : null;

    return {
      rewards: stakeAddressData.withdrawable_amount,
      isActive: stakeAddressData.active,
      poolId: stakeAddressData.pool_id,
      drep: drepData,
    };
  } catch (error) {
    if (error instanceof BlockfrostServerError && error.status_code === 404) {
      return {
        rewards: '0',
        isActive: false,

        poolId: null,
        drep: null,
      };
    }
    throw error;
  }
};

export const getStakingAccountTotal = async (
  stakeAddress: string,
): Promise<Responses['account_addresses_total']> => {
  try {
    const total = await limiter(() => blockfrostAPI.accountsAddressesTotal(stakeAddress));

    return total;
  } catch (error) {
    if (error instanceof BlockfrostServerError && error.status_code === 404) {
      return {
        stake_address: stakeAddress,
        received_sum: [],
        sent_sum: [],
        tx_count: 0,
      };
    }
    throw error;
  }
};
