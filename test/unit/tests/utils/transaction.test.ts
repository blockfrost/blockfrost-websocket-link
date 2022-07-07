import * as transactionUtils from '../../../../src/utils/transaction';
import * as fixtures from '../../fixtures/transaction';
import nock from 'nock';

describe('transaction utils', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  for (const fixture of fixtures.transformTransactionData) {
    test(fixture.description, async () => {
      nock(/.+blockfrost.io/)
        .persist()
        .get(/api\/v0\/assets\/.*/)
        .reply(200, {
          asset: '5c2433514783ee382f28d03665fb612bea4964f5cf8a1e653284d3534e61697261',
          policy_id: '5c2433514783ee382f28d03665fb612bea4964f5cf8a1e653284d353',
          asset_name: '4e61697261',
          fingerprint: 'asset17hm68cv0achk4wwmsvcenudnf4j2urqrceh0ta',
          quantity: '9223372036854775807',
          initial_mint_tx_hash: '2f4c5ca55fbe74f9a3216db2abb228a61db8ebf27b95f12fefdbcca5788494ff',
          mint_or_burn_count: 1,
          onchain_metadata: {
            name: 'FAKENUTS',
          },
          metadata: {
            decimals: 10,
          },
        });
      const res = await transactionUtils.transformTransactionData(fixture.tx);

      expect(res).toStrictEqual(fixture.result);
    });
  }

  for (const fixture of fixtures.transformTransactionUtxo) {
    test(fixture.description, async () => {
      nock(/.+blockfrost.io/)
        .persist()
        .get(/api\/v0\/assets\/.*/)
        .reply(200, {
          asset: '5c2433514783ee382f28d03665fb612bea4964f5cf8a1e653284d3534e61697261',
          policy_id: '5c2433514783ee382f28d03665fb612bea4964f5cf8a1e653284d353',
          asset_name: '4e61697261',
          fingerprint: 'asset17hm68cv0achk4wwmsvcenudnf4j2urqrceh0ta',
          quantity: '9223372036854775807',
          initial_mint_tx_hash: '2f4c5ca55fbe74f9a3216db2abb228a61db8ebf27b95f12fefdbcca5788494ff',
          mint_or_burn_count: 1,
          onchain_metadata: {
            name: 'FAKENUTS',
          },
          metadata: {
            decimals: 10,
          },
        });
      // nock.recorder.rec();
      const result = await transactionUtils.transformTransactionUtxo(fixture.utxo);
      // nock.restore();

      expect(result).toStrictEqual(fixture.result);
    });
  }

  for (const fixture of fixtures.sortTransactionsCmp) {
    test(fixture.description, () => {
      expect(transactionUtils.sortTransactionsCmp(fixture.tx1, fixture.tx2)).toStrictEqual(
        fixture.result,
      );
    });
  }
});
