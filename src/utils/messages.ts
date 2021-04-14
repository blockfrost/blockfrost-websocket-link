import { Responses } from '@blockfrost/blockfrost-js';
import { ResponseAccountInfo, ResponseServerInfo, IncomingMessage } from '../types';

export const getMessage = (message: string): IncomingMessage | null => {
  try {
    const parsedMessage: IncomingMessage = JSON.parse(message);
    return parsedMessage;
  } catch (err) {
    return null;
  }
};

export const prepareMessage = (
  id: number,
  message: string,
  data:
    | Error
    | ResponseServerInfo
    | ResponseAccountInfo
    | string
    | Responses['block_content']
    | Responses['tx_content'],
): string => JSON.stringify({ id, message, data });
