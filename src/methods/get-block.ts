import { prepareMessage, prepareErrorMessage } from '../utils/message.js';
import { blockfrostAPI } from '../utils/blockfrost-api.js';
import { logger } from '../utils/logger.js';

export default async (
  msgId: number,
  clientId: string,
  hashOrNumber: string | number,
): Promise<string> => {
  try {
    const block = await blockfrostAPI.blocks(hashOrNumber);
    const message = prepareMessage(msgId, clientId, block);

    return message;
  } catch (error) {
    logger.error(error);
    const message = prepareErrorMessage(msgId, clientId, error);

    return message;
  }
};
