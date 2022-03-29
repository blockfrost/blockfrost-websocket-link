import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import packageJson from '../../package.json';

const blockfrostAPI = new BlockFrostAPI({
  projectId: process.env.BLOCKFROST_PROJECT_ID,
  customBackend: process.env.BLOCKFROST_BACKEND_URL || '',
  isTestnet: process.env.BLOCKFROST_NETWORK === 'testnet',
  userAgent: `${packageJson.name}@${packageJson.version}`,
  rateLimiter: false,
});

export { blockfrostAPI };
