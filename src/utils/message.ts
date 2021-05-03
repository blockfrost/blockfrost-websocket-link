import { Responses } from '@blockfrost/blockfrost-js';
import { Incoming } from '../types/message';
import { AccountInfo, ServerInfo } from '../types/response';

export const getMessage = (message: string): Incoming | null => {
  try {
    const parsedMessage: Incoming = JSON.parse(message);
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
    | ServerInfo
    | AccountInfo
    | string
    | Responses['block_content']
    | Responses['tx_content']
    | Responses['address_utxo_content'],
): string => JSON.stringify({ id, message, data });