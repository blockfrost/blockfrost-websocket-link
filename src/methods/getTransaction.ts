import { MESSAGES } from '../constants';
import { prepareMessage } from '../utils/message';
import { blockfrostAPI } from '../utils/blockfrostAPI';

export default async (id: number, txId: string): Promise<string> => {
  try {
    const tx = await blockfrostAPI.txs(txId);
    const message = prepareMessage(id, MESSAGES.TRANSACTION, tx);

    return message;
  } catch (err) {
    console.log(err);
    const message = prepareMessage(id, MESSAGES.TRANSACTION, 'Error');

    return message;
  }
};
