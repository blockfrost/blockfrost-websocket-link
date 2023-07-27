import * as ratesUtils from '../../../../src/utils/rates.js';
import * as fixtures from '../../fixtures/rates.js';
import { describe, test, expect } from 'vitest';

describe('asset utils', () => {
  for (const fixture of fixtures.getFiatRatesProxies) {
    test(fixture.description, () => {
      expect(ratesUtils.getFiatRatesProxies(fixture.additional)).toMatchObject(fixture.result);
    });
  }

  for (const fixture of fixtures.formatCoingeckoTime) {
    test(fixture.description, () => {
      expect(ratesUtils.formatCoingeckoTime(fixture.time)).toBe(fixture.result);
    });
  }
});
