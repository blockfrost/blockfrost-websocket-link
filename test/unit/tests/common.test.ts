import * as utils from '../../../src/utils/common.js';
import { describe, test, expect } from 'vitest';

describe('common utils', () => {
  test('pagination', () => {
    const input1 = [
      { item: 1 },
      { item: 2 },
      { item: 3 },
      { item: 4 },
      { item: 5 },
      { item: 6 },
      { item: 7 },
      { item: 8 },
      { item: 9 },
      { item: 10 },
    ];

    expect(utils.paginate(input1, 3)).toEqual([
      [{ item: 1 }, { item: 2 }, { item: 3 }],
      [{ item: 4 }, { item: 5 }, { item: 6 }],
      [{ item: 7 }, { item: 8 }, { item: 9 }],
      [{ item: 10 }],
    ]);

    const input2 = [
      { item: 1 },
      { item: 2 },
      { item: 3 },
      { item: 4 },
      { item: 5 },
      { item: 6 },
      { item: 7 },
      { item: 8 },
      { item: 9 },
      { item: 10 },
    ];

    expect(utils.paginate(input2, 5)).toEqual([
      [{ item: 1 }, { item: 2 }, { item: 3 }, { item: 4 }, { item: 5 }],
      [{ item: 6 }, { item: 7 }, { item: 8 }, { item: 9 }, { item: 10 }],
    ]);
  });
});
