import * as Types from '../types';
import { getAccountAddresses } from '../utils/address';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';

export default async (
  blockFrostApi: BlockFrostAPI,
  publicKey: string,
): Promise<Types.AccountInfo> => {
  const addresses = await getAccountAddresses(publicKey, blockFrostApi);
  const balances: Types.Balance[] = [];
  console.log('addresses', addresses);
  // addresses.map(address => {
  //   address.amount.map(amountItem => {
  //     if (amountItem.quantity && amountItem.unit) {
  //       const balanceRow = balances.find(balanceResult => balanceResult.unit === amountItem.unit);

  //       if (!balanceRow) {
  //         balances.push({
  //           unit: amountItem.unit,
  //           quantity: amountItem.quantity,
  //         });
  //       }
  //     }

  //     console.log(address.amount);
  //   });
  // });
  // const response = await blockFrostApi.addresses(
  //   'addr1q99mx3sh9jcq8j05ulnnwtrhkvdjg4qepwhps822enlxs8ynqw4ysqr8h05e7ushm338057ymp4qqwta9ca8jvyqd6tsv844df',
  // );
  // console.log('descriptor', descriptor);
  // console.log('response', response);
  // const lovelaceAmount = response.amount?.find(u => u.unit === 'lovelace');
  // const account: AccountInfo = {
  //   descriptor,
  //   balance: lovelaceAmount?.quantity || '0',
  //   availableBalance: lovelaceAmount?.quantity || '0',
  //   empty: lovelaceAmount?.quantity === '0',
  //   history: {
  //     total: 0,
  //     tokens: 0,
  //     unconfirmed: 0,
  //   },
  // };

  console.log('balances', balances);

  return {
    descriptor: publicKey,
    balance: '0',
  };
};
