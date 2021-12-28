import { BlockfrostServerError, Responses } from '@blockfrost/blockfrost-js';
import { redisCache } from '../services/redis';
import * as Types from '../types/transactions';
import { TransformedTransaction, TransformedTransactionUtxo } from '../types/transactions';
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
  options?: {
    cache?: boolean;
  },
): Promise<Types.TxIdsToTransactionsResponse[]> => {
  const promisesBundle: Types.TxIdsToTransactionsPromises[] = [];
  const result: Types.TxIdsToTransactionsResponse[] = [];

  if (txidsPerAddress.length === 0) return [];

  txidsPerAddress.forEach(item => {
    item.data.forEach(hash => {
      const promise = new Promise<Types.Data>((resolve, reject) => {
        (async () => {
          try {
            if (options?.cache) {
              // try to retrieve cached tx
              const tx = await redisCache.getTransaction(hash);
              if (tx) {
                console.log(`Retrieving tx ${tx.txHash} from cache`);
                return resolve({
                  txData: tx.txData,
                  txUtxos: tx.txUtxos,
                  fromCache: true,
                });
              }
            }

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
          if (data.fromCache) {
            // cached tx is already transformed
            result.push({
              address: p.address,
              txData: data.txData,
              txUtxos: data.txUtxos,
              txHash: p.txHash,
            });
          } else {
            const tx = {
              address: p.address,
              txData: transformTransaction(data.txData),
              txUtxos: transformTransactionUtxo(data.txUtxos),
              txHash: p.txHash,
            };
            result.push(tx);

            if (options?.cache) {
              // cache tx
              redisCache.storeTransaction(tx);
            }
          }
        })
        .catch(err => {
          if (err instanceof BlockfrostServerError && err.status_code === 404) {
            console.log(`Tx ${p.txHash} not found.`);
          }

          throw err;
        }),
    ),
  );

  const sortedTxs = result.sort((a, b) => sortTransactionsCmp(a.txData, b.txData));

  return sortedTxs;
};

export const getTransactionsWithUtxo = async (
  txids: string[],
  options?: {
    cache?: boolean;
  },
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

    const partialResults = txResults.map((tx, i) => ({
      txData: transformTransaction(tx),
      txUtxos: transformTransactionUtxo(txUtxoResults[i]),
    }));
    result.push(...partialResults);
  }

  // TODO: we could also try to retrieve tx from a cache before fetching, but right know this function
  // is used only to fetch new txs that are sent via notification on new block
  if (options?.cache) {
    // cache tx
    for (const tx of result) {
      redisCache.storeTransaction({ ...tx, txHash: tx.txData.hash });
    }
  }

  return result;
};

export const transformTransaction = (tx: Responses['tx_content']): TransformedTransaction => {
  return {
    ...tx,
    output_amount: tx.output_amount.map(a => transformAsset(a)),
  };
};

export const transformTransactionUtxo = (
  utxo: Responses['tx_content_utxo'],
): TransformedTransactionUtxo => {
  return {
    ...utxo,
    inputs: utxo.inputs.map(i => ({
      ...i,
      amount: i.amount.map(a => transformAsset(a)),
    })),
    outputs: utxo.outputs.map(o => ({
      ...o,
      amount: o.amount.map(a => transformAsset(a)),
    })),
  };
};
