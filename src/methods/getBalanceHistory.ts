import { prepareMessage, prepareErrorMessage } from '../utils/message';
import { addressesToTxIds, discoverAddresses } from '../utils/address';
import { txIdsToTransactions } from '../utils/transaction';

export default async (id: number, publicKey: string): Promise<string> => {
  if (!publicKey) {
    const message = prepareMessage(id, 'Missing parameter descriptor');

    return message;
  }

  try {
    const externalAddresses = await discoverAddresses(publicKey, 0);
    const internalAddresses = await discoverAddresses(publicKey, 1);
    const addresses = [...externalAddresses, ...internalAddresses];

    const txIds = await addressesToTxIds(addresses);
    const txs = await txIdsToTransactions(txIds);

    const message = prepareMessage(id, txs);
    return message;
  } catch (err) {
    console.log(err);
    const message = prepareErrorMessage(id, err);
    return message;
  }
};
