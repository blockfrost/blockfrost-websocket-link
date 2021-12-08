import { Responses } from '@blockfrost/blockfrost-js';
import * as Types from '../types/transactions';
import { blockfrostAPI } from '../utils/blockfrostAPI';
import { transformAsset } from './asset';

export const txIdsToTransactions = async (
  addresses: {
    address: string;
    data: string[];
  }[],
): Promise<Types.TxIdsToTransactionsResponse[]> => {
  const promisesBundle: Types.TxIdsToTransactionsPromises[] = [];
  const result: Types.TxIdsToTransactionsResponse[] = [];

  addresses.forEach(item => {
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

  const sortedTxs = result.sort(
    (first, second) =>
      second.txData.block_height - first.txData.block_height ||
      second.txData.index - first.txData.index,
  );

  return sortedTxs;
};

export const getBlockTransactionsUtxos = async (
  blockHeight: number | null,
): Promise<Responses['tx_content_utxo'][]> => {
  if (blockHeight === null) {
    throw new Error('Cannot fetch block transactions. Invalid block height.');
  }
  const txids = await blockfrostAPI.blocksTxsAll(blockHeight);
  const txsUtxo: Responses['tx_content_utxo'][] = [];

  const getPromiseBundle = (startIndex: number, batchSize: number) => {
    const promises = [...Array.from({ length: batchSize }).keys()].map(i => {
      const txid = txids[startIndex + i];
      return txid ? blockfrostAPI.txsUtxos(txid) : undefined;
    });
    return promises.filter(p => Boolean(p)) as unknown as Responses['tx_content_utxo'][];
  };

  const batch_size = 100;
  // TODO: this will get rate limited for 3rd parties using websocket-link if the amount of txs is too high
  // Blockfrost API allows burst of 500 request, then we can only make 10 requests per second
  for (let i = 0; i < txids.length; i += batch_size) {
    const promiseSlice = getPromiseBundle(i, batch_size);

    // eslint-disable-next-line no-await-in-loop
    const partialResults = await Promise.all(promiseSlice);
    txsUtxo.push(...partialResults);
  }
  return txsUtxo;
};

export const getBlockTransactionsByAddresses = async (
  block: Responses['block_content'],
  addresses: string[],
): Promise<Types.TxIdsToTransactionsResponse[]> => {
  const blockHeight = block.height;
  if (blockHeight === null) {
    throw new Error('Cannot fetch block transactions. Invalid block height.');
  }

  const promisesBundle = addresses.map(address => {
    // we are lowering batchSize (number of pages that are fetched at the same time)
    // with the quite safe assumption that most addresses will have just a few transactions (or none) in a given block.
    // One page includes 100 txs by default, default batchSize is 10.
    const promise = blockfrostAPI.addressesTransactionsAll(
      address,
      { batchSize: 1 },
      {
        from: blockHeight.toString(),
        to: blockHeight.toString(),
      },
    );
    return { address, promise };
  });

  const txsData = await Promise.all(
    promisesBundle.map(p =>
      p.promise
        .then(txs => ({ address: p.address, data: txs.map(tx => tx.tx_hash) }))
        .catch(err => {
          // invalid address?
          console.error(err);
          throw err;
        }),
    ),
  );

  const result = await txIdsToTransactions(txsData);
  return result;
};
