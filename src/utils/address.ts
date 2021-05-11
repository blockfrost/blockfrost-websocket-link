import { ADDRESS_GAP_LIMIT } from '../constants';
import * as Addresses from '../types/address';
import { blockfrostAPI } from '../utils/blockfrostAPI';
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

export const discoverAddresses = async (
  publicKey: string,
  type: Addresses.Type,
): Promise<Addresses.Result> => {
  let addressDiscoveredCount = 0;
  let lastEmptyCount = 0;
  let addressCount = 0;

  const result: Addresses.Result = [];

  while (lastEmptyCount < ADDRESS_GAP_LIMIT) {
    const promisesBundle: Addresses.Bundle = [];

    for (let i = addressDiscoveredCount; i < addressDiscoveredCount + ADDRESS_GAP_LIMIT; i++) {
      const address = deriveAddress(publicKey, addressCount, type);
      addressCount++;
      const promise = blockfrostAPI.addresses(address);
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
              throw Error(error);
            }
          }),
      ),
    );

    addressDiscoveredCount++;
  }

  return result;
};

export const addressesToBalances = async (
  addresses: { address: string; data: Responses['address_content'] | 'empty' }[],
): Promise<Addresses.Balance[]> => {
  const balances: Addresses.Balance[] = [];

  addresses.map(address => {
    const addressData = address.data;
    if (addressData === 'empty') return;

    addressData.amount.map(amountItem => {
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
  addresses: { address: string; data: Responses['address_content'] | 'empty' }[],
): Promise<{ address: string; data: Responses['address_utxo_content'] | 'empty' }[]> => {
  const promisesBundle: {
    address: string;
    promise: Promise<Responses['address_utxo_content']>;
  }[] = [];

  const result: {
    address: string;
    data: Responses['address_utxo_content'] | 'empty';
  }[] = [];

  addresses.map(item => {
    if (item.data === 'empty') return;

    const promise = blockfrostAPI.addressesUtxosAll(item.address);
    promisesBundle.push({ address: item.address, promise });
  });

  await Promise.all(
    promisesBundle.map(p =>
      p.promise
        .then(data => {
          result.push({ address: p.address, data });
        })
        .catch(() => {
          throw Error('a');
        }),
    ),
  );

  return result;
};

export const utxosWithBlocks = async (
  utxos: Addresses.UtxosWithBlocksParams,
): Promise<Addresses.UtxosWithBlockResponse[]> => {
  const promisesBundle: Addresses.UtxosWithBlocksBundle[] = [];
  const result: Addresses.UtxosWithBlockResponse[] = [];

  utxos.map(utxo => {
    if (utxo.data === 'empty') return;

    utxo.data.map(utxoData => {
      const promise = blockfrostAPI.blocks(utxoData.block);
      promisesBundle.push({ address: utxo.address, utxoData, promise });
    });
  });

  await Promise.all(
    promisesBundle.map(p =>
      p.promise
        .then(data => {
          result.push({
            address: p.address,
            utxoData: p.utxoData,
            blockInfo: data,
          });
        })
        .catch(err => {
          throw Error(err);
        }),
    ),
  );

  return result;
};

export const addressesToTxIds = async (
  addresses: Addresses.Result,
): Promise<{ address: string; data: string[] }[]> => {
  const promisesBundle: {
    address: string;
    promise: Promise<string[]>;
  }[] = [];

  addresses.map(item => {
    if (item.data === 'empty') return;

    const promise = blockfrostAPI.addressesTxsAll(item.address);
    promisesBundle.push({ address: item.address, promise });
  });

  const result: { address: string; data: string[] }[] = [];

  await Promise.all(
    promisesBundle.map(p =>
      p.promise
        .then(data => {
          result.push({ address: p.address, data });
        })
        .catch(error => {
          throw Error(error);
        }),
    ),
  );

  return result;
};
