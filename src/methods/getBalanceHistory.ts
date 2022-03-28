import BigNumber from 'bignumber.js';
import { Address } from '../types/address';
import { BalanceHistoryData } from '../types/response';
import { TxIdsToTransactionsResponse } from '../types/transactions';
import { getAccountTransactionHistory } from '../utils/account';
import { sumAssetBalances } from '../utils/asset';
import { getRatesForDate } from '../utils/rates';
import { prepareErrorMessage, prepareMessage } from '../utils/message';
import { txIdsToTransactions } from '../utils/transaction';
import { FIAT_RATES_ENABLE_ON_TESTNET } from '../constants/config';
import { blockfrostAPI } from '../utils/blockfrostAPI';
import { logger } from '../utils/logger';

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

    const addressesList = addresses.all.map(a => a.address);
    for (const tx of bin.txs) {
      const { inputs, outputs } = tx.txUtxos;
      const myInputs = inputs.filter(input => addressesList.includes(input.address));
      const myOutputs = outputs.filter(output => addressesList.includes(output.address));

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
      sent: sent.toFixed(), // sent including sentToSelf
      received: received.toFixed(), // received including sentToSelf
      sentToSelf: sentToSelf.toFixed(),
    };
  });
  return result;
};

export const getAccountBalanceHistory = async (
  publicKey: string,
  groupBy: number,
  from?: number,
  to?: number,
  deriveByronAddresses?: boolean,
): Promise<BalanceHistoryData[]> => {
  const { txIds, addresses } = await getAccountTransactionHistory({
    accountPublicKey: publicKey,
    // Some txs may have byron inputs/outputs, in order to properly calculate amounts during
    // tx aggregation we need to know if given byron i/o belongs to the account or not.
    // And we cannot do that if we don't derive account's byron addresses first.
    deriveByronAddresses,
  });

  // fetch all transactions and filter only those that are from within from-to interval
  logger.debug('getAccountBalanceHistory', `Fetching ${txIds.length} txs`);
  const txs = (
    await txIdsToTransactions(
      txIds.map(tx => ({
        address: tx.address,
        data: [tx.tx_hash],
      })),
    )
  )
    .filter(tx => {
      if (typeof from !== 'number' || typeof to !== 'number') return true;
      return tx.txData.block_time >= from && tx.txData.block_time <= to;
    })
    // txs are sorted from newest to oldest, we need exact opposite
    .reverse();

  logger.debug('getAccountBalanceHistory', `aggregating ${txs.length} txs`);
  const bins = await aggregateTransactions(txs, addresses, groupBy);

  if (blockfrostAPI.options.isTestnet && !FIAT_RATES_ENABLE_ON_TESTNET) {
    // fiat rates for testnet are disabled
    return bins;
  }

  // fetch fiat rate for each bin
  logger.debug('getAccountBalanceHistory', `fetching fiat rates for ${bins.length} time intervals`);
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
  id: number,
  publicKey: string,
  groupBy: number,
  from?: number,
  to?: number,
  deriveByronAddresses?: boolean,
): Promise<string> => {
  if (!publicKey) {
    const message = prepareMessage(id, 'Missing parameter descriptor');
    return message;
  }

  const t1 = new Date().getTime();
  try {
    const data = await getAccountBalanceHistory(publicKey, groupBy, from, to, deriveByronAddresses);
    const message = prepareMessage(id, data);
    return message;
  } catch (err) {
    logger.error(err);
    const message = prepareErrorMessage(id, err);
    return message;
  } finally {
    const t2 = new Date().getTime();
    const diff = t2 - t1;
    logger.debug(`getBalanceHistory for public key ${publicKey} took ${diff} ms`);
  }
};
