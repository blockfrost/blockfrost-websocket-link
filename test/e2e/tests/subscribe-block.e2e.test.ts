import { describe, test } from 'vitest';
import { WebsocketClientE2e } from '../utils/websocket-client-e2e.js';
import { getFixtures } from '../utils/fixtures-loader.js';
import { expect } from 'vitest';

const fixtures = await getFixtures('subscribe-block');

describe('subscribe-block', () => {
  const ws = new WebsocketClientE2e('ws://localhost:3005');

  for (const fixture of fixtures) {
    test(fixture.testName, async () => {
      await ws.waitForConnection();

      const response = await ws.sendAndWait('SUBSCRIBE_BLOCK');
      expect(response.data).toMatchObject({
        'subscribed': true,
      });

      const messages = await ws.waitForSubscriptionMessages(2,160_000);

      expect(messages[0].data).toMatchObject(fixture.subscribe_message_schema);
      expect(messages[1].data).toMatchObject(fixture.subscribe_message_schema);
      expect(messages[1].data.previous_block).equals(messages[0].data.hash)
      ws.close();
    });
  }
});
