import { describe, test } from 'vitest';
import { expect } from 'vitest';
import { sleep } from '../utils/sleep.js';
import { getWebSocketClient } from '../utils/setup-websocket-client.js';


describe('unsubscribe-block', () => {

    test('UNSUBSCRIBE_BLOCK - success', async () => {
      const ws = getWebSocketClient();

      await ws.sendAndWait('SUBSCRIBE_BLOCK');
      ws.clearSubscriptionMessages();
      const response = await ws.sendAndWait('UNSUBSCRIBE_BLOCK');
      expect(response.data).toMatchObject({
        'subscribed': false,
      });
      await sleep(100_000);
      expect(ws.getSubscriptionMessages().length).equals(0);
    });

});
