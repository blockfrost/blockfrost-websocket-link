import { describe, expect, test } from 'vitest';
import { getFixtures } from '../utils/fixtures-loader';
import { WebsocketClientE2e } from '../utils/websocket-client-e2e';

const fixtures = await getFixtures('get-account-utxo');

describe('get-account-utxo', () => {
  const ws = new WebsocketClientE2e('ws://localhost:3005');

  for (const fixture of fixtures) {
    test(fixture.testName, async () => {
      await ws.waitForConnection();
      const { data } = await ws.sendAndWait('GET_ACCOUNT_UTXO', {
        descriptor: fixture.descriptor,
      });

      expect(data).toMatchObject(fixture.result);
      await ws.close();
    });
  }
});
