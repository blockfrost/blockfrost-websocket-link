import { ADDRESS_GAP_LIMIT } from '../constants';
import * as Addresses from '../types/addresses';
import { blockfrost } from '../utils/blockfrostAPI';
import { Responses } from '@blockfrost/blockfrost-js';
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
  type: Addresses.Type,
): Promise<{ address: string; data: Responses['address_content'] | 'error' | 'empty' }[]> => {
  let addressDiscoveredCount = 0;
  let lastEmptyCount = 0;
  let addressCount = 0;
  const result: {
    address: string;
    data: Responses['address_content'] | 'error' | 'empty';
  }[] = [];

  while (lastEmptyCount < ADDRESS_GAP_LIMIT) {
    const promisesBundle: Addresses.Bundle = [];

    for (let i = addressDiscoveredCount; i < addressDiscoveredCount + ADDRESS_GAP_LIMIT; i++) {
      const address = deriveAddress(publicKey, addressCount, type);
      addressCount++;
      const promise = blockfrost.addresses(address);
      promisesBundle.push({ address, promise });
    }

    await Promise.all(
      promisesBundle.map(p =>
        p.promise
          .then(data => {
            result.push({ address: p.address, data });
            lastEmptyCount = 0;
          })
          .catch(error => {
            lastEmptyCount++;
            if (error.status === 404) {
              result.push({ address: p.address, data: 'empty' });
            } else {
              result.push({ address: p.address, data: 'error' });
            }
          }),
      ),
    );

    addressDiscoveredCount++;
  }

  return result;
};

export const addressesToBalances = async (
  addresses: { address: string; data: Responses['address_content'] | 'error' | 'empty' }[],
): Promise<Addresses.Balance[]> => {
  const balances: Addresses.Balance[] = [];

  addresses.map(address => {
    if (address.data === 'empty' || address.data === 'error') return;
    address.data.amount.map(amountItem => {
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

export const addressesToUtxos = async (
  addresses: { address: string; data: Responses['address_content'] | 'error' | 'empty' }[],
): Promise<any> => {
  const promisesBundle: {
    address: string;
    promise: Promise<Responses['address_utxo_content']>;
  }[] = [];
  const utxos: any = [];

  addresses.map(item => {
    if (item.data === 'empty' || item.data === 'error') return;

    const promise = blockfrost.addressesUtxos(item.address);
    promisesBundle.push({ address: item.address, promise });
  });

  await Promise.all(
    promisesBundle.map(p =>
      p.promise
        .then(data => {
          utxos.push({ address: p.address, data });
        })
        .catch(() => {
          utxos.push({ address: p.address, data: 'error' });
        }),
    ),
  );

  return utxos;
};
