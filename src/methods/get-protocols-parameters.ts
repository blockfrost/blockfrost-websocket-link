import { prepareMessage } from '../utils/message.js';
import { blockfrostAPI } from '../utils/blockfrost-api.js';
import { MessageId } from '../types/message.js';
import { limiter } from '../utils/limiter.js';

export default async (id: MessageId, clientId: string) =>
  prepareMessage({
    id,
    clientId,
    data: await limiter(() => blockfrostAPI.epochsLatestParameters()),
  });
