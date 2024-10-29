import { describe, test } from 'vitest';
import fixtures from '../fixtures/mainnet/get-transaction.e2e';
import { WebsocketClientE2e } from '../utils/websocket-client-e2e';

describe('subscribe-block', () => {
  const ws = new WebsocketClientE2e('ws://localhost:3005', true);

  for (const fixture of fixtures) {
    test(fixture.testName, async () => {
      await ws.waitForConnection();

      // ws.setSubscriptionCallback(message => {
      //   console.log('Received subscription message:', message);
      //   expect(message).toHaveProperty('type', 'update');
      //   expect(message).toHaveProperty('data');
      // });
      //
      // const response = await ws.sendAndWait('SUBSCRIBE_ADDRESS');
      //
      // expect(response.data).toMatchObject(fixture.result);
      await ws.close();
    });
  }
});
