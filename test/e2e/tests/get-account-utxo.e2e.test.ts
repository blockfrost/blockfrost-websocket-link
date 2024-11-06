import { describe, expect, test } from 'vitest';
import { getFixtures } from '../utils/fixtures-loader.js';
import { getWebSocketClient } from '../utils/setup-websocket-client.js';

const fixtures = await getFixtures('get-account-utxo');

describe('get-account-utxo', () => {
  for (const fixture of fixtures) {
    test(fixture.testName, async () => {
      const ws = getWebSocketClient();
      const { data } = await ws.sendAndWait('GET_ACCOUNT_UTXO', {
        descriptor: fixture.descriptor,
      });

      expect(data).toMatchObject(fixture.result);
    });
  }
});
