import sinon from 'sinon';
import fixtures from '../../fixtures/getServerInfo';
import { blockfrostAPI } from '../../../../src/utils/blockfrostAPI';
import getServerInfo from '../../../../src/methods/getServerInfo';

describe('getServerInfo', () => {
  fixtures.forEach(fixture => {
    test(fixture.testName, async () => {
      const mock1 = sinon.stub(blockfrostAPI, 'root').resolves(fixture.root);
      const mock2 = sinon.stub(blockfrostAPI, 'blocksLatest').resolves(fixture.blocksLatest);

      const result = await getServerInfo(1);
      expect(result).toBe(JSON.stringify(fixture.result));

      mock1.restore();
      mock2.restore();
    });
  });
});
