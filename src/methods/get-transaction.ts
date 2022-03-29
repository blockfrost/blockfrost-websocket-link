import { prepareMessage, prepareErrorMessage } from '../utils/message';
import { blockfrostAPI } from '../utils/blockfrost-api';
import { transformTransactionData } from '../utils/transaction';
import { logger } from '../utils/logger';

export default async (id: number, txId: string): Promise<string> => {
  try {
    const tx = await blockfrostAPI.txs(txId);
    const message = prepareMessage(id, await transformTransactionData(tx));

    return message;
  } catch (error) {
    logger.error(error);
    const message = prepareErrorMessage(id, error);

    return message;
  }
};
