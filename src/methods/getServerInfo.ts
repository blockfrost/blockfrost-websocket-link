import * as Types from 'types';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';

export default async (blockFrostApi: BlockFrostAPI): Promise<Types.ServerInfo> => {
  const info = await blockFrostApi.root();
  const latestBlock = await blockFrostApi.blocksLatest();

  return {
    url: blockFrostApi.apiUrl,
    name: 'Cardano',
    shortcut: 'ada',
    testnet: false,
    version: info.version.toString(),
    decimals: 6,
    blockHeight: latestBlock.height || 0,
    blockHash: latestBlock.hash,
  };
};
