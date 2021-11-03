export const emitBlock = [
  {
    description: 'one block',
    blocks: [
      {
        time: 1506203091,
        height: 1,
        hash: 'a',
      },
    ],
  },
];

export const emitMissedBlock = [
  {
    description: 'missed 2 blocks',
    latestBlocks: [
      {
        time: 1506203091,
        height: 1,
        hash: 'a',
      },
      {
        time: 1506203091,
        height: 4,
        hash: 'd',
      },
    ],
    missedBlocks: [
      {
        time: 1506203091,
        height: 2,
        hash: 'b',
      },
      {
        time: 1506203091,
        height: 3,
        hash: 'c',
      },
    ],
  },
]
