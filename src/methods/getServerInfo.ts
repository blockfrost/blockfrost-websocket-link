import { MESSAGES } from '../constants';
import { prepareMessage } from '../utils/messages';
import { blockfrost } from '../utils/blockfrostAPI';

export default async (id: number): Promise<string> => {
  try {
    const info = await blockfrost.root();
    const latestBlock = await blockfrost.blocksLatest();
    const serverInfo = {
      url: blockfrost.apiUrl,
      name: 'Cardano',
      shortcut: 'ada',
      testnet: blockfrost.apiUrl.includes('testnet'),
      version: info.version,
      decimals: 6,
      blockHeight: latestBlock.height || 0,
      blockHash: latestBlock.hash,
    };

    const message = prepareMessage(id, MESSAGES.GET_SERVER_INFO, serverInfo);
    return message;
  } catch (err) {
    const message = prepareMessage(id, MESSAGES.GET_SERVER_INFO, 'Error');
    return message;
  }
};
