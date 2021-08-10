import * as Responses from '../types/response';
import * as Messages from '../types/message';
import {
  discoverAddresses,
  addressesToBalances,
  addressesToTxIds,
  isAccountEmpty,
  getAddressesData,
} from '../utils/address';
import { txIdsToTransactions } from '../utils/transaction';
import { prepareMessage, prepareErrorMessage } from '../utils/message';
import { paginate } from '../utils/common';
import { transformToken } from '../utils/asset';

export default async (
  id: number,
  publicKey: string,
  details: Messages.Details,
  page = 1,
  pageSize = 25,
): Promise<string> => {
  const pageSizeNumber = Number(pageSize);
  const pageNumber = Number(page) - 1;

  if (!publicKey) {
    const message = prepareErrorMessage(id, 'Missing parameter descriptor');

    return message;
  }

  try {
    const externalAddresses = await discoverAddresses(publicKey, 0);
    const internalAddresses = await discoverAddresses(publicKey, 1);

    const addresses = [...externalAddresses, ...internalAddresses];
    const empty = await isAccountEmpty(addresses);
    const transactionsPerAddressList = await addressesToTxIds(addresses);
    const balances = await addressesToBalances(addresses);

    const lovelaceBalance = balances.find(b => b.unit === 'lovelace');
    const tokensBalances = balances.filter(b => b.unit !== 'lovelace');
    const txCount = transactionsPerAddressList.reduce((acc, item) => acc + item.data.length, 0);

    const accountInfo: Responses.AccountInfo = {
      descriptor: publicKey,
      empty,
      balance: lovelaceBalance?.quantity || '0',
      availableBalance: lovelaceBalance?.quantity || '0',
      history: {
        total: txCount,
        unconfirmed: 0,
      },
      page: {
        index: page,
        size: pageSize,
        total: Math.ceil(txCount / pageSize),
      },
    };

    if (details !== 'basic') {
      accountInfo.tokens = tokensBalances.map(t => transformToken(t));
    }

    if (details === 'txs' || details === 'txids') {
      const txs = await txIdsToTransactions(transactionsPerAddressList);
      const paginatedTxs = paginate(txs, pageSizeNumber);
      accountInfo.history.transactions = paginatedTxs[pageNumber];
      accountInfo.history.total = txs.length;
      accountInfo.page.total = paginatedTxs.length;
    }

    if (details === 'txs') {
      const usedExternalAddresses = externalAddresses.filter(a => a.data !== 'empty');
      const unusedExternalAddresses = externalAddresses.filter(a => a.data === 'empty');
      const change = await getAddressesData(internalAddresses);
      const used = await getAddressesData(usedExternalAddresses);

      const unused = unusedExternalAddresses.map(addressData => ({
        address: addressData.address,
        path: addressData.path,
        transfers: 0,
        received: '0',
        sent: '0',
      }));

      accountInfo.addresses = {
        change,
        used,
        unused,
      };
    }

    const message = prepareMessage(id, accountInfo);
    return message;
  } catch (err) {
    console.log(err);
    const message = prepareErrorMessage(id, err);
    return message;
  }
};
