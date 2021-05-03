import { MESSAGES_RESPONSE } from '../constants';
import { prepareMessage } from '../utils/message';
import { blockfrostAPI } from '../utils/blockfrostAPI';

export default async (id: number, txId: string): Promise<string> => {
  try {
    const tx = await blockfrostAPI.txs(txId);
    const message = prepareMessage(id, MESSAGES_RESPONSE.TRANSACTION, tx);

    return message;
  } catch (err) {
    console.log(err);
    const message = prepareMessage(id, MESSAGES_RESPONSE.TRANSACTION, 'Error');

    return message;
  }
};
