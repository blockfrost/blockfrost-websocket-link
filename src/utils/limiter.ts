import PQueue from 'p-queue';
import { REQUEST_CONCURRENCY } from '../constants/config';

export const pLimiter = new PQueue({ concurrency: REQUEST_CONCURRENCY });
