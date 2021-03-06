import { prepareErrorMessage, prepareMessage } from '../utils/message';
import { blockfrostAPI } from '../utils/blockfrost-api';
import { logger } from '../utils/logger';

export default async (id: number, transaction: Uint8Array | string): Promise<string> => {
  try {
    const submitTransactionResult = await blockfrostAPI.txSubmit(transaction);
    const message = prepareMessage(id, submitTransactionResult);

    return message;
  } catch (error) {
    logger.error(error);
    const message = prepareErrorMessage(id, error);

    return message;
  }
};
