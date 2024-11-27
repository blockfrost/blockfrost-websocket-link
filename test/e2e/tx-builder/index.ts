// This example is written in Typescript.
// In order to run it on Node.js your need to compile the code first.
// Follow instructions in README
import { BlockfrostServerError } from '@blockfrost/blockfrost-js';

import { composeTransaction } from './helpers/compose-transaction.js';
import { signTransaction } from './helpers/sign-transaction.js';
import { deriveAddressPrvKey, mnemonicToPrivateKey } from './helpers/key.js';
import { blockfrostAPI } from '../../../src/utils/blockfrost-api.js';
import { UTXO } from './types/index.js';


export const buildTx = async (sendingMnemonic: string, amountInLovelace: string, receivingAddress: string) => {
  // Derive an address (this is the address where you need to send ADA in order to have UTXO to actually make the transaction)
  const bip32PrvKey = mnemonicToPrivateKey(sendingMnemonic);
  const { signKey, address } = deriveAddressPrvKey(bip32PrvKey, 0);

  blockfrostAPI.instance = blockfrostAPI.instance.extend({
    https: {
      rejectUnauthorized: false,
    },
  });
  const protocolParameters = await blockfrostAPI.epochsLatestParameters();

  // Retrieve utxo for the address
  let utxo: UTXO = [];

  try {
    utxo = await blockfrostAPI.addressesUtxosAll(address);
  } catch (error) {
    if (error instanceof BlockfrostServerError && error.status_code === 404) {
      // Address derived from the seed was not used yet
      // In this case Blockfrost API will return 404
      utxo = [];
    } else {
      throw error;
    }
  }

  const hasLowBalance =
    utxo.length === 1 &&
    BigInt(utxo.at(0)?.amount.find(a => a.unit === 'lovelace')?.quantity ?? '0') < 2_000_000;

  if (utxo.length === 0 || hasLowBalance) {
    throw new Error(`You should send ADA to ${address} to have enough funds to sent a transaction`);
  }

  const { txBody, txHash } = composeTransaction(address, receivingAddress, amountInLovelace, utxo, {
    protocolParams: protocolParameters,
  });

  const transaction = signTransaction(txBody, signKey);

  return { transaction, txHash };
};
