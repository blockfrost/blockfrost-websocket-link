import * as os from 'os';
import { prepareMessage, prepareErrorMessage } from '../utils/message';
import { blockfrostAPI } from '../utils/blockfrost-api';

export const getServerInfo = async () => {
  const isTestnet = !!blockfrostAPI.options.isTestnet;
  const info = await blockfrostAPI.root();
  const latestBlock = await blockfrostAPI.blocksLatest();
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

export default async (id: number): Promise<string> => {
  try {
    const serverInfo = await getServerInfo();
    const message = prepareMessage(id, serverInfo);

    return message;
  } catch (error) {
    const message = prepareErrorMessage(id, error);

    return message;
  }
};
