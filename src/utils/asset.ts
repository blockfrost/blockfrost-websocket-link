import { Balance } from 'types/address';
import { TokenBalance } from 'types/response';

export const transformToken = (token: Balance): TokenBalance => {
  return {
    ...token,
    decimals: 0,
  };
};
