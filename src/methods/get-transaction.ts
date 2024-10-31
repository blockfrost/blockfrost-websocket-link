import { prepareMessage, prepareErrorMessage } from '../utils/message.js';
import { blockfrostAPI } from '../utils/blockfrost-api.js';
import { transformTransactionData } from '../utils/transaction.js';
import { logger } from '../utils/logger.js';
import { MessageId } from '../types/message.js';

export default async (id: MessageId, clientId: string, txId: string): Promise<string> => {
  try {
    const tx = await blockfrostAPI.txs(txId);
    const data = await transformTransactionData(tx);
    const message = prepareMessage({ id, clientId, data });

    return message;
  } catch (error) {
    logger.error(error);
    const message = prepareErrorMessage(id, clientId, error);

    return message;
  }
};
