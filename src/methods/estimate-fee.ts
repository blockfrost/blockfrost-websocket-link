import { prepareMessage } from '../utils/message.js';
import { blockfrostAPI } from '../utils/blockfrost-api.js';
import { MessageId } from '../types/message.js';

export default async (id: MessageId, clientId: string): Promise<string> => {
  const epochsLatest = await blockfrostAPI.epochsLatest();
  const epochsParameters = await blockfrostAPI.epochsParameters(epochsLatest.epoch);

  const message = prepareMessage({
    id,
    clientId,
    data: { lovelacePerByte: epochsParameters.min_fee_a },
  });

  return message;
};
