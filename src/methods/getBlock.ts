import { MESSAGES } from '../constants';
import { prepareMessage } from '../utils/messages';
import { blockfrost } from '../utils/blockfrostAPI';

export default async (id: number, hashOrNumber: string | number): Promise<string> => {
  try {
    const block = await blockfrost.blocks(hashOrNumber);
    const message = prepareMessage(id, MESSAGES.GET_BLOCK, block);
    return message;
  } catch (err) {
    console.log(err);
    const message = prepareMessage(id, MESSAGES.GET_BLOCK, 'Error');
    return message;
  }
};
