import { prepareMessage, prepareErrorMessage, prepareGenericErrorMessage } from '../utils/message';
import { blockfrostAPI } from '../utils/blockfrostAPI';

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
    console.log(err);
    if (err instanceof Error) {
      const message = prepareErrorMessage(id, err);
      return message;
    } else {
      const message = prepareGenericErrorMessage(id, err);
      return message;
    }
  }
};
