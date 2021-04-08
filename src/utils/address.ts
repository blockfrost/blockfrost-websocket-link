import { ADDRESS_GAP_LIMIT } from '../constants';
import * as Types from '../types';
import BigNumber from 'bignumber.js';
import { BlockFrostAPI, Responses } from '@blockfrost/blockfrost-js';
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

const deriveBatchOfAddresses = (
  publicKey: string,
  start: number,
  end: number,
  type: Types.AddressType,
): string[] => {
  const addresses = [];

  for (let i = start; i < end; i++) {
    const address = deriveAddress(publicKey, i, type);
    addresses.push(address);
  }

  return addresses;
};

export const getAddresses = async (
  publicKey: string,
  blockFrostApi: BlockFrostAPI,
  type: Types.AddressType,
): Promise<Responses['address_content'][]> => {
  const nonEmptyAddresses: Responses['address_content'][] = [];
  let discoveryActive = true;
  let start = 0;
  let end = ADDRESS_GAP_LIMIT;

  while (discoveryActive) {
    const addresses = deriveBatchOfAddresses(publicKey, start, end, type);
    const addressRequests = addresses.map(async address => {
      try {
        const response = await blockFrostApi.addresses(address);
        if (response) {
          nonEmptyAddresses.push(response);
        }

        return response;
      } catch (err) {
        if (err.status === 404) {
          return undefined;
        } else {
          console.log(err.status);
          return err;
        }
      }
    });

    const batchResult = await Promise.all(addressRequests);

    discoveryActive = !batchResult.every(
      (currentValue: Responses['address_content'] | undefined) =>
        typeof currentValue === 'undefined',
    );

    start += ADDRESS_GAP_LIMIT;
    end += ADDRESS_GAP_LIMIT;
  }

  return nonEmptyAddresses;
};

export const getBalances = async (
  addresses: Responses['address_content'][],
): Promise<Types.Balance[]> => {
  const balances: Types.Balance[] = [];

  addresses.map(address => {
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
