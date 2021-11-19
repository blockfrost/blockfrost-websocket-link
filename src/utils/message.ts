import { BlockfrostClientError, BlockfrostServerError, Responses } from '@blockfrost/blockfrost-js';
import { serializeError } from 'serialize-error';
import { Messages } from '../types/message';
import * as TxTypes from '../types/transactions';
import { UtxosWithBlockResponse } from '../types/address';
import { AccountInfo, ServerInfo } from '../types/response';

export const getMessage = (message: string): Messages | null => {
  try {
    const parsedMessage: Messages = JSON.parse(message);
    return parsedMessage;
  } catch (err) {
    return null;
  }
};

export const prepareErrorMessage = (id: number, error: unknown): string => {
  if (
    error instanceof BlockfrostClientError ||
    error instanceof BlockfrostServerError ||
    error instanceof Error
  ) {
    return JSON.stringify({
      id,
      type: 'error',
      data: {
        error: { ...serializeError(error), stack: undefined },
      },
    });
  } else {
    return JSON.stringify({
      id,
      type: 'error',
      data: {
        error: error,
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
    | TxTypes.BalanceHistoryItem[]
    | TxTypes.TxIdsToTransactionsResponse[]
    | Responses['tx_content']
    | UtxosWithBlockResponse[]
    | { subscribed: boolean }
    | { lovelacePerByte: number },
): string => {
  return JSON.stringify({ id, type: 'message', data });
};
