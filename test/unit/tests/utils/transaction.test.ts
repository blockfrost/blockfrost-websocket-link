import * as transactionUtils from '../../../../src/utils/transaction';
import * as fixtures from '../../fixtures/transaction';

describe('transaction utils', () => {
  fixtures.transformTransaction.forEach(fixture => {
    test(fixture.description, () => {
      expect(transactionUtils.transformTransaction(fixture.tx)).toStrictEqual(fixture.result);
    });
  });

  fixtures.transformTransactionUtxo.forEach(fixture => {
    test(fixture.description, () => {
      expect(transactionUtils.transformTransactionUtxo(fixture.utxo)).toStrictEqual(fixture.result);
    });
  });

  fixtures.sortTransactionsCmp.forEach(fixture => {
    test(fixture.description, () => {
      expect(transactionUtils.sortTransactionsCmp(fixture.tx1, fixture.tx2)).toStrictEqual(
        fixture.result,
      );
    });
  });
});
