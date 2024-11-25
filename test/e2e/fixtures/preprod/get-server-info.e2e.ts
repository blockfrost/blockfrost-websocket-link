import { expect } from 'vitest';

export default [
  {
    testName: 'GET_SERVER success - preprod',
    result: {
      name: 'Cardano',
      shortcut: 'tada',
      testnet: true,
      version: expect.any(String),
      decimals: 6,
      blockHeight: expect.any(Number),
      blockHash: expect.stringMatching(/^[a-f0-9]{64}$/),
    },
  },
] as const;
