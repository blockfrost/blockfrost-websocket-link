export default [
  {
    testName: 'getServerInfo success - mainnet',
    id: 1,
    root: {
      url: 'https://blockfrost.io/',
      version: '0.12.2',
    },
    blocksLatest: {
      time: 1_635_333_623,
      height: 6_424_205,
      hash: '81c7a29d53d926c2dc6ec7c1fafb7ad603786d114f868e593376a25dbb589438',
      slot: 43_767_332,
      epoch: 298,
      epoch_slot: 394_532,
      slot_leader: 'pool18v9r8afalh50l4lstct2awdc3zspnvurcs7t45nv29uc2mnxc6c',
      size: 3867,
      tx_count: 8,
      output: '817327168389',
      fees: '1435082',
      block_vrf: 'vrf_vk12dl25929z0snzdwqdy8400aykx64257ted8gfvpxywmwmf4adx7sh29hd2',
      previous_block: 'dabe0ec6cf11034b2024a4e5bb24c4037274027c91c37978e8ffd6848de7939d',
      next_block: null,
      confirmations: 0,
      op_cert: null,
      op_cert_counter: null,
    },
    result: {
      // hostname: 'mocked hostname',
      name: 'Cardano',
      shortcut: 'ada',
      testnet: false,
      version: '0.12.2',
      decimals: 6,
      blockHeight: 6_424_205,
      blockHash: '81c7a29d53d926c2dc6ec7c1fafb7ad603786d114f868e593376a25dbb589438',
    },
  },
] as const;
