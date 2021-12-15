import { Responses } from '@blockfrost/blockfrost-js';
import * as Types from '../types/transactions';
import { blockfrostAPI } from '../utils/blockfrostAPI';
import { transformAsset } from './asset';

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
  const promisesBundle: Types.TxIdsToTransactionsPromises[] = [];
  const result: Types.TxIdsToTransactionsResponse[] = [];

  if (txidsPerAddress.length === 0) return [];

  txidsPerAddress.forEach(item => {
    item.data.forEach(hash => {
      const promise = new Promise<Types.Data>((resolve, reject) => {
        (async () => {
          try {
            const tx = await blockfrostAPI.txs(hash);
            const txUtxos = await blockfrostAPI.txsUtxos(hash);

            return resolve({
              txData: tx,
              txUtxos,
            });
          } catch (err) {
            return reject(err);
          }
        })();
      });

      promisesBundle.push({
        address: item.address,
        promise,
        txHash: hash,
      });
    });
  });

  await Promise.all(
    promisesBundle.map(p =>
      p.promise
        .then(data => {
          result.push({
            address: p.address,
            txData: {
              ...data.txData,
              output_amount: data.txData.output_amount.map(asset => transformAsset(asset)),
            },
            txUtxos: {
              ...data.txUtxos,
              inputs: data.txUtxos.inputs.map(input => ({
                ...input,
                amount: input.amount.map(asset => transformAsset(asset)),
              })),
              outputs: data.txUtxos.outputs.map(output => ({
                ...output,
                amount: output.amount.map(asset => transformAsset(asset)),
              })),
            },
            txHash: p.txHash,
          });
        })
        .catch(err => {
          if (err.status === 404) {
            return;
          }

          throw Error(err);
        }),
    ),
  );

  const sortedTxs = result.sort((a, b) => sortTransactionsCmp(a.txData, b.txData));

  return sortedTxs;
};

export const getTransactionsWithUtxo = async (
  txids: string[],
): Promise<{ txData: Responses['tx_content']; txUtxos: Responses['tx_content_utxo'] }[]> => {
  const result: { txData: Responses['tx_content']; txUtxos: Responses['tx_content_utxo'] }[] = [];

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

    const partialResults = txResults.map((tx, i) => ({
      txData: tx,
      txUtxos: txUtxoResults[i],
    }));
    result.push(...partialResults);
  }

  return result;
};
