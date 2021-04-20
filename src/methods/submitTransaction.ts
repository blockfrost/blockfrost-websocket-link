import { MESSAGES } from '../constants';
import { prepareMessage } from '../utils/messages';
import { blockfrost } from '../utils/blockfrostAPI';

export default async (id: number, transaction: Uint8Array): Promise<string> => {
  try {
    const submitTransactionResult = await blockfrost.txSubmit(transaction);
    const message = prepareMessage(id, MESSAGES.SUBMIT_TRANSACTION, submitTransactionResult);
    return message;
  } catch (err) {
    console.log(err);
    const message = prepareMessage(id, MESSAGES.SUBMIT_TRANSACTION, 'Error');
    return message;
  }
};
