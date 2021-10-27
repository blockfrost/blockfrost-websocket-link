import sinon from 'sinon';
import fixtures from '../../fixtures/getTransaction';
import { blockfrostAPI } from '../../../../src/utils/blockfrostAPI';
import getTransaction from '../../../../src/methods/getTransaction';

describe('getTransaction', () => {
  fixtures.forEach(fixture => {
    test(fixture.testName, async () => {
      const mock1 = sinon.stub(blockfrostAPI, 'txs').resolves(fixture.txs);
      const result = await getTransaction(
        1,
        '28172ea876c3d1e691284e5179fae2feb3e69d7d41e43f8023dc380115741026',
      );
      expect(result).toBe(JSON.stringify(fixture.result));

      mock1.restore();
    });
  });
});
