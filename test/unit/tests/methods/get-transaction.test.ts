import sinon from 'sinon';
import { describe, test, expect } from 'vitest';
import fixtures from '../../fixtures/getTransaction.js';
import { blockfrostAPI } from '../../../../src/utils/blockfrost-api.js';
import getTransaction from '../../../../src/methods/get-transaction.js';

describe('getTransaction', () => {
  for (const fixture of fixtures) {
    test(fixture.testName, async () => {
      const mock1 = sinon.stub(blockfrostAPI, 'txs').resolves(fixture.txs);
      const result = await getTransaction(
        1,
        'client-id',
        '28172ea876c3d1e691284e5179fae2feb3e69d7d41e43f8023dc380115741026',
      );

      expect(result).toBe(JSON.stringify(fixture.result));

      mock1.restore();
    });
  }
});
