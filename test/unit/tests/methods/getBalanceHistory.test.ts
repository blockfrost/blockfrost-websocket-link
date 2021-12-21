import * as fixtures from '../../fixtures/getBalanceHistory';
import { aggregateTransactionIntervals } from '../../../../src/methods/getBalanceHistory';

describe('getBalanceHistory', () => {
  fixtures.aggregateTransactionIntervals.forEach(fixture => {
    test(fixture.description, async () => {
      const result = await aggregateTransactionIntervals(
        fixture.transactions,
        // @ts-ignore
        fixture.addresses,
        fixture.groupBy,
      );

      expect(result).toMatchObject(fixture.result);
    });
  });
});
