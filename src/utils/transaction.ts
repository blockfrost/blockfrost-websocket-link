import { Responses } from '@blockfrost/blockfrost-js';
import * as Types from '../types/transactions';
import { blockfrostAPI } from '../utils/blockfrostAPI';

export const txIdsToTransactions = async (
  addresses: {
    address: string;
    data: string[];
  }[],
): Promise<Types.TxIdsToTransactionsResponse[]> => {
  const promisesBundle: Types.TxIdsToTransactionsPromises[] = [];
  const result: Types.TxIdsToTransactionsResponse[] = [];

  addresses.map(item => {
    item.data.map(hash => {
      const promise = new Promise<Types.Data>((resolve, reject) => {
        (async () => {
          try {
            const tx = await blockfrostAPI.txs(hash);
            const blockInfo = await blockfrostAPI.blocks(tx.block);
            const txUtxos = await blockfrostAPI.txsUtxos(hash);

            return resolve({
              txData: tx,
              txUtxos,
              blockInfo,
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
            txData: data.txData,
            txUtxos: data.txUtxos,
            blockInfo: data.blockInfo,
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

export const getBlockTransactionsByAddresses = async (
  block: Responses['block_content'],
  addresses: string[],
): Promise<Types.TxIdsToTransactionsResponse[]> => {
  const promisesBundle: {
    address: string;
    promise: Promise<Responses['address_transactions_content']>;
  }[] = [];

  addresses.forEach(address => {
    // TODO: we don't have to download all transactions at once,
    // we can stop fetching once we have a page where some tx is older than the block
    const promise = blockfrostAPI.addressesTransactionsAll(address);
    promisesBundle.push({ address, promise });
  });

  const txIds: { address: string; txId: string; blockHeight: number }[] = [];

  await Promise.all(
    promisesBundle.map(p =>
      p.promise
        .then(data => {
          data.map(id => {
            txIds.push({ address: p.address, txId: id.tx_hash, blockHeight: id.block_height });
          });
        })
        .catch(() => {
          // invalid address?
        }),
    ),
  );

  const relevantTxs = txIds.filter(tx => tx.blockHeight === block.height);

  const prepared = relevantTxs.map(tx => ({
    address: tx.address,
    data: [tx.txId],
  }));

  const result = await txIdsToTransactions(prepared);

  return result;
};
