import { BlockfrostClientError, BlockfrostServerError } from '@blockfrost/blockfrost-js';
import { prepareErrorMessage, prepareMessage } from '../utils/message.js';
import { txClient } from '../utils/blockfrost-api.js';
import { logger } from '../utils/logger.js';

export default async (
  id: number,
  clientId: string,
  transaction: Uint8Array | string,
): Promise<string> => {
  try {
    const submitTransactionResult = await txClient.txSubmit(transaction);
    const message = prepareMessage(id, clientId, submitTransactionResult);

    return message;
  } catch (error) {
    if (error instanceof BlockfrostClientError && error.code === 'ETIMEDOUT') {
      // Request timed out. Most likely mempool is full since that's the only reason why submit api should get stuck
      const errorMessage = 'Mempool is full, please try resubmitting again later.';
      const message = prepareErrorMessage(id, clientId, errorMessage);

      logger.error(error);
      return message;
    } else if (error instanceof BlockfrostServerError && error.status_code === 400) {
      // 400 Bad Request could be directly from the Cardano Submit API due to invalid tx, forward a body which includes the error as a message
      const formattedError = {
        ...error,
        message: error.body ?? error.message,
        body: undefined,
      };
      const message = prepareErrorMessage(id, clientId, formattedError);

      logger.error(
        new BlockfrostServerError({
          ...formattedError,
          // error.body containing error msg from cardano submit api will be passed as a message in error object
          // resulting in easier to use reports
          message:
            typeof formattedError.message === 'string' ? formattedError.message : error.message,
        }),
      );

      return message;
    } else {
      logger.error(error);
      const message = prepareErrorMessage(id, clientId, error);

      return message;
    }
  }
};
