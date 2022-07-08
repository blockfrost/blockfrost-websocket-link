import nock from 'nock';
import { describe, test, expect } from 'vitest';
import { getAccountInfo } from '../../../../src/methods/get-account-info';
import { loadRecord } from './__mocks__/get-acount-info-txs.nock';

describe('getAccountInfo', () => {
  // basic get account info
  test('getAccountInfo basic', async () => {
    nock('https://cardano-mainnet.blockfrost.io:443')
      .get(
        '/api/v0/assets/2f712364ec46f0cf707d412106ce71ef3370f76e27fb56b6bb14708776657465726e696b4e657a6a6564656e79',
      )
      .reply(200, {
        asset:
          '2f712364ec46f0cf707d412106ce71ef3370f76e27fb56b6bb14708776657465726e696b4e657a6a6564656e79',
        policy_id: '2f712364ec46f0cf707d412106ce71ef3370f76e27fb56b6bb147087',
        asset_name: '76657465726e696b4e657a6a6564656e79',
        fingerprint: 'asset1eevmdlaz5424s3663ypw8w4vyxdlxkm3lefz06',
        quantity: '1',
        initial_mint_tx_hash: '2827c9a81a6e0f735d3c607b87eda6b950741dfdf0c389c9b56edae52f4e4a86',
        mint_or_burn_count: 1,
        onchain_metadata: {
          name: 'Nezjedeny veternik',
          image: 'ipfs://ipfs/QmfKyJ4tuvHowwKQCbCHj4L5T3fSj8cjs7Aau8V7BWv226',
        },
        metadata: {
          decimals: 10, // this is fake
        },
      });

    nock('https://cardano-mainnet.blockfrost.io:443')
      .get(
        '/api/v0/assets/d894897411707efa755a76deb66d26dfd50593f2e70863e1661e98a07370616365636f696e73',
      )
      .reply(200, {
        asset: 'd894897411707efa755a76deb66d26dfd50593f2e70863e1661e98a07370616365636f696e73',
        policy_id: 'd894897411707efa755a76deb66d26dfd50593f2e70863e1661e98a0',
        asset_name: '7370616365636f696e73',
        fingerprint: 'asset1pmmzqf2akudknt05ealtvcvsy7n6wnc9dd03mf',
        quantity: '106631501',
        initial_mint_tx_hash: '3cce12c77b9d11d70575320c4f2834b26debb065308fbe43954018fbeb90010d',
        mint_or_burn_count: 6320,
        onchain_metadata: {
          name: 'spacecoins',
          image: 'ipfs://Qmc44D9d8oaj38TtrXKXPYyWKpyPButDQtA9pVjBtb1qYV',
          files: [
            {
              src: 'ipfs://QmZWaVnF5m5h9cd2KeMoqm4QAdsM5ZmEBrnfaLtckNUMGP',
              name: 'spacecoins whitepaper',
              mediaType: 'application/pdf',
            },
          ],
          website: 'https://spacecoins.io',
          description: 'your did it!',
        },
        // eslint-disable-next-line unicorn/no-null
        metadata: null,
      });

    nock('https://cardano-mainnet.blockfrost.io:443', { encodedQueryParams: true })
      .get(
        '/api/v0/accounts/stake1uxzutrtmxwv2rf2j3hdpps66ch0jydmkr58vwgnetddcdwg32u4rc/addresses/total',
      )
      .reply(
        200,
        [
          '1f8b08000000000000038c8e4b6e83401005efd26b16f3ed06ae12456898e9b1b10d76e6033816778f9448596495e593aa54ef05b9b82b0f2e84c43943ffb365dd3f6b4965deb755a5a82efa1c1e8f8ce8cfe2f20cf335d976dd4e0b97107cd84e5a55933c3490d8f3b47218729da17f7b415da6023ddcee2bdf9c6768e0a3baa54ce5093d48125ddb76cac0d1fca22a92541a0d7b8351f8488282914a0af44c92a3d62422212b8aa3c511c7511a122d11a2258396143276381a464b0e1d5a346891a9fb1387e3bd81cc4bf9e759a3492b23c5b757f6c1dfeb52a0c7e30b0000ffff03001a5cfaf945010000',
        ],
        ['Content-Encoding', 'gzip'],
      );

    nock('https://cardano-mainnet.blockfrost.io:443', { encodedQueryParams: true })
      .get('/api/v0/accounts/stake1uxzutrtmxwv2rf2j3hdpps66ch0jydmkr58vwgnetddcdwg32u4rc')
      .reply(
        200,
        [
          '1f8b08000000000000034c8d4b6e84301044efd26b16c6c6fc2e831c7767f8d8c0b46d0c8972f74813916457af4a55f509219a850683c81402f43f5ca6f323458efecc87e47739ab11f73dd4b51dc57ca15f58b7477eac14112de68792a9620b05181ba783a08f9ce8a681f6cd8ed04b2d0ab0db1a79738e70307e4b6b841e6453cb4e352d14c0940d631842f2d043590ad9c90e0ac8531c914d36eece1a2544ad5f95407cd0ed0b2820329990f8fa67fd0ebc39fa7b568d6ceb0a0ad8b7cd0d1342ff52e59ef4ece6ead9e56e762725d508a36ce7afb36a3cea597b19228bd5a475954fe516bce0eb1b0000ffff0300f2900ea74c010000',
        ],
        ['Content-Encoding', 'gzip'],
      );

    // nock.recorder.rec();

    const result = await getAccountInfo(
      '6d17587575a3b4f0f86ebad3977e8f7e4981faa863eccf5c1467065c74fe3435943769446dd290d103fb3d360128e86de4b47faea73ffb0900c94c6a61ef9ea2',
      'basic',
      1,
      25,
    );
    // nock.restore();

    expect(result).toMatchSnapshot();
  });

  // txs get account info (aka full blown discovery)
  test('getAccountInfo txs', async () => {
    // Uncomment this to re-record requests
    // (don't forget to also uncomment nock.restore() below the method call)
    // after the export wrap the output in `export const loadRecord = () => {...}`
    // nock.recorder.rec({
    //   use_separator: false,
    //   logging: content =>
    //     fs.appendFileSync(path.join(__dirname, `./__mocks__/getAccountInfo.nock.ts`), content),
    // });

    loadRecord();
    const result = await getAccountInfo(
      '6d17587575a3b4f0f86ebad3977e8f7e4981faa863eccf5c1467065c74fe3435943769446dd290d103fb3d360128e86de4b47faea73ffb0900c94c6a61ef9ea2',
      'txs',
      1,
      25,
    );
    // nock.restore();

    expect(result).toMatchSnapshot();
  });
});
