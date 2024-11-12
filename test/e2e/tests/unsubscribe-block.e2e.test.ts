import { afterAll, beforeAll, describe, test } from 'vitest';
import { expect } from 'vitest';
import { getWebSocketClient } from '../utils/setup-websocket-client.js';
import { WebsocketClientE2e } from '../utils/websocket-client-e2e.js';

describe('unsubscribe-block', () => {
  // alternative ws client used to be aware when server emits a new block
  let ws2: WebsocketClientE2e;

  beforeAll(async () => {
    ws2 = new WebsocketClientE2e('ws://localhost:3005');

    // init the alternative client
    await ws2.waitForConnection();
  });

  afterAll(() => {
    if (ws2) ws2.close();
  });

  test('UNSUBSCRIBE_BLOCK - success', async () => {
    // standard e2e ws client
    const ws1 = getWebSocketClient();

    // subscribe both the clients
    await Promise.all([ws1.sendAndWait('SUBSCRIBE_BLOCK'), ws2.sendAndWait('SUBSCRIBE_BLOCK')]);

    // immediately unsubscribe the standard e2e ws client
    const response = await ws1.sendAndWait('UNSUBSCRIBE_BLOCK');
    expect(response.data).toMatchObject({
      'subscribed': false,
    });

    ws1.clearSubscriptionMessages();
    ws2.clearSubscriptionMessages();

    // wait for a new block
    await ws2.waitForSubscriptionMessages(1, 160_000);

    // ensure the alternative client got the new block while the standard one didn't
    expect(ws1.getSubscriptionMessages().length).equals(0);
    expect(ws2.getSubscriptionMessages().length).equals(1);
  });
});
