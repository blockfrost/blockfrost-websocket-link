import { expect } from 'vitest';

export default [
  {
    testName: 'SUBSCRIBE_BLOCK success - preprod',
    result: {
      'subscribed': true,
    },
    subscribe_message_schema: {
      block_vrf: expect.stringMatching(/^vrf_vk[a-zA-Z0-9]+$/),
      confirmations: expect.any(Number),
      epoch: expect.any(Number),
      epoch_slot: expect.any(Number),
      fees: expect.toBeOneOf([expect.any(String), null]),
      hash: expect.stringMatching(/^[a-f0-9]{64}$/),
      height: expect.any(Number),
      next_block: expect.toBeOneOf([expect.stringMatching(/^[a-f0-9]{64}$/), null]),
      op_cert: expect.stringMatching(/^[a-f0-9]{64}$/),
      op_cert_counter: expect.stringMatching(/^\d+$/),
      output:  expect.toBeOneOf([expect.any(String), null]),
      previous_block: expect.stringMatching(/^[a-f0-9]{64}$/),
      size: expect.any(Number),
      slot: expect.any(Number),
      slot_leader: expect.stringMatching(/^pool[a-zA-Z0-9]+$/),
      time: expect.any(Number),
      tx_count: expect.any(Number)
    },
  },
] as const;
