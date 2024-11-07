import { describe, expect, test } from 'vitest';
import { getFixtures } from '../utils/fixtures-loader.js';
import { getWebSocketClient } from '../utils/setup-websocket-client.js';

const fixtures = await getFixtures('get-block');

describe('get-block', () => {

  for (const fixture of fixtures) {
    test(fixture.testName, async () => {
      const ws = getWebSocketClient();
      const { data } = await ws.sendAndWait('GET_BLOCK', { hashOrNumber: '8b41ba36539ce5f72ec5e6792dfa125ba60126443c7d2d6452f71e5f7d410cfc' });
      expect(data).toMatchObject(fixture.result);
    });
  }
});
