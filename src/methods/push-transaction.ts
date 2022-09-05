import { prepareErrorMessage, prepareMessage } from '../utils/message';
import { getBlockfrostClient } from '../utils/blockfrost-api';
import { logger } from '../utils/logger';
import { BlockfrostClientError } from '@blockfrost/blockfrost-js';

// Special client for tx submit due timeout that's necessary for handling "mempool full" error.
// Cardano Tx Submit API will just wait indefinitely, so we need to close the connection and return proper error message
const txClient = getBlockfrostClient({ requestTimeout: 5000 });

export default async (id: number, transaction: Uint8Array | string): Promise<string> => {
  try {
    const submitTransactionResult = await txClient.txSubmit(transaction);
    const message = prepareMessage(id, submitTransactionResult);

    return message;
  } catch (error) {
    logger.error(error);
    if (error instanceof BlockfrostClientError && error.code === 'ETIMEDOUT') {
      // Request timed out. Most likely mempool is full since that's the only reason why submit api should get stuck
      const errorMessage = 'Mempool is full, please try resubmitting again later.';
      const message = prepareErrorMessage(id, errorMessage);

      return message;
    } else {
      const message = prepareErrorMessage(id, error);

      return message;
    }
  }
};
