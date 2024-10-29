import { expect } from 'vitest';

export default [
  {
    testName: 'GET_SERVER success - mainnet',
    result: {
      name: 'Cardano',
      shortcut: 'ada',
      testnet: false,
      version: '2.2.1',
      decimals: 6,
      blockHeight: expect.any(Number),
      blockHash: expect.stringMatching(/^[a-f0-9]{64}$/),
    },
  },
] as const;
