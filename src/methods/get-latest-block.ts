import { blockfrostAPI } from '../utils/blockfrost-api.js';

export default async () => blockfrostAPI.blocksLatest();
