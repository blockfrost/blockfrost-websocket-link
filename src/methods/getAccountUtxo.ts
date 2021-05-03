import { prepareMessage } from '../utils/message';
import { MESSAGES } from '../constants';
import { Responses } from '@blockfrost/blockfrost-js';
import { discoverAddresses, addressesUtxos } from '../utils/address';

export default async (id: number, publicKey: string): Promise<string> => {
  if (!publicKey) {
    const message = prepareMessage(id, MESSAGES.ACCOUNT_INFO, 'Missing parameter descriptor');
    return message;
  }

  try {
    const externalAddresses = await discoverAddresses(publicKey, 0);
    const internalAddresses = await discoverAddresses(publicKey, 1);
    const addresses = [...externalAddresses, ...internalAddresses];
    const result: Responses['address_utxo_content'] = [];
    const utxosResult = await addressesUtxos(addresses);

    utxosResult.map(utxoRow => {
      const data = utxoRow.data;
      if (data === 'empty') return;
      result.concat(data);
    });

    const message = prepareMessage(id, MESSAGES.ACCOUNT_INFO, result);
    return message;
  } catch (err) {
    console.log(err);
    const message = prepareMessage(id, MESSAGES.ACCOUNT_INFO, 'Error');
    return message;
  }
};
