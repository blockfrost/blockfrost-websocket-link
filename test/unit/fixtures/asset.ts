export const transformAsset = [
  {
    description: 'lovelace transform asset',
    input: {
      unit: 'lovelace',
      quantity: '10',
    },
    result: {
      unit: 'lovelace',
      quantity: '10',
      decimals: 6,
    },
  },
  {
    description: 'non-lovelace transform asset',
    input: {
      unit: '00000002df633853f6a47465c9496721d2d5b1291b8398016c0e87ae6e7574636f696e',
      quantity: '10',
    },
    result: {
      unit: '00000002df633853f6a47465c9496721d2d5b1291b8398016c0e87ae6e7574636f696e',
      quantity: '10',
      fingerprint: 'asset12h3p5l3nd5y26lr22am7y7ga3vxghkhf57zkhd',
      decimals: 0,
    },
  },
];

export const getAssetBalance = [
  {
    description: 'getAssetBalance lovelace',
    asset: 'lovelace',
    received_sum: [
      {
        unit: 'lovelace',
        quantity: '158129176564',
      },
      {
        unit: '2048c7e09308f9138cef8f1a81733b72e601d016eea5eef759ff2933416d617a696e67436f696e',
        quantity: '7',
      },
      {
        unit: '21c3e7f6f954e606fe90017628b048a0067b561a4f6e2aa0e1aa613156616375756d73',
        quantity: '19999020',
      },
    ],
    sent_sum: [
      {
        unit: 'lovelace',
        quantity: '153847996165',
      },
      {
        unit: '2048c7e09308f9138cef8f1a81733b72e601d016eea5eef759ff2933416d617a696e67436f696e',
        quantity: '7',
      },
      {
        unit: '21c3e7f6f954e606fe90017628b048a0067b561a4f6e2aa0e1aa613156616375756d73',
        quantity: '18999084',
      },
    ],
    result: '4281180399',
  },
  {
    description: 'getAssetBalance token',
    asset: '21c3e7f6f954e606fe90017628b048a0067b561a4f6e2aa0e1aa613156616375756d73',
    received_sum: [
      {
        unit: 'lovelace',
        quantity: '158129176564',
      },
      {
        unit: '2048c7e09308f9138cef8f1a81733b72e601d016eea5eef759ff2933416d617a696e67436f696e',
        quantity: '7',
      },
      {
        unit: '21c3e7f6f954e606fe90017628b048a0067b561a4f6e2aa0e1aa613156616375756d73',
        quantity: '19999020',
      },
    ],
    sent_sum: [
      {
        unit: 'lovelace',
        quantity: '153847996165',
      },
      {
        unit: '2048c7e09308f9138cef8f1a81733b72e601d016eea5eef759ff2933416d617a696e67436f696e',
        quantity: '7',
      },
      {
        unit: '21c3e7f6f954e606fe90017628b048a0067b561a4f6e2aa0e1aa613156616375756d73',
        quantity: '18999084',
      },
    ],
    result: '999936',
  },
  {
    description: "getAssetBalance - asset that doesn't exist ",
    asset: '2048c7e09308f9138cef8f1a81733b72e601d016eea5eef759ff2933416d617a696e67436f696e',
    received_sum: [
      {
        unit: 'lovelace',
        quantity: '158129176564',
      },
    ],
    sent_sum: [
      {
        unit: 'lovelace',
        quantity: '153847996165',
      },
    ],
    result: '0',
  },
];

export const sumAssetBalances = [
  {
    description: 'sumAssetBalances lovelace',
    asset: 'lovelace',
    list: [
      {
        amount: [
          {
            unit: 'lovelace',
            quantity: '2000000',
          },
          {
            unit: '2048c7e09308f9138cef8f1a81733b72e601d016eea5eef759ff2933416d617a696e67436f696e',
            quantity: '7',
          },
          {
            unit: '21c3e7f6f954e606fe90017628b048a0067b561a4f6e2aa0e1aa613156616375756d73',
            quantity: '10',
          },
        ],
      },
      {
        amount: [
          {
            unit: 'lovelace',
            quantity: '1000000',
          },
          {
            unit: '2048c7e09308f9138cef8f1a81733b72e601d016eea5eef759ff2933416d617a696e67436f696e',
            quantity: '10',
          },
          {
            unit: '21c3e7f6f954e606fe90017628b048a0067b561a4f6e2aa0e1aa613156616375756d73',
            quantity: '20',
          },
          {
            unit: 'bla',
            quantity: '20',
          },
        ],
      },
    ],

    result: [
      {
        unit: 'lovelace',
        quantity: '3000000',
      },
      {
        unit: '2048c7e09308f9138cef8f1a81733b72e601d016eea5eef759ff2933416d617a696e67436f696e',
        quantity: '17',
      },
      {
        unit: '21c3e7f6f954e606fe90017628b048a0067b561a4f6e2aa0e1aa613156616375756d73',
        quantity: '30',
      },
      {
        unit: 'bla',
        quantity: '20',
      },
    ],
  },
];
