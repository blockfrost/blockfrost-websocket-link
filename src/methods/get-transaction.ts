import { prepareMessage, prepareErrorMessage } from '../utils/message.js';
import { blockfrostAPI } from '../utils/blockfrost-api.js';
import { transformTransactionData } from '../utils/transaction.js';
import { logger } from '../utils/logger.js';
import { MessageId } from '../types/message.js';

export default async (msgId: MessageId, clientId: string, txId: string): Promise<string> => {
  try {
    const tx = await blockfrostAPI.txs(txId);
    const message = prepareMessage(msgId, clientId, await transformTransactionData(tx));

    return message;
  } catch (error) {
    logger.error(error);
    const message = prepareErrorMessage(msgId, clientId, error);

    return message;
  }
};
