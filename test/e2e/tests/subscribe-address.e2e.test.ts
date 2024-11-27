// @ts-nocheck
import { describe, expect, test } from 'vitest';
import { buildTx } from '../tx-builder/index.js';
import { getWebSocketClient } from '../utils/setup-websocket-client.js';
import { getFixtures } from '../utils/fixtures-loader.js';

const fixtures = await getFixtures('subscribe-address');

describe('subscribe-address', () => {

  for (const fixture of fixtures) {
    test(fixture.testName, async () => {
      const ws = getWebSocketClient();

      //Subscribe wallets and validate if enabled correctly
      const subscribeWalletsResponse = await ws.sendAndWait('SUBSCRIBE_ADDRESS', {
        addresses: [fixture.sendingWallet.address, fixture.receivingWallet.address],
      });

      expect(subscribeWalletsResponse.data).toMatchObject(fixture.result);

      //Push transaction between wallets to trigger subscription
      const randomLovelaceValue = (Math.floor(Math.random() * (1500000 - 1000000 + 1)) + 1000000).toString();
      const { transaction, txHash } = await buildTx(fixture.sendingWallet?.mnemonic, randomLovelaceValue, fixture.receivingWallet?.address);
      await ws.sendAndWait('PUSH_TRANSACTION', {
        txData: transaction.to_hex(),
      });

      //Check subscription message
      const [message] = await ws.waitForSubscriptionMessages(1, 150_000);
      expect(message.data).toMatchObject(fixture.subscribe_message_schema);
      expect(message.data[0].txHash).toMatchObject(txHash);
      expect(message.data[1].txHash).toMatchObject(txHash);
    });
  }
});
