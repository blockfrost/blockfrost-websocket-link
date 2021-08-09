import { Responses } from '@blockfrost/blockfrost-js';
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

export const prepareErrorMessage = (id: number, error: Error | string): string => {
  return JSON.stringify({ id, type: 'error', error });
};

export const prepareMessage = (
  id: string | number,
  data:
    | ServerInfo
    | AccountInfo
    | string
    | Responses['block_content']
    | TxTypes.TxIdsToTransactionsResponse[]
    | Responses['tx_content']
    | UtxosWithBlockResponse[]
    | { subscribed: boolean }
    | { lovelacePerByte: number },
): string => {
  return JSON.stringify({ id, type: 'message', data });
};
