import { MESSAGES_RESPONSE } from '../constants';
import { prepareMessage, prepareErrorMessage } from '../utils/message';
import { blockfrostAPI } from '../utils/blockfrostAPI';

export default async (id: number): Promise<string> => {
  try {
    const info = await blockfrostAPI.root();
    const latestBlock = await blockfrostAPI.blocksLatest();
    const serverInfo = {
      name: 'Cardano',
      shortcut: 'ada',
      testnet: blockfrostAPI.apiUrl.includes('testnet'),
      version: info.version,
      decimals: 6,
      blockHeight: latestBlock.height || 0,
      blockHash: latestBlock.hash,
    };

    const message = prepareMessage(id, MESSAGES_RESPONSE.SERVER_INFO, serverInfo);
    return message;
  } catch (error) {
    const message = prepareErrorMessage(id, MESSAGES_RESPONSE.SERVER_INFO, error);
    return message;
  }
};
