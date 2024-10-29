import { describe, test } from 'vitest';
import { WebsocketClientE2e } from '../utils/websocket-client-e2e';
import { buildTx } from '../tx-builder';

describe('pushTransactionE2e', () => {
  const ws = new WebsocketClientE2e('ws://localhost:3005', true);

  test('PUSH_TRANSACTION', async () => {
    await ws.waitForConnection();
    const receivingAddress =
      'addr_test1qq4wgdp3xw29d6ewuv9cvx83h9v0d5sy8lntd8vrdtrsfykwfnd2ewysca99vdwkvpp6a8w9nv5u4srvw5k0ywtl3v8qrl4qwp';
    const signedTx = await buildTx('1000000', receivingAddress);

    ws.setSubscriptionCallback(message => {
      console.log('Received subscription message:', message);
    });

    await ws.sendAndWait('SUBSCRIBE_ADDRESS', {
      addresses: receivingAddress,
    });

    await ws.sendAndWait('PUSH_TRANSACTION', {
      txData: signedTx.to_hex(),
    });
    await ws.close();
  });
});
