import BigNumber from 'bignumber.js';
import { AssetBalance } from '../types/response';
import { TxIdsToTransactionsResponse } from '../types/transactions';
import { addressesToTxIds, discoverAddresses } from '../utils/address';
import { getRatesForDate } from '../utils/common';
import { prepareErrorMessage, prepareMessage } from '../utils/message';
import { txIdsToTransactions } from '../utils/transaction';

const sumAssetBalances = (outputs: { amount: AssetBalance[] }[]) => {
  const balances: AssetBalance[] = [];
  for (const output of outputs) {
    for (const asset of output.amount) {
      const index = balances.findIndex(bAsset => bAsset.unit === asset.unit);
      if (index > -1) {
        balances[index].quantity = new BigNumber(balances[index].quantity)
          .plus(asset.quantity)
          .toFixed();
      } else {
        // new item
        balances.push(asset);
      }
    }
  }
  return balances;
};

interface BalanceHistoryData {
  time: number;
  txs: number;
  received: string;
  sent: string;
  sentToSelf: string;
  rates: Record<string, number>;
}

export const getAccountBalanceHistory = async (
  publicKey: string,
  groupBy: number,
  from?: number,
  to?: number,
): Promise<BalanceHistoryData[]> => {
  const externalAddresses = await discoverAddresses(publicKey, 0);
  const internalAddresses = await discoverAddresses(publicKey, 1);
  const addresses = [...externalAddresses, ...internalAddresses];
  const addressesList = addresses.map(a => a.address);

  const txIds = await addressesToTxIds(addresses);

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
      console.log(
        'tx.txData.block_time >= from && tx.txData.block_time <= to',
        tx.txData.block_time >= from && tx.txData.block_time <= to,
      );
      console.log('tx time', tx.txData.block_time);
      return tx.txData.block_time >= from && tx.txData.block_time <= to;
    })
    // txs are sorted from newest to oldest, we need exact opposite
    .reverse();

  // Put txs into bins with a size of groupBy parameter (from-to)
  interface BalanceHistoryBin {
    from: number;
    to: number;
    txs: TxIdsToTransactionsResponse[];
  }
  const bins: BalanceHistoryBin[] = [];
  // const txsTimeRange = [txs[0].txData.block_time, txs[txs.length - 1].txData.block_time];
  const firstTxTimestamp = txs[0].txData.block_time ?? 0;

  let currentBin: BalanceHistoryBin = {
    from: firstTxTimestamp,
    to: firstTxTimestamp + groupBy,
    txs: [],
  };
  bins.push(currentBin);
  for (const tx of txs) {
    console.log('tx', tx.txHash, tx.txData.block_time);
    if (currentBin.from <= tx.txData.block_time && currentBin.to >= tx.txData.block_time) {
      // tx fits into a bin's range
      currentBin.txs.push(tx);
      console.log('pushing to current bin');
    } else {
      // tx doesn't fit into a current bin, let's create a new bin placed more into the future

      // forwards several groupBy seconds starting from firstTxTimestamp so distance between every 2 bins is N * groupBy.
      // Number of groupBy's added depends on how many of them we can fit between tx's timestamp and starting point
      const newFrom =
        firstTxTimestamp +
        Math.floor((tx.txData.block_time - firstTxTimestamp) / groupBy) * groupBy;
      currentBin = {
        from: newFrom,
        to: newFrom + groupBy,
        txs: [tx],
      };
      console.log('making new bin');
      bins.push(currentBin);
    }
  }

  console.log('bins', bins);

  const binRatesPromises = bins.map(bin => getRatesForDate(bin.from));
  // TODO: caching, and what to do if data are missing?
  const binRates = await Promise.all(binRatesPromises);

  const result: BalanceHistoryData[] = bins.map((bin, index) => {
    // aggregate sent, received sums for each bin
    let sent = new BigNumber(0);
    let received = new BigNumber(0);
    let sentToSelf = new BigNumber(0);

    for (const tx of bin.txs) {
      const { inputs, outputs } = tx.txUtxos;
      const myInputs = inputs.filter(input => addressesList.includes(input.address));
      const myOutputs = outputs.filter(output => addressesList.includes(output.address));
      if (
        inputs.every(input => addressesList.includes(input.address)) &&
        outputs.every(output => addressesList.includes(output.address))
        // TODO: this will probably work too: myInputs.length === inputs.length && myOutputs.length === outputs.length
      ) {
        // self tx
        sentToSelf = sentToSelf.plus(tx.txData.fees);
      } else if (myInputs.length === 0 && myOutputs.length > 0) {
        // recv tx
        const amount = sumAssetBalances(myOutputs);
        received = received.plus(amount.find(a => a.unit === 'lovelace')?.quantity ?? '0');
      } else {
        // sent tx
        const myInternalOutputs = outputs.filter(output =>
          internalAddresses.map(a => a.address).includes(output.address),
        );
        const inputsAmount = sumAssetBalances(myInputs);
        const internalOutputsAmount = sumAssetBalances(myInternalOutputs);

        const inputsAmountLovelace = inputsAmount.find(a => a.unit === 'lovelace')?.quantity ?? '0';
        const internalOutputsAmountLovelace =
          internalOutputsAmount.find(a => a.unit === 'lovelace')?.quantity ?? '0';
        const amountSent = new BigNumber(inputsAmountLovelace).minus(internalOutputsAmountLovelace);
        sent = sent.plus(amountSent);
      }
    }

    return {
      time: bin.from,
      txs: bin.txs.length,
      // _debug_txs: bin.txs,
      sent: sent.toFixed(),
      received: received.toFixed(),
      sentToSelf: sentToSelf.toFixed(),
      rates: binRates[index]!, // TODO: we should always have the data, but what if we don't?
    };
  });

  console.log('result', JSON.stringify(result, undefined, 4));
  console.log('txs', txs.length);
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

  console.log(groupBy, from, to);
  console.log(typeof groupBy, typeof from, to);
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
