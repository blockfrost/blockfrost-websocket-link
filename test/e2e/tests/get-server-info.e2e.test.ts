import { describe, expect, test } from 'vitest';
import { getFixtures } from '../utils/fixtures-loader.js';
import { getWebSocketClient } from '../utils/setup-websocket-client.js';

const fixtures = await getFixtures('get-server-info');

describe('get-server-info', () => {

  for (const fixture of fixtures) {
    test(fixture.testName, async () => {
      const ws = getWebSocketClient();
      const { data } = await ws.sendAndWait('GET_SERVER_INFO');
      expect(data).toMatchObject(fixture.result);
    });
  }
});
