import { MESSAGES } from '../constants';
import { prepareMessage } from '../utils/messages';
import { blockfrost } from '../utils/blockfrostAPI';

export default async (id: number, txId: string): Promise<string> => {
  try {
    const tx = await blockfrost.txs(txId);
    const message = prepareMessage(id, MESSAGES.GET_TRANSACTION, tx);

    return message;
  } catch (err) {
    console.log(err);
    const message = prepareMessage(id, MESSAGES.GET_TRANSACTION, 'Error');

    return message;
  }
};
