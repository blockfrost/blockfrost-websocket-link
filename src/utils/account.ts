import { Address } from '../types/address';
import { Responses } from '@blockfrost/blockfrost-js';
import { addressesToTxIds, discoverAddresses, getAddressesData } from './address';

export const getTxidsFromAccountAddresses = async (addresses: Address[], accountEmpty: boolean) => {
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

export const getAccountTransactionHistory = async (params: {
  accountPublicKey: string;
  deriveByronAddresses?: boolean;
}) => {
  const externalAddresses = await discoverAddresses(params.accountPublicKey, 0);
  const internalAddresses = await discoverAddresses(params.accountPublicKey, 1);
  let byronExternalAddresses: Address[] = [];
  let byronInternalAddresses: Address[] = [];

  const isEmpty =
    externalAddresses.every(a => a.data === 'empty') &&
    internalAddresses.every(a => a.data === 'empty');

  const addresses = [...externalAddresses, ...internalAddresses];

  if (params.deriveByronAddresses) {
    // discover byron addresses only if account is non empty, we don't really care about txs history on byron
    // we just need byron addresses to properly assign byron inputs that could be used in a transaction
    byronExternalAddresses = !isEmpty
      ? await discoverAddresses(params.accountPublicKey, 0, false, true)
      : [];
    byronInternalAddresses = !isEmpty
      ? await discoverAddresses(params.accountPublicKey, 1, false, true)
      : [];
  }

  const txIds = await getTxidsFromAccountAddresses(addresses, false);

  return {
    addresses: {
      external: [...externalAddresses, ...byronExternalAddresses],
      internal: [...internalAddresses, ...byronInternalAddresses],
      all: [...addresses, ...byronExternalAddresses, ...byronInternalAddresses],
    },
    txIds,
  };
};
