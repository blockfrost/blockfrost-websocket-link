import * as utils from '../../src/utils';

describe('utils', () => {
  test('get params', () => {
    expect(utils.getParams(JSON.stringify({ item: 'item value' }))).toEqual({ item: 'item value' });
    expect(utils.getParams(JSON.stringify({ item: 'item value', item2: 'item2 value' }))).toEqual({
      item: 'item value',
      item2: 'item2 value',
    });
  });
});
