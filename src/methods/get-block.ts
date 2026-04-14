import { blockfrostAPI } from '../utils/blockfrost-api.js';

export default (hashOrNumber: string | number) => blockfrostAPI.blocks(hashOrNumber);
