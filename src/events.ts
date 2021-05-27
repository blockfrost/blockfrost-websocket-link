import EventEmitter from 'events';
import { blockfrostAPI } from './utils/blockfrostAPI';
import { Responses } from '@blockfrost/blockfrost-js';

const events = new EventEmitter();

let previousBlock: null | Responses['block_content'] = null;

setInterval(async () => {
  try {
    const latestBlock = await blockfrostAPI.blocksLatest();

    if (!previousBlock || previousBlock.hash !== latestBlock.hash) {
      previousBlock = latestBlock;
      events.emit('block', latestBlock);
    }
  } catch (err) {
    throw Error(err);
  }
}, 1000);

export { events };
