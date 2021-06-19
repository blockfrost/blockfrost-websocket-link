import { BlockFrostAPI } from '@blockfrost/blockfrost-js';

const blockfrostAPI = new BlockFrostAPI({
  projectId: process.env.PROJECT_ID,
  customBackend: process.env.BACKEND_URL || '',
  userAgent: 'trezor-blockfrost-websocket-link',
});

export { blockfrostAPI };
