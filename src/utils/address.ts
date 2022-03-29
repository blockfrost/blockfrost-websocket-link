import { ADDRESS_GAP_LIMIT } from '../constants/config';
import * as Addresses from '../types/address';
import { blockfrostAPI } from '../utils/blockfrostAPI';
import {
  BlockfrostServerError,
  deriveAddress as sdkDeriveAddress,
  Responses,
} from '@blockfrost/blockfrost-js';
import memoizee from 'memoizee';
import { getAssetData, transformAsset } from './asset';
import { logger } from './logger';
import { assetMetadataLimiter, pLimiter } from './limiter';

export const deriveAddress = (
  publicKey: string,
  type: number,
  addressIndex: number,
  isTestnet: boolean,
): { address: string; path: string } => {
  const { address } = sdkDeriveAddress(publicKey, type, addressIndex, isTestnet);
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
    for (let i = 0; i < ADDRESS_GAP_LIMIT; i++) {
      const { address, path } = memoizedDeriveAddress(
        publicKey,
        type,
        i,
        !!blockfrostAPI.options.isTestnet,
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

    for (let i = 0; i < ADDRESS_GAP_LIMIT; i++) {
      const { address, path } = memoizedDeriveAddress(
        publicKey,
        type,
        addressCount,
        !!blockfrostAPI.options.isTestnet,
      );
      addressCount++;
      const promise = pLimiter.add(() => blockfrostAPI.addresses(address));
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

export const addressesToUtxos = async (
  addresses: { address: string; path: string; data: Responses['address_content'] | 'empty' }[],
): Promise<{ address: string; path: string; data: Addresses.TransformedUtxo[] | 'empty' }[]> => {
  const promises = addresses.map(item =>
    item.data === 'empty'
      ? []
      : pLimiter.add(() =>
          // change batchSize to fetch only 1 page at a time (each page has 100 utxos)
          blockfrostAPI.addressesUtxosAll(item.address, { batchSize: 1 }).catch(err => {
            if (err instanceof BlockfrostServerError && err.status_code === 404) {
              return [];
            } else {
              throw err;
            }
          }),
        ),
  );

  const allUtxos = await Promise.all(promises);

  const assets = new Set<string>();
  allUtxos.forEach(addressUtxos =>
    addressUtxos.forEach(utxo =>
      utxo.amount.forEach(a => (a.unit !== 'lovelace' ? assets.add(a.unit) : undefined)),
    ),
  );

  const tokenMetadata = await Promise.all(
    Array.from(assets).map(a => assetMetadataLimiter.add(() => getAssetData(a))),
  );

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
  utxos: Addresses.UtxosWithBlocksParams,
): Promise<Addresses.UtxosWithBlockResponse[]> => {
  const promisesBundle: Promise<Addresses.UtxosWithBlockResponse>[] = [];

  for (const utxo of utxos) {
    if (utxo.data === 'empty') continue;

    for (const utxoData of utxo.data) {
      const promise = pLimiter.add(() =>
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

  for (const item of addresses) {
    if (item.data === 'empty') continue;

    const promise = pLimiter.add(() =>
      // 1 page (100 txs) per address at a time should be more efficient default value
      // compared to fetching 10 pages (1000 txs) per address
      blockfrostAPI
        .addressesTransactionsAll(item.address, { batchSize: 1 })
        .then(data => ({
          address: item.address,
          data,
        }))
        .catch(error => {
          if (error instanceof BlockfrostServerError && error.status_code === 404) {
            return {
              address: item.address,
              data: [],
            };
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
    pLimiter.add(() =>
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
    ),
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

export const getAffectedAddresses = async (
  blockHeight: number | null,
): Promise<Responses['block_content_addresses']> => {
  if (blockHeight === null) {
    throw new Error('Cannot fetch block transactions. Invalid block height.');
  }
  try {
    const addresses = await blockfrostAPI.blocksAddressesAll(blockHeight, { batchSize: 2 });
    return addresses;
  } catch (error) {
    if (error instanceof BlockfrostServerError && error.status_code === 404) {
      logger.warn(`Failed to fetch addresses for a block ${blockHeight}. Block not found.`);
    }
    throw error;
  }
};
