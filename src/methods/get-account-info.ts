import * as Responses from '../types/response.js';
import { BigNumber } from 'bignumber.js';
import { Details, MessageId } from '../types/message.js';
import {
  discoverAddresses,
  getStakingData,
  getStakingAccountTotal,
  memoizedDeriveAddress,
} from '../utils/address.js';
import { getTxidsFromAccountAddresses, getAccountAddressesData } from '../utils/account.js';
import { txIdsToTransactions } from '../utils/transaction.js';
import { MessageError, prepareMessage } from '../utils/message.js';
import { paginate } from '../utils/common.js';
import { getAssetBalance, getAssetData, transformAsset } from '../utils/asset.js';
import { blockfrostAPI } from '../utils/blockfrost-api.js';
import { logger } from '../utils/logger.js';

export const getAccountInfo = async (
  publicKey: string,
  details: Details,
  page = 1,
  pageSize = 25,
  cbor?: boolean,
): Promise<Responses.AccountInfo> => {
  let _addressesCount = 0;
  const tStart = Date.now();
  const pageSizeNumber = Number(pageSize);
  const pageIndex = Number(page) - 1;

  if (page < 1) {
    throw new MessageError('Invalid page number - first page is 1');
  }

  const { address: stakeAddress } = memoizedDeriveAddress(
    publicKey,
    2,
    0,
    blockfrostAPI.options.network !== 'mainnet',
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
        quantity: new BigNumber(received).minus(sent).toFixed(0),
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
    balance: balanceWithRewards.toFixed(0),
    availableBalance: lovelaceBalance.toFixed(0),
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
        drep: stakingData.drep,
      },
    },
  };

  if (['tokenBalances', 'txids', 'txs'].includes(details)) {
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
    } else {
      if (details === 'txs') {
        // fetch full transaction objects and set account.history.transactions
        const txs = await txIdsToTransactions(
          requestedPageTxIds.map(item => ({ address: item.address, txIds: [item.tx_hash] })),
          cbor,
        );

        accountInfo.history.transactions = txs;
      }

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

  const tEnd = Date.now();
  const duration = (tEnd - tStart) / 1000;

  if (duration > 7) {
    logger.warn(
      `Warning: getAccountInfo-${details} ${publicKey} took ${duration}s. Transactions: ${txCount} Addresses: ${_addressesCount} Tokens: ${tokensBalances.length} `,
    );
  }

  return accountInfo;
};

export default async (
  id: MessageId,
  clientId: string,
  publicKey: string,
  details: Details,
  page = 1,
  pageSize = 25,
  cbor?: boolean,
): Promise<string> => {
  const data = await getAccountInfo(publicKey, details, page, pageSize, cbor);
  const message = prepareMessage({ id, clientId, data });

  return message;
};
