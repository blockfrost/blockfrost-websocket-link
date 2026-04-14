import { blockfrostAPI } from '../utils/blockfrost-api.js';

export default async () => {
  const epochsLatest = await blockfrostAPI.epochsLatest();
  const epochsParameters = await blockfrostAPI.epochsParameters(epochsLatest.epoch);

  return { lovelacePerByte: epochsParameters.min_fee_a };
};
