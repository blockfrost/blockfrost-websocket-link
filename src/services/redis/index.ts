import { createClient } from 'redis';
import { accountAddressesToArray } from '../../utils/address';
import { AccountInfo } from '../../types/response';
import { getKey } from './utils';
import { TxIdsToTransactionsResponse } from '../../types/transactions';
import { UtxosWithBlockResponse } from '../../types/address';

type TransactionWithUtxo = Omit<TxIdsToTransactionsResponse, 'address'>;
export class RedisCache {
  client: ReturnType<typeof createClient>;
  subscriber: ReturnType<typeof createClient>;

  constructor() {
    this.client = createClient();
    this.subscriber = this.client.duplicate();
    this.client.connect();
    this.subscriber.connect();
  }

  storeAccount = async (
    account: AccountInfo,
    txHashList: { address: string; txHash: string }[],
  ) => {
    // store account info
    const accountKey = getKey('account', account.descriptor);
    await this.client.hSet(accountKey, 'data', JSON.stringify(account));
    // store list of all tx hashes for a given account
    await this.client.hSet(accountKey, 'txsHashList', JSON.stringify(txHashList));
    await this.client.expire(accountKey, 60 * 60 * 24); // expires whole account after 24 hours

    // store xpub indexed by an address that was derived from it
    const addresses = accountAddressesToArray(account.addresses);
    for (const address of addresses) {
      const addressKey = getKey('address', address);
      const data = await this.client.get(addressKey);

      if (!data) {
        await this.client.set(addressKey, JSON.stringify(account.descriptor));
      } else {
        // address already associated with xpub
        const xpub = JSON.parse(data) as string;
        if (xpub !== account.descriptor) {
          console.error('Same address associated with multiple xpubs');
        } else {
          console.log(`address already associated with an xpub`);
        }
      }
    }

    // store already retrieved transaction objects
    for (const tx of account.history?.transactions ?? []) {
      await this.storeTransaction(tx);
    }
  };

  getAccountTxHashList = async (
    publicKey: string,
  ): Promise<{ address: string; txHash: string }[] | null> => {
    const accountKey = getKey('account', publicKey);
    const cachedTxHashList = await this.client.hGet(accountKey, 'txsHashList');
    if (!cachedTxHashList) return null;
    try {
      const txHashList = JSON.parse(cachedTxHashList);
      return txHashList as { address: string; txHash: string }[];
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  storeAccountUtxo = async (publicKey: string, utxo: UtxosWithBlockResponse[]) => {
    // store account info
    const accountKey = getKey('account', publicKey);
    return this.client.hSet(accountKey, 'utxo', JSON.stringify(utxo));
  };

  getAccountUtxo = async (publicKey: string): Promise<UtxosWithBlockResponse[] | null> => {
    const accountKey = getKey('account', publicKey);
    const data = await this.client.hGet(accountKey, 'utxo');
    if (!data) return null;
    try {
      const utxo = JSON.parse(data);
      return utxo as UtxosWithBlockResponse[];
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  storeTransaction = async (tx: TransactionWithUtxo) => {
    // store transaction
    // txs have no expiration, they could be evicted only if memory is full
    const txKey = getKey('tx', tx.txHash);
    return this.client.set(txKey, JSON.stringify({ ...tx, address: undefined }));
  };

  getTransaction = async (txHash: string): Promise<TransactionWithUtxo | null> => {
    const txKey = getKey('tx', txHash);
    const data = await this.client.get(txKey);
    if (!data) return null;
    try {
      const tx = JSON.parse(data);
      return tx as TransactionWithUtxo;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  getAccount = async (publicKey: string): Promise<AccountInfo | null> => {
    const accountKey = getKey('account', publicKey);

    const cachedAccount = await this.client.hGet(accountKey, 'data');
    if (!cachedAccount) return null;
    try {
      const accountInfo = JSON.parse(cachedAccount);
      return accountInfo as AccountInfo;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  removeAccount = async (publicKey: string) => {
    const accountKey = getKey('account', publicKey);
    try {
      await this.client.hDel(accountKey, 'utxo');
      await this.client.hDel(accountKey, 'txHashList');
      return this.client.hDel(accountKey, 'data');
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  invalidateAccountByAddress = async (address: string) => {
    const addressKey = getKey('address', address);
    const data = await this.client.get(addressKey);
    if (data) {
      const publicKey = JSON.parse(data) as string;
      console.log(`Invalidating account ${publicKey}`);
      await this.removeAccount(publicKey);
    }
  };
}

export const redisCache = new RedisCache();
