import { prepareMessage, prepareErrorMessage } from '../utils/message';
import { blockfrostAPI } from '../utils/blockfrostAPI';
import { logger } from '../utils/logger';

export default async (id: number): Promise<string> => {
  try {
    const epochsLatest = await blockfrostAPI.epochsLatest();
    const epochsParameters = await blockfrostAPI.epochsParameters(epochsLatest.epoch);

    const result = {
      lovelacePerByte: epochsParameters.min_fee_a,
    };

    const message = prepareMessage(id, result);
    return message;
  } catch (err) {
    logger.error(err);
    const message = prepareErrorMessage(id, err);
    return message;
  }
};
