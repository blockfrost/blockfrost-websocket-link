import EventEmitter from 'events';
import * as Server from './types/server.js';
import { prepareMessage } from './utils/message.js';
import { blockfrostAPI, getBlockData } from './utils/blockfrost-api.js';
import { Responses } from '@blockfrost/blockfrost-js';
import { getTransactionsWithDetails } from './utils/transaction.js';
import { TxNotification } from './types/response.js';
import { EMIT_MAX_MISSED_BLOCKS } from './constants/config.js';
import { logger } from './utils/logger.js';
import { limiter } from './utils/limiter.js';

interface EmitBlockOptions {
  fetchTimeoutMs?: number;
  maxMissedBlocks?: number;
}

export interface SubscribedAddress {
  address: string;
  cbor?: boolean;
}

type Block = Responses['block_content'];
type BlockAddresses = Responses['block_content_addresses'];

interface Events {
  on(event: 'newBlock', listener: (block: Block, addresses: BlockAddresses) => void): this;
  emit(event: 'newBlock', block: Block, addresses: BlockAddresses): boolean;
  removeAllListeners(): this;
}

// eslint-disable-next-line unicorn/prefer-event-target
const events: Events = new EventEmitter();

const latestBlocks: Block[] = [];

export const _resetPreviousBlock = () => {
  latestBlocks.splice(0);
};

export const emitBlock = async ({
  maxMissedBlocks = EMIT_MAX_MISSED_BLOCKS,
}: EmitBlockOptions = {}) => {
  const latest = await limiter(() => blockfrostAPI.blocksLatest());

  logger.info(`[BLOCK EMITTER] Latest block ${latest.height} (${latest.hash})`);

  const add = [latest]; // Ascending by height, adding to/removing from start
  const known = latestBlocks; // Descending by height, adding to/removing from start
  const remove: Block[] = []; // Descending by height, adding to end

  while (
    known.length > 0 && // There is at least one known, non-reorged block, and
    add.length > 0 && // there is at least one block to be added, but
    add.length < maxMissedBlocks && // there is at most maxMissedBlocks of them, and
    add[0].previous_block !== known[0].hash // known blocks are not directly followed by blocks to be added
  ) {
    if (known[0].height! < add[0].height!) {
      // Latest known block is lower than earliest block to be added -> fetch and add even earlier block
      const previous = await limiter(() => blockfrostAPI.blocks(add[0].previous_block!));

      add.unshift(previous);
    } else if (known[0].height! > add[0].height!) {
      // Latest known block is higher than earliest block to be added -> remove latest known block (reorg)
      remove.push(known.shift()!);
    } else if (known[0].hash !== add[0].hash) {
      // Latest known block has same height but different hash than earliest block to be added -> remove latest known block (reorg)
      remove.push(known.shift()!);
    } else {
      // Latest known block is identical to earliest block to be added -> remove earliest block to be added
      add.shift();
    }
  }

  if (remove.length > 0 && known.length === 0) {
    logger.warn(`[BLOCK EMITTER] Complete rollback, rollbacking ${remove.length} known blocks`);
    remove.splice(0);
  }

  for (const removed of remove) {
    logger.warn(`[BLOCK EMITTER] Rollbacked block ${removed.height} (${removed.hash})`);
  }

  for (const added of add) {
    try {
      const addresses = await getBlockData(added);

      logger.info(`[BLOCK EMITTER] Emit block ${added.height} (${added.hash})`);
      events.emit('newBlock', added, addresses);
      known.unshift(added);
    } catch (error) {
      if (error instanceof Error && error.message === 'PROMISE_TIMEOUT') {
        logger.warn(`[BLOCK EMITTER] Skipping block ${added.height}. Fetch takes too long.`);
      } else {
        throw error;
      }
    }
  }

  known.splice(maxMissedBlocks);
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

  await emitBlock().catch(error => {
    logger.error('[BLOCK EMITTER] Error', error);
  });

  const t1 = Date.now();
  const durationMs = t1 - t0;

  const delay = Math.max(interval - durationMs, 0);

  setTimeout(startEmitter, delay);
};

export { events };
