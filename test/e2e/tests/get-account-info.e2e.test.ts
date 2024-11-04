import { describe, expect, test } from 'vitest';
import { getFixtures } from '../utils/fixtures-loader.js';
import { WebsocketClientE2e } from '../utils/websocket-client-e2e.js';

const fixtures = await getFixtures('get-account-info');

describe('get-account-info', () => {
  const ws = new WebsocketClientE2e('ws://localhost:3005');

  for (const fixture of fixtures) {
    test(fixture.testName, async () => {
      await ws.waitForConnection();
      const { data } = await ws.sendAndWait('GET_ACCOUNT_INFO', {
        descriptor: fixture.descriptor,
        details: fixture.details,
        page: fixture.page,
        pageSize: fixture.pageSize,
      });

      expect(data).toMatchObject(fixture.result);
      ws.close();
    });
  }
});
