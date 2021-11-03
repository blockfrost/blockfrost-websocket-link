import { format } from 'date-fns';
import { blockfrostAPI } from '../utils/blockfrostAPI';
import got from 'got';
import { NetworkInfo } from '@emurgo/cardano-serialization-lib-nodejs';

export const paginate = <T>(items: T[], pageSize: number): T[][] => {
  return items.reduce((ac, val, i) => {
    const id = Math.floor(i / pageSize);
    const page = ac[id] || (ac[id] = []);
    page.push(val);
    return ac;
  }, [] as T[][]);
};

export const getTimeFromSlot = (slot: number): number => {
  return 1596491091 + (slot - 4924800);
};

const formatCoingeckoTime = (date: number): string => {
  return format(date * 1000, 'mm-dd-yyyy');
};

export const getRatesForDate = async (date: number): Promise<Record<string, number> | null> => {
  const coingeckoDateFormat = formatCoingeckoTime(date);

  try {
    const response: {
      market_data: {
        current_price: Record<string, number>;
      };
    } = await got(
      `https://api.coingecko.com/api/v3/coins/cardano/history?date=${coingeckoDateFormat}`,
    ).json();

    return response.market_data.current_price;
  } catch (error) {
    console.log(error);
    return null;
  }
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
      reject('Timed out in ' + ms + 'ms.');
    }, ms);
  });

  // Returns a race between our timeout and the passed in promise
  return Promise.race([promise, timeout]);
};
