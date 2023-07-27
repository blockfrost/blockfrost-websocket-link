import { FIAT_RATES_PROXY } from '../../../src/constants/config.js';

export const getFiatRatesProxies = [
  {
    description: 'getFiatRatesProxies: basic',
    additional: '',
    result: [...FIAT_RATES_PROXY],
  },
  {
    description: 'getFiatRatesProxies: passing additional proxy',
    additional: 'https://mynextproxy.com/history',
    result: ['https://mynextproxy.com/history', ...FIAT_RATES_PROXY],
  },
  {
    description: 'getFiatRatesProxies: passing additional proxy with trailing slash',
    additional: 'https://mynextproxy.com/history/',
    result: ['https://mynextproxy.com/history', ...FIAT_RATES_PROXY],
  },
  {
    description: 'getFiatRatesProxies: passing additional proxies separated by comma',
    additional: 'https://mynextproxy.com/history,mybiggestproxy.com',
    result: ['https://mynextproxy.com/history', 'mybiggestproxy.com', ...FIAT_RATES_PROXY],
  },
  {
    description: 'getFiatRatesProxies: passing additional proxies  with trailing comma',
    additional: 'https://mynextproxy.com/history,mybiggestproxy.com,',
    result: ['https://mynextproxy.com/history', 'mybiggestproxy.com', ...FIAT_RATES_PROXY],
  },
];

export const formatCoingeckoTime = [
  {
    description: 'formatCoingeckoTime: basic',
    time: 1_641_561_868,
    result: '07-01-2022',
  },
  {
    description: 'formatCoingeckoTime: basic 2',
    time: 1_643_545_468,
    result: '30-01-2022',
  },
];
