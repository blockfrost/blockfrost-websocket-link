import { expect } from 'vitest';

export default [
  {
    testName: 'GET_BLOCK success - preprod',
    result: {
      "block_vrf": "vrf_vk1suxu5crrj7u96tjwu8jxhkum0p9qj2s7cfwts9rv7szxg4hlscwqg9ljpt",
      "confirmations": expect.any(Number),
      "epoch": 176,
      "epoch_slot": 307781,
      "fees": "4449834",
      "hash": "8b41ba36539ce5f72ec5e6792dfa125ba60126443c7d2d6452f71e5f7d410cfc",
      "height": 2839412,
      "next_block": "83139f88a06c4ff66c395b3603f98c69f2f3732189cc5e187d6ce19bb778eb0d",
      "op_cert": "a3727c534ed0bef79c124d6754c528f162e012c37069b7f6b4473e2d1262daed",
      "op_cert_counter": "12",
      "output": "48648336745",
      "previous_block": "e72a3d503fbe6a7abaf68ab1093a03a244912fd6fa921f4e62f0661f7f239256",
      "size": 29246,
      "slot": 74698181,
      "slot_leader": "pool1upqfyzqpk6wkpsvw90qqrpr9tjyemh484wk4em69anwpu586ehq",
      "time": 1730381381,
      "tx_count": 9
    },
  },
] as const;
