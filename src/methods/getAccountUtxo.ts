import { prepareMessage, prepareErrorMessage } from '../utils/message';
import { MESSAGES_RESPONSE } from '../constants';
import { discoverAddresses, addressesToUtxos, utxosWithBlocks } from '../utils/address';

export default async (id: number, publicKey: string): Promise<string> => {
  if (!publicKey) {
    const message = prepareMessage(
      id,
      MESSAGES_RESPONSE.ACCOUNT_UTXO,
      'Missing parameter descriptor',
    );

    return message;
  }

  try {
    const externalAddresses = await discoverAddresses(publicKey, 0);
    const internalAddresses = await discoverAddresses(publicKey, 1);
    const addresses = [...externalAddresses, ...internalAddresses];

    const utxosResult = await addressesToUtxos(addresses);
    const utxosBlocks = await utxosWithBlocks(utxosResult);

    const message = prepareMessage(id, MESSAGES_RESPONSE.ACCOUNT_UTXO, utxosBlocks);
    return message;
  } catch (err) {
    console.log(err);
    const message = prepareErrorMessage(id, MESSAGES_RESPONSE.ACCOUNT_UTXO, err.data);
    return message;
  }
};
