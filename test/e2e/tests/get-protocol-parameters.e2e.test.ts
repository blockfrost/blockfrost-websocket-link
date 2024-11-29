import { describe, expect, test } from 'vitest';
import { getFixtures } from '../utils/fixtures-loader.js';
import { getWebSocketClient } from '../utils/setup-websocket-client.js';

const fixtures = await getFixtures('get-protocol-parameters');

describe('get-protocol-parameters', () => {
  for (const fixture of fixtures) {
    test(fixture.testName, async () => {
      const ws = getWebSocketClient();
      const msg = await ws.sendAndWait('GET_PROTOCOL_PARAMETERS');

      expect(msg).toStrictEqual(fixture.result);
    });
  }
});
