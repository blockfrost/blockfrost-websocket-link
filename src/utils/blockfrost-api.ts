import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import { Options } from '@blockfrost/blockfrost-js/lib/types/index';
import packageJson from '../../package.json';

export const getBlockfrostClient = (options?: Partial<Options>) => {
  return new BlockFrostAPI({
    projectId: process.env.BLOCKFROST_PROJECT_ID,
    customBackend: process.env.BLOCKFROST_BACKEND_URL || '',
    network: process.env.BLOCKFROST_NETWORK,
    userAgent: `${packageJson.name}@${packageJson.version}`,
    rateLimiter: false,
    ...options,
  });
};

export const blockfrostAPI = getBlockfrostClient();

// Special client for tx submit due timeout that's necessary for handling "mempool full" error.
// Cardano Tx Submit API will just wait indefinitely, so we need to close the connection and return proper error message
export const txClient = getBlockfrostClient({ requestTimeout: 5000 });
