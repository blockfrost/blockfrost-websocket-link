import { BlockfrostServerError, Responses } from '@blockfrost/blockfrost-js';
import * as Types from '../types/transactions';
import { TransformedTransaction, TransformedTransactionUtxo } from '../types/transactions';
import { blockfrostAPI } from '../utils/blockfrostAPI';
import { getAssetData, transformAsset } from './asset';
import { pLimiter } from './limiter';
import { logger } from './logger';

export const sortTransactionsCmp = <
  T extends {
    index: number;
    block_height: number;
  },
>(
  a: T,
  b: T,
): number => b.block_height - a.block_height || b.index - a.index;

export const txIdsToTransactions = async (
  txidsPerAddress: {
    address: string;
    data: string[];
  }[],
): Promise<Types.TxIdsToTransactionsResponse[]> => {
  if (txidsPerAddress.length === 0) return [];

  const promisesBundle = txidsPerAddress.flatMap(item =>
    item.data.map(hash =>
      pLimiter.add(async () => {
        try {
          const txData = await transformTransactionData(await blockfrostAPI.txs(hash));
          const txUtxos = await transformTransactionUtxo(await blockfrostAPI.txsUtxos(hash));

          return {
            txData,
            txUtxos,
            address: item.address,
            txHash: hash,
          };
        } catch (error) {
          // WARNING: this will omit txs that returned 404, caller should be well aware of this fact
          if (error instanceof BlockfrostServerError && error.status_code === 404) {
            logger.error(`Fetching tx ${hash} failed with status code ${error.status_code}`);
            return;
          } else {
            throw error;
          }
        }
      }),
    ),
  );

  const result = (await Promise.all(
    promisesBundle.filter(p => p !== undefined),
  )) as Types.TxIdsToTransactionsResponse[];

  const sortedTxs = result.sort((a, b) => sortTransactionsCmp(a.txData, b.txData));

  return sortedTxs;
};

export const getTransactionsWithUtxo = async (
  txids: string[],
): Promise<{ txData: TransformedTransaction; txUtxos: TransformedTransactionUtxo }[]> => {
  const txsData = await Promise.all(
    txids.map(txid =>
      pLimiter.add(() => blockfrostAPI.txs(txid).then(data => transformTransactionData(data))),
    ),
  );
  const txsUtxo = await Promise.all(
    txids.map(txid =>
      pLimiter.add(() => blockfrostAPI.txsUtxos(txid).then(data => transformTransactionUtxo(data))),
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
    tx.output_amount.map(asset => pLimiter.add(() => getAssetData(asset.unit))),
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
      .map(asset => pLimiter.add(() => getAssetData(asset))),
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
