import { describe, expect, test } from 'vitest';
import { getFixtures } from '../utils/fixtures-loader.js';
import { WebsocketClientE2e } from '../utils/websocket-client-e2e.js';

const fixtures = await getFixtures('get-block');

describe('get-block', () => {
  const ws = new WebsocketClientE2e('ws://localhost:3005');

  for (const fixture of fixtures) {
    test(fixture.testName, async () => {
      await ws.waitForConnection();
      const { data } = await ws.sendAndWait('GET_BLOCK', { hashOrNumber: '8b41ba36539ce5f72ec5e6792dfa125ba60126443c7d2d6452f71e5f7d410cfc' });
      expect(data).toMatchObject(fixture.result);
      ws.close();
    });
  }
});
