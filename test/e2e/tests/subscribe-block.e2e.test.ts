import { describe, test } from 'vitest';
import { WebsocketClientE2e } from '../utils/websocket-client-e2e';
import { getFixtures } from '../utils/fixtures-loader';
import { expect } from 'vitest';
import { sleep } from '../utils/sleep';

const fixtures = await getFixtures('subscribe-block');

describe('subscribe-block', () => {
  const ws = new WebsocketClientE2e('ws://localhost:3005', true);

  for (const fixture of fixtures) {
    test(fixture.testName, async () => {
      await ws.waitForConnection();

      ws.setSubscriptionCallback(message => {
        //TODO
        console.log('Received subscription message:', message);
      });

      const response = await ws.sendAndWait('SUBSCRIBE_BLOCK');
      expect(response.data).toMatchObject({
        'subscribed': true,
      });
      await sleep(15_000)
      await ws.close();
    });
  }
});
