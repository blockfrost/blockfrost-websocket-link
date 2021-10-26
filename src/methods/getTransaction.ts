import { prepareMessage, prepareErrorMessage, prepareGenericErrorMessage } from '../utils/message';
import { blockfrostAPI } from '../utils/blockfrostAPI';
import { transformAsset } from '../utils/asset';

export default async (id: number, txId: string): Promise<string> => {
  try {
    const tx = await blockfrostAPI.txs(txId);
    const message = prepareMessage(id, {
      ...tx,
      output_amount: tx.output_amount.map(asset => transformAsset(asset)),
    });

    return message;
  } catch (err) {
    console.log(err);
    if (err instanceof Error) {
      const message = prepareErrorMessage(id, err);
      return message;
    } else {
      const message = prepareGenericErrorMessage(id, err);
      return message;
    }
  }
};
