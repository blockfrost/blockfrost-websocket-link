import PQueue from 'p-queue';
import { REQUEST_CONCURRENCY } from '../constants/config';
import { logger } from './logger';

export const pLimiter = new PQueue({ concurrency: REQUEST_CONCURRENCY });

// @ts-expect-error
pLimiter.on('error', error => {
  logger.error(error);
});
