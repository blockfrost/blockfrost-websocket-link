import { blockfrostAPI } from '../utils/blockfrost-api.js';
import { limiter } from '../utils/limiter.js';

export default async () => {
  const epochsLatest = await limiter(() => blockfrostAPI.epochsLatest());
  const epochsParameters = await limiter(() => blockfrostAPI.epochsParameters(epochsLatest.epoch));

  return { lovelacePerByte: epochsParameters.min_fee_a };
};
