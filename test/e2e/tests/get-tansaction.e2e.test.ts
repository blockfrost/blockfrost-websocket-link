import { describe, test, expect } from 'vitest';
import { WebsocketClientE2e } from '../utils/websocket-client-e2e.js';
import { getFixtures } from '../utils/fixtures-loader.js';

const fixtures = await getFixtures('get-transaction');

describe('getLatestBlock', () => {
  const ws = new WebsocketClientE2e('ws://localhost:3005', true);

  for (const fixture of fixtures) {
    test(fixture.testName, async () => {
      await ws.waitForConnection();
      const response = await ws.sendAndWait('GET_TRANSACTION', {
        txId: fixture.txID,
      });

      expect(response.data).toMatchObject(fixture.result);
      ws.close();
    });
  }
});
