import { discoverAddresses, addressesToUtxos, utxosWithBlocks } from '../utils/address.js';

export default async (publicKey: string) => {
  const externalAddresses = await discoverAddresses(publicKey, 0);
  const internalAddresses = await discoverAddresses(publicKey, 1);
  const addresses = [...externalAddresses, ...internalAddresses];

  const utxosResult = await addressesToUtxos(addresses);

  return utxosWithBlocks(utxosResult);
};
