import * as Responses from '../types/response';
import { Responses as BackendResponse } from '@blockfrost/blockfrost-js';
import BigNumber from 'bignumber.js';
import * as Messages from '../types/message';
import {
  discoverAddresses,
  addressesToBalances,
  addressesToTxIds,
  getAddressesData,
  getStakingData,
  memoizedDeriveStakeAddress,
} from '../utils/address';
import { txIdsToTransactions } from '../utils/transaction';
import { prepareMessage, prepareErrorMessage } from '../utils/message';
import { paginate } from '../utils/common';
import { transformAsset } from '../utils/asset';

export default async (
  id: number,
  publicKey: string,
  details: Messages.Details,
  page = 1,
  pageSize = 25,
): Promise<string> => {
  const tStart = new Date().getTime();
  const pageSizeNumber = Number(pageSize);
  const pageIndex = Number(page) - 1;

  if (page < 1) {
    const message = prepareErrorMessage(id, 'Invalid page number - first page is 1');
    return message;
  }

  if (!publicKey) {
    const message = prepareErrorMessage(id, 'Missing parameter descriptor');
    return message;
  }

  try {
    const [externalAddresses, internalAddresses] = await Promise.all([
      discoverAddresses(publicKey, 0),
      discoverAddresses(publicKey, 1),
    ]);
    const stakeAddress = memoizedDeriveStakeAddress(publicKey);

    const addresses = [...externalAddresses, ...internalAddresses];
    const [transactionsPerAddressList, stakingData] = await Promise.all([
      addressesToTxIds(addresses),
      getStakingData(stakeAddress),
    ]);

    const empty = !transactionsPerAddressList.find(txs => txs.data.length > 0);
    const balances = addressesToBalances(addresses);
    const lovelaceBalance = balances.find(b => b.unit === 'lovelace');
    const tokensBalances = balances.filter(b => b.unit !== 'lovelace');

    const uniqueTxIds: ({
      address: string;
    } & BackendResponse['address_transactions_content'][number])[] = [];
    transactionsPerAddressList.forEach(txsPerAddress => {
      txsPerAddress.data.forEach(addrItem => {
        if (!uniqueTxIds.find(item => addrItem.tx_hash === item.tx_hash)) {
          uniqueTxIds.push({ address: txsPerAddress.address, ...addrItem });
        }
      });
    });

    const balanceBig = new BigNumber(lovelaceBalance?.quantity || '0').plus(stakingData.rewards);

    const totalPages = Math.ceil(uniqueTxIds.length / pageSize);

    const accountInfo: Responses.AccountInfo = {
      descriptor: publicKey,
      empty,
      balance: balanceBig.toString(),
      availableBalance: lovelaceBalance?.quantity || '0',
      history: {
        total: uniqueTxIds.length,
        unconfirmed: 0,
      },
      page: {
        index: page,
        size: pageSize,
        total: totalPages,
      },
      misc: {
        staking: {
          address: stakeAddress,
          rewards: stakingData.rewards,
          isActive: stakingData.isActive,
          poolId: stakingData.poolId,
        },
      },
    };

    if (details !== 'basic') {
      accountInfo.tokens = tokensBalances.map(t => transformAsset(t));
    }

    if (details === 'txs' || details === 'txids') {
      const sortedTxIds = uniqueTxIds.sort(
        (first, second) =>
          second.block_height - first.block_height || second.tx_index - first.tx_index,
      );
      const paginatedTxsIds = paginate(sortedTxIds, pageSizeNumber);
      const requestedPageTxIds = paginatedTxsIds[pageIndex] ?? [];
      accountInfo.page.total = totalPages; // number of pages

      if (details === 'txs') {
        const txs = await txIdsToTransactions(
          requestedPageTxIds.map(item => ({ address: item.address, data: [item.tx_hash] })),
        );
        accountInfo.history.transactions = txs;
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

      if (details === 'txids') {
        accountInfo.history.txids = requestedPageTxIds.map(t => t.tx_hash);
      }
    }

    const message = prepareMessage(id, accountInfo);
    const tEnd = new Date().getTime();
    const duration = (tEnd - tStart) / 1000;

    if (duration > 7) {
      console.warn(
        `Warning: getAccountInfo-(${details}) took ${duration}s. Transactions: ${uniqueTxIds.length} Addresses: ${addresses.length} Tokens: ${tokensBalances.length} `,
      );
    }

    return message;
  } catch (err) {
    console.log(err);
    const message = prepareErrorMessage(id, err);
    return message;
  }
};
