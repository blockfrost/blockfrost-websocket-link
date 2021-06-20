import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import packageJson from '../../package.json';

const blockfrostAPI = new BlockFrostAPI({
  projectId: process.env.PROJECT_ID,
  customBackend: process.env.BACKEND_URL || '',
  userAgent: `trezor-blockfrost-websocket-link@${packageJson.version}`,
});

export { blockfrostAPI };
