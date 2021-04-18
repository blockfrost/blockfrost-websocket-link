import { MESSAGES } from '../constants';
import { prepareMessage } from '../utils/messages';
import { blockfrost } from '../utils/blockfrostAPI';

export default async (id: number, hashOrNumber: string | number): Promise<string> => {
  try {
    // @ts-ignore
    const block = await blockfrost.txSubmit(hashOrNumber);
    const message = prepareMessage(id, MESSAGES.PUSH_TRANSACTION, block);
    return message;
  } catch (err) {
    console.log(err);
    const message = prepareMessage(id, MESSAGES.PUSH_TRANSACTION, 'Error');
    return message;
  }
};
