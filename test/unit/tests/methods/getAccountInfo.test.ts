import getAccountInfo from '../../../../src/methods/getAccountInfo';

describe('getAccountInfo', () => {
  test('getAccountInfo - basic', async () => {
    const res = await getAccountInfo(
      1,
      '6d17587575a3b4f0f86ebad3977e8f7e4981faa863eccf5c1467065c74fe3435943769446dd290d103fb3d360128e86de4b47faea73ffb0900c94c6a61ef9ea2',
      'basic',
    );

    expect(res).toBe(
      JSON.stringify({
        id: 1,
        type: 'message',
        data: {
          descriptor:
            '6d17587575a3b4f0f86ebad3977e8f7e4981faa863eccf5c1467065c74fe3435943769446dd290d103fb3d360128e86de4b47faea73ffb0900c94c6a61ef9ea2',
          empty: false,
          balance: '27429803',
          availableBalance: '27256514',
          history: {
            total: 6,
            unconfirmed: 0,
          },
          page: {
            index: 1,
            size: 25,
            total: 1,
          },
          misc: {
            staking: {
              address: 'stake1uxzutrtmxwv2rf2j3hdpps66ch0jydmkr58vwgnetddcdwg32u4rc',
              rewards: '173289',
              isActive: true,
              poolId: 'pool1pu5jlj4q9w9jlxeu370a3c9myx47md5j5m2str0naunn2q3lkdy',
            },
          },
        },
      }),
    );
  });

  test('getAccountInfo - tokens', async () => {
    const res = await getAccountInfo(
      1,
      '6d17587575a3b4f0f86ebad3977e8f7e4981faa863eccf5c1467065c74fe3435943769446dd290d103fb3d360128e86de4b47faea73ffb0900c94c6a61ef9ea2',
      'tokens',
    );

    expect(res).toBe(
      JSON.stringify({
        id: 1,
        type: 'message',
        data: {
          descriptor:
            '6d17587575a3b4f0f86ebad3977e8f7e4981faa863eccf5c1467065c74fe3435943769446dd290d103fb3d360128e86de4b47faea73ffb0900c94c6a61ef9ea2',
          empty: false,
          balance: '27429803',
          availableBalance: '27256514',
          history: {
            total: 6,
            unconfirmed: 0,
          },
          page: {
            index: 1,
            size: 25,
            total: 1,
          },
          misc: {
            staking: {
              address: 'stake1uxzutrtmxwv2rf2j3hdpps66ch0jydmkr58vwgnetddcdwg32u4rc',
              rewards: '173289',
              isActive: true,
              poolId: 'pool1pu5jlj4q9w9jlxeu370a3c9myx47md5j5m2str0naunn2q3lkdy',
            },
          },
          tokens: [
            {
              unit: '2f712364ec46f0cf707d412106ce71ef3370f76e27fb56b6bb14708776657465726e696b4e657a6a6564656e79',
              quantity: '1',
              decimals: 0,
            },
          ],
        },
      }),
    );
  });
});
