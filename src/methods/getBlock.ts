import { prepareMessage, prepareErrorMessage } from '../utils/message';
import { blockfrostAPI } from '../utils/blockfrostAPI';
import { logger } from '../utils/logger';

export default async (id: number, hashOrNumber: string | number): Promise<string> => {
  try {
    const block = await blockfrostAPI.blocks(hashOrNumber);
    const message = prepareMessage(id, block);
    return message;
  } catch (err) {
    logger.error(err);
    const message = prepareErrorMessage(id, err);
    return message;
  }
};
