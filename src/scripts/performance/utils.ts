import * as CardanoWasm from '@emurgo/cardano-serialization-lib-nodejs';
import { deriveAddress } from '@blockfrost/blockfrost-js';

export class Deferred<T> {
  promise: Promise<T>;
  reject!: (reason?: unknown) => void;
  resolve!: (value: T) => void;
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.reject = reject;
      this.resolve = resolve;
    });
  }
}

export const harden = (number_: number): number => {
  return 0x80_00_00_00 + number_;
};

export const generateRandomAccounts = (count: number) => {
  const xpubs: string[] = [];
  const rootKey = CardanoWasm.Bip32PrivateKey.generate_ed25519_bip32();

  for (let index = 0; index < count; index++) {
    const key = rootKey
      .derive(harden(1852)) // purpose
      .derive(harden(1815)) // coin type
      .derive(harden(index)) // account #
      .to_public()
      .as_bytes();

    xpubs.push(Buffer.from(key).toString('hex'));
  }
  return xpubs;
};

export const deriveAddressesForXpub = (xpub: string, count = 20) => {
  const addresses: string[] = [];

  for (let index = 0; index < count; index++) {
    const addr = deriveAddress(xpub, 0, index, true);
    const change = deriveAddress(xpub, 1, index, true);

    addresses.push(addr.address, change.address);
  }
  return addresses;
};

export const randomIntFromInterval = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};
