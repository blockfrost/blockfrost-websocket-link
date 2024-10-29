import { describe, test, expect } from 'vitest';
import { WebsocketClientE2e } from '../utils/websocket-client-e2e';
import { getFixtures } from '../utils/fixtures-loader';

const fixtures = await getFixtures('get-transaction');

describe('getLatestBlock', () => {
  const ws = new WebsocketClientE2e('ws://localhost:3005', true);

  for (const fixture of fixtures) {
    test(fixture.testName, async () => {
      await ws.waitForConnection();
      const response = await ws.sendAndWait('GET_TRANSACTION', {
        txId: 'ed7e75df5a1d4925cc642ba6360d0dd031bfff54d0314757cfcbf2448a5e8c33',
      });

      expect(response.data).toMatchObject(fixture.result);
      await ws.close();
    });
  }
});
