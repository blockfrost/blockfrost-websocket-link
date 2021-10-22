import { parseAsset } from '@blockfrost/blockfrost-js';
import { Balance } from 'types/address';
import { AssetBalance } from 'types/response';

export const transformAsset = (token: Balance): AssetBalance => {
  if (token.unit === 'lovelace') {
    return { ...token, decimals: 6 };
  }

  return {
    ...token,
    fingerprint: parseAsset(token.unit).fingerprint,
    decimals: 0,
  };
};
