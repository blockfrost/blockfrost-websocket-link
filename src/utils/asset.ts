import { BlockfrostServerError, parseAsset, Responses } from '@blockfrost/blockfrost-js';
import { BigNumber } from 'bignumber.js';
import memoizee from 'memoizee';
import { blockfrostAPI } from '../utils/blockfrost-api.js';
import { Balance } from '../types/address.js';
import { AssetBalance } from '../types/response.js';
import { logger } from './logger.js';

export const getAssetData = memoizee(
  async (hex: string) => {
    if (hex === 'lovelace') return;
    logger.debug(`Fetching asset metadata for ${hex}`);
    try {
      const response = await blockfrostAPI.assetsById(hex);

      return response;
    } catch (error) {
      if (error instanceof BlockfrostServerError && error.status_code === 404) {
        logger.warn(`Fetching asset ${hex} failed. Asset not found.`);
      } else {
        logger.error(error);
      }
      throw error;
    }
  },
  {
    maxAge: 30 * 60 * 1000, // each asset is cached in-memory for 30 mins
    primitive: true,
    promise: true,
  },
);

export const transformAsset = (
  token: Balance,
  tokenRegistryMetadata: Responses['asset'] | undefined,
): AssetBalance => {
  if (token.unit === 'lovelace') {
    return { ...token, decimals: 6 };
  }

  let decimals = 0;
  const metadataDecimals = tokenRegistryMetadata?.metadata?.decimals;

  if (metadataDecimals && typeof metadataDecimals === 'number') {
    decimals = metadataDecimals;
  }

  return {
    ...token,
    fingerprint: parseAsset(token.unit).fingerprint,
    decimals,
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
          .toFixed(0);
      } else {
        // new item
        balances.push(asset);
      }
    }
  }
  return balances;
};
