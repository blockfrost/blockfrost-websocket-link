import { Responses } from '@blockfrost/blockfrost-js';
import { blockfrostAPI } from '../utils/blockfrostAPI';

export const txIdsToTransactions = async (
  addresses: { address: string; data: Responses['address_content'] | 'empty' }[],
): Promise<{ address: string; data: Responses['tx_content'] | 'empty' }[]> => {
  const promisesBundle: {
    address: string;
    promise: Promise<Responses['tx_content']>;
  }[] = [];

  const result: {
    address: string;
    data: Responses['tx_content'] | 'empty';
  }[] = [];

  addresses.map(item => {
    if (item.data === 'empty') return;

    const promise = blockfrostAPI.txs(item.address);
    promisesBundle.push({ address: item.address, promise });
  });

  await Promise.all(
    promisesBundle.map(p =>
      p.promise
        .then(data => {
          result.push({ address: p.address, data });
        })
        .catch(err => {
          throw Error(err);
        }),
    ),
  );

  return result;
};