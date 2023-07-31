import { prepareMessage, prepareErrorMessage } from '../utils/message.js';
import { blockfrostAPI } from '../utils/blockfrost-api.js';
import { transformTransactionData } from '../utils/transaction.js';
import { logger } from '../utils/logger.js';

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
