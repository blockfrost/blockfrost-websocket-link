import { describe, test } from 'vitest';
import { WebsocketClientE2e } from '../utils/websocket-client-e2e.js';
import { expect } from 'vitest';
import { sleep } from '../utils/sleep.js';


describe('unsubscribe-block', () => {
  const ws = new WebsocketClientE2e('ws://localhost:3005');

    test('UNSUBSCRIBE_BLOCK - success', async () => {
      await ws.waitForConnection();

      await ws.sendAndWait('SUBSCRIBE_BLOCK');
      ws.clearSubscriptionMessages();
      const response = await ws.sendAndWait('UNSUBSCRIBE_BLOCK');
      expect(response.data).toMatchObject({
        'subscribed': false,
      });
      await sleep(100_000);
      expect(ws.getSubscriptionMessages().length).equals(0);
      ws.close();
    });

});
