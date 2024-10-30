import { prepareMessage, prepareErrorMessage } from '../utils/message.js';
import { blockfrostAPI } from '../utils/blockfrost-api.js';
import { logger } from '../utils/logger.js';
import { MessageId } from '../types/message.js';

export default async (
  id: MessageId,
  clientId: string,
  hashOrNumber: string | number,
): Promise<string> => {
  try {
    const block = await blockfrostAPI.blocks(hashOrNumber);
    const message = prepareMessage(id, clientId, block);

    return message;
  } catch (error) {
    logger.error(error);
    const message = prepareErrorMessage(id, clientId, error);

    return message;
  }
};
