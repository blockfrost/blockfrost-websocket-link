import * as Types from '../types';
import { getBalances, getAddresses } from '../utils/address';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';

export default async (
  blockFrostApi: BlockFrostAPI,
  publicKey: string,
  details: Types.Details,
): Promise<Types.ResponseAccountInfo> => {
  const externalAddresses = await getAddresses(publicKey, blockFrostApi, 0);
  const internalAddresses = await getAddresses(publicKey, blockFrostApi, 1);

  const addresses = [...externalAddresses, ...internalAddresses];
  const balances = await getBalances(addresses);

  const lovelaceBalance = balances.find(b => b.unit === 'lovelace');
  const tokensBalances = balances.filter(b => b.unit !== 'lovelace');

  const response: Types.ResponseAccountInfo = {
    descriptor: publicKey,
    balance: lovelaceBalance?.quantity || '0',
  };

  if (details !== 'basic') {
    response.tokens = tokensBalances;
  }

  return response;
};
