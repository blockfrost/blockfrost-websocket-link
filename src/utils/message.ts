import { BlockfrostClientError, BlockfrostServerError, Responses } from '@blockfrost/blockfrost-js';
import { serializeError } from 'serialize-error';
import { Messages } from '../types/message';
import * as TxTypes from '../types/transactions';
import { UtxosWithBlockResponse } from '../types/address';
import { AccountInfo, BalanceHistoryData, ServerInfo } from '../types/response';
import { logger } from './logger';

export const getMessage = (message: string): Messages | undefined => {
  try {
    const parsedMessage: Messages = JSON.parse(message);

    return parsedMessage;
  } catch {
    return undefined;
  }
};

export const prepareErrorMessage = (id: number, error: unknown): string => {
  logger.debug(`Prepared error response for id ${id}`, (error as Error)?.message);

  return error instanceof BlockfrostClientError ||
    error instanceof BlockfrostServerError ||
    error instanceof Error
    ? JSON.stringify({
        id,
        type: 'error',
        data: {
          error: {
            ...serializeError({
              ...error,
              // 400 Bad Request could be directly from the Cardano Submit API due to invalid tx, forward a body which includes the error as a message
              message: (error as BlockfrostServerError).body ?? error.message,
            }),
            stack: undefined,
          },
        },
      })
    : JSON.stringify({
        id,
        type: 'error',
        data: {
          error: error,
        },
      });
};

export const prepareMessage = (
  id: string | number,
  data:
    | ServerInfo
    | AccountInfo
    | string
    | Responses['block_content']
    | BalanceHistoryData[]
    | TxTypes.TxIdsToTransactionsResponse[]
    | TxTypes.TransformedTransaction
    | UtxosWithBlockResponse[]
    | { subscribed: boolean }
    | { lovelacePerByte: number },
): string => {
  const message = JSON.stringify({ id, type: 'message', data });

  logger.debug(`Prepared response for id ${id} with length ${message.length}`);
  return message;
};
