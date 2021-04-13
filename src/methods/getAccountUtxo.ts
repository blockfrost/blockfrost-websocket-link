import { prepareMessage } from '../utils/messages';
import { MESSAGES } from '../constants';

export default async (id: number, publicKey: string): Promise<string> => {
  if (!publicKey) {
    const message = prepareMessage(id, MESSAGES.GET_ACCOUNT_UTXO, 'Missing parameter descriptor');
    return message;
  }

  try {
    const accountUtxo = 'a';
    const message = prepareMessage(id, MESSAGES.GET_ACCOUNT_INFO, accountUtxo);
    return message;
  } catch (err) {
    const message = prepareMessage(id, MESSAGES.GET_ACCOUNT_UTXO, 'Error');
    return message;
  }
};
