import sinon from 'sinon';
import { describe, test, expect } from 'vitest';
import fixtures from '../../fixtures/getLatestBlock.js';
import { blockfrostAPI } from '../../../../src/utils/blockfrost-api.js';
import getLatestBlock from '../../../../src/methods/get-latest-block.js';

describe('getLatestBlock', () => {
  for (const fixture of fixtures) {
    test(fixture.testName, async () => {
      const mock1 = sinon.stub(blockfrostAPI, 'blocksLatest').resolves(fixture.blocksLatest);
      // @ts-ignore
      const result = await getLatestBlock(1);

      expect(result).toBe(JSON.stringify(fixture.result));

      mock1.restore();
    });
  }
});
