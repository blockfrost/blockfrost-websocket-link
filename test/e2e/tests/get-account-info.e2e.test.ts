import { describe, expect, test } from 'vitest';
import { getFixtures } from '../utils/fixtures-loader.js';
import { getWebSocketClient } from '../utils/setup-websocket-client.js';

const fixtures = await getFixtures('get-account-info');

describe('get-account-info', () => {
  for (const fixture of fixtures) {
    test(fixture.testName, async () => {
      const ws = getWebSocketClient();
      const { data } = await ws.sendAndWait('GET_ACCOUNT_INFO', {
        descriptor: fixture.descriptor,
        details: fixture.details,
        page: fixture.page,
        pageSize: fixture.pageSize,
      });

      expect(data).toEqual(fixture.result);
    });
  }
});
