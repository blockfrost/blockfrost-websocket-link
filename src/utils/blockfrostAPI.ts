import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import packageJson from '../../package.json';

console.log('process.env', process.env);

const blockfrostAPI = new BlockFrostAPI({
  projectId: process.env.PROJECT_ID,
  customBackend: process.env.BACKEND_URL || '',
  isTestnet: process.env.NETWORK === 'testnet',
  userAgent: `${packageJson.name}@${packageJson.version}`,
});

export { blockfrostAPI };
