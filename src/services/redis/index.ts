import { createClient } from 'redis';
import { accountAddressesToArray } from '../../utils/address';
import { AccountInfo } from '../../types/response';

export class RedisCache {
  client: ReturnType<typeof createClient>;
  subscriber: ReturnType<typeof createClient>;

  constructor() {
    this.client = createClient();
    this.subscriber = this.client.duplicate();
    this.client.connect();
    this.subscriber.connect();
  }

  setAddressListener = async (address: string, publicKey: string) => {
    // TODO resubscribe to all addresses after start
    // EITHER invalidate stale accounts on start or just remove all accounts on every start
    // OR don't use pub/sub since the validity could be checked on each request without additional overhead

    const channelName = `affectedAddress-${address}`;
    console.log('subscribing to', channelName);

    await this.subscriber.subscribe(channelName, addr => {
      console.log('affected addr', addr, 'in account', publicKey); // 'message'
      this.removeAccount(publicKey);
    });
  };

  storeAccount = async (
    account: AccountInfo,
    txHashList: { address: string; txHash: string }[],
  ) => {
    // store account info
    await this.client.hSet(account.descriptor, 'data', JSON.stringify(account));
    await this.client.expire(account.descriptor, 60 * 60 * 24); // expires whole account after 24 hours
    // store list of all tx hashes for a given account
    await this.client.hSet(account.descriptor, 'txsHashList', JSON.stringify(txHashList));

    const addresses = accountAddressesToArray(account.addresses);
    for (const address of addresses) {
      // set listener for every known account's address
      await this.setAddressListener(address, account.descriptor);
    }

    // store already retrieved transaction objects
    for (const tx of account.history?.transactions ?? []) {
      await this.client.hSet('transactions', tx.txHash, JSON.stringify(tx));
    }
  };

  getAccountTxHashList = async (
    publicKey: string,
  ): Promise<{ address: string; txHash: string }[] | null> => {
    const cachedTxHashList = await this.client.hGet(publicKey, 'txsHashList');
    if (!cachedTxHashList) return null;
    try {
      const txHashList = JSON.parse(cachedTxHashList);
      return txHashList as { address: string; txHash: string }[];
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  getAccount = async (publicKey: string): Promise<AccountInfo | null> => {
    const cachedAccount = await this.client.hGet(publicKey, 'data');
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
    try {
      const account = await this.getAccount(publicKey);
      if (account) {
        const addresses = accountAddressesToArray(account.addresses);

        for (const address of addresses) {
          await this.subscriber.unsubscribe(`affectedAddress-${address}`);
        }
      }

      this.client.hDel(publicKey, 'txHashList');
      return this.client.hDel(publicKey, 'data');
    } catch (err) {
      console.error(err);
      return null;
    }
  };
}

export const redisCache = new RedisCache();

export const invalidateAddresses = async (
  addresses: {
    address: string;
    transactions: {
      tx_hash: string;
    }[];
  }[],
) => {
  for (const affectedAddress of addresses) {
    const channels = await redisCache.client.pubSubChannels('affectedAddress-*');
    console.log('subscribed channels', channels);
    redisCache.client
      .publish(`affectedAddress-${affectedAddress.address}`, affectedAddress.address)
      .catch(err => {
        console.log(err);
      });
  }
};
