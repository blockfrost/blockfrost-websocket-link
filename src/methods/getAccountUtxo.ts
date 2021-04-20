import { prepareMessage } from '../utils/messages';
import { MESSAGES } from '../constants';
import { addressesToUtxos, getAddresses } from '../utils/address';

export default async (id: number, publicKey: string): Promise<string> => {
  if (!publicKey) {
    const message = prepareMessage(id, MESSAGES.GET_ACCOUNT_UTXO, 'Missing parameter descriptor');
    return message;
  }

  try {
    const externalAddresses = await getAddresses(publicKey, 0);
    const internalAddresses = await getAddresses(publicKey, 1);

    const addresses = [...externalAddresses, ...internalAddresses];
    const utxos = await addressesToUtxos(addresses);
    const message = prepareMessage(id, MESSAGES.GET_ACCOUNT_UTXO, utxos);
    return message;
  } catch (err) {
    console.log(err);
    const message = prepareMessage(id, MESSAGES.GET_ACCOUNT_UTXO, 'Error');
    return message;
  }
};
