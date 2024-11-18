import { BlockfrostServerError } from "@blockfrost/blockfrost-js";

export default [
  {
    testName: 'getAdaHandle success',
    id: 1,
    assets: [{
      address: 'address',
      quantity: '1',
    }],
    result: {
      id: 1,
      type: 'message',
      data: { address: 'address' },
    },
  },
  {
    testName: 'getAdaHandle not found',
    id: 1,
    error: new BlockfrostServerError({
      error: 'error',
      message: 'Not found',
      status_code: 404,
      url: 'url',
    }),
    result: {
      id: 1,
      type: 'message',
      data: null,
    },
  },
  {
    testName: 'getAdaHandle empty result',
    id: 1,
    assets: [],
    result: {
      id: 1,
      type: 'message',
      data: null,
    },
  },
  {
    testName: 'getAdaHandle double minted',
    id: 1,
    assets: [
      {
        address: 'address1',
        quantity: '1',
      },
      {
        address: 'address2',
        quantity: '1',
      }
    ],
    thrown: new Error('Double minted Ada Handle detected'),
  },
];
