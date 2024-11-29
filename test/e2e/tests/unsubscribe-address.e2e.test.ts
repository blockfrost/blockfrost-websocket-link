import { afterAll, beforeAll, describe, test } from 'vitest';
import { expect } from 'vitest';
import { getWebSocketClient } from '../utils/setup-websocket-client.js';
import { WebsocketClientE2e } from '../utils/websocket-client-e2e.js';
import { buildTx } from '../tx-builder/index.js';

describe('unsubscribe-address', () => {
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

  test('UNSUBSCRIBE_ADDRESS - success', async () => {
    // standard e2e ws client
    const ws1 = getWebSocketClient();
    const receivingAddress =
      'addr_test1qq4wgdp3xw29d6ewuv9cvx83h9v0d5sy8lntd8vrdtrsfykwfnd2ewysca99vdwkvpp6a8w9nv5u4srvw5k0ywtl3v8qrl4qwp';
    const sendingAddress = 'addr_test1qq7gkzq6nptzfdrthyfxl32wfq7mxq7t7r3tvelngprees3ac6gyz0hv6z4jle5p363ey9vk3rn54sh3q5xc9hdqrxyshqn8dd';
    const sendingMnemonic = 'champion pen black option more emerge icon space mushroom antenna sort common myth dizzy bitter host kidney gospel melody submit stove rally number mistake';

    // subscribe both the clients
    await Promise.all([await ws1.sendAndWait('SUBSCRIBE_ADDRESS', {
        addresses: [sendingAddress, receivingAddress],
      }), await ws2.sendAndWait('SUBSCRIBE_ADDRESS', {
        addresses: [sendingAddress, receivingAddress],
      })],
    );

    // immediately unsubscribe the standard e2e ws client
    const response = await ws1.sendAndWait('UNSUBSCRIBE_ADDRESS');
    expect(response.data).toMatchObject({
      'subscribed': false,
    });


    //Push transaction which will trigger subscription message
    const randomLovelaceValue = (Math.floor(Math.random() * (1500000 - 1000000 + 1)) + 1000000).toString();
    const { transaction } = await buildTx(sendingMnemonic, randomLovelaceValue, receivingAddress);
    await ws1.sendAndWait('PUSH_TRANSACTION', {
      txData: transaction.to_hex(),
    });

    // Wait for a new subscription message
    await ws2.waitForSubscriptionMessages(1, 160_000);

    // Ensure the alternative client got the new subscription while the standard one didn't
    expect(ws1.getSubscriptionMessages().length).equals(0);
    expect(ws2.getSubscriptionMessages().length).equals(1);
  });
});
