import { ADDRESS_GAP_LIMIT } from '../constants';
import * as Types from '../types';
import { blockfrost } from '../utils/blockfrostAPI';
import BigNumber from 'bignumber.js';
import {
  Bip32PublicKey,
  BaseAddress,
  NetworkInfo,
  StakeCredential,
} from '@emurgo/cardano-serialization-lib-nodejs';

const deriveAddress = (publicKey: string, addressIndex: number, type = 1 | 0): string => {
  const accountKey = Bip32PublicKey.from_bytes(Buffer.from(publicKey, 'hex'));
  const utxoPubKey = accountKey.derive(type).derive(addressIndex);
  const stakeKey = accountKey.derive(2).derive(0);

  const baseAddr = BaseAddress.new(
    NetworkInfo.mainnet().network_id(),
    StakeCredential.from_keyhash(utxoPubKey.to_raw_key().hash()),
    StakeCredential.from_keyhash(stakeKey.to_raw_key().hash()),
  );

  return baseAddr.to_address().to_bech32();
};

export const getAddresses = async (
  publicKey: string,
  type: Types.AddressType,
): Promise<Types.AddressArray> => {
  let addressDiscoveredCount = 0;
  let lastEmptyCount = 0;
  let addressCount = 0;
  const result: Types.AddressArray = [];

  while (lastEmptyCount < ADDRESS_GAP_LIMIT) {
    const promises = [];

    for (let i = addressDiscoveredCount; i < addressDiscoveredCount + ADDRESS_GAP_LIMIT; i++) {
      const address = deriveAddress(publicKey, addressCount, type);
      addressCount++;
      const promise = blockfrost.addresses(address);
      promises.push(promise);
    }

    await Promise.all(
      promises.map(p =>
        p
          .then(data => {
            result.push(data);
            lastEmptyCount = 0;
          })
          .catch(error => {
            lastEmptyCount++;
            if (error.status === 404) {
              result.push('empty');
            } else {
              result.push('error');
            }
          }),
      ),
    );

    addressDiscoveredCount++;
  }

  return result;
};

export const getBalances = async (addresses: Types.AddressArray): Promise<Types.Balance[]> => {
  const balances: Types.Balance[] = [];

  addresses.map(address => {
    if (address === 'empty' || address === 'error') return;
    address.amount.map(amountItem => {
      if (amountItem.quantity && amountItem.unit) {
        const balanceRow = balances.find(balanceResult => balanceResult.unit === amountItem.unit);

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

  return balances;
};
