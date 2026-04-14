import * as os from 'os';
import { blockfrostAPI } from '../utils/blockfrost-api.js';

export default async () => {
  const isTestnet = blockfrostAPI.options.network !== 'mainnet';

  const [info, latestBlock] = await Promise.all([
    blockfrostAPI.root(),
    blockfrostAPI.blocksLatest(),
  ]);

  const serverInfo = {
    hostname: os.hostname(),
    name: 'Cardano',
    shortcut: isTestnet ? 'tada' : 'ada',
    testnet: isTestnet,
    version: info.version,
    decimals: 6,
    blockHeight: latestBlock.height || 0,
    blockHash: latestBlock.hash,
  };

  return serverInfo;
};
