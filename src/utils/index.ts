import { AccountInfo, Message, ServerInfo } from '../types';

export const getParams = (message: string): Message => {
  try {
    const parsedMessage: Message = JSON.parse(message);
    return parsedMessage;
  } catch (err) {
    return {
      command: 'ERROR',
      params: null,
    };
  }
};

export const prepareMessage = (
  message: string,
  payload: Error | ServerInfo | AccountInfo | string,
): string => {
  return JSON.stringify({ message, payload });
};
