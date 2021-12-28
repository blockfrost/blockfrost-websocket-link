import { prepareMessage, prepareErrorMessage } from '../utils/message';
import { discoverAddresses, addressesToUtxos, utxosWithBlocks } from '../utils/address';
import { UtxosWithBlockResponse } from '../types/address';
import { redisCache } from '../services/redis';

export const getAccountUtxo = async (publicKey: string): Promise<UtxosWithBlockResponse[]> => {
  const externalAddresses = await discoverAddresses(publicKey, 0);
  const internalAddresses = await discoverAddresses(publicKey, 1);
  const addresses = [...externalAddresses, ...internalAddresses];

  const utxosResult = await addressesToUtxos(addresses);
  const utxosBlocks = await utxosWithBlocks(utxosResult);
  return utxosBlocks;
};

export const getCachedAccountUtxo = async (
  publicKey: string,
): Promise<UtxosWithBlockResponse[]> => {
  // todo: invalidation
  const cachedAccountUtxo = await redisCache.getAccountUtxo(publicKey);
  if (cachedAccountUtxo) {
    console.log(`Returning cached account utxo ${publicKey}`);
    return cachedAccountUtxo;
  } else {
    console.log(`Retrieving account utxo ${publicKey}`);
    const accountUtxo = await getAccountUtxo(publicKey);
    await redisCache.storeAccountUtxo(publicKey, accountUtxo);
    return accountUtxo;
  }
};

export default async (id: number, publicKey: string): Promise<string> => {
  if (!publicKey) {
    const message = prepareMessage(id, 'Missing parameter descriptor');
    return message;
  }

  try {
    const utxosBlocks = await getCachedAccountUtxo(publicKey);
    const message = prepareMessage(id, utxosBlocks);
    return message;
  } catch (err) {
    console.log(err);
    const message = prepareErrorMessage(id, err);
    return message;
  }
};
