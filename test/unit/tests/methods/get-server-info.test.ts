import sinon from 'sinon';
// import * as os from 'os';
import fixtures from '../../fixtures/getServerInfo';
import { blockfrostAPI } from '../../../../src/utils/blockfrost-api';
import { getServerInfo } from '../../../../src/methods/get-server-info';

describe('getServerInfo', () => {
  //  TODO: hostname mock
  // jest.mock('os', () => ({
  //   __esModule: true,
  //   ...jest.requireActual('os'),
  //   hostname: jest.fn().mockImplementation(() => 'mocked hostname'),
  // }));

  for (const fixture of fixtures) {
    test(fixture.testName, async () => {
      const mock1 = sinon.stub(blockfrostAPI, 'root').resolves(fixture.root);
      const mock2 = sinon.stub(blockfrostAPI, 'blocksLatest').resolves(fixture.blocksLatest);
      const result = await getServerInfo();

      expect(result.hostname).toBeDefined();
      expect(result).toMatchObject(fixture.result);

      mock1.restore();
      mock2.restore();
    });
  }
});
