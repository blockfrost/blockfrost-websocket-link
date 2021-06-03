import { Responses } from '@blockfrost/blockfrost-js';
import { Messages } from '../types/message';
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

export const prepareErrorMessage = (id: number, message: string, error: Error | string): string => {
  return JSON.stringify({ id, message, type: 'error', error });
};

export const prepareMessage = (
  id: string | number,
  message: string,
  data:
    | ServerInfo
    | AccountInfo
    | string
    | Responses['block_content']
    | Responses['tx_content'][]
    | Responses['tx_content']
    | UtxosWithBlockResponse[],
): string => JSON.stringify({ id, type: 'message', message, data });
