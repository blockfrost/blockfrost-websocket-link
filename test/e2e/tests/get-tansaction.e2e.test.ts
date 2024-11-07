import { describe, test, expect } from 'vitest';
import { getFixtures } from '../utils/fixtures-loader.js';
import { getWebSocketClient } from '../utils/setup-websocket-client.js';

const fixtures = await getFixtures('get-transaction');

describe('getLatestBlock', () => {

  for (const fixture of fixtures) {
    test(fixture.testName, async () => {
      const ws = getWebSocketClient();
      const response = await ws.sendAndWait('GET_TRANSACTION', {
        txId: fixture.txID,
      });

      expect(response.data).toMatchObject(fixture.result);
    });
  }
});
