import sinon from 'sinon';
import fixtures from '../../fixtures/estimteFee';
import { blockfrostAPI } from '../../../../src/utils/blockfrost-api';
import estimateFee from '../../../../src/methods/estimate-fee';

describe('estimateFee', () => {
  for (const fixture of fixtures) {
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
  }
});
