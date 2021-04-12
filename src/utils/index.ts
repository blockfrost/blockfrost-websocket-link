import { ResponseAccountInfo, Message, ResponseServerInfo } from '../types';

export const getMessage = (message: string): Message | null => {
  try {
    const parsedMessage: Message = JSON.parse(message);
    return parsedMessage;
  } catch (err) {
    return null;
  }
};

export const prepareMessage = (
  id: number,
  message: string,
  data: Error | ResponseServerInfo | ResponseAccountInfo | string,
): string => {
  return JSON.stringify({ id, message, data });
};
