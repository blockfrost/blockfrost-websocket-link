import { prepareMessage, prepareErrorMessage } from '../utils/message';
import { blockfrostAPI } from '../utils/blockfrostAPI';

export default async (id: number, txId: string): Promise<string> => {
  try {
    const tx = await blockfrostAPI.txs(txId);
    const message = prepareMessage(id, tx);

    return message;
  } catch (err) {
    console.log(err);
    const message = prepareErrorMessage(id, err.data);

    return message;
  }
};
