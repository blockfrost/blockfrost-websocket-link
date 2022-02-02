import { Responses } from '@blockfrost/blockfrost-js';
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

  const promisesBundle = txidsPerAddress
    .map(item =>
      item.data.map(hash => {
        return new Promise<Types.TxIdsToTransactionsResponse>((resolve, reject) => {
          (async () => {
            try {
              const txData = await transformTransactionData(await blockfrostAPI.txs(hash));
              const txUtxos = await transformTransactionUtxo(await blockfrostAPI.txsUtxos(hash));

              return resolve({
                txData,
                txUtxos,
                address: item.address,
                txHash: hash,
              });
            } catch (err) {
              return reject(err);
            }
          })();
        });
      }),
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
  const result: { txData: TransformedTransaction; txUtxos: TransformedTransactionUtxo }[] = [];

  const getPromiseBundle = (startIndex: number, batchSize: number) => {
    const promises = [...Array.from({ length: batchSize }).keys()].map(i => {
      const txid = txids[startIndex + i];
      return txid
        ? { txUtxoPromise: blockfrostAPI.txsUtxos(txid), txPromise: blockfrostAPI.txs(txid) }
        : undefined;
    });
    return promises.filter(p => Boolean(p)) as unknown as {
      txPromise: Responses['tx_content'];
      txUtxoPromise: Responses['tx_content_utxo'];
    }[];
  };

  const batch_size = 10;
  for (let i = 0; i < txids.length; i += batch_size) {
    const promiseSlice = getPromiseBundle(i, batch_size);

    // eslint-disable-next-line no-await-in-loop
    const txResults = await Promise.all(promiseSlice.map(p => p?.txPromise));
    const txUtxoResults = await Promise.all(promiseSlice.map(p => p?.txUtxoPromise));

    const partialResultsPromises = txResults.map(async (tx, i) => ({
      txData: await transformTransactionData(tx),
      txUtxos: await transformTransactionUtxo(txUtxoResults[i]),
    }));
    const partialResults = await Promise.all(partialResultsPromises);
    result.push(...partialResults);
  }

  return result;
};

export const transformTransactionData = async (
  tx: Responses['tx_content'],
): Promise<Types.TransformedTransaction> => {
  const assetsMetadata = await Promise.all(
    tx.output_amount.map(asset => getAssetFromRegistry(asset.unit)),
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
  utxo.inputs.forEach(input => input.amount.forEach(a => assets.add(a.unit)));
  utxo.outputs.forEach(output => output.amount.forEach(a => assets.add(a.unit)));

  const assetsMetadata = await Promise.all(
    Array.from(assets)
      .filter(asset => asset !== 'lovelace')
      .map(asset => blockfrostAPI.assetsById(asset)),
  );

  return {
    ...utxo,
    inputs: utxo.inputs.map(i => ({
      ...i,
      amount: i.amount.map(a => transformAsset(a, assetsMetadata.find(m => m.asset === a.unit)!)),
    })),
    outputs: utxo.outputs.map(o => ({
      ...o,
      amount: o.amount.map(a => transformAsset(a, assetsMetadata.find(m => m.asset === a.unit)!)),
    })),
  };
};
