export default [
  {
    testName: 'GET_ACCOUNT_INFO success - preprod',
    descriptor: '6d17587575a3b4f0f86ebad3977e8f7e4981faa863eccf5c1467065c74fe3435943769446dd290d103fb3d360128e86de4b47faea73ffb0900c94c6a61ef9ea2',
    details: 'basic',
    page: 1,
    pageSize: 25,
    result: {
      "descriptor": "6d17587575a3b4f0f86ebad3977e8f7e4981faa863eccf5c1467065c74fe3435943769446dd290d103fb3d360128e86de4b47faea73ffb0900c94c6a61ef9ea2",
      "empty": true,
      "balance": "0",
      "availableBalance": "0",
      "tokens": [],
      "history": {
        "total": 0,
        "unconfirmed": 0
      },
      "page": {
        "index": 1,
        "size": 25,
        "total": 0
      },
      "misc": {
        "staking": {
          "address": "stake_test1uzzutrtmxwv2rf2j3hdpps66ch0jydmkr58vwgnetddcdwgkqkh89",
          "rewards": "0",
          "isActive": false,
          "poolId": null
        }
      }
    },
  },
] as const;
