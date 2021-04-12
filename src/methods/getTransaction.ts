import * as Types from '../types';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';

export default async (blockFrostApi: BlockFrostAPI, txId: string): Promise<Types.ResponseServerInfo> => {
  const tx = await blockFrostApi.txs(txId);

  return {
   ...tx
  };
};
