import { describe, expect, test } from 'vitest';
import { getFixtures } from '../utils/fixtures-loader.js';
import { WebsocketClientE2e } from '../utils/websocket-client-e2e.js';

const fixtures = await getFixtures('get-server-info');

describe('get-server-info', () => {
  const ws = new WebsocketClientE2e('ws://localhost:3005');

  for (const fixture of fixtures) {
    test(fixture.testName, async () => {
      await ws.waitForConnection();
      const { data } = await ws.sendAndWait('GET_SERVER_INFO');

      expect(data).toMatchObject(fixture.result);
      ws.close();
    });
  }
});
