import EventEmitter from 'events';
import { blockfrostAPI } from './utils/blockfrostAPI';
import { Responses } from '@blockfrost/blockfrost-js';

const events = new EventEmitter();

let previousBlock: null | Responses['block_content'] = null;

setInterval(
  async () => {
    try {
      const latestBlock = await blockfrostAPI.blocksLatest();

      if (!previousBlock || previousBlock.hash !== latestBlock.hash) {
        previousBlock = latestBlock;
        events.emit('newBlock', latestBlock);
      }
    } catch (err) {
      console.log('error', err);
    }
  },
  process.env.BLOCK_LISTEN_INTERVAL ? parseInt(process.env.BLOCK_LISTEN_INTERVAL, 10) : 5000,
);

export { events };
