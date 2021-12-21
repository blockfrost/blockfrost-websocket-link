import BigNumber from 'bignumber.js';
import { Address } from '../types/address';
import { BalanceHistoryData } from '../types/response';
import { TxIdsToTransactionsResponse } from '../types/transactions';
import { getAccountTransactionIds } from '../utils/account';
import { sumAssetBalances } from '../utils/asset';
import { getRatesForDate } from '../utils/common';
import { prepareErrorMessage, prepareMessage } from '../utils/message';
import { txIdsToTransactions } from '../utils/transaction';

interface BalanceHistoryBin {
  from: number;
  to: number;
  txs: TxIdsToTransactionsResponse[];
}

export const aggregateTransactionIntervals = async (
  txs: TxIdsToTransactionsResponse[],
  addresses: {
    external: Address[];
    internal: Address[];
    all: Address[];
  },
  groupBy: number,
) => {
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
      const myInternalOutputs = outputs.filter(output =>
        addresses.internal.map(a => a.address).includes(output.address),
      );
      const internalOutputsAmount = sumAssetBalances(myInternalOutputs);

      if (myInputs.length === inputs.length && myOutputs.length === outputs.length) {
        // self tx
        const amount = sumAssetBalances(myOutputs);
        const internalOutputsAmountLovelace =
          internalOutputsAmount.find(a => a.unit === 'lovelace')?.quantity ?? '0';

        sentToSelf = sentToSelf
          .minus(internalOutputsAmountLovelace)
          .plus(amount.find(a => a.unit === 'lovelace')?.quantity ?? '0');
      } else if (myInputs.length === 0 && myOutputs.length > 0) {
        // recv tx
        const amount = sumAssetBalances(myOutputs);
        received = received.plus(amount.find(a => a.unit === 'lovelace')?.quantity ?? '0');
      } else {
        // sent tx

        const inputsAmount = sumAssetBalances(myInputs);
        const inputsAmountLovelace = inputsAmount.find(a => a.unit === 'lovelace')?.quantity ?? '0';
        const internalOutputsAmountLovelace =
          internalOutputsAmount.find(a => a.unit === 'lovelace')?.quantity ?? '0';
        const amountSpent = new BigNumber(inputsAmountLovelace)
          .minus(internalOutputsAmountLovelace)
          .minus(tx.txData.fees);
        sent = sent.plus(amountSpent);
      }
    }

    return {
      time: bin.from,
      txs: bin.txs.length,
      sent: sent.toFixed(),
      received: received.toFixed(),
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
): Promise<BalanceHistoryData[]> => {
  const { txIds, addresses } = await getAccountTransactionIds(publicKey);

  // fetch all transactions and filter only those that are from within from-to interval
  const txs = (
    await txIdsToTransactions(
      txIds.map(tx => ({
        address: tx.address,
        data: tx.data.map(d => d.tx_hash),
      })),
    )
  )
    .filter(tx => {
      if (typeof from !== 'number' || typeof to !== 'number') return true;
      return tx.txData.block_time >= from && tx.txData.block_time <= to;
    })
    // txs are sorted from newest to oldest, we need exact opposite
    .reverse();

  const bins = await aggregateTransactionIntervals(txs, addresses, groupBy);

  // fetch fiat rate for each bin
  const binRatesPromises = bins.map(bin => getRatesForDate(bin.time));
  const binRates = await Promise.all(binRatesPromises);

  const result = bins.map((bin, index) => ({
    ...bin,
    rates: binRates[index],
  }));

  return result;
};

export default async (
  id: number,
  publicKey: string,
  groupBy: number,
  from?: number,
  to?: number,
): Promise<string> => {
  if (!publicKey) {
    const message = prepareMessage(id, 'Missing parameter descriptor');
    return message;
  }

  try {
    const data = await getAccountBalanceHistory(publicKey, groupBy, from, to);
    const message = prepareMessage(id, data);
    return message;
  } catch (err) {
    console.error(err);
    const message = prepareErrorMessage(id, err);
    return message;
  }
};
