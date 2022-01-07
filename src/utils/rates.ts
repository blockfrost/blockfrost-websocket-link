import { format } from 'date-fns';
import got from 'got';
import { FIAT_RATES_REQUESTS_PER_SEC, FIAT_RATES_PROXY } from '../constants/config';
import { RateLimiterMemory, RateLimiterQueue } from 'rate-limiter-flexible';

// limit max number of requests per sec to prevent too many opened connections
const ratesLimiter = new RateLimiterMemory({
  points: FIAT_RATES_REQUESTS_PER_SEC,
  duration: 1,
});

const limiterQueue = new RateLimiterQueue(ratesLimiter);

export const formatCoingeckoTime = (date: number): string => {
  return format(date * 1000, 'dd-MM-yyyy');
};

export const getFiatRatesProxies = (additional = process.env.BLOCKFROST_FIAT_RATES_PROXY) => {
  let proxies = FIAT_RATES_PROXY;
  if (additional) {
    const items = additional.split(',');
    const sanitized = items
      .map(item => (item.endsWith('/') ? item.substring(0, item.length - 1) : item))
      .filter(proxy => proxy.length > 0); // remove trailing slash
    proxies = sanitized.concat(proxies);
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
        response = await got(`${proxy}?date=${coingeckoDateFormat}`).json();
        if (response?.market_data?.current_price) {
          break;
        }
      } catch (err) {
        if (index === FIAT_RATES_PROXY.length - 1) {
          // last proxy thrown error, we don't have the data
          throw err;
        }
      }
    }

    if (!response?.market_data) {
      throw Error(`Failed to fetch exchange rate for ${coingeckoDateFormat}`);
    }

    return response.market_data?.current_price;
  } catch (error) {
    throw Error(`Failed to fetch exchange rate for ${coingeckoDateFormat}`);
  }
};

export const getRatesForDate = async (date: number): Promise<Record<string, number>> => {
  const t1 = new Date().getTime();

  // wait for a slot
  await limiterQueue.removeTokens(1);

  const t2 = new Date().getTime();
  const diff = t2 - t1;
  if (diff > 1000) {
    console.warn(`Fiat rates limiter slowed down request for ${diff} ms!`);
  }

  return getRatesForDateNoLimit(date);
};
