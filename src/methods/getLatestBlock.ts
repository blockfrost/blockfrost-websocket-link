import { MESSAGES_RESPONSE } from '../constants';
import { prepareMessage } from '../utils/message';
import { blockfrostAPI } from '../utils/blockfrostAPI';

export default async (id: number): Promise<string> => {
  try {
    const latestBlock = await blockfrostAPI.blocksLatest();
    const message = prepareMessage(id, MESSAGES_RESPONSE.BLOCK, latestBlock);
    return message;
  } catch (err) {
    console.log(err);
    const message = prepareMessage(id, MESSAGES_RESPONSE.BLOCK, 'Error');
    return message;
  }
};
