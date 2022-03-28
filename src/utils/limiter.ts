import PQueue from 'p-queue';
import { FIAT_RATES_REQUESTS_PER_SEC, BLOCKFROST_REQUEST_CONCURRENCY } from '../constants/config';
import { logger } from './logger';

export const pLimiter = new PQueue({ concurrency: BLOCKFROST_REQUEST_CONCURRENCY });

// separate queue for assets' metadata as these will be mostly memoized
export const assetMetadataLimiter = new PQueue({ concurrency: BLOCKFROST_REQUEST_CONCURRENCY / 5 });

export const ratesLimiter = new PQueue({
  intervalCap: FIAT_RATES_REQUESTS_PER_SEC,
  interval: 1000,
  carryoverConcurrencyCount: true,
});

// @ts-expect-error error event not defined, but it exists
pLimiter.on('error', error => {
  logger.error(`pLimiter error`, error);
});

// @ts-expect-error error event not defined, but it exists
ratesLimiter.on('error', error => {
  logger.error(`ratesLimiter error`, error);
});
