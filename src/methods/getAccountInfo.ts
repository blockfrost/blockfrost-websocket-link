import * as Responses from '../types/response';
import { Responses as BackendResponse } from '@blockfrost/blockfrost-js';
import BigNumber from 'bignumber.js';
import * as Messages from '../types/message';
import {
  discoverAddresses,
  addressesToTxIds,
  getAddressesData,
  getStakingData,
  memoizedDeriveStakeAddress,
} from '../utils/address';
import { txIdsToTransactions } from '../utils/transaction';
import { prepareMessage, prepareErrorMessage } from '../utils/message';
import { paginate } from '../utils/common';
import { getAssetBalance, transformAsset } from '../utils/asset';
import { blockfrostAPI } from '../utils/blockfrostAPI';

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
    const stakeAddress = memoizedDeriveStakeAddress(publicKey);
    const [stakeAddressTotal, stakingData] = await Promise.all([
      blockfrostAPI.accountsAddressesTotal(stakeAddress),
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
    const empty = txCount === 0; // true if account is unused

    const accountInfo: Responses.AccountInfo = {
      descriptor: publicKey,
      empty,
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

    if (details !== 'basic') {
      accountInfo.tokens = tokensBalances.map(t => transformAsset(t));
    }

    let addressesCount = 0;
    if (details === 'txs' || details === 'txids') {
      const [externalAddresses, internalAddresses] = await Promise.all([
        discoverAddresses(publicKey, 0),
        discoverAddresses(publicKey, 1),
      ]);

      const addresses = [...externalAddresses, ...internalAddresses];
      addressesCount = addresses.length;
      const transactionsPerAddressList = await addressesToTxIds(addresses);

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
        `Warning: getAccountInfo-${details} took ${duration}s. Transactions: ${txCount} Addresses: ${addressesCount} Tokens: ${tokensBalances.length} `,
      );
    }

    return message;
  } catch (err) {
    console.log(err);
    const message = prepareErrorMessage(id, err);
    return message;
  }
};
