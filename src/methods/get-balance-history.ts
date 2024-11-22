import { BigNumber } from 'bignumber.js';
import { Address } from '../types/address.js';
import { BalanceHistoryData } from '../types/response.js';
import { TxIdsToTransactionsResponse } from '../types/transactions.js';
import { getAccountTransactionHistory } from '../utils/account.js';
import { sumAssetBalances } from '../utils/asset.js';
import { getRatesForDate } from '../utils/rates.js';
import { prepareMessage } from '../utils/message.js';
import { txIdsToTransactions } from '../utils/transaction.js';
import { FIAT_RATES_ENABLE_ON_TESTNET } from '../constants/config.js';
import { blockfrostAPI } from '../utils/blockfrost-api.js';
import { logger } from '../utils/logger.js';
import { MessageId } from '../types/message.js';

interface BalanceHistoryBin {
  from: number;
  to: number;
  txs: TxIdsToTransactionsResponse[];
}

export const aggregateTransactions = async (
  txs: TxIdsToTransactionsResponse[],
  addresses: {
    external: Address[];
    internal: Address[];
    all: Address[];
  },
  groupBy: number,
): Promise<Omit<BalanceHistoryData, 'rates'>[]> => {
  if (txs.length === 0) {
    return [];
  }

  // Put txs into bins with a size of groupBy parameter (from-to)
  const bins: BalanceHistoryBin[] = [];
  const firstTxTimestamp = txs[0].txData.block_time ?? 0;
  let currentBin: BalanceHistoryBin = {
    from: firstTxTimestamp,
    to: firstTxTimestamp + groupBy,
    txs: [],
  };

  bins.push(currentBin);

  for (const tx of txs) {
    if (currentBin.from <= tx.txData.block_time && currentBin.to >= tx.txData.block_time) {
      // tx fits into a bin's range
      currentBin.txs.push(tx);
    } else {
      // tx doesn't fit into a current bin, let's create a new bin placed in the future

      // forwards several groupBy seconds starting from firstTxTimestamp so distance between every 2 bins is N * groupBy.
      // number of groupBy's added depends on how many of them we can fit between tx's timestamp and starting point
      const newFrom =
        firstTxTimestamp +
        Math.floor((tx.txData.block_time - firstTxTimestamp) / groupBy) * groupBy;

      currentBin = {
        from: newFrom,
        to: newFrom + groupBy,
        txs: [tx],
      };
      bins.push(currentBin);
    }
  }

  const result: Omit<BalanceHistoryData, 'rates'>[] = bins.map(bin => {
    // aggregate sent, received sums for each bin
    let sent = new BigNumber(0);
    let received = new BigNumber(0);
    let sentToSelf = new BigNumber(0);

    const addressesList = new Set(addresses.all.map(a => a.address));

    for (const tx of bin.txs) {
      const { inputs, outputs } = tx.txUtxos;
      const myInputs = inputs.filter(input => addressesList.has(input.address));
      const myOutputs = outputs.filter(output => addressesList.has(output.address));

      const myInputsAmount = sumAssetBalances(myInputs);
      const myInputsAmountLovelace =
        myInputsAmount.find(a => a.unit === 'lovelace')?.quantity ?? '0';

      const myOutputsAmount = sumAssetBalances(myOutputs);
      const myOutputsAmountLovelace =
        myOutputsAmount.find(a => a.unit === 'lovelace')?.quantity ?? '0';

      if (myInputs.length === inputs.length && myOutputs.length === outputs.length) {
        // self tx (also withdrawal tx)
        // sent and received amounts are basically sums of all account's inputs/outputs
        // but some of the account's inputs may be used to fill output to same account - that amount is stored in sentToSelf
        // tl;dr: The amount that left the account can be computed as sent - sentToSelf
        // The amount that was received by the account (amount that would be added to account balance) is received - sentToSelf
        sent = sent.plus(myInputsAmountLovelace);
        // received can include withdrawal amount, but it can also lack deposited amount
        received = received.plus(myOutputsAmountLovelace);
        // withdrawal and deposit amounts are not part of sentToSelf
        sentToSelf = sentToSelf
          .plus(myInputsAmountLovelace)
          .minus(tx.txData.fees)
          .minus(tx.txData.deposit);
      } else if (myInputs.length === 0 && myOutputs.length > 0) {
        // recv tx
        received = received.plus(myOutputsAmountLovelace);
      } else {
        // sent tx
        sent = sent.plus(myInputsAmountLovelace);
        received = received.plus(myOutputsAmountLovelace);
        sentToSelf = sentToSelf.plus(myOutputsAmountLovelace);
      }
    }

    return {
      time: bin.from,
      txs: bin.txs.length, // TODO: should be renamed to txCount, but that will break compatibility with trezor/blockchain-link
      txids: bin.txs.map(tx => tx.txHash),
      sent: sent.toFixed(0), // sent including sentToSelf
      received: received.toFixed(0), // received including sentToSelf
      sentToSelf: sentToSelf.toFixed(0),
    };
  });

  return result;
};

export const getAccountBalanceHistory = async (
  publicKey: string,
  groupBy: number,
  from?: number,
  to?: number,
): Promise<BalanceHistoryData[]> => {
  const { txIds, addresses } = await getAccountTransactionHistory({ accountPublicKey: publicKey });

  // fetch all transactions and filter only those that are from within from-to interval
  const txs = (
    await txIdsToTransactions(
      txIds.map(tx => ({
        address: tx.address,
        txIds: [tx.tx_hash],
      })),
    )
  )
    // eslint-disable-next-line unicorn/no-await-expression-member
    .filter(tx => {
      if (typeof from !== 'number' || typeof to !== 'number') {
        return true;
      }
      return tx.txData.block_time >= from && tx.txData.block_time <= to;
    })
    // txs are sorted from newest to oldest, we need exact opposite
    .reverse();

  const bins = await aggregateTransactions(txs, addresses, groupBy);

  if (blockfrostAPI.options.network !== 'mainnet' && !FIAT_RATES_ENABLE_ON_TESTNET) {
    // fiat rates for testnet are disabled
    return bins;
  }

  // fetch fiat rate for each bin
  const binRatesPromises = bins.map(bin => getRatesForDate(bin.time));
  const binRates = await Promise.allSettled(binRatesPromises);

  const binsWithRates = bins.map((bin, index) => {
    const rateForBin = binRates[index];

    return {
      ...bin,
      rates: rateForBin.status === 'fulfilled' ? rateForBin.value : {},
    };
  });

  return binsWithRates;
};

export default async (
  id: MessageId,
  clientId: string,
  publicKey: string,
  groupBy: number,
  from?: number,
  to?: number,
): Promise<string> => {
  const t1 = Date.now();

  try {
    const data = await getAccountBalanceHistory(publicKey, groupBy, from, to);
    const message = prepareMessage({ id, clientId, data });

    return message;
  } finally {
    const t2 = Date.now();
    const diff = t2 - t1;

    logger.debug(`[${clientId}] getBalanceHistory for public key ${publicKey} took ${diff} ms`);
  }
};
