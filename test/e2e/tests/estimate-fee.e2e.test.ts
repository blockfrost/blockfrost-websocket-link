import { describe, expect, test } from 'vitest';
import { getFixtures } from '../utils/fixtures-loader.js';
import { WebsocketClientE2e } from '../utils/websocket-client-e2e.js';

const fixtures = await getFixtures('estimate-fee');

describe('estimate-fee', () => {
  const ws = new WebsocketClientE2e('ws://localhost:3005');

  for (const fixture of fixtures) {
    test(fixture.testName, async () => {
      await ws.waitForConnection();
      const { data } = await ws.sendAndWait('ESTIMATE_FEE');
      expect(data).toMatchObject(fixture.result);
      ws.close();
    });
  }
});
