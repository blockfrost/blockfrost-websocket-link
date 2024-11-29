import EventEmitter from 'events';
import * as Server from './types/server.js';
import { prepareMessage } from './utils/message.js';
import { getBlockData } from './utils/blockfrost-api.js';
import { Responses } from '@blockfrost/blockfrost-js';
import { promiseTimeout } from './utils/common.js';
import { getTransactionsWithDetails } from './utils/transaction.js';
import { TxNotification } from './types/response.js';
import { EMIT_MAX_MISSED_BLOCKS } from './constants/config.js';
import { logger } from './utils/logger.js';

interface EmitBlockOptions {
  fetchTimeoutMs?: number;
  maxMissedBlocks?: number;
}

export interface SubscribedAddress {
  address: string;
  cbor?: boolean;
}

// eslint-disable-next-line unicorn/prefer-event-target
const events = new EventEmitter();

let previousBlock: undefined | Responses['block_content'];

export const _resetPreviousBlock = () => {
  previousBlock = undefined;
};

export const emitBlock = async (options?: EmitBlockOptions) => {
  try {
    const { latestBlock, affectedAddresses } = await getBlockData();

    if ((latestBlock.height ?? 0) < (previousBlock?.height ?? 0)) {
      // rollback
      logger.warn(
        `[BLOCK EMITTER] Rollback detected. Previous block height: ${previousBlock?.height}, current block height: ${latestBlock.height}`,
      );
      previousBlock = undefined;
    }

    const currentPreviousBlock = previousBlock;

    previousBlock = latestBlock;

    if (!currentPreviousBlock || currentPreviousBlock.hash !== latestBlock.hash) {
      if (currentPreviousBlock && latestBlock.height && currentPreviousBlock.height) {
        // check if we missed more blocks since the last emit

        const missedBlocks = latestBlock.height - currentPreviousBlock.height;

        if (missedBlocks > (options?.maxMissedBlocks ?? EMIT_MAX_MISSED_BLOCKS)) {
          // too many missed blocks, skip emitting
          logger.warn(
            `[BLOCK EMITTER] Emitting skipped. Too many missed blocks: ${
              currentPreviousBlock.height + 1
            }-${latestBlock.height - 1}`,
          );
        } else {
          for (let index = currentPreviousBlock.height + 1; index < latestBlock.height; index++) {
            // emit previously missed blocks
            try {
              const missedBlockData = (await promiseTimeout(
                getBlockData({ block: index }),
                options?.fetchTimeoutMs ?? 8000,
              )) as Awaited<ReturnType<typeof getBlockData>>;

              logger.warn(
                `[BLOCK EMITTER] Emitting missed block: ${index} (current block: ${latestBlock.height})`,
              );
              events.emit(
                'newBlock',
                missedBlockData.latestBlock,
                missedBlockData.affectedAddresses,
              );
            } catch (error) {
              if (error instanceof Error && error.message === 'PROMISE_TIMEOUT') {
                logger.warn(`[BLOCK EMITTER] Skipping block ${index}. Fetch takes too long.`);
              } else {
                logger.warn(`[BLOCK EMITTER] Skipping block ${index}.`);

                logger.warn(error);
              }
            }
          }
        }
      }

      logger.info(`[BLOCK EMITTER] Emitting new block ${latestBlock.hash} (${latestBlock.height})`);
      // emit latest block
      events.emit('newBlock', latestBlock, affectedAddresses);
    }
  } catch (error) {
    logger.error('[BLOCK EMITTER] error', error);
  }
};

export const onBlock = async (
  ws: Server.Ws,
  clientId: string,
  latestBlock: Responses['block_content'],
  affectedAddressesInBlock: Responses['block_content_addresses'],
  activeSubscriptions: Server.Subscription[] | undefined,
  subscribedAddresses: SubscribedAddress[] | undefined,
) => {
  // client has no subscription
  if (!activeSubscriptions) {
    return;
  }

  // block subscription
  const activeBlockSub = activeSubscriptions?.find(index => index.type === 'block');

  if (activeBlockSub) {
    const message = prepareMessage({ id: activeBlockSub.id, clientId, data: latestBlock });

    ws.send(message);
  }

  // address subscription
  const activeAddressSub = activeSubscriptions.find(index => index.type === 'addresses');

  if (activeAddressSub && subscribedAddresses) {
    const affectedAddresses = affectedAddressesInBlock.filter(a =>
      subscribedAddresses.some(addr => addr.address === a.address),
    );

    if (affectedAddresses.length === 0) {
      // none of client's addresses was affected
      return;
    }

    // get list of unique txids (same tx could affect multiple client's addresses, but we want to fetch it only once)
    const txsCbor: Record<string, boolean | undefined> = {};

    for (const address of affectedAddresses) {
      const { cbor } = subscribedAddresses.find(
        subscription => subscription.address === address.address,
      )!;

      for (const tx of address.transactions) {
        txsCbor[tx.tx_hash] ||= cbor;
      }
    }

    // fetch txs that include client's address with their utxo data
    const txs = await getTransactionsWithDetails(
      Object.entries(txsCbor).map(([txId, cbor]) => ({ txId, cbor })),
    );

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
    const message = prepareMessage({ id: activeAddressSub.id, clientId, data: notifications });

    ws.send(message);
  }
};

export const startEmitter = async () => {
  const interval = process.env.BLOCKFROST_BLOCK_LISTEN_INTERVAL
    ? Number.parseInt(process.env.BLOCKFROST_BLOCK_LISTEN_INTERVAL, 10)
    : 5000;

  const t0 = Date.now();

  await emitBlock();
  const t1 = Date.now();
  const durationMs = t1 - t0;

  const delay = Math.max(interval - durationMs, 0);

  setTimeout(startEmitter, delay);
};

export { events };
