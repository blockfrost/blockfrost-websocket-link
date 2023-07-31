import { describe, test, expect } from 'vitest';
import sinon from 'sinon';
import fixtures from '../../fixtures/estimteFee.js';
import { blockfrostAPI } from '../../../../src/utils/blockfrost-api.js';
import estimateFee from '../../../../src/methods/estimate-fee.js';

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
