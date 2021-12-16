import { parseAsset, Responses } from '@blockfrost/blockfrost-js';
import BigNumber from 'bignumber.js';
import { Balance } from '../types/address';
import { AssetBalance } from '../types/response';

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

export const getAssetBalance = (
  asset: string,
  sent: Responses['account_addresses_total']['sent_sum'],
  received: Responses['account_addresses_total']['received_sum'],
) => {
  const receivedAsset = received.find(r => r.unit === asset)?.quantity ?? '0';
  const sentAsset = sent.find(r => r.unit === asset)?.quantity ?? '0';
  return new BigNumber(receivedAsset).minus(sentAsset);
};
