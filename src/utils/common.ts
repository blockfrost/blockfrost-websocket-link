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

const formatCoingeckoTime = (date: number): string => {
  return format(date * 1000, 'dd-MM-yyyy');
};

export const getRatesForDate = async (date: number): Promise<Record<string, number>> => {
  const coingeckoDateFormat = formatCoingeckoTime(date);
  try {
    const response: {
      market_data?: {
        current_price: Record<string, number>;
      };
    } = await got(
      `https://api.coingecko.com/api/v3/coins/cardano/history?date=${coingeckoDateFormat}`,
    ).json();

    if (!response?.market_data) {
      throw Error(`Failed to fetch exchange rate for ${coingeckoDateFormat}`);
    }

    return response.market_data?.current_price;
  } catch (error) {
    throw Error(`Failed to fetch exchange rate for ${coingeckoDateFormat}`);
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
