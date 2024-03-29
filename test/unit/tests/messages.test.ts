import { describe, test, expect } from 'vitest';
import * as utils from '../../../src/utils/message.js';

describe('messages utils', () => {
  test('get params', () => {
    expect(utils.getMessage(JSON.stringify({ item: 'item value' }))).toEqual({
      item: 'item value',
    });

    expect(utils.getMessage(JSON.stringify({ item: 'item value', item2: 'item2 value' }))).toEqual({
      item: 'item value',
      item2: 'item2 value',
    });
  });
});
