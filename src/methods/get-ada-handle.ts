import { prepareMessage } from '../utils/message.js';
import { blockfrostAPI } from '../utils/blockfrost-api.js';
import { MessageId } from '../types/message.js';
import { BlockfrostServerError } from '@blockfrost/blockfrost-js';

const policyID = 'f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a';

export default async (id: MessageId, clientId: string, name: string): Promise<string> => {
  let data: { address: string } | null;

  try {
    const result = await blockfrostAPI.assetsAddresses(
      policyID + Buffer.from(name, 'utf8').toString('hex'),
    );

    if (result.length > 1) {
      throw new Error('Double minted Ada Handle detected');
    }

    if (result.length === 0) {
      data = null;
    } else {
      const { address } = result[0];

      data = { address };
    }
  } catch (error) {
    if (error instanceof BlockfrostServerError && error.status_code === 404) {
      data = null;
    } else {
      throw error;
    }
  }

  return prepareMessage({ id, clientId, data });
};
