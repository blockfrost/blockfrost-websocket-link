import * as transactionUtils from '../../../../src/utils/transaction.js';
import * as fixtures from '../../fixtures/transaction.js';
import { pLimiter } from '../../../../src/utils/limiter.js';

import nock from 'nock';
import { describe, test, expect, afterEach } from 'vitest';

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
          name: null,
          ticker: null,
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
          name: null,
          ticker: null,
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

  test(
    'no deadlock in fetchTransactionData',
    { timeout: 30000 },
    async () => {
      // Mock /txs/:txHash responses
      nock(/.+blockfrost.io/)
        .persist()
        .get(/api\/v0\/txs\/.*/)
        .delay(1000)
        .reply(200, (uri, _body, cb) => {
          const hash = uri.match(/api\/v0\/txs\/(.*)/); // capture the hash from the URL

          cb(null, {
            hash: hash?.[1] ?? 'unknown',
            block: 'b84222884eff701b48400d5ad46d24670efacf61177af3f99b1def8403a3201c',
            block_height: 11122549,
            block_time: 1732201436,
            slot: 140635145,
            index: 0,
            output_amount: [
              {
                unit: 'lovelace',
                quantity: '264652877058',
              },
              {
                unit: '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c64d494e',
                quantity: '1447797',
              },
              {
                unit: '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c64d494e',
                quantity: '248301178248',
              },
              {
                unit: 'f7516c9f7b347eb412a777f3c711099b199ccd2be23b568a4a3abf6d535058',
                quantity: '186873942',
              },
              {
                unit: 'f7516c9f7b347eb412a777f3c711099b199ccd2be23b568a4a3abf6d535058',
                quantity: '92883278507785',
              },
            ],
            fees: '196081',
            deposit: '0',
            size: 920,
            invalid_before: null,
            invalid_hereafter: '140645940',
            utxo_count: 6,
            withdrawal_count: 0,
            mir_cert_count: 0,
            delegation_count: 0,
            stake_cert_count: 0,
            pool_update_count: 0,
            pool_retire_count: 0,
            asset_mint_or_burn_count: 3,
            redeemer_count: 0,
            valid_contract: true,
          });
        });

      // Mock /assets/:asset responses
      nock(/.+blockfrost.io/)
        .persist()
        .get(/api\/v0\/assets\/.*/)
        .delay(2000)
        .reply(200, (uri, _body, cb) => {
          const hash = uri.match(/api\/v0\/assets\/(.*)/); // capture the hash from the URL

          cb(null, {
            asset: hash?.[1],
            policy_id: '5c2433514783ee382f28d03665fb612bea4964f5cf8a1e653284d353',
            asset_name: '4e61697261',
            name: null,
            ticker: null,
            fingerprint: 'asset17hm68cv0achk4wwmsvcenudnf4j2urqrceh0ta',
            quantity: '9223372036854775807',
            initial_mint_tx_hash:
              '2f4c5ca55fbe74f9a3216db2abb228a61db8ebf27b95f12fefdbcca5788494ff',
            mint_or_burn_count: 1,
            onchain_metadata: {
              name: 'FAKENUTS',
            },
            metadata: {
              decimals: 10,
            },
          });
        });

      // Mock txs/:id/cbor responses
      nock(/.+blockfrost.io/)
        .persist()
        .get(/api\/v0\/txs\/.*\/cbor/)
        .delay(1000)
        .reply(200, (_uri, _body, cb) => {
          cb(null, { cbor: '0123456789abcdef0123456789abcdef0123456789abcdef' });
        });

      let promises = [];

      // run thousands of fetchTransactionData
      // (promise limiter concurrency set to 500 by default)
      for (let i = 0; i < 5000; i++) {
        promises.push(
          transactionUtils.fetchTransactionData(`txHash-${i}`, true).then(data => {
            // console.log(`Fetched txHash-${i}`);
            return data;
          }),
        );
      }

      // Uncomment for debug prints
      // const printQueueData = () => {
      //   console.log('pLimiter.pending', pLimiter.pending);
      //   console.log('pLimiter.size', pLimiter.size);
      //   setTimeout(() => {
      //     printQueueData();
      //   }, 5000);
      // };
      // printQueueData();

      const txs = await Promise.all(promises);

      // Make sure all promises were resolved and the correct data fetched
      expect(pLimiter.size).toBe(0);
      expect(pLimiter.pending).toBe(0);
      for (let i = 0; i < txs.length; i++) {
        expect(txs[i].hash).toBe(`txHash-${i}`);
      }
    },
  );

  test(
    'no deadlock in fetchTxWithUtxo',
    async () => {
      // Mock /txs/:txHash responses
      nock(/.+blockfrost.io/)
        .persist()
        .get(/api\/v0\/txs\/[^\/]*$/)
        .delay(1000)
        .reply(200, (uri, _body, cb) => {
          const hash = uri.match(/api\/v0\/txs\/(.*)/); // capture the hash from the URL

          cb(null, {
            hash: hash?.[1] ?? 'unknown',
            block: 'b84222884eff701b48400d5ad46d24670efacf61177af3f99b1def8403a3201c',
            block_height: 11122549,
            block_time: 1732201436,
            slot: 140635145,
            index: 0,
            output_amount: [
              {
                unit: 'lovelace',
                quantity: '264652877058',
              },
              {
                unit: '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c64d494e',
                quantity: '1447797',
              },
              {
                unit: '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c64d494e',
                quantity: '248301178248',
              },
              {
                unit: 'f7516c9f7b347eb412a777f3c711099b199ccd2be23b568a4a3abf6d535058',
                quantity: '186873942',
              },
              {
                unit: 'f7516c9f7b347eb412a777f3c711099b199ccd2be23b568a4a3abf6d535058',
                quantity: '92883278507785',
              },
            ],
            fees: '196081',
            deposit: '0',
            size: 920,
            invalid_before: null,
            invalid_hereafter: '140645940',
            utxo_count: 6,
            withdrawal_count: 0,
            mir_cert_count: 0,
            delegation_count: 0,
            stake_cert_count: 0,
            pool_update_count: 0,
            pool_retire_count: 0,
            asset_mint_or_burn_count: 3,
            redeemer_count: 0,
            valid_contract: true,
          });
        });
      // Mock /txs/:txHash/utxos responses
      nock(/.+blockfrost.io/)
        .persist()
        .get(/api\/v0\/txs\/.*\/utxos/)
        .delay(1000)
        .reply(200, (uri, _body, cb) => {
          const hash = uri.match(/api\/v0\/txs\/(.*)\/utxos/); // capture the hash from the URL

          cb(null, {
            hash: hash?.[1],
            inputs: [
              {
                address:
                  'addr1qyemgavut6gd3jggadtm8fmsldg0k8r77da8fx888cw5p02j2c79gy9l76sdg0xwhd7r0c0kna0tycz4y5s6mlenh8pq3w79fv',
                amount: [
                  {
                    unit: 'lovelace',
                    quantity: '1954210',
                  },
                  {
                    unit: '013e391835a882459afdf21352606003e241e5916e262fd8b01228f27374414441',
                    quantity: '1672774',
                  },
                  {
                    unit: '013e391835a882459afdf21352606003e241e5916e262fd8b01228f273744d494e',
                    quantity: '1447797',
                  },
                  {
                    unit: '013e391835a882459afdf21352606003e241e5916e262fd8b01228f27374535058',
                    quantity: '186873942',
                  },
                ],
                tx_hash: 'd3510da69bb7f0d622283e11c5d48157fe31dd963a40ac419133d7818afcbd18',
                output_index: 0,
                data_hash: null,
                inline_datum: null,
                reference_script_hash: null,
                collateral: false,
                reference: false,
              },
              {
                address:
                  'addr1qyemgavut6gd3jggadtm8fmsldg0k8r77da8fx888cw5p02j2c79gy9l76sdg0xwhd7r0c0kna0tycz4y5s6mlenh8pq3w79fv',
                amount: [
                  {
                    unit: 'lovelace',
                    quantity: '264649081083',
                  },
                ],
                tx_hash: 'e1a3800765e75103af09236da1ae9bcad7fd271890e7a9c4f566659d5eeef318',
                output_index: 1,
                data_hash: null,
                inline_datum: null,
                reference_script_hash: null,
                collateral: false,
                reference: false,
              },
              {
                address:
                  'addr1qyemgavut6gd3jggadtm8fmsldg0k8r77da8fx888cw5p02j2c79gy9l76sdg0xwhd7r0c0kna0tycz4y5s6mlenh8pq3w79fv',
                amount: [
                  {
                    unit: 'lovelace',
                    quantity: '2037846',
                  },
                  {
                    unit: '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c64d494e',
                    quantity: '248302626045',
                  },
                  {
                    unit: 'f7516c9f7b347eb412a777f3c711099b199ccd2be23b568a4a3abf6d535058',
                    quantity: '92883465381727',
                  },
                ],
                tx_hash: 'e1a3800765e75103af09236da1ae9bcad7fd271890e7a9c4f566659d5eeef318',
                output_index: 2,
                data_hash: null,
                inline_datum: null,
                reference_script_hash: null,
                collateral: false,
                reference: false,
              },
            ],
            outputs: [
              {
                address:
                  'addr1q9za8dvwz7ezlw26qxnmv87z49envv0sjepl8gp362s63qwnulnh8mkys3307j80ykyzkn5ltsl5kdk479679q3gwfrsl2xvd6',
                amount: [
                  {
                    unit: 'lovelace',
                    quantity: '2995944',
                  },
                  {
                    unit: '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c64d494e',
                    quantity: '1447797',
                  },
                  {
                    unit: 'f7516c9f7b347eb412a777f3c711099b199ccd2be23b568a4a3abf6d535058',
                    quantity: '186873942',
                  },
                ],
                output_index: 0,
                data_hash: null,
                inline_datum: null,
                collateral: false,
                reference_script_hash: null,
                consumed_by_tx: '160f64023fa86fb2f1cb6154d705cebb3757e1374e69a4568d14c11a38a1b742',
              },
              {
                address:
                  'addr1qyemgavut6gd3jggadtm8fmsldg0k8r77da8fx888cw5p02j2c79gy9l76sdg0xwhd7r0c0kna0tycz4y5s6mlenh8pq3w79fv',
                amount: [
                  {
                    unit: 'lovelace',
                    quantity: '264647843268',
                  },
                ],
                output_index: 1,
                data_hash: null,
                inline_datum: null,
                collateral: false,
                reference_script_hash: null,
                consumed_by_tx: 'd34fbeea59443314347c0e22dcdc3bdcea660ab4214b05e2bfbec41744e9b181',
              },
              {
                address:
                  'addr1qyemgavut6gd3jggadtm8fmsldg0k8r77da8fx888cw5p02j2c79gy9l76sdg0xwhd7r0c0kna0tycz4y5s6mlenh8pq3w79fv',
                amount: [
                  {
                    unit: 'lovelace',
                    quantity: '2037846',
                  },
                  {
                    unit: '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c64d494e',
                    quantity: '248301178248',
                  },
                  {
                    unit: 'f7516c9f7b347eb412a777f3c711099b199ccd2be23b568a4a3abf6d535058',
                    quantity: '92883278507785',
                  },
                ],
                output_index: 2,
                data_hash: null,
                inline_datum: null,
                collateral: false,
                reference_script_hash: null,
                consumed_by_tx: 'd34fbeea59443314347c0e22dcdc3bdcea660ab4214b05e2bfbec41744e9b181',
              },
            ],
          });
        });

      // Mock /assets/:asset responses
      nock(/.+blockfrost.io/)
        .persist()
        .get(/api\/v0\/assets\/.*/)
        .delay(2000)
        .reply(200, (uri, _body, cb) => {
          const hash = uri.match(/api\/v0\/assets\/(.*)/); // capture the hash from the URL

          cb(null, {
            asset: hash?.[1],
            policy_id: '5c2433514783ee382f28d03665fb612bea4964f5cf8a1e653284d353',
            asset_name: '4e61697261',
            name: null,
            ticker: null,
            fingerprint: 'asset17hm68cv0achk4wwmsvcenudnf4j2urqrceh0ta',
            quantity: '9223372036854775807',
            initial_mint_tx_hash:
              '2f4c5ca55fbe74f9a3216db2abb228a61db8ebf27b95f12fefdbcca5788494ff',
            mint_or_burn_count: 1,
            onchain_metadata: {
              name: 'FAKENUTS',
            },
            metadata: {
              decimals: 10,
            },
          });
        });

      // Uncomment for debug prints
      const printQueueData = () => {
        console.log('pLimiter.pending', pLimiter.pending);
        console.log('pLimiter.size', pLimiter.size);
        setTimeout(() => {
          printQueueData();
        }, 3000);
      };
      printQueueData();

      // This runs thousands of fetchTransactionData
      // (promise limiter concurrency set to 500 by default)
      const txs = await transactionUtils.txIdsToTransactions([
        {
          address: 'addr',
          // adding more txs than the maximum number of concurrent request for the limiter causes deadlock
          txIds: Array.from({ length: 2000 }, (_, i) => `txHash-${i}`),
        },
      ]);

      // Make sure all promises were resolved and the correct data fetched
      expect(pLimiter.size).toBe(0);
      expect(pLimiter.pending).toBe(0);
      for (let i = 0; i < txs.length; i++) {
        expect(txs[i].txHash).toBe(`txHash-${i}`);
      }
    },
    { timeout: 120000 },
  );
});
