import sinon from 'sinon';
import fixtures from '../../fixtures/estimteFee';
import { blockfrostAPI } from '../../../../src/utils/blockfrostAPI';
import estimateFee from '../../../../src/methods/estimateFee';

describe('estimateFee', () => {
  fixtures.forEach(fixture => {
    test(fixture.testName, async () => {
      const mock1 = sinon.stub(blockfrostAPI, 'epochsLatest').resolves(fixture.epochLatest);
      const mock2 = sinon
        .stub(blockfrostAPI, 'epochsParameters')
        .resolves(fixture.epochsParameters);

      const result = await estimateFee(1);
      expect(result).toBe(JSON.stringify(fixture.result));

      mock1.restore();
      mock2.restore();
    });
  });
});
