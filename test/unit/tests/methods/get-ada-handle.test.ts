import sinon from 'sinon';
import { describe, test, expect } from 'vitest';
import fixtures from '../../fixtures/getAdaHandle.js';
import { blockfrostAPI } from '../../../../src/utils/blockfrost-api.js';
import getAdaHandle from '../../../../src/methods/get-ada-handle.js';

describe('getAdaHandle', () => {
  for (const fixture of fixtures) {
    test(fixture.testName, async () => {
      const mock1 = fixture.assets ?
        sinon.stub(blockfrostAPI, 'assetsAddresses').resolves(fixture.assets) :
        sinon.stub(blockfrostAPI, 'assetsAddresses').rejects(fixture.error);

      if(fixture.result) {
        const result = await getAdaHandle(1, 'test', 'test');

        expect(result).toBe(JSON.stringify(fixture.result));
      }
      else {
        await expect(getAdaHandle(1, 'test', 'test')).rejects.toEqual(fixture.thrown);
      }

      mock1.restore();
    });
  }
});
