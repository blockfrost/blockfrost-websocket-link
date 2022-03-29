import EventEmitter from 'events';
import * as Server from './types/server';
import { prepareMessage } from './utils/message';
import { blockfrostAPI } from './utils/blockfrost-api';
import { Responses } from '@blockfrost/blockfrost-js';
import { promiseTimeout } from './utils/common';
import { getTransactionsWithUtxo } from './utils/transaction';
import { TxNotification } from './types/response';
import { EMIT_MAX_MISSED_BLOCKS } from './constants/config';
import { logger } from './utils/logger';

interface EmitBlockOptions {
  fetchTimeoutMs?: number;
  maxMissedBlocks?: number;
}

const events = new EventEmitter();

let previousBlock: undefined | Responses['block_content'];

export const _resetPreviousBlock = () => {
  previousBlock = undefined;
};

export const emitBlock = async (options?: EmitBlockOptions) => {
  try {
    const latestBlock = await blockfrostAPI.blocksLatest();

    if ((latestBlock.height ?? 0) < (previousBlock?.height ?? 0)) {
      // rollback
      logger.warn(
        `Rollback detected. Previous block height: ${previousBlock?.height}, current block height: ${latestBlock.height}`,
      );
      previousBlock = undefined;
    }

    const currentPreviousBlock = previousBlock;
    // update previousBlock ASAP (before fetching missing blocks)) so next run won't have stale data

    previousBlock = latestBlock;

    if (!currentPreviousBlock || currentPreviousBlock.hash !== latestBlock.hash) {
      if (currentPreviousBlock && latestBlock.height && currentPreviousBlock.height) {
        // check if we missed more blocks since the last emit

        const missedBlocks = latestBlock.height - currentPreviousBlock.height;

        if (missedBlocks > (options?.maxMissedBlocks ?? EMIT_MAX_MISSED_BLOCKS)) {
          // too many missed blocks, skip emitting
          logger.warn(
            `newBlock emitter: Emitting skipped. Too many missed blocks: ${
              currentPreviousBlock.height + 1
            }-${latestBlock.height - 1}`,
          );
        } else {
          for (let index = currentPreviousBlock.height + 1; index < latestBlock.height; index++) {
            // emit previously missed blocks
            try {
              const missedBlock = await promiseTimeout(
                blockfrostAPI.blocks(index),
                options?.fetchTimeoutMs ?? 2000,
              );

              logger.warn(
                `newBlock emitter: Emitting missed block: ${index} (current block: ${latestBlock.height})`,
              );
              events.emit('newBlock', missedBlock);
            } catch (error) {
              if (error instanceof Error && error.message === 'PROMISE_TIMEOUT') {
                logger.warn(`newBlock emitter: Skipping block ${index}. Fetch takes too long.`);
              } else {
                logger.warn(`newBlock emitter: Skipping block ${index}.`);

                logger.warn(error);
              }
            }
          }
        }
      }

      logger.info(`Emitting new block ${latestBlock.hash} (${latestBlock.height})`);
      // emit latest block
      events.emit('newBlock', latestBlock);
    }
  } catch (error) {
    logger.error('newBlock emitter error', error);
  }
};

export const onBlock = async (
  ws: Server.Ws,
  clientId: string,
  latestBlock: Responses['block_content'],
  affectedAddressesInBlock: Responses['block_content_addresses'],
  activeSubscriptions: Server.Subscription[] | undefined,
  subscribedAddresses: string[] | undefined,
) => {
  // client has no subscription
  if (!activeSubscriptions) return;

  // block subscription
  const activeBlockSub = activeSubscriptions?.find(index => index.type === 'block');

  if (activeBlockSub) {
    const message = prepareMessage(activeBlockSub.id, latestBlock);

    ws.send(message);
  }

  // address subscription
  const activeAddressSub = activeSubscriptions.find(index => index.type === 'addresses');

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
        txIdsSet.add(tx.tx_hash);
      }
    }
    // fetch txs that include client's address with their utxo data
    const txs = await getTransactionsWithUtxo([...txIdsSet]);

    const notifications: TxNotification[] = [];

    // prepare array of notifications. 1 item per transaction
    for (const address of affectedAddresses) {
      for (const tx of address.transactions) {
        // find tx's data for a given tx_hash; it's
        const enhancedTx = txs.find(t => t.txData.hash === tx.tx_hash);

        if (!enhancedTx) {
          // should not happen
          logger.error(`onBlock: Could not find tx data for ${tx.tx_hash}`);
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

    logger.debug(`Sent tx notification to client ${clientId}`);
    const message = prepareMessage(activeAddressSub.id, notifications);

    ws.send(message);
  }
};

export const startEmitter = () => {
  logger.info('Started block emitter');
  setInterval(
    emitBlock,
    process.env.BLOCKFROST_BLOCK_LISTEN_INTERVAL
      ? Number.parseInt(process.env.BLOCKFROST_BLOCK_LISTEN_INTERVAL, 10)
      : 5000,
  );
};

export { events };
