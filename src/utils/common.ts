import { format } from 'date-fns';
import got from 'got';

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

export const getRatesForDate = async (date: number): Promise<Record<number, string> | null> => {
  const coingeckoDateFormat = formatCoingeckoTime(date);
  console.log('coingeckoDateFormat', coingeckoDateFormat);
  try {
    const response = await got(
      `https://api.coingecko.com/api/v3/coins/cardano/history?date=${coingeckoDateFormat}`,
    ).json();
    // @ts-ignore
    return response.market_data.current_price;
  } catch (error) {
    console.log(error);
    return null;
  }
};
