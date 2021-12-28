import * as Responses from '../types/response';
import BigNumber from 'bignumber.js';
import * as Messages from '../types/message';
import {
  discoverAddresses,
  getStakingData,
  getStakingAccountTotal,
  memoizedDeriveAddress,
} from '../utils/address';
import { getAccountTxids, getAccountAddressesData } from '../utils/account';
import { txIdsToTransactions } from '../utils/transaction';
import { prepareMessage, prepareErrorMessage } from '../utils/message';
import { paginate } from '../utils/common';
import { getAssetBalance, transformAsset } from '../utils/asset';
import { blockfrostAPI } from '../utils/blockfrostAPI';
import { redisCache } from '../services/redis';

export const getAccountInfo = async (
  publicKey: string,
  details: Messages.Details,
  page = 1,
  pageSize = 25,
): Promise<{
  accountInfo: Responses.AccountInfo;
  txHashList: { address: string; txHash: string }[];
}> => {
  let _addressesCount = 0;
  const tStart = new Date().getTime();
  const pageSizeNumber = Number(pageSize);
  const pageIndex = Number(page) - 1;

  if (page < 1) {
    throw Error('Invalid page number - first page is 1');
  }

  if (!publicKey) {
    throw Error('Missing parameter descriptor');
  }

  const { address: stakeAddress } = memoizedDeriveAddress(
    publicKey,
    2,
    0,
    !!blockfrostAPI.options.isTestnet,
  );
  const [stakeAddressTotal, stakingData] = await Promise.all([
    getStakingAccountTotal(stakeAddress),
    getStakingData(stakeAddress),
  ]);
  const txCount = stakeAddressTotal.tx_count;

  const lovelaceBalance = getAssetBalance(
    'lovelace',
    stakeAddressTotal.sent_sum,
    stakeAddressTotal.received_sum,
  );
  const balanceWithRewards = lovelaceBalance.plus(stakingData.rewards);

  const tokensBalances = stakeAddressTotal.received_sum.map(r => {
    const received = r.quantity;
    const sent = stakeAddressTotal.sent_sum.find(s => s.unit === r.unit)?.quantity ?? '0';
    return {
      unit: r.unit,
      quantity: new BigNumber(received).minus(sent).toFixed(),
    };
  });

  const totalPages = Math.ceil(txCount / pageSize);
  const accountEmpty = txCount === 0; // true if account is unused

  const accountInfo: Responses.AccountInfo = {
    descriptor: publicKey,
    empty: accountEmpty,
    balance: balanceWithRewards.toFixed(),
    availableBalance: lovelaceBalance.toFixed(),
    history: {
      total: txCount,
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

  if (details === 'basic') {
    // for every level of details except basic set token balances
    accountInfo.tokens = tokensBalances.map(t => transformAsset(t));
  }

  let txHashList: { address: string; txHash: string }[] = [];
  if (details === 'txs' || details === 'txids') {
    const [externalAddresses, internalAddresses] = await Promise.all([
      discoverAddresses(publicKey, 0, accountEmpty),
      discoverAddresses(publicKey, 1, accountEmpty),
    ]);

    const addresses = [...externalAddresses, ...internalAddresses];
    _addressesCount = addresses.length; // just a debug helper

    const txids = await getAccountTxids(addresses, accountEmpty);
    txHashList = txids.map(tx => ({ address: tx.address, txHash: tx.tx_hash }));
    const paginatedTxsIds = paginate(txids, pageSizeNumber);
    const requestedPageTxIds = paginatedTxsIds[pageIndex] ?? [];

    if (details === 'txids') {
      // set only txids
      accountInfo.history.txids = requestedPageTxIds.map(t => t.tx_hash);
    } else if (details === 'txs') {
      // fetch full transaction objects and set account.history.transactions
      const txs = await txIdsToTransactions(
        requestedPageTxIds.map(item => ({ address: item.address, data: [item.tx_hash] })),
      );
      accountInfo.history.transactions = txs;

      // fetch data for each address and set account.addresses
      const accountAddresses = await getAccountAddressesData(
        externalAddresses,
        internalAddresses,
        accountEmpty,
      );
      accountInfo.addresses = {
        change: accountAddresses.change,
        used: accountAddresses.used,
        unused: accountAddresses.unused,
      };
    }
  }

  const tEnd = new Date().getTime();
  const duration = (tEnd - tStart) / 1000;

  if (duration > 7) {
    console.warn(
      `Warning: getAccountInfo-${details} for ${publicKey} took ${duration}s. Transactions: ${txCount} Addresses: ${_addressesCount} Tokens: ${tokensBalances.length} `,
    );
  }

  return { accountInfo, txHashList };
};

export const getCachedAccount = async (
  publicKey: string,
  details: Messages.Details,
  page = 1,
  pageSize = 25,
): Promise<Responses.AccountInfo> => {
  const cachedData = await redisCache.getAccount(publicKey);

  if (cachedData) {
    const { address: stakeAddress } = memoizedDeriveAddress(
      publicKey,
      2,
      0,
      !!blockfrostAPI.options.isTestnet,
    );
    const [stakeAddressTotal, stakingData] = await Promise.all([
      getStakingAccountTotal(stakeAddress),
      getStakingData(stakeAddress),
    ]);

    const lovelaceBalance = getAssetBalance(
      'lovelace',
      stakeAddressTotal.sent_sum,
      stakeAddressTotal.received_sum,
    );
    const balanceWithRewards = lovelaceBalance.plus(stakingData.rewards);

    if (stakeAddressTotal.tx_count === cachedData.history.total) {
      if (balanceWithRewards.toFixed() !== cachedData.balance) {
        console.log('balance with rewards does not match. Updating balance.');
        cachedData.balance = balanceWithRewards.toString();
      }

      if (pageSize === cachedData.page.size && page === cachedData.page.index) {
        console.log('same page info, returning cached data');
        return cachedData;
      } else {
        console.log(
          'Client requested not yet cached account page. Retrieving missing transactions',
        );
        const pageIndex = Number(page) - 1;
        const txHashList = await redisCache.getAccountTxHashList(publicKey);
        if (txHashList) {
          console.log(
            'txHashList',
            txHashList.map(tx => tx.txHash),
          );
          // fetch transactions for a given page
          const paginatedTxsIds = paginate(txHashList, Number(pageSize));
          const requestedPageTxIds = paginatedTxsIds[pageIndex] ?? [];
          const txs = await txIdsToTransactions(
            requestedPageTxIds.map(item => ({ address: item.address, data: [item.txHash] })),
            { cache: true }, // use cached txs
          );
          cachedData.history.transactions = txs;
          return cachedData;
        }
      }
    }
  }

  if (cachedData) {
    console.log('Cached data stale. Retrieving account info from a backend.');
  } else {
    console.log('Cached data unavailable. Retrieving account info from a backend.');
  }
  const { accountInfo, txHashList } = await getAccountInfo(publicKey, details, page, pageSize);
  if (details === 'txs') {
    redisCache.storeAccount(accountInfo, txHashList);
  }
  return accountInfo;
};

export default async (
  id: number,
  publicKey: string,
  details: Messages.Details,
  page = 1,
  pageSize = 25,
): Promise<string> => {
  try {
    const accountInfo = await getCachedAccount(publicKey, details, page, pageSize);
    const message = prepareMessage(id, accountInfo);
    return message;
  } catch (err) {
    console.error(err);
    const message = prepareErrorMessage(id, err);
    return message;
  }
};
