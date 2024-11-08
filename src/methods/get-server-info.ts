import * as os from 'os';
import { prepareMessage } from '../utils/message.js';
import { blockfrostAPI } from '../utils/blockfrost-api.js';
import { MessageId } from '../types/message.js';

export const getServerInfo = async () => {
  const isTestnet = blockfrostAPI.options.network !== 'mainnet';
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

export default async (id: MessageId, clientId: string): Promise<string> => {
  const data = await getServerInfo();
  const message = prepareMessage({ id, clientId, data });

  return message;
};
