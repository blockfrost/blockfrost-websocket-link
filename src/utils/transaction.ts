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
    (first, second) => first.txData.block_height - second.txData.block_height,
  );

  return sortedTxs;
};

export const getBlockTransactionsByAddresses = async (
  block: Responses['block_content'],
  addresses: string[],
): Promise<Responses['tx_content'][]> => {
  const blockAddressTxs: Responses['tx_content'][] = [];

  const promisesBundle: {
    address: string;
    promise: Promise<string[]>;
  }[] = [];

  addresses.map(async address => {
    const promise = blockfrostAPI.addressesTxsAll(address);
    promisesBundle.push({ address, promise });
  });

  const txIds: { address: string; txId: string }[] = [];

  await Promise.all(
    promisesBundle.map(p =>
      p.promise
        .then(data => {
          data.map(id => {
            txIds.push({ address: p.address, txId: id });
          });
        })
        .catch(() => {
          // invalid address?
        }),
    ),
  );

  const promisesBundleTxs: {
    address: string;
    promise: Promise<Responses['tx_content']>;
  }[] = [];

  txIds.map(tx => {
    const promise = blockfrostAPI.txs(tx.txId);
    promisesBundleTxs.push({ address: tx.address, promise });
  });

  await Promise.all(
    promisesBundleTxs.map(p =>
      p.promise
        .then(data => {
          if (data.block === block.hash) {
            blockAddressTxs.push(data);
          }
        })
        .catch(error => {
          throw Error(error);
        }),
    ),
  );

  return blockAddressTxs;
};
