import { Responses } from '@blockfrost/blockfrost-js';
import { blockfrostAPI } from '../utils/blockfrostAPI';

export const txIdsToTransactions = async (
  addresses: {
    address: string;
    data: string[];
  }[],
): Promise<
  {
    address: string;
    txHash: string;
    txData: Responses['tx_content'];
    blockInfo: Responses['block_content'];
  }[]
> => {
  const promisesBundle: {
    address: string;
    txHash: string;
    promise: Promise<{
      txData: Responses['tx_content'];
      blockInfo: Responses['block_content'];
    }>;
  }[] = [];

  const result: {
    address: string;
    txHash: string;
    txData: Responses['tx_content'];
    blockInfo: Responses['block_content'];
  }[] = [];

  addresses.map(item => {
    item.data.map(hash => {
      const promise = new Promise<{
        txData: Responses['tx_content'];
        blockInfo: Responses['block_content'];
      }>((resolve, reject) => {
        (async () => {
          try {
            const tx = await blockfrostAPI.txs(hash);
            const blockInfo = await blockfrostAPI.blocks(tx.block);
            return resolve({ txData: tx, blockInfo });
          } catch (err) {
            return reject(err);
          }
        })();
      });

      promisesBundle.push({ address: item.address, promise, txHash: hash });
    });
  });

  await Promise.all(
    promisesBundle.map(p =>
      p.promise
        .then(data => {
          result.push({
            address: p.address,
            txData: data.txData,
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
