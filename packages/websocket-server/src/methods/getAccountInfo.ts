import * as Types from '../types';
import { getAccountAddresses } from '../utils/address';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import BigNumber from 'bignumber.js';

export default async (
  blockFrostApi: BlockFrostAPI,
  publicKey: string,
): Promise<Types.AccountInfo> => {
  const addresses = await getAccountAddresses(publicKey, blockFrostApi);
  const balances: Types.Balance[] = [];

  addresses.map(address => {
    address.amount.map(amountItem => {
      if (amountItem.quantity && amountItem.unit) {
        const balanceRow = balances.find(balanceResult => balanceResult.unit === amountItem.unit);

        console.log('amountItem.unit', amountItem);

        if (!balanceRow) {
          balances.push({
            unit: amountItem.unit,
            quantity: amountItem.quantity,
          });
        } else {
          balanceRow.quantity = new BigNumber(balanceRow.quantity)
            .plus(amountItem.quantity)
            .toString();
        }
      }
    });
  });

  const accountBalance = balances.find(b => b.unit === 'lovelace');
  const tokens = balances.filter(b => b.unit !== 'lovelace');

  console.log('tokens', tokens);

  return {
    descriptor: publicKey,
    balance: accountBalance?.quantity || '0',
  };
};
