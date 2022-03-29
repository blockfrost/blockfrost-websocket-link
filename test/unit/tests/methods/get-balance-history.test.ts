import * as fixtures from '../../fixtures/getBalanceHistory';
import { aggregateTransactions } from '../../../../src/methods/get-balance-history';

describe('getBalanceHistory', () => {
  for (const fixture of fixtures.aggregateTransactions) {
    test(fixture.description, async () => {
      const result = await aggregateTransactions(
        fixture.transactions,
        // @ts-ignore
        fixture.addresses,
        fixture.groupBy,
      );

      expect(result).toMatchObject(fixture.result);
    });
  }
});
