import sinon from 'sinon';
import fixtures from '../../fixtures/getBlock';
import { blockfrostAPI } from '../../../../src/utils/blockfrostAPI';
import getBlock from '../../../../src/methods/getBlock';

describe('getBlock', () => {
  fixtures.forEach(fixture => {
    test(fixture.testName, async () => {
      const mock1 = sinon.stub(blockfrostAPI, 'blocks').resolves(fixture.blocks);
      const result = await getBlock(1, 'jesus');
      expect(result).toBe(JSON.stringify(fixture.result));

      mock1.restore();
    });
  });
});
