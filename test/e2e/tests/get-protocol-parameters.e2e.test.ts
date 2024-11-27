import { describe, expect, test } from 'vitest';
import { getFixtures } from '../utils/fixtures-loader.js';
import { getWebSocketClient } from '../utils/setup-websocket-client.js';

const fixtures = await getFixtures('get-protocol-parameters');

describe('get-protocol-parameters', () => {
  for (const fixture of fixtures) {
    test(fixture.testName, async () => {
      const ws = getWebSocketClient();
      const { id, type, data: { cost_models, ...data } } = await ws.sendAndWait('GET_PROTOCOL_PARAMETERS');

      expect({ id, type, data }).toStrictEqual(fixture.result);
      expect(typeof cost_models).toEqual('object');

      for(const [version, values] of Object.entries(cost_models)) {
        expect(typeof version).toEqual('string');
        expect(typeof values).toEqual('object');

        for(const [description, value] of Object.entries(values as any)) {
          expect(typeof description).toEqual('string');
          expect(typeof value).toEqual('number');
        }
      }
    });
  }
});
