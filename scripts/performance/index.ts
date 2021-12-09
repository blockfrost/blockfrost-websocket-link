import { allSeed } from './constants';
import { deriveAddressesForXpub, generateRandomAccounts, randomIntFromInterval } from './utils';
import { TestClient } from './websocket';

interface TestSuiteMetrics {
  accounts: number;
  users: number;
}

class TestSuite {
  metrics: TestSuiteMetrics = {
    accounts: 0,
    users: 0,
  };
  accountsCount = 0;
  wsServer: string;

  constructor(url: string) {
    this.wsServer = url;
  }

  addUser = async (xpubs: string[]) => {
    console.log(`Connecting user with ${xpubs.length} accounts... `);
    //  each user has its own websocket client
    const c = new TestClient(this.wsServer);
    await c.waitForConnection();

    // retrieve basic info and subscribe to block notifications
    c.send('GET_SERVER_INFO');
    c.send('SUBSCRIBE_BLOCK', {});

    const addresses: string[] = []; // for all user's accounts (xpubs)
    for (const xpub of xpubs) {
      addresses.push(...deriveAddressesForXpub(xpub));

      // initial account discovery with txs
      await c.sendAndWait('GET_ACCOUNT_INFO', {
        descriptor: xpub,
        details: 'txs',
        pageSize: 25,
      });
      await c.sendAndWait('GET_ACCOUNT_UTXO', {
        descriptor: xpub,
      });
      // after each added account call resubscribe with updated addresses
      c.send('SUBSCRIBE_ADDRESS', {
        addresses: addresses,
      });

      // periodically retrieve basic account info on each block
      // for testing purposes let's approximate the interval to 20s
      setInterval(() => {
        c.send('GET_ACCOUNT_INFO', {
          descriptor: xpub,
          details: 'basic',
        });
      }, 20000);
      this.metrics.accounts += 1;
    }
    this.metrics.users += 1;
    console.log(
      `Current total users: ${this.metrics.users}, total accounts: ${this.metrics.accounts}`,
    );
  };

  addRandomUserInInterval = (interval: number) => {
    setInterval(() => {
      console.log('Adding new user');
      this.addUser(generateRandomAccounts(randomIntFromInterval(2, 4)));
    }, interval);
  };
}

const suite = new TestSuite(process.env.TEST_WEBSOCKET_BACKEND ?? 'ws://localhost:3005');
suite.addUser(allSeed);
suite.addRandomUserInInterval(30000);
