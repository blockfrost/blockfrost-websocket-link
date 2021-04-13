import { BlockFrostAPI } from '@blockfrost/blockfrost-js';

export default async (blockFrostApi: BlockFrostAPI, txId: string): Promise<any> => {
  const tx = await blockFrostApi.txs(txId);
  return tx;
};
