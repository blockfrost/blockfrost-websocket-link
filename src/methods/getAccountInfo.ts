import * as Types from '../types';
import { getAddresses, getBalances } from '../utils/address';
import { prepareMessage } from '../utils/messages';
import { MESSAGES } from '../constants';

export default async (id: number, publicKey: string, details: Types.Details): Promise<string> => {
  if (!publicKey) {
    const message = prepareMessage(id, MESSAGES.GET_ACCOUNT_INFO, 'Missing parameter descriptor');
    return message;
  }

  try {
    const externalAddresses = await getAddresses(publicKey, 0);
    const internalAddresses = await getAddresses(publicKey, 1);

    const addresses = [...externalAddresses, ...internalAddresses];
    const balances = await getBalances(addresses);

    const lovelaceBalance = balances.find(b => b.unit === 'lovelace');
    const tokensBalances = balances.filter(b => b.unit !== 'lovelace');

    const accountInfo: Types.ResponseAccountInfo = {
      descriptor: publicKey,
      balance: lovelaceBalance?.quantity || '0',
    };

    if (details !== 'basic') {
      accountInfo.tokens = tokensBalances;
    }

    const message = prepareMessage(id, MESSAGES.GET_ACCOUNT_INFO, accountInfo);
    return message;
  } catch (err) {
    console.log(err);
    const message = prepareMessage(id, MESSAGES.GET_ACCOUNT_INFO, 'Error');
    return message;
  }
};
