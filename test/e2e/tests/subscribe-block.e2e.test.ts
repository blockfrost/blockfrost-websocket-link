import { describe, test } from 'vitest';
import { getFixtures } from '../utils/fixtures-loader.js';
import { expect } from 'vitest';
import { getWebSocketClient } from '../utils/setup-websocket-client.js';

const fixtures = await getFixtures('subscribe-block');

describe('subscribe-block', () => {
  for (const fixture of fixtures) {
    test(fixture.testName, async () => {
      const ws = getWebSocketClient();

      const response = await ws.sendAndWait('SUBSCRIBE_BLOCK');
      expect(response.data).toMatchObject({
        'subscribed': true,
      });

      const messages = await ws.waitForSubscriptionMessages(2, 300_000);

      expect(messages[0].data).toMatchObject(fixture.subscribe_message_schema);
      expect(messages[1].data).toMatchObject(fixture.subscribe_message_schema);
      expect(messages[1].data.previous_block).equals(messages[0].data.hash)
    });
  }
});
