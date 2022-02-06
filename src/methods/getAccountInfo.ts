import * as Responses from '../types/response';
import BigNumber from 'bignumber.js';
import * as Messages from '../types/message';
import {
  discoverAddresses,
  getStakingData,
  getStakingAccountTotal,
  memoizedDeriveAddress,
} from '../utils/address';
import { getTxidsFromAccountAddresses, getAccountAddressesData } from '../utils/account';
import { txIdsToTransactions } from '../utils/transaction';
import { prepareMessage, prepareErrorMessage } from '../utils/message';
import { paginate } from '../utils/common';
import { getAssetBalance, getAssetData, transformAsset } from '../utils/asset';
import { blockfrostAPI } from '../utils/blockfrostAPI';

export const getAccountInfo = async (
  publicKey: string,
  details: Messages.Details,
  page = 1,
  pageSize = 25,
  deriveByronAddresses?: boolean,
): Promise<Responses.AccountInfo> => {
  let _addressesCount = 0;
  let _byronAddressesCount = 0;
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
    false,
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

  const tokensBalances = stakeAddressTotal.received_sum
    .map(r => {
      const received = r.quantity;
      const sent = stakeAddressTotal.sent_sum.find(s => s.unit === r.unit)?.quantity ?? '0';
      return {
        unit: r.unit,
        quantity: new BigNumber(received).minus(sent).toFixed(),
      };
    })
    .filter(b => b.quantity !== '0' && b.unit !== 'lovelace');

  const tokenMetadataPromises = tokensBalances.map(token => getAssetData(token.unit));
  const tokenMetadata = await Promise.all(tokenMetadataPromises);

  const totalPages = Math.ceil(txCount / pageSize);
  const accountEmpty = txCount === 0; // true if account is unused

  const accountInfo: Responses.AccountInfo = {
    descriptor: publicKey,
    empty: accountEmpty,
    balance: balanceWithRewards.toFixed(),
    availableBalance: lovelaceBalance.toFixed(),
    tokens: tokensBalances.map((t, index) => transformAsset(t, tokenMetadata[index])),
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

  if (details === 'txs' || details === 'txids') {
    const [externalAddresses, internalAddresses] = await Promise.all([
      discoverAddresses(publicKey, 0, accountEmpty),
      discoverAddresses(publicKey, 1, accountEmpty),
    ]);

    const addresses = [...externalAddresses, ...internalAddresses];

    _addressesCount = addresses.length; // just a debug helper

    const txids = await getTxidsFromAccountAddresses(addresses, accountEmpty);
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

      if (deriveByronAddresses) {
        const [externalAddressesByron, internalAddressesByron] = await Promise.all([
          discoverAddresses(publicKey, 0, accountEmpty, true),
          discoverAddresses(publicKey, 1, accountEmpty, true),
        ]);

        _byronAddressesCount = externalAddressesByron.length + internalAddressesByron.length; // just a debug helper

        accountInfo.byronAddresses = {
          change: internalAddressesByron.map(a => ({ address: a.address, path: a.path })),
          external: externalAddressesByron.map(a => ({ address: a.address, path: a.path })),
        };
      }
    }
  }

  const tEnd = new Date().getTime();
  const duration = (tEnd - tStart) / 1000;

  if (duration > 7) {
    console.warn(
      `Warning: getAccountInfo-${details} took ${duration}s. Transactions: ${txCount} Addresses: ${_addressesCount} ByronAddresses: ${_byronAddressesCount} Tokens: ${tokensBalances.length} `,
    );
  }

  return accountInfo;
};

export default async (
  id: number,
  publicKey: string,
  details: Messages.Details,
  page = 1,
  pageSize = 25,
  deriveByronAddresses = false,
): Promise<string> => {
  try {
    const accountInfo = await getAccountInfo(
      publicKey,
      details,
      page,
      pageSize,
      deriveByronAddresses,
    );
    const message = prepareMessage(id, accountInfo);
    return message;
  } catch (err) {
    console.error(err);
    const message = prepareErrorMessage(id, err);
    return message;
  }
};
