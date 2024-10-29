import { BlockFrostAPI, BlockfrostServerError, Responses } from '@blockfrost/blockfrost-js';
import { Options } from '@blockfrost/blockfrost-js/lib/types/index.js';
import { createRequire } from 'module';
import { BLOCKFROST_REQUEST_TIMEOUT } from '../constants/config.js';
import { logger } from './logger.js';
import { AffectedAddressesInBlock } from '../types/events.js';
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

export const getBlockData = async (options?: {
  block?: number | string;
  attempt?: number;
}): Promise<{
  latestBlock: Responses['block_content'];
  affectedAddresses: AffectedAddressesInBlock;
}> => {
  // Fetch latest block and all addresses affected in the block
  // Fetching of affected addresses may fail, there are 3 retry attempts before throwing an error
  const MAX_ATTEMPTS = 3;
  const latestBlock = options?.block
    ? await blockfrostAPI.blocks(options.block)
    : await blockfrostAPI.blocksLatest();
  let affectedAddresses: AffectedAddressesInBlock = [];

  try {
    affectedAddresses = await blockfrostAPI.blocksAddressesAll(latestBlock.hash, {
      batchSize: 2,
    });
  } catch (error) {
    if (
      error instanceof BlockfrostServerError &&
      error.status_code === 404 // Backend lagging, block rollback
    ) {
      const attempt = options?.attempt ?? 0;

      if (attempt < MAX_ATTEMPTS - 1) {
        logger.warn(
          `Unable to fetch addresses for block ${latestBlock.height} ${latestBlock.hash}. Block no longer on chain.`,
        );
        return getBlockData({ ...options, attempt: attempt + 1 });
      } else {
        throw error;
      }
    } else {
      throw error;
    }
  }

  return {
    latestBlock,
    affectedAddresses,
  };
};

export const blockfrostAPI = getBlockfrostClient();

// Special client for tx submit due timeout that's necessary for handling "mempool full" error.
// Cardano Tx Submit API will just wait indefinitely, so we need to close the connection and return proper error message
export const txClient = getBlockfrostClient({ requestTimeout: 5000 });
