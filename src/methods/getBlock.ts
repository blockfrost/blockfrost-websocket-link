import { prepareMessage, prepareErrorMessage, prepareGenericErrorMessage } from '../utils/message';
import { blockfrostAPI } from '../utils/blockfrostAPI';

export default async (id: number, hashOrNumber: string | number): Promise<string> => {
  try {
    const block = await blockfrostAPI.blocks(hashOrNumber);
    const message = prepareMessage(id, block);
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
