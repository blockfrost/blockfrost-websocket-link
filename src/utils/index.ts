import { ResponseAccountInfo, Message, ResponseServerInfo } from '../types';

export const getParams = (message: string): Message => {
  try {
    const parsedMessage: Message = JSON.parse(message);
    return parsedMessage;
  } catch (err) {
    return {
      id: 0,
      command: 'ERROR',
      params: null,
    };
  }
};

export const prepareMessage = (
  id: number,
  message: string,
  data: Error | ResponseServerInfo | ResponseAccountInfo | string,
): string => {
  return JSON.stringify({ id, message, data });
};
