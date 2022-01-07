import { blockfrostAPI } from '../utils/blockfrostAPI';
import { NetworkInfo } from '@emurgo/cardano-serialization-lib-nodejs';

export const paginate = <T>(items: T[], pageSize: number): T[][] => {
  return items.reduce((ac, val, i) => {
    const id = Math.floor(i / pageSize);
    const page = ac[id] || (ac[id] = []);
    page.push(val);
    return ac;
  }, [] as T[][]);
};

export const getNetworkId = (): number => {
  const networkId = blockfrostAPI.options.isTestnet
    ? NetworkInfo.testnet().network_id()
    : NetworkInfo.mainnet().network_id();

  return networkId;
};

export const promiseTimeout = <T>(promise: T, ms: number) => {
  // Create a promise that rejects in <ms> milliseconds
  const timeout = new Promise((_resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(Error('PROMISE_TIMEOUT'));
    }, ms);
  });

  // Returns a race between our timeout and the passed in promise
  return Promise.race([promise, timeout]);
};
