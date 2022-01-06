import EventEmitter from 'events';
import * as Server from './types/server';
import { prepareMessage } from './utils/message';
import { blockfrostAPI } from './utils/blockfrostAPI';
import { Responses } from '@blockfrost/blockfrost-js';
import { promiseTimeout } from './utils/common';
import { getTransactionsWithUtxo } from './utils/transaction';
import { TxNotification } from './types/response';
import { EMIT_MAX_MISSED_BLOCKS } from './constants/config';

interface EmitBlockOptions {
  fetchTimeoutMs?: number;
  maxMissedBlocks?: number;
}

const events = new EventEmitter();

let previousBlock: null | Responses['block_content'] = null;

export const _resetPreviousBlock = () => {
  previousBlock = null;
};

export const emitBlock = async (options?: EmitBlockOptions) => {
  try {
    const latestBlock = await blockfrostAPI.blocksLatest();
    if ((latestBlock.height ?? 0) < (previousBlock?.height ?? 0)) {
      // rollback
      console.warn(
        `Rollback detected. Previous block height: ${previousBlock?.height}, current block height: ${latestBlock.height}`,
      );
      previousBlock = null;
    }

    if (!previousBlock || previousBlock.hash !== latestBlock.hash) {
      if (previousBlock && latestBlock.height && previousBlock.height) {
        // check if we missed more blocks since the last emit
        const missedBlocks = latestBlock.height - previousBlock.height;
        if (missedBlocks > (options?.maxMissedBlocks ?? EMIT_MAX_MISSED_BLOCKS)) {
          // too many missed blocks, skip emitting
          console.warn(
            `newBlock emitter: Emitting skipped. Too many missed blocks: ${
              previousBlock.height + 1
            }-${latestBlock.height - 1}`,
          );
        } else {
          for (let i = previousBlock.height + 1; i < latestBlock.height; i++) {
            // emit previously missed blocks
            try {
              const missedBlock = await promiseTimeout(
                blockfrostAPI.blocks(i),
                options?.fetchTimeoutMs ?? 2000,
              );
              console.warn(
                `newBlock emitter: Emitting missed block: ${i} (current block: ${latestBlock.height})`,
              );
              events.emit('newBlock', missedBlock);
            } catch (err) {
              if (err instanceof Error && err.message === 'PROMISE_TIMEOUT') {
                console.warn(`newBlock emitter: Skipping block ${i}. Fetch takes too long.`);
              } else {
                console.warn(`newBlock emitter: Skipping block ${i}.`);

                console.warn(err);
              }
            }
          }
        }
      }

      previousBlock = latestBlock;
      // emit latest block
      events.emit('newBlock', latestBlock);
    }
  } catch (err) {
    console.error('newBlock emitter', err);
  }
};

export const onBlock = async (
  ws: Server.Ws,
  latestBlock: Responses['block_content'],
  affectedAddressesInBlock: Responses['block_content_addresses'],
  activeSubscriptions: Server.Subscription[] | undefined,
  subscribedAddresses: string[] | undefined,
) => {
  // client has no subscription
  if (!activeSubscriptions) return;

  // block subscription
  const activeBlockSub = activeSubscriptions?.find(i => i.type === 'block');
  if (activeBlockSub) {
    const message = prepareMessage(activeBlockSub.id, latestBlock);
    ws.send(message);
  }

  // address subscription
  const activeAddressSub = activeSubscriptions.find(i => i.type === 'addresses');
  if (activeAddressSub && subscribedAddresses) {
    const affectedAddresses = affectedAddressesInBlock.filter(a =>
      subscribedAddresses.includes(a.address),
    );

    if (affectedAddresses.length === 0) {
      // none of client's addresses was affected
      return;
    }

    // get list of unique txids (same tx could affect multiple client's addresses, but we want to fetch it only once)
    const txIdsSet = new Set<string>();
    for (const address of affectedAddresses) {
      for (const tx of address.transactions) {
        txIdsSet.add(tx.tx_hash); // bug in ts types, tx_hash is required
      }
    }
    // fetch txs that include client's address with their utxo data
    const txs = await getTransactionsWithUtxo(Array.from(txIdsSet));

    const notifications: TxNotification[] = [];

    // prepare array of notifications. 1 item per transaction
    for (const address of affectedAddresses) {
      for (const tx of address.transactions) {
        // find tx's data for a given tx_hash; it's
        const enhancedTx = txs.find(t => t.txData.hash === tx.tx_hash);
        if (!enhancedTx) {
          // should not happen
          console.error(`onBlock: Could not find tx data for ${tx.tx_hash}`);
        } else {
          notifications.push({
            address: address.address,
            txData: enhancedTx.txData,
            txUtxos: enhancedTx.txUtxos,
            txHash: enhancedTx.txData.hash,
          });
        }
      }
    }

    const message = prepareMessage(activeAddressSub.id, notifications);
    ws.send(message);
  }
};

export const startEmitter = () => {
  console.info('Started block emitter');
  setInterval(
    emitBlock,
    process.env.BLOCKFROST_BLOCK_LISTEN_INTERVAL
      ? parseInt(process.env.BLOCKFROST_BLOCK_LISTEN_INTERVAL, 10)
      : 5000,
  );
};

export { events };
