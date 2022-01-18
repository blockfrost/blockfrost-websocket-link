export const deriveAddress = [
  {
    description: 'deriveAddress 0/0 mainnet',
    publicKey:
      'd507c8f866691bd96e131334c355188b1a1d0b2fa0ab11545075aab332d77d9eb19657ad13ee581b56b0f8d744d66ca356b93d42fe176b3de007d53e9c4c4e7a',
    type: 0,
    addressIndex: 0,
    isTestnet: false,
    result: {
      address:
        'addr1qxq0nckg3ekgzuqg7w5p9mvgnd9ym28qh5grlph8xd2z92sj922xhxkn6twlq2wn4q50q352annk3903tj00h45mgfmsl3s9zt',
      path: `m/1852'/1815'/i'/0/0`,
    },
  },
  {
    description: 'deriveAddress 2/0 mainnet',
    publicKey:
      'd507c8f866691bd96e131334c355188b1a1d0b2fa0ab11545075aab332d77d9eb19657ad13ee581b56b0f8d744d66ca356b93d42fe176b3de007d53e9c4c4e7a',
    type: 2,
    addressIndex: 0,
    isTestnet: false,
    result: {
      address: 'stake1uyfz49rtntfa9h0s98f6s28sg69weemgjhc4e8hm66d5yacalmqha',
      path: `m/1852'/1815'/i'/2/0`,
    },
  },
  {
    description: 'deriveAddress 0/0 testnet',
    publicKey:
      'd507c8f866691bd96e131334c355188b1a1d0b2fa0ab11545075aab332d77d9eb19657ad13ee581b56b0f8d744d66ca356b93d42fe176b3de007d53e9c4c4e7a',
    type: 0,
    addressIndex: 0,
    isTestnet: true,
    result: {
      address:
        'addr_test1qzq0nckg3ekgzuqg7w5p9mvgnd9ym28qh5grlph8xd2z92sj922xhxkn6twlq2wn4q50q352annk3903tj00h45mgfmsu8d9w5',
      path: `m/1852'/1815'/i'/0/0`,
    },
  },
  {
    description: 'deriveAddress 2/0 testnet',
    publicKey:
      'd507c8f866691bd96e131334c355188b1a1d0b2fa0ab11545075aab332d77d9eb19657ad13ee581b56b0f8d744d66ca356b93d42fe176b3de007d53e9c4c4e7a',
    type: 2,
    addressIndex: 0,
    isTestnet: true,
    result: {
      address: 'stake_test1uqfz49rtntfa9h0s98f6s28sg69weemgjhc4e8hm66d5yac643znq',
      path: `m/1852'/1815'/i'/2/0`,
    },
  },
];

export const transformUtxo = [
  {
    description: 'transformUtxo',
    utxo: {
      tx_hash: '2b5075d8a7b7a30c886204000d1c0da2ca6ad3b9e31bd7d3606be0d42dc03adc',
      tx_index: 0,
      output_index: 0,
      amount: [
        {
          unit: 'lovelace',
          quantity: '1000000000',
        },
        {
          unit: '00000002df633853f6a47465c9496721d2d5b1291b8398016c0e87ae6e7574636f696e',
          quantity: '2',
        },
      ],
      block: '2e83c622461fe5a2ef075091ade3d9deb7428d20616772adaf50b482bb1899cf',
      data_hash: null,
    },
    result: {
      tx_hash: '2b5075d8a7b7a30c886204000d1c0da2ca6ad3b9e31bd7d3606be0d42dc03adc',
      tx_index: 0,
      output_index: 0,
      amount: [
        {
          unit: 'lovelace',
          quantity: '1000000000',
          decimals: 6,
        },
        {
          unit: '00000002df633853f6a47465c9496721d2d5b1291b8398016c0e87ae6e7574636f696e',
          quantity: '2',
          fingerprint: 'asset12h3p5l3nd5y26lr22am7y7ga3vxghkhf57zkhd',
          decimals: 0,
        },
      ],
      block: '2e83c622461fe5a2ef075091ade3d9deb7428d20616772adaf50b482bb1899cf',
      data_hash: null,
    },
  },
];

export const bech32PoolToHex = [
  {
    description: 'stkaenuts',
    poolId: 'pool1y6chk7x7fup4ms9leesdr57r4qy9cwxuee0msan72x976a6u0nc',
    result: '26b17b78de4f035dc0bfce60d1d3c3a8085c38dcce5fb8767e518bed',
  },
];
