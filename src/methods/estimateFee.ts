import { prepareMessage, prepareErrorMessage } from '../utils/message';
import { blockfrostAPI } from '../utils/blockfrostAPI';

export default async (id: number): Promise<string> => {
  try {
    const epochsLatest = await blockfrostAPI.epochsLatest();
    const epochsParameters = await blockfrostAPI.epochsParameters(epochsLatest.epoch);
    const message = prepareMessage(id, {
      lovelacePerByte: epochsParameters.min_fee_a,
    });
    return message;
  } catch (err) {
    console.log(err);
    const message = prepareErrorMessage(id, err);
    return message;
  }
};
