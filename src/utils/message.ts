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
  logger.debug(`Prepared error response for id ${id}.`, error);

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
