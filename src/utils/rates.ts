import { format } from 'date-fns';
import got from 'got';
import { FIAT_RATES_PROXY, FIAT_RATES_REQUESTS_TIMEOUT } from '../constants/config';
import { blockfrostAPI } from './blockfrostAPI';
import { ratesLimiter } from './limiter';
import { logger } from './logger';

export const formatCoingeckoTime = (date: number): string => {
  return format(date * 1000, 'dd-MM-yyyy');
};

export const getFiatRatesProxies = (additional = process.env.BLOCKFROST_FIAT_RATES_PROXY) => {
  let proxies = FIAT_RATES_PROXY;

  if (additional) {
    const items = additional.split(',');
    const sanitized = items
      .map(item => (item.endsWith('/') ? item.slice(0, Math.max(0, item.length - 1)) : item))
      .filter(proxy => proxy.length > 0); // remove trailing slash

    proxies = [...sanitized, ...proxies];
  }
  return proxies;
};

export const getRatesForDateNoLimit = async (date: number): Promise<Record<string, number>> => {
  const coingeckoDateFormat = formatCoingeckoTime(date);

  try {
    let response: {
      market_data?: {
        current_price: Record<string, number>;
      };
    } = {};

    for (const [index, proxy] of getFiatRatesProxies().entries()) {
      // iterate through proxies till we have a valid response
      try {
        response = await got(`${proxy}?date=${coingeckoDateFormat}`, {
          headers: {
            'User-Agent': blockfrostAPI.userAgent,
          },
          timeout: {
            request: FIAT_RATES_REQUESTS_TIMEOUT,
          },
        }).json();
        if (response?.market_data?.current_price) {
          break;
        }
      } catch (error) {
        if (index === FIAT_RATES_PROXY.length - 1) {
          // last proxy thrown error, we don't have the data
          throw error;
        }
      }
    }

    if (!response?.market_data) {
      throw new Error(`Failed to fetch exchange rate for ${coingeckoDateFormat}`);
    }

    return response.market_data?.current_price;
  } catch {
    throw new Error(`Failed to fetch exchange rate for ${coingeckoDateFormat}`);
  }
};

export const getRatesForDate = async (date: number): Promise<Record<string, number>> => {
  const t1 = Date.now();
  const t2 = Date.now();
  const diff = t2 - t1;

  if (diff > 1000) {
    logger.warn(`Fiat rates limiter slowed down request for ${diff} ms!`);
  }

  return ratesLimiter.add(() => getRatesForDateNoLimit(date));
};
