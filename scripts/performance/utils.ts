import * as CardanoWasm from '@emurgo/cardano-serialization-lib-nodejs';
import { deriveAddress } from '@blockfrost/blockfrost-js';

export class Deferred {
  promise: Promise<unknown>;
  reject!: (reason?: any) => void;
  resolve!: (value: unknown) => void;
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.reject = reject;
      this.resolve = resolve;
    });
  }
}

export const harden = (num: number): number => {
  return 0x80000000 + num;
};

export const generateRandomAccounts = (count: number) => {
  const xpubs: string[] = [];
  const rootKey = CardanoWasm.Bip32PrivateKey.generate_ed25519_bip32();

  for (let i = 0; i < count; i++) {
    const key = rootKey
      .derive(harden(1852)) // purpose
      .derive(harden(1815)) // coin type
      .derive(harden(i)) // account #
      .to_public()
      .as_bytes();
    xpubs.push(Buffer.from(key).toString('hex'));
  }
  return xpubs;
};

export const deriveAddressesForXpub = (xpub: string, count = 20) => {
  const addresses: string[] = [];
  for (let i = 0; i < count; i++) {
    const addr = deriveAddress(xpub, 0, i, true);
    const change = deriveAddress(xpub, 1, i, true);
    addresses.push(addr.address);
    addresses.push(change.address);
  }
  return addresses;
};

export const randomIntFromInterval = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};
