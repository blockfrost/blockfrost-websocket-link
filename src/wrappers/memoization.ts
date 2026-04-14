import memoizee from 'memoizee';
import { BlockfrostServerError } from '@blockfrost/blockfrost-js';

import { events } from '../events.js';
import { blockfrostAPI } from '../utils/blockfrost-api.js';

const withMemoAddress = <Response>(func: (address: string) => Promise<Response>) => {
  const cache = memoizee(
    (address: string) =>
      func.call(blockfrostAPI, address).catch(error => {
        if (!(error instanceof BlockfrostServerError && error.status_code === 404)) {
          // cache only 404 rejections
          cache.delete(address);
        }
        throw error;
      }),
    {
      length: 1, // consider only the first arg
      primitive: true, // first argument should always be string
      maxAge: 30 * 60 * 1000, // 30 mins
      profileName: func.name,
    },
  );

  events.on('newBlock', (_, addresses) => {
    for (const { address } of addresses) {
      cache.delete(address);
    }
  });

  events.on('reorgBlock', (_, addresses) => {
    for (const { address } of addresses) {
      cache.delete(address);
    }
  });

  events.on('reorgAll', () => cache.clear());

  return cache;
};

const withMemo = <Response>(func: (param: string) => Promise<Response>) =>
  memoizee(func, {
    length: 1, // consider only the first arg
    primitive: true, // first argument should always be string
    maxAge: 30 * 60 * 1000, // 30 mins
    promise: true, // don't cache rejections
    profileName: func.name,
  });

blockfrostAPI.addresses = withMemoAddress(blockfrostAPI.addresses);
blockfrostAPI.addressesTotal = withMemoAddress(blockfrostAPI.addressesTotal);
blockfrostAPI.addressesTransactionsAll = withMemoAddress(blockfrostAPI.addressesTransactionsAll);
blockfrostAPI.addressesUtxosAll = withMemoAddress(blockfrostAPI.addressesUtxosAll);
blockfrostAPI.assetsById = withMemo(blockfrostAPI.assetsById);
blockfrostAPI.txs = withMemo(blockfrostAPI.txs);
blockfrostAPI.txsCbor = withMemo(blockfrostAPI.txsCbor);
blockfrostAPI.txsUtxos = withMemo(blockfrostAPI.txsUtxos);
