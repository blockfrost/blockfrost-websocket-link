import { prepareMessage, prepareErrorMessage } from '../utils/message.js';
import { blockfrostAPI } from '../utils/blockfrost-api.js';
import { logger } from '../utils/logger.js';

export default async (id: number, clientId: string): Promise<string> => {
  try {
    const block = await blockfrostAPI.blocksLatest();
    const message = prepareMessage(id, clientId, block);

    return message;
  } catch (error) {
    logger.error(error);
    const message = prepareErrorMessage(id, clientId, error);

    return message;
  }
};
