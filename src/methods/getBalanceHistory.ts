import { prepareMessage } from '../utils/message';
// import { prepareMessage, prepareErrorMessage } from '../utils/message';
// import { addressesToTxIds, discoverAddresses } from '../utils/address';
// import { txIdsToTransactions } from '../utils/transaction';

// import { getTimeFromSlot, getRatesForDate } from '../utils/common';

export default async (
  id: number,
  publicKey: string,
  from: number,
  to: number,
  groupBy: string,
): Promise<string> => {
  if (!publicKey) {
    const message = prepareMessage(id, 'Missing parameter descriptor');
    return message;
  }

  console.log(from, to, groupBy);

  return 'a';

  // try {
  //   const externalAddresses = await discoverAddresses(publicKey, 0);
  //   const internalAddresses = await discoverAddresses(publicKey, 1);
  //   const addresses = [...externalAddresses, ...internalAddresses];

  //   console.log(from, to, groupBy);

  //   const txIds = await addressesToTxIds(addresses);
  //   const txs = await txIdsToTransactions(txIds);
  //   const result = txs.map(tx => ({
  //     time: getTimeFromSlot(tx.blockInfo.slot || 0),
  //     transaction: tx.txData,
  //     utxo: tx.txUtxos,
  //   }));

  //   const rates = await getRatesForDate(result[0].time);

  //   if (result.length <= 1) {
  //     const item = result[0];
  //     // @ts-ignore
  //     const m = result.forEach(r => {
  //       return {
  //         received: 0,
  //         time: item.time,
  //         sent: 0,
  //         sentToSelf: 0,
  //         rates: rates,
  //       };
  //     });

  //     // @ts-ignore
  //     const message = prepareMessage(id, m);
  //     return message;
  //   }
  //   return 'a';
  // } catch (err) {
  //   console.log(err);
  //   const message = prepareErrorMessage(id, err);
  //   return message;
  // }
};
