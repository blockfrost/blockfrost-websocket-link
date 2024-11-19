import { BlockfrostServerError, Responses } from '@blockfrost/blockfrost-js';
import * as Types from '../types/transactions.js';
import { TxIdsToTransactionsResponse } from '../types/transactions.js';
import { blockfrostAPI } from '../utils/blockfrost-api.js';
import { getAssetData, transformAsset } from './asset.js';
import { assetMetadataLimiter, pLimiter } from './limiter.js';
import { logger } from './logger.js';

export const sortTransactionsCmp = <
  T extends {
    index: number;
    block_height: number;
  },
>(
  a: T,
  b: T,
): number => b.block_height - a.block_height || b.index - a.index;

const fetchTxWithUtxo = async (txHash: string, address: string) => {
  try {
    const tx = await blockfrostAPI.txs(txHash);
    const txUtxo = await blockfrostAPI.txsUtxos(txHash);
    const txData = await transformTransactionData(tx);
    const txUtxos = await transformTransactionUtxo(txUtxo);

    return { txData, txUtxos, address, txHash };
  } catch (error) {
    // WARNING: this will omit txs that returned 404, caller should be well aware of this fact
    if (error instanceof BlockfrostServerError && error.status_code === 404) {
      logger.error(`Fetching tx ${txHash} failed with status code ${error.status_code}`);
      return;
    } else {
      throw error;
    }
  }
};

export const txIdsToTransactions = async (
  txidsPerAddress: {
    address: string;
    txIds: string[];
  }[],
): Promise<Types.TxIdsToTransactionsResponse[]> => {
  if (txidsPerAddress.length === 0) return [];

  const promises: Promise<Types.TxIdsToTransactionsResponse | undefined>[] = [];

  for (const item of txidsPerAddress) {
    for (const txId of item.txIds) {
      promises.push(
        pLimiter.add(() => fetchTxWithUtxo(txId, item.address), { throwOnTimeout: true }),
      );
    }
  }

  // eslint-disable-next-line unicorn/no-await-expression-member
  const result = (await Promise.all(promises)).filter(
    index => index !== undefined,
  ) as Types.TxIdsToTransactionsResponse[];

  const sortedTxs = result.sort((a, b) => sortTransactionsCmp(a.txData, b.txData));

  return sortedTxs;
};

export interface GetTransactionsDetails {
  txId: string;
  cbor?: boolean;
}

export const getTransactionsWithDetails = async (
  txs: GetTransactionsDetails[],
): Promise<Pick<TxIdsToTransactionsResponse, 'txData' | 'txUtxos' | 'txCbor'>[]> => {
  const txsData = await Promise.all(
    txs.map(({ txId }) =>
      pLimiter.add(() => blockfrostAPI.txs(txId).then(data => transformTransactionData(data)), {
        throwOnTimeout: true,
      }),
    ),
  );
  const txsUtxo = await Promise.all(
    txs.map(({ txId }) =>
      pLimiter.add(
        () => blockfrostAPI.txsUtxos(txId).then(data => transformTransactionUtxo(data)),
        { throwOnTimeout: true },
      ),
    ),
  );
  const txsCbors = await Promise.all(
    txs.map(({ txId, cbor }) =>
      cbor
        ? pLimiter.add(() => blockfrostAPI.txsCbor(txId).then(data => data.cbor), {
            throwOnTimeout: true,
          })
        : // eslint-disable-next-line unicorn/no-useless-undefined
          Promise.resolve<undefined>(undefined),
    ),
  );

  return txs.map((_tx, index) => ({
    txData: txsData[index],
    txUtxos: txsUtxo[index],
    txCbor: txsCbors[index],
  }));
};

export const transformTransactionData = async (
  tx: Responses['tx_content'],
): Promise<Types.TransformedTransaction> => {
  const assetsMetadata = await Promise.all(
    tx.output_amount.map(asset =>
      assetMetadataLimiter.add(() => getAssetData(asset.unit), { throwOnTimeout: true }),
    ),
  );

  return {
    ...tx,
    output_amount: tx.output_amount.map((a, index) => transformAsset(a, assetsMetadata[index])),
  };
};

export const transformTransactionUtxo = async (
  utxo: Responses['tx_content_utxo'],
): Promise<Types.TransformedTransactionUtxo> => {
  const assets = new Set<string>();

  for (const input of utxo.inputs) for (const a of input.amount) assets.add(a.unit);
  for (const output of utxo.outputs) for (const a of output.amount) assets.add(a.unit);

  const assetsMetadata = await Promise.all(
    [...assets]
      .filter(asset => asset !== 'lovelace')
      .map(asset => assetMetadataLimiter.add(() => getAssetData(asset), { throwOnTimeout: true })),
  );

  return {
    ...utxo,
    inputs: utxo.inputs.map(index => ({
      ...index,
      amount: index.amount.map(a =>
        transformAsset(
          a,
          assetsMetadata.find(m => m?.asset === a.unit),
        ),
      ),
    })),
    outputs: utxo.outputs.map(o => ({
      ...o,
      amount: o.amount.map(a =>
        transformAsset(
          a,
          assetsMetadata.find(m => m?.asset === a.unit),
        ),
      ),
    })),
  };
};
