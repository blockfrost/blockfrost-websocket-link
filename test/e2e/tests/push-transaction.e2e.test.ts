import { describe, expect, test } from 'vitest';
import { buildTx } from '../tx-builder/index.js';
import { getWebSocketClient } from '../utils/setup-websocket-client.js';


describe('push-transaction', () => {

  test('PUSH_TRANSACTION', async () => {
    const ws = getWebSocketClient();
    const receivingAddress =
      'addr_test1qq4wgdp3xw29d6ewuv9cvx83h9v0d5sy8lntd8vrdtrsfykwfnd2ewysca99vdwkvpp6a8w9nv5u4srvw5k0ywtl3v8qrl4qwp';
    const sendingMnemonic = 'zone city mean decorate budget gasp furnace extend shrimp promote diary torch quantum album market wheel urge maple above provide stomach suspect depend second';
    const randomLovelaceValue = (Math.floor(Math.random() * (1500000 - 1000000 + 1)) + 1000000).toString();
    const { transaction, txHash } = await buildTx(sendingMnemonic, randomLovelaceValue, receivingAddress);
    const response = await ws.sendAndWait('PUSH_TRANSACTION', {
      txData: transaction.to_hex(),
    });

    expect(response.data).toEqual(txHash);
  });
});
