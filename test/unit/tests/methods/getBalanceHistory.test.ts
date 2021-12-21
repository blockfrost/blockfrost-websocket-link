import * as fixtures from '../../fixtures/getBalanceHistory';
import { aggregateTransactions } from '../../../../src/methods/getBalanceHistory';

describe('getBalanceHistory', () => {
  fixtures.aggregateTransactions.forEach(fixture => {
    test(fixture.description, async () => {
      const result = await aggregateTransactions(
        fixture.transactions,
        // @ts-ignore
        fixture.addresses,
        fixture.groupBy,
      );

      expect(result).toMatchObject(fixture.result);
    });
  });
});
