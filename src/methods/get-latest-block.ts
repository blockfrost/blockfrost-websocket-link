import { prepareMessage } from '../utils/message.js';
import { blockfrostAPI } from '../utils/blockfrost-api.js';

export default async (id: number, clientId: string): Promise<string> => {
  const data = await blockfrostAPI.blocksLatest();
  const message = prepareMessage({ id, clientId, data });

  return message;
};
