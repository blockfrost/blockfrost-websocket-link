import { Address } from '../types/address';
import { Responses } from '@blockfrost/blockfrost-js';
import { addressesToTxIds, discoverAddresses, getAddressesData } from './address';

export const getAccountTxids = async (addresses: Address[], accountEmpty: boolean) => {
  const uniqueTxIds: ({
    address: string;
  } & Responses['address_transactions_content'][number])[] = [];
  if (accountEmpty) return [];

  const transactionsPerAddressList = await addressesToTxIds(addresses);

  // filter only unique txs to prevent counting a transaction that was sent from and to the same account twice
  transactionsPerAddressList.forEach(txsPerAddress => {
    txsPerAddress.data.forEach(addrItem => {
      if (!uniqueTxIds.find(item => addrItem.tx_hash === item.tx_hash)) {
        uniqueTxIds.push({ address: txsPerAddress.address, ...addrItem });
      }
    });
  });

  const sortedTxIds = uniqueTxIds.sort(
    (first, second) => second.block_height - first.block_height || second.tx_index - first.tx_index,
  );

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

export const getAccountTransactionIds = async (accountPublicKey: string) => {
  const externalAddresses = await discoverAddresses(accountPublicKey, 0);
  const internalAddresses = await discoverAddresses(accountPublicKey, 1);
  const addresses = [...externalAddresses, ...internalAddresses];

  const txIds = await addressesToTxIds(addresses);

  return {
    addresses: {
      external: externalAddresses,
      internal: internalAddresses,
      all: addresses,
    },
    txIds,
  };
};
