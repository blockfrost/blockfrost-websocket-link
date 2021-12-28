import { createClient } from 'redis';
import { accountAddressesToArray } from '../../utils/address';
import { AccountInfo } from '../../types/response';
import { getKey } from './utils';
import { TxIdsToTransactionsResponse } from '../../types/transactions';

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

  // setAddressListener = async (address: string, publicKey: string) => {
  //   // TODO resubscribe to all addresses after start
  //   // EITHER invalidate stale accounts on start or just remove all accounts on every start
  //   // OR don't use pub/sub since the validity could be checked on each request without additional overhead

  //   const channelName = `affectedAddress-${address}`;
  //   console.log('subscribing to', channelName);

  //   await this.subscriber.subscribe(channelName, addr => {
  //     console.log('affected addr', addr, 'in account', publicKey); // 'message'
  //     this.removeAccount(publicKey);
  //   });
  // };

  storeAccount = async (
    account: AccountInfo,
    txHashList: { address: string; txHash: string }[],
  ) => {
    // store account info
    const accountKey = getKey('account', account.descriptor);
    await this.client.hSet(accountKey, 'data', JSON.stringify(account));
    await this.client.expire(accountKey, 60 * 60 * 24); // expires whole account after 24 hours
    // store list of all tx hashes for a given account
    await this.client.hSet(accountKey, 'txsHashList', JSON.stringify(txHashList));

    // const addresses = accountAddressesToArray(account.addresses);
    // for (const address of addresses) {
    //   // set listener for every known account's address
    //   await this.setAddressListener(address, account.descriptor);
    // }

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

  storeTransaction = async (tx: TransactionWithUtxo) => {
    // TODO: set sane expiration
    // store transaction
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
      const account = await this.getAccount(accountKey);
      if (account) {
        const addresses = accountAddressesToArray(account.addresses);

        for (const address of addresses) {
          await this.subscriber.unsubscribe(`affectedAddress-${address}`);
        }
      }

      this.client.hDel(accountKey, 'txHashList');
      return this.client.hDel(accountKey, 'data');
    } catch (err) {
      console.error(err);
      return null;
    }
  };
}

export const redisCache = new RedisCache();

// export const invalidateAddresses = async (
//   addresses: {
//     address: string;
//     transactions: {
//       tx_hash: string;
//     }[];
//   }[],
// ) => {
//   for (const affectedAddress of addresses) {
//     const channels = await redisCache.client.pubSubChannels('affectedAddress-*');
//     console.log('subscribed channels', channels);
//     redisCache.client
//       .publish(`affectedAddress-${affectedAddress.address}`, affectedAddress.address)
//       .catch(err => {
//         console.log(err);
//       });
//   }
// };
