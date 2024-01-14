import PQueue from 'p-queue';
import {
  FIAT_RATES_REQUESTS_PER_SEC,
  BLOCKFROST_REQUEST_CONCURRENCY,
} from '../constants/config.js';
import { logger } from './logger.js';
import { BlockfrostServerError } from '@blockfrost/blockfrost-js';

export const pLimiter = new PQueue({ concurrency: BLOCKFROST_REQUEST_CONCURRENCY });

// separate queue for assets' metadata as these will be mostly memoized
export const assetMetadataLimiter = new PQueue({ concurrency: BLOCKFROST_REQUEST_CONCURRENCY / 5 });

export const ratesLimiter = new PQueue({
  intervalCap: FIAT_RATES_REQUESTS_PER_SEC,
  interval: 1000,
  carryoverConcurrencyCount: true,
});

pLimiter.on('error', error => {
  if (error instanceof BlockfrostServerError && error.status_code === 404) {
    // do not log 404 errors
  } else {
    logger.error(`pLimiter error`, error);
  }
});

ratesLimiter.on('error', error => {
  logger.warn(`ratesLimiter error`, error);
});
