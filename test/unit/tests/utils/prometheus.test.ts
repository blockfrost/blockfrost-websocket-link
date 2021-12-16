import { jsonToPrometheus } from '../../../../src/utils/prometheus';

describe('prometheus utils', () => {
  test('jsonToPrometheus', () => {
    expect(jsonToPrometheus({ test1: 1, test2: '2' })).toBe('test1 1\ntest2 2\n');
  });
});
