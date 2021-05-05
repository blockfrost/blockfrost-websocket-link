import * as Responses from '../types/response';
import * as Messages from '../types/message';
import { discoverAddresses, addressesToBalances, addressesToTxIds } from '../utils/address';
import { txIdsToTransactions } from '../utils/transaction';
import { prepareMessage, prepareErrorMessage } from '../utils/message';
import { paginate } from '../utils/common';
import { MESSAGES_RESPONSE } from '../constants';

export default async (
  id: number,
  publicKey: string,
  details: Messages.Details,
  page = 1,
  pageSize = 25,
): Promise<string> => {
  const pageSizeNumber = Number(pageSize);
  const pageNumber = Number(page);

  if (!publicKey) {
    const message = prepareErrorMessage(
      id,
      MESSAGES_RESPONSE.ACCOUNT_INFO,
      'Missing parameter descriptor',
    );
    return message;
  }

  try {
    const externalAddresses = await discoverAddresses(publicKey, 0);
    const internalAddresses = await discoverAddresses(publicKey, 1);

    const addresses = [...externalAddresses, ...internalAddresses];
    const balances = await addressesToBalances(addresses);

    const lovelaceBalance = balances.find(b => b.unit === 'lovelace');
    const tokensBalances = balances.filter(b => b.unit !== 'lovelace');

    const accountInfo: Responses.AccountInfo = {
      descriptor: publicKey,
      balance: lovelaceBalance?.quantity || '0',
    };

    if (details !== 'basic') {
      accountInfo.tokens = tokensBalances;
    }

    if (details === 'txids') {
      try {
        const transactionsIds = await addressesToTxIds(addresses);
        accountInfo.transactions = transactionsIds;
      } catch (err) {
        const message = prepareMessage(id, MESSAGES_RESPONSE.ACCOUNT_INFO, accountInfo);
        return message;
      }
    }

    if (details === 'txs') {
      try {
        const transactionsIds = await addressesToTxIds(addresses);
        const txs = await txIdsToTransactions(transactionsIds);
        const paginatedTxs = paginate(txs, pageSizeNumber);
        accountInfo.transactions = paginatedTxs[pageNumber - 1];
        accountInfo.totalPages = paginatedTxs.length;
      } catch (err) {
        const message = prepareMessage(id, MESSAGES_RESPONSE.ACCOUNT_INFO, accountInfo);
        return message;
      }
    }

    const message = prepareMessage(id, MESSAGES_RESPONSE.ACCOUNT_INFO, accountInfo);
    return message;
  } catch (err) {
    console.log(err);
    const message = prepareMessage(id, MESSAGES_RESPONSE.ACCOUNT_INFO, err.data);
    return message;
  }
};
