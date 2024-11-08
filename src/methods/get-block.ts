import { prepareMessage } from '../utils/message.js';
import { blockfrostAPI } from '../utils/blockfrost-api.js';
import { MessageId } from '../types/message.js';

export default async (
  id: MessageId,
  clientId: string,
  hashOrNumber: string | number,
): Promise<string> => {
  const data = await blockfrostAPI.blocks(hashOrNumber);
  const message = prepareMessage({ id, clientId, data });

  return message;
};
