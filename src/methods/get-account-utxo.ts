import { prepareMessage, prepareErrorMessage } from '../utils/message.js';
import { discoverAddresses, addressesToUtxos, utxosWithBlocks } from '../utils/address.js';
import { logger } from '../utils/logger.js';

export default async (msgId: number, clientId: string, publicKey: string): Promise<string> => {
  if (!publicKey) {
    const message = prepareMessage(msgId, 'Missing parameter descriptor', clientId);

    return message;
  }

  try {
    const externalAddresses = await discoverAddresses(publicKey, 0);
    const internalAddresses = await discoverAddresses(publicKey, 1);
    const addresses = [...externalAddresses, ...internalAddresses];

    const utxosResult = await addressesToUtxos(addresses);
    const utxosBlocks = await utxosWithBlocks(utxosResult);

    const message = prepareMessage(msgId, clientId, utxosBlocks);

    return message;
  } catch (error) {
    logger.error(error);
    const message = prepareErrorMessage(msgId, clientId, error);

    return message;
  }
};
