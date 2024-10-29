import { describe, expect, test } from 'vitest';
import { WebsocketClientE2e } from '../utils/websocket-client-e2e';
import { buildTx } from '../tx-builder';
import { getFixtures } from '../utils/fixtures-loader';


const fixtures = await getFixtures('push-transaction');

describe('push-transaction', () => {
  const ws = new WebsocketClientE2e('ws://localhost:3005', true);

  for (const fixture of fixtures) {
    test('PUSH_TRANSACTION', async () => {
      await ws.waitForConnection();
      const receivingAddress =
        'addr_test1qq4wgdp3xw29d6ewuv9cvx83h9v0d5sy8lntd8vrdtrsfykwfnd2ewysca99vdwkvpp6a8w9nv5u4srvw5k0ywtl3v8qrl4qwp';
      const { transaction, txHash } = await buildTx('1000000', receivingAddress);
      const resposne = await ws.sendAndWait('PUSH_TRANSACTION', {
        txData: transaction.to_hex(),
      });

      expect(resposne.data).toMatchObject(txHash);
      await ws.close();
    });
  }
});
