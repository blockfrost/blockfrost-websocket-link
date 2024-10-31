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
    const data = await blockfrostAPI.blocks(hashOrNumber);
    const message = prepareMessage({ id, clientId, data });

    return message;
  } catch (error) {
    logger.error(error);
    const message = prepareErrorMessage(id, clientId, error);

    return message;
  }
};
