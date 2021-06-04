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

const deriveAddress = (
  publicKey: string,
  addressIndex: number,
  type = 1 | 0,
): { address: string; path: string } => {
  const accountKey = Bip32PublicKey.from_bytes(Buffer.from(publicKey, 'hex'));
  const utxoPubKey = accountKey.derive(type).derive(addressIndex);
  const stakeKey = accountKey.derive(2).derive(0);
  const baseAddr = BaseAddress.new(
    NetworkInfo.mainnet().network_id(),
    StakeCredential.from_keyhash(utxoPubKey.to_raw_key().hash()),
    StakeCredential.from_keyhash(stakeKey.to_raw_key().hash()),
  );

  return {
    address: baseAddr.to_address().to_bech32(),
    path: `m/1852'/1815'/0'/${type}/${addressIndex}`,
  };
};

export const discoverAddresses = async (
  publicKey: string,
  type: Addresses.Type,
): Promise<Addresses.Result[]> => {
  let addressDiscoveredCount = 0;
  let lastEmptyCount = 0;
  let addressCount = 0;

  const result: Addresses.Result[] = [];

  while (lastEmptyCount < ADDRESS_GAP_LIMIT) {
    const promisesBundle: Addresses.Bundle = [];

    for (let i = addressDiscoveredCount; i < addressDiscoveredCount + ADDRESS_GAP_LIMIT; i++) {
      const { address, path } = deriveAddress(publicKey, addressCount, type);
      addressCount++;
      const promise = blockfrostAPI.addresses(address);
      promisesBundle.push({ address, promise, path });
    }

    await Promise.all(
      promisesBundle.map(p =>
        p.promise
          .then(data => {
            result.push({ address: p.address, path: p.path, data });
            lastEmptyCount = 0;
          })
          .catch(error => {
            lastEmptyCount++;
            if (error.status === 404) {
              result.push({ address: p.address, data: 'empty', path: p.path });
            } else {
              console.log(error);
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
        .catch(error => {
          throw Error(error);
        }),
    ),
  );

  return result;
};

export const isAccountEmpty = async (
  addresses: { address: string; data: Responses['address_content'] | 'empty' }[],
): Promise<boolean> => {
  const promisesBundle: {
    address: string;
    promise: Promise<Responses['address_txs_content']>;
  }[] = [];

  addresses.map(item => {
    if (item.data === 'empty') return;

    const promise = blockfrostAPI.addressesTxs(item.address, 1, 1);
    promisesBundle.push({ address: item.address, promise });
  });

  const result = await Promise.all(
    promisesBundle.map(p =>
      p.promise
        .then(data => {
          return data;
        })
        .catch(error => {
          throw Error(error);
        }),
    ),
  );

  return result.flat().length === 0;
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
  addresses: Addresses.Result[],
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

export const getAddressesData = async (
  addresses: Addresses.Result[],
): Promise<Addresses.AddressData[]> => {
  const bundle: Addresses.GetAddressDataBundle[] = [];

  addresses.map(addr => {
    const promise = blockfrostAPI.addressesTxsAll(addr.address);
    bundle.push({
      promise,
      address: addr.address,
      path: addr.path,
    });
  });

  const txIds: { address: string; path: string; txIds: string[] }[] = [];

  await Promise.all(
    bundle.map(p =>
      p.promise
        .then(data => {
          txIds.push({
            address: p.address,
            path: p.path,
            txIds: data,
          });
        })
        .catch(error => {
          if (error.status === 404) {
            txIds.push({
              address: p.address,
              path: p.path,
              txIds: [],
            });
          } else {
            console.log('error', error.data, error.request);
          }
        }),
    ),
  );

  const bundleAddressesTxUtxos: {
    address: string;
    path: string;
    promise: Promise<Responses['tx_content_utxo']>;
  }[] = [];

  txIds.map(data => {
    data.txIds.map(txId => {
      const promise = blockfrostAPI.txsUtxos(txId);
      bundleAddressesTxUtxos.push({
        promise,
        address: data.address,
        path: data.path,
      });
    });
  });

  const res: {
    address: string;
    path: string;
    utxos: Responses['tx_content_utxo'];
  }[] = [];

  await Promise.all(
    bundleAddressesTxUtxos.map(p =>
      p.promise
        .then(data => {
          const item = res.find(r => r.address === p.address);

          if (!item) {
            res.push({
              address: p.address,
              path: p.path,
              utxos: data,
            });
          } else {
            item.utxos.outputs = [...item.utxos.outputs, ...data.outputs];
            item.utxos.inputs = [...item.utxos.inputs, ...data.inputs];
          }
        })
        .catch(error => {
          throw Error(error);
        }),
    ),
  );

  const result = res.map(r => {
    const received = r.utxos.inputs.reduce((acc, currentValue) => {
      const lovelaceAmount = currentValue.amount.find(a => a.unit === 'lovelace');
      return acc.plus(lovelaceAmount?.quantity || '0');
    }, new BigNumber(0));

    const sent = r.utxos.outputs.reduce((acc, currentValue) => {
      const lovelaceAmount = currentValue.amount.find(a => a.unit === 'lovelace');
      return acc.plus(lovelaceAmount?.quantity || '0');
    }, new BigNumber(0));

    return {
      address: r.address,
      path: r.path,
      transfers: r.utxos.inputs.length + r.utxos.outputs.length,
      received: received.toString(),
      sent: sent.toString(),
    };
  });

  return result;
};
