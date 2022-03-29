import { prepareMessage, prepareErrorMessage } from '../utils/message';
import { discoverAddresses, addressesToUtxos, utxosWithBlocks } from '../utils/address';
import { logger } from '../utils/logger';

export default async (id: number, publicKey: string): Promise<string> => {
  if (!publicKey) {
    const message = prepareMessage(id, 'Missing parameter descriptor');

    return message;
  }

  try {
    const externalAddresses = await discoverAddresses(publicKey, 0);
    const internalAddresses = await discoverAddresses(publicKey, 1);
    const addresses = [...externalAddresses, ...internalAddresses];

    const utxosResult = await addressesToUtxos(addresses);
    const utxosBlocks = await utxosWithBlocks(utxosResult);

    const message = prepareMessage(id, utxosBlocks);

    return message;
  } catch (error) {
    logger.error(error);
    const message = prepareErrorMessage(id, error);

    return message;
  }
};
