import { prepareMessage } from '../utils/message';
import { blockfrostAPI } from '../utils/blockfrostAPI';

export default async (id: number, transaction: Uint8Array): Promise<string> => {
  try {
    const submitTransactionResult = await blockfrostAPI.txSubmit(transaction);
    const message = prepareMessage(id, submitTransactionResult);

    return message;
  } catch (err) {
    console.log(err);
    const message = prepareMessage(id, err);
    return message;
  }
};
