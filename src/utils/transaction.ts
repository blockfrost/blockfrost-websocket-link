import { BlockfrostServerError, Responses } from '@blockfrost/blockfrost-js';
import * as Types from '../types/transactions.js';
import { TransformedTransaction, TransformedTransactionUtxo } from '../types/transactions.js';
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

    return {
      txData,
      txUtxos,
      address: address,
      txHash: txHash,
    };
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
    data: string[];
  }[],
): Promise<Types.TxIdsToTransactionsResponse[]> => {
  if (txidsPerAddress.length === 0) return [];

  const promises: Promise<Types.TxIdsToTransactionsResponse | undefined>[] = [];

  for (const item of txidsPerAddress) {
    for (const tx of item.data) {
      promises.push(
        pLimiter.add(() => fetchTxWithUtxo(tx, item.address), { throwOnTimeout: true }),
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

export const getTransactionsWithUtxo = async (
  txids: string[],
): Promise<{ txData: TransformedTransaction; txUtxos: TransformedTransactionUtxo }[]> => {
  const txsData = await Promise.all(
    txids.map(txid =>
      pLimiter.add(() => blockfrostAPI.txs(txid).then(data => transformTransactionData(data)), {
        throwOnTimeout: true,
      }),
    ),
  );
  const txsUtxo = await Promise.all(
    txids.map(txid =>
      pLimiter.add(
        () => blockfrostAPI.txsUtxos(txid).then(data => transformTransactionUtxo(data)),
        { throwOnTimeout: true },
      ),
    ),
  );

  return txids.map((_txid, index) => ({
    txData: txsData[index],
    txUtxos: txsUtxo[index],
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
