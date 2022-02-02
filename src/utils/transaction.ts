import { Responses } from '@blockfrost/blockfrost-js';
import pLimit from 'p-limit';
import { PROMISE_CONCURRENCY } from '../constants/config';
import * as Types from '../types/transactions';
import { TransformedTransaction, TransformedTransactionUtxo } from '../types/transactions';
import { blockfrostAPI } from '../utils/blockfrostAPI';
import { getAssetFromRegistry, transformAsset } from './asset';

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
  const limit = pLimit(PROMISE_CONCURRENCY);
  const promisesBundle = txidsPerAddress
    .map(item =>
      item.data.map(hash =>
        limit(async () => {
          const txData = await transformTransactionData(await blockfrostAPI.txs(hash));
          const txUtxos = await transformTransactionUtxo(await blockfrostAPI.txsUtxos(hash));
          return {
            txData,
            txUtxos,
            address: item.address,
            txHash: hash,
          };
        }),
      ),
    )
    .flat();

  const result = await Promise.all(promisesBundle);
  // TODO: rollbacked tx could return 404
  // .catch(err => {
  //   if (err instanceof BlockfrostServerError && err.status_code === 404) {
  //     return;
  //   }

  //   throw Error(err);
  // }),

  const sortedTxs = result.sort((a, b) => sortTransactionsCmp(a.txData, b.txData));

  return sortedTxs;
};

export const getTransactionsWithUtxo = async (
  txids: string[],
): Promise<{ txData: TransformedTransaction; txUtxos: TransformedTransactionUtxo }[]> => {
  const limit = pLimit(PROMISE_CONCURRENCY);

  const txsData = await Promise.all(
    txids.map(txid =>
      limit(() => blockfrostAPI.txs(txid).then(data => transformTransactionData(data))),
    ),
  );
  const txsUtxo = await Promise.all(
    txids.map(txid =>
      limit(() => blockfrostAPI.txsUtxos(txid).then(data => transformTransactionUtxo(data))),
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
  const limit = pLimit(PROMISE_CONCURRENCY);

  const assetsMetadata = await Promise.all(
    tx.output_amount.map(asset => limit(() => getAssetFromRegistry(asset.unit))),
  );
  return {
    ...tx,
    output_amount: tx.output_amount.map((a, index) => transformAsset(a, assetsMetadata[index])),
  };
};

export const transformTransactionUtxo = async (
  utxo: Responses['tx_content_utxo'],
): Promise<Types.TransformedTransactionUtxo> => {
  const limit = pLimit(10);
  const assets = new Set<string>();
  utxo.inputs.forEach(input => input.amount.forEach(a => assets.add(a.unit)));
  utxo.outputs.forEach(output => output.amount.forEach(a => assets.add(a.unit)));

  const assetsMetadata = await Promise.all(
    Array.from(assets)
      .filter(asset => asset !== 'lovelace')
      .map(asset => limit(() => blockfrostAPI.assetsById(asset))),
  );

  return {
    ...utxo,
    inputs: utxo.inputs.map(i => ({
      ...i,
      amount: i.amount.map(a => transformAsset(a, assetsMetadata.find(m => m.asset === a.unit)!)),
    })),
    outputs: utxo.outputs.map(o => ({
      ...o,
      amount: o.amount.map(a =>
        transformAsset(
          a,
          assetsMetadata.find(m => m.asset === a.unit),
        ),
      ),
    })),
  };
};
