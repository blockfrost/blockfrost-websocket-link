import { expect } from 'vitest';

export default [
  {
    handle: 'test',
    testName: 'GET_ADA_HANDLE success - preprod',
    result: { address: expect.any(String) },
  },
  {
    handle: 'does_not_exist',
    testName: 'GET_ADA_HANDLE not existing - preprod',
    result: null,
  },
] as const;
