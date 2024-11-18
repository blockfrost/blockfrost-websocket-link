import { describe, expect, test } from 'vitest';
import { getFixtures } from '../utils/fixtures-loader.js';
import { getWebSocketClient } from '../utils/setup-websocket-client.js';

const fixtures = await getFixtures('get-ada-handle');

describe('get-ada-handle', () => {
  for (const { handle, result, testName } of fixtures) {
    test(testName, async () => {
      const ws = getWebSocketClient();
      const { data } = await ws.sendAndWait('GET_ADA_HANDLE', { name: handle });
      expect(data).toMatchObject(result);
    });
  }
});
