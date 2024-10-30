import { BlockfrostClientError, BlockfrostServerError, Responses } from '@blockfrost/blockfrost-js';
import { serializeError } from 'serialize-error';
import { MessageId, Messages } from '../types/message.js';
import * as TxTypes from '../types/transactions.js';
import { UtxosWithBlockResponse } from '../types/address.js';
import { AccountInfo, BalanceHistoryData, ServerInfo } from '../types/response.js';
import { logger } from './logger.js';

export const getMessage = (message: string): Messages | undefined => {
  try {
    const parsedMessage: Messages = JSON.parse(message);

    return parsedMessage;
  } catch {
    return undefined;
  }
};

export const prepareErrorMessage = (id: MessageId, clientId: string, error: unknown): string => {
  logger.debug(`[${clientId}] Prepared error response for id ${id}.`, error);

  if (
    error instanceof BlockfrostClientError ||
    error instanceof BlockfrostServerError ||
    error instanceof Error ||
    (typeof error === 'object' && error !== null && 'message' in error)
  ) {
    const serializedError = serializeError(error);

    return JSON.stringify({
      id,
      type: 'error',
      data: {
        error: {
          ...serializedError,
          stack: undefined,
        },
      },
    });
  } else {
    // string and other non-Error messages
    return JSON.stringify({
      id,
      type: 'error',
      data: {
        error: { message: error },
      },
    });
  }
};

export const prepareMessage = (
  id: MessageId,
  clientId: string,
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

  logger.debug(`[${clientId}] Prepared response for msg id ${id} with length ${message.length}`);
  return message;
};
