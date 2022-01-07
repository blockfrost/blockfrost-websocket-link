import { format } from 'date-fns';
import got from 'got';
import { COINGECKO_PROXY } from '../constants/config';

const formatCoingeckoTime = (date: number): string => {
  return format(date * 1000, 'dd-MM-yyyy');
};

export const getCoingeckoProxies = () => {
  let proxies = COINGECKO_PROXY;
  const additional = process.env.BLOCKFROST_COINGECKO_PROXY;
  if (additional) {
    const items = additional.split(',');
    const sanitized = items.map(item =>
      item.endsWith('/') ? item.substring(0, item.length - 1) : item,
    ); // remove trailing slash
    proxies = proxies.concat(sanitized);
  }
  return proxies;
};

export const getRatesForDate = async (date: number): Promise<Record<string, number>> => {
  const coingeckoDateFormat = formatCoingeckoTime(date);
  try {
    let response: {
      market_data?: {
        current_price: Record<string, number>;
      };
    } = {};

    for (const [index, proxy] of getCoingeckoProxies().entries()) {
      try {
        response = await got(
          `${proxy}/api/v3/coins/cardano/history?date=${coingeckoDateFormat}`,
        ).json();
        if (response?.market_data?.current_price) {
          break;
        }
      } catch (err) {
        if (index === COINGECKO_PROXY.length - 1) {
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
