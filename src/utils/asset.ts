import { parseAsset, Responses } from '@blockfrost/blockfrost-js';
import BigNumber from 'bignumber.js';
import memoizee from 'memoizee';
import { blockfrostAPI } from '../utils/blockfrostAPI';
import { Balance } from '../types/address';
import { AssetBalance } from '../types/response';

export const getAssetFromRegistry = memoizee(
  async (hex: string) => {
    if (hex === 'lovelace') return undefined;
    const res = await blockfrostAPI.assetsById(hex);
    return res;
  },
  {
    maxAge: 30 * 60 * 1000, // each asset is cached in-memory for 30 mins
    primitive: true,
  },
);

export const transformAsset = (
  token: Balance,
  tokenRegistryMetadata?: Responses['asset'],
): AssetBalance => {
  if (token.unit === 'lovelace') {
    return { ...token, decimals: 6 };
  }

  return {
    ...token,
    fingerprint: parseAsset(token.unit).fingerprint,
    decimals: tokenRegistryMetadata?.metadata?.decimals ?? 0,
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

export const sumAssetBalances = (list: { amount: Pick<AssetBalance, 'quantity' | 'unit'>[] }[]) => {
  const balances: Pick<AssetBalance, 'quantity' | 'unit'>[] = [];
  for (const item of list) {
    for (const asset of item.amount) {
      const index = balances.findIndex(bAsset => bAsset.unit === asset.unit);
      if (index > -1) {
        balances[index].quantity = new BigNumber(balances[index].quantity)
          .plus(asset.quantity)
          .toFixed();
      } else {
        // new item
        balances.push(asset);
      }
    }
  }
  return balances;
};
