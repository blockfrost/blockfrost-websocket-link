import { ALL_SEED } from './constants.js';
import { deriveAddressesForXpub, generateRandomAccounts, randomIntFromInterval } from './utils.js';
import { WebsocketClient } from '../../utils/websocket-client.js';

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
    const c = new WebsocketClient(this.wsServer, false);

    await c.waitForConnection();

    // retrieve basic info and subscribe to block notifications
    c.send('GET_SERVER_INFO');
    c.send('SUBSCRIBE_BLOCK');

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
      await c.sendAndWait('SUBSCRIBE_ADDRESS', {
        addresses: addresses,
      });

      // periodically retrieve basic account info on each block
      // for testing purposes let's approximate the interval to 20s
      setInterval(() => {
        c.send('GET_ACCOUNT_INFO', {
          descriptor: xpub,
          details: 'basic',
        });
      }, 20_000);

      // refetch balance history (could happen after receiving/sending tx)
      setInterval(
        () => {
          c.send('GET_BALANCE_HISTORY', {
            descriptor: xpub,
            groupBy: 86_400, // 1 day
          });
        },
        randomIntFromInterval(600, 1200) * 1000,
      ); // every 10-20 mins
      this.metrics.accounts += 1;
    }
    for (const xpub of xpubs) {
      // fetch history for all xpubs of the user
      c.send('GET_BALANCE_HISTORY', {
        descriptor: xpub,
        groupBy: 86_400, // 1 day
      });
    }

    this.metrics.users += 1;
    console.log(
      `Current total users: ${this.metrics.users}, total accounts: ${this.metrics.accounts}`,
    );
  };

  addRandomUserInInterval = (interval: number) => {
    setInterval(() => {
      console.log('Adding new user');
      // 50% change it will be "all seed" user otherwise there will be only empty accounts
      const r = randomIntFromInterval(0, 10);

      if (r > 5) {
        this.addUser(ALL_SEED);
      } else {
        this.addUser(generateRandomAccounts(randomIntFromInterval(2, 4)));
      }
    }, interval);
  };
}

const suite = new TestSuite(process.env.TEST_WEBSOCKET_BACKEND ?? 'ws://localhost:3005');

suite.addUser(ALL_SEED);
suite.addRandomUserInInterval(30_000);
