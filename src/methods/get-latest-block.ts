import { prepareMessage, prepareErrorMessage } from '../utils/message';
import { blockfrostAPI } from '../utils/blockfrost-api';
import { logger } from '../utils/logger';

export default async (id: number): Promise<string> => {
  try {
    const block = await blockfrostAPI.blocksLatest();
    const message = prepareMessage(id, block);

    return message;
  } catch (error) {
    logger.error(error);
    const message = prepareErrorMessage(id, error);

    return message;
  }
};
