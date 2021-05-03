import { MESSAGES_RESPONSE } from '../constants';
import { prepareMessage } from '../utils/message';
import { blockfrostAPI } from '../utils/blockfrostAPI';

export default async (id: number, hashOrNumber: string | number): Promise<string> => {
  try {
    const block = await blockfrostAPI.blocks(hashOrNumber);
    const message = prepareMessage(id, MESSAGES_RESPONSE.BLOCK, block);
    return message;
  } catch (err) {
    console.log(err);
    const message = prepareMessage(id, MESSAGES_RESPONSE.BLOCK, 'Error');
    return message;
  }
};
