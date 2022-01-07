import * as ratesUtils from '../../../../src/utils/rates';
import * as fixtures from '../../fixtures/rates';

describe('asset utils', () => {
  fixtures.getFiatRatesProxies.forEach(fixture => {
    test(fixture.description, () => {
      expect(ratesUtils.getFiatRatesProxies(fixture.additional)).toMatchObject(fixture.result);
    });
  });

  fixtures.formatCoingeckoTime.forEach(fixture => {
    test(fixture.description, () => {
      expect(ratesUtils.formatCoingeckoTime(fixture.time)).toBe(fixture.result);
    });
  });
});
