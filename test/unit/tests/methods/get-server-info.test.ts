import sinon from 'sinon';
import fixtures from '../../fixtures/getServerInfo';
import { blockfrostAPI } from '../../../../src/utils/blockfrost-api';
import getServerInfo from '../../../../src/methods/get-server-info';

describe('getServerInfo', () => {
  for (const fixture of fixtures) {
    test(fixture.testName, async () => {
      const mock1 = sinon.stub(blockfrostAPI, 'root').resolves(fixture.root);
      const mock2 = sinon.stub(blockfrostAPI, 'blocksLatest').resolves(fixture.blocksLatest);
      const result = await getServerInfo(1);

      expect(result).toBe(JSON.stringify(fixture.result));

      mock1.restore();
      mock2.restore();
    });
  }
});
