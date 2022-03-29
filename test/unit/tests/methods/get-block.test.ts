import sinon from 'sinon';
import fixtures from '../../fixtures/getBlock';
import { blockfrostAPI } from '../../../../src/utils/blockfrost-api';
import getBlock from '../../../../src/methods/get-block';

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
