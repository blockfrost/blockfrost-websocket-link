import { blockfrostAPI } from '../utils/blockfrost-api.js';
import { limiter } from '../utils/limiter.js';

export default (hashOrNumber: string | number) => limiter(() => blockfrostAPI.blocks(hashOrNumber));
