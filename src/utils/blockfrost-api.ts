import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import { Options } from '@blockfrost/blockfrost-js/lib/types/index';
import packageJson from '../../package.json';

export const getBlockfrostClient = (options?: Partial<Options>) => {
  return new BlockFrostAPI({
    projectId: process.env.BLOCKFROST_PROJECT_ID,
    customBackend: process.env.BLOCKFROST_BACKEND_URL || '',
    isTestnet: process.env.BLOCKFROST_NETWORK === 'testnet',
    userAgent: `${packageJson.name}@${packageJson.version}`,
    rateLimiter: false,
    ...options,
  });
};

const blockfrostAPI = getBlockfrostClient();

export { blockfrostAPI };
