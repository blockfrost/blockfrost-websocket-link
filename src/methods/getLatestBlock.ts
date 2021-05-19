import { MESSAGES_RESPONSE } from '../constants';
import { prepareMessage, prepareErrorMessage } from '../utils/message';
import { blockfrostAPI } from '../utils/blockfrostAPI';

export default async (id: number): Promise<string> => {
  try {
    const block = await blockfrostAPI.blocksLatest();
    const message = prepareMessage(id, MESSAGES_RESPONSE.LATEST_BLOCK, block);
    return message;
  } catch (err) {
    console.log(err);
    const message = prepareErrorMessage(id, MESSAGES_RESPONSE.LATEST_BLOCK, err.data);
    return message;
  }
};
