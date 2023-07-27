import sinon from 'sinon';
import { describe, test, expect } from 'vitest';
import fixtures from '../../fixtures/getBlock.js';
import { blockfrostAPI } from '../../../../src/utils/blockfrost-api.js';
import getBlock from '../../../../src/methods/get-block.js';

describe('getBlock', () => {
  for (const fixture of fixtures) {
    test(fixture.testName, async () => {
      const mock1 = sinon.stub(blockfrostAPI, 'blocks').resolves(fixture.blocks);
      const result = await getBlock(1, 'jesus');

      expect(result).toBe(JSON.stringify(fixture.result));

      mock1.restore();
    });
  }
});
