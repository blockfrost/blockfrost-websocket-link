import { describe, expect, test } from 'vitest';
import { getFixtures } from '../utils/fixtures-loader.js';
import { getWebSocketClient } from '../utils/setup-websocket-client.js';

const fixtures = await getFixtures('estimate-fee');

describe('estimate-fee', () => {
  for (const fixture of fixtures) {
    test(fixture.testName, async () => {
      const ws = getWebSocketClient();
      const { data } = await ws.sendAndWait('ESTIMATE_FEE');
      expect(data).toMatchObject(fixture.result);
    });
  }
});
