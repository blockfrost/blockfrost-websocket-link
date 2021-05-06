import { prepareMessage, prepareErrorMessage } from '../utils/message';
import { MESSAGES_RESPONSE } from '../constants';
import { Responses } from '@blockfrost/blockfrost-js';
import { discoverAddresses, addressesToUtxos } from '../utils/address';

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
    let result: Responses['address_utxo_content'] = [];
    const utxosResult = await addressesToUtxos(addresses);

    utxosResult.map(utxoRow => {
      const data = utxoRow.data;
      if (data === 'empty') return;

      result = result.concat(data);
    });

    const message = prepareMessage(id, MESSAGES_RESPONSE.ACCOUNT_UTXO, result);
    return message;
  } catch (err) {
    console.log(err);
    const message = prepareErrorMessage(id, MESSAGES_RESPONSE.ACCOUNT_UTXO, err.data);
    return message;
  }
};
