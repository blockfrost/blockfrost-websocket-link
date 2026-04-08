import { BlockFrostAPI, BlockfrostServerError, Responses } from '@blockfrost/blockfrost-js';
import { Options } from '@blockfrost/blockfrost-js/lib/types/index.js';
import { createRequire } from 'module';
import { BLOCKFROST_REQUEST_TIMEOUT } from '../constants/config.js';
import { limiter } from './limiter.js';

const require = createRequire(import.meta.url);
const packageJson = require('../../package.json');

export const getBlockfrostClient = (options?: Partial<Options>) => {
  return new BlockFrostAPI({
    projectId: process.env.BLOCKFROST_PROJECT_ID,
    customBackend: process.env.BLOCKFROST_BACKEND_URL || '',
    // @ts-expect-error passing string network type
    network: process.env.BLOCKFROST_NETWORK,
    userAgent: `${packageJson.name}@${packageJson.version}`,
    rateLimiter: false,
    requestTimeout: BLOCKFROST_REQUEST_TIMEOUT,
    ...options,
  });
};

const assertRepeatableError = (error: unknown) => {
  if (!(error instanceof BlockfrostServerError) || error.status_code !== 404) {
    throw error;
  }
};

export const getBlockData = async (block: Responses['block_content']) => {
  const tryFetch = () =>
    limiter(() => blockfrostAPI.blocksAddressesAll(block.hash, { batchSize: 2 }));

  try {
    return await tryFetch();
  } catch (error) {
    assertRepeatableError(error);
  }
  try {
    return await tryFetch();
  } catch (error) {
    assertRepeatableError(error);
  }
  return await tryFetch();
};

export const blockfrostAPI = getBlockfrostClient();

// Special client for tx submit due timeout that's necessary for handling "mempool full" error.
// Cardano Tx Submit API will just wait indefinitely, so we need to close the connection and return proper error message
export const txClient = getBlockfrostClient({ requestTimeout: 5000 });
