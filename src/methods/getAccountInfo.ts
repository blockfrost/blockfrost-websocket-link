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

export default async (
  id: number,
  publicKey: string,
  details: Messages.Details,
  page = 0,
  pageSize = 25,
): Promise<string> => {
  const pageSizeNumber = Number(pageSize);
  const pageNumber = Number(page);

  if (!publicKey) {
    const message = prepareErrorMessage(id, 'Missing parameter descriptor');

    return message;
  }

  try {
    const externalAddresses = await discoverAddresses(publicKey, 0);
    const internalAddresses = await discoverAddresses(publicKey, 1);

    const addresses = [...externalAddresses, ...internalAddresses];
    const empty = await isAccountEmpty(addresses);
    const balances = await addressesToBalances(addresses);

    const lovelaceBalance = balances.find(b => b.unit === 'lovelace');
    const tokensBalances = balances.filter(b => b.unit !== 'lovelace');

    const usedExternalAddresses = externalAddresses.filter(a => a.data !== 'empty');
    const unusedExternalAddresses = externalAddresses.filter(a => a.data === 'empty');

    const change = await getAddressesData(internalAddresses);
    const used = await getAddressesData(usedExternalAddresses);
    const unused = await getAddressesData(unusedExternalAddresses, true);

    const accountInfo: Responses.AccountInfo = {
      descriptor: publicKey,
      empty,
      addresses: {
        change,
        used,
        unused,
      },
      balance: lovelaceBalance?.quantity || '0',
      availableBalance: lovelaceBalance?.quantity || '0',
      history: {
        total: 0,
        unconfirmed: 0,
        transactions: [],
      },
      page: {
        index: page,
        size: pageSize,
        total: 0,
      },
    };

    if (details !== 'basic') {
      accountInfo.tokens = tokensBalances;
    }

    if (details === 'txs' || details === 'txids') {
      try {
        const transactionsIds = await addressesToTxIds(addresses);
        const txs = await txIdsToTransactions(transactionsIds);
        const paginatedTxs = paginate(txs, pageSizeNumber);
        const paginatedTxsCount = paginatedTxs.length;

        if (paginatedTxsCount > page) {
          accountInfo.history.transactions = paginatedTxs[pageNumber];
          accountInfo.history.total = paginatedTxs.length;
        }

        accountInfo.page.total = paginatedTxs.length;
      } catch (err) {
        const message = prepareMessage(id, accountInfo);
        return message;
      }
    }

    const message = prepareMessage(id, accountInfo);
    return message;
  } catch (err) {
    console.log(err);
    const message = prepareMessage(id, err);
    return message;
  }
};
