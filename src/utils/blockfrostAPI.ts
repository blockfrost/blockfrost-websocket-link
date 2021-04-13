import { BlockFrostAPI } from '@blockfrost/blockfrost-js';

const blockfrost = new BlockFrostAPI({
  projectId: process.env.PROJECT_ID,
  customBackend: process.env.BACKEND_URL || '',
});

export { blockfrost };
