import * as Types from '../types';
import { getBalances } from '../utils/address';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';

export default async (
  blockFrostApi: BlockFrostAPI,
  publicKey: string,
): Promise<Types.AccountInfo> => {
  const balances = await getBalances(blockFrostApi, publicKey);
  const accountBalance = balances.find(b => b.unit === 'lovelace');
  const tokens = balances.filter(b => b.unit !== 'lovelace');

  return {
    descriptor: publicKey,
    balance: accountBalance?.quantity || '0',
    tokens,
  };
};
