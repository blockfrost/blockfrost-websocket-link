import { Address } from '../types/address.js';
import {
  AddressesToTxIds,
  addressesToTxIds,
  discoverAddresses,
  getAddressesData,
} from './address.js';

export const getTxidsFromAccountAddresses = async (
  addresses: Address[],
  accountEmpty: boolean,
  mempool?: boolean,
) => {
  const uniqueTxIds: ({
    address: string;
  } & AddressesToTxIds[number]['data'][number])[] = [];

  if (accountEmpty) {
    return [];
  }

  const transactionsPerAddressList = await addressesToTxIds(addresses, mempool);

  // filter only unique txs to prevent counting a transaction that was sent from and to the same account twice
  for (const txsPerAddress of transactionsPerAddressList) {
    for (const addrItem of txsPerAddress.data) {
      if (!uniqueTxIds.some(item => addrItem.tx_hash === item.tx_hash)) {
        uniqueTxIds.push({ address: txsPerAddress.address, ...addrItem });
      }
    }
  }

  const sortedTxIds = uniqueTxIds.sort((first, second) => {
    if (first.mempool) {
      return -1;
    }

    if (second.mempool) {
      return 1;
    }

    return second.block_height - first.block_height || second.tx_index - first.tx_index;
  });

  return sortedTxIds;
};

export const getAccountAddressesData = async (
  externalAddresses: Address[],
  internalAddresses: Address[],
  accountEmpty: boolean,
) => {
  const usedExternalAddresses = externalAddresses.filter(a => a.data !== 'empty');
  const unusedExternalAddresses = externalAddresses.filter(a => a.data === 'empty');
  const change = await getAddressesData(internalAddresses, accountEmpty);
  const used = await getAddressesData(usedExternalAddresses, accountEmpty);

  const unused = unusedExternalAddresses.map(addressData => ({
    address: addressData.address,
    path: addressData.path,
    transfers: 0,
    received: '0',
    sent: '0',
  }));

  return { change, used, unused };
};

export const getAccountTransactionHistory = async (parameters: { accountPublicKey: string }) => {
  const externalAddresses = await discoverAddresses(parameters.accountPublicKey, 0);
  const internalAddresses = await discoverAddresses(parameters.accountPublicKey, 1);
  const addresses = [...externalAddresses, ...internalAddresses];

  const txIds = await getTxidsFromAccountAddresses(addresses, false);

  return {
    addresses: {
      external: [...externalAddresses],
      internal: [...internalAddresses],
      all: [...addresses],
    },
    txIds,
  };
};
