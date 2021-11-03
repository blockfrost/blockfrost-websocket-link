import EventEmitter from 'events';
import * as Server from './types/server';
import { prepareMessage } from './utils/message';
import { getBlockTransactionsByAddresses } from './utils/transaction';
import { blockfrostAPI } from './utils/blockfrostAPI';
import { Responses } from '@blockfrost/blockfrost-js';
import { promiseTimeout } from './utils/common';

interface EmitBlockOptions {
  fetchTimeoutMs?: number;
}

const events = new EventEmitter();

let previousBlock: null | Responses['block_content'] = null;

export const _resetPreviousBlock = () => {
  previousBlock = null;
};

export const emitBlock = async (options?: EmitBlockOptions) => {
  try {
    const latestBlock = await blockfrostAPI.blocksLatest();
    if (!previousBlock || previousBlock.hash !== latestBlock.hash) {
      // check if we missed some blocks since the last run
      if (
        latestBlock.height &&
        previousBlock?.height &&
        latestBlock.height - previousBlock.height > 1
      ) {
        for (let i = previousBlock.height + 1; i < latestBlock.height; i++) {
          console.warn(
            `newBlock emitter: emitting missed block: ${i} (current block: ${latestBlock.height})`,
          );

          // emit previously missed blocks
          await promiseTimeout(
            blockfrostAPI.blocks(i).then(missedBlock => {
              events.emit('newBlock', missedBlock);
            }),
            options?.fetchTimeoutMs ?? 2000,
          ).catch(() => {
            console.warn(`newBlock emitter: Skipping block ${i}. Fetch takes too long.`);
          });
        }
      }

      // emit latest block
      previousBlock = latestBlock;
      events.emit('newBlock', latestBlock);
    }
  } catch (err) {
    console.error('newBlock emitter', err);
  }
};

export const onBlock = async (
  ws: Server.Ws,
  latestBlock: Responses['block_content'],
  activeSubscriptions: Server.Subscription[] | undefined,
  addressesSubscribed: string[] | undefined,
) => {
  // block subscriptions
  const activeBlockSub = activeSubscriptions?.find(i => i.type === 'block');

  if (activeBlockSub) {
    const message = prepareMessage(activeBlockSub.id, latestBlock);

    ws.send(message);
  }

  // address subscriptions
  if (activeSubscriptions && addressesSubscribed) {
    const activeAddressesSubIndex = activeSubscriptions.findIndex(i => i.type === 'addresses');
    const activeAddressSub = activeSubscriptions[activeAddressesSubIndex];

    if (activeAddressSub && activeAddressSub.type === 'addresses') {
      const tsxInBlock = await getBlockTransactionsByAddresses(latestBlock, addressesSubscribed);

      // do not send empty notification
      if (tsxInBlock.length > 0) {
        const message = prepareMessage(activeAddressSub.id, tsxInBlock);
        ws.send(message);
      }
    }
  }
};

export const startEmitter = () => {
  console.info('Started block emitter');
  setInterval(
    emitBlock,
    process.env.BLOCK_LISTEN_INTERVAL ? parseInt(process.env.BLOCK_LISTEN_INTERVAL, 10) : 5000,
  );
};

export { events };
