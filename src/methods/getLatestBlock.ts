import { MESSAGES } from '../constants';
import { prepareMessage } from '../utils/messages';
import { blockfrost } from '../utils/blockfrostAPI';

export default async (id: number): Promise<string> => {
  try {
    const latestBlock = await blockfrost.blocksLatest();
    const message = prepareMessage(id, MESSAGES.GET_LATEST_BLOCK, latestBlock);
    return message;
  } catch (err) {
    console.log(err);
    const message = prepareMessage(id, MESSAGES.GET_LATEST_BLOCK, 'Error');
    return message;
  }
};
