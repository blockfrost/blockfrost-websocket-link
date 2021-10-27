import sinon from 'sinon';
import fixtures from '../../fixtures/getLatestBlock';
import { blockfrostAPI } from '../../../../src/utils/blockfrostAPI';
import getLatestBlock from '../../../../src/methods/getLatestBlock';

describe('getLatestBlock', () => {
  fixtures.forEach(fixture => {
    test(fixture.testName, async () => {
      const mock1 = sinon.stub(blockfrostAPI, 'blocksLatest').resolves(fixture.blocksLatest);
      const result = await getLatestBlock(1);
      expect(result).toBe(JSON.stringify(fixture.result));

      mock1.restore();
    });
  });
});
