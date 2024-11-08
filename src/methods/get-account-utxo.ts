import { prepareMessage } from '../utils/message.js';
import { discoverAddresses, addressesToUtxos, utxosWithBlocks } from '../utils/address.js';
import { MessageId } from '../types/message.js';

export default async (id: MessageId, clientId: string, publicKey: string): Promise<string> => {
  const externalAddresses = await discoverAddresses(publicKey, 0);
  const internalAddresses = await discoverAddresses(publicKey, 1);
  const addresses = [...externalAddresses, ...internalAddresses];

  const utxosResult = await addressesToUtxos(addresses);
  const data = await utxosWithBlocks(utxosResult);

  const message = prepareMessage({ id, clientId, data });

  return message;
};
