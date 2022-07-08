import { describe, test, expect } from 'vitest';
import * as assetUtils from '../../../../src/utils/asset';
import * as fixtures from '../../fixtures/asset';

describe('asset utils', () => {
  for (const fixture of fixtures.transformAsset) {
    test(fixture.description, () => {
      expect(assetUtils.transformAsset(fixture.input, undefined)).toMatchObject(fixture.result);
    });
  }

  for (const fixture of fixtures.getAssetBalance) {
    test(fixture.description, () => {
      expect(
        assetUtils
          .getAssetBalance(fixture.asset, fixture.sent_sum, fixture.received_sum)
          .toString(),
      ).toBe(fixture.result);
    });
  }

  for (const fixture of fixtures.sumAssetBalances) {
    test(fixture.description, () => {
      expect(assetUtils.sumAssetBalances(fixture.list)).toStrictEqual(fixture.result);
    });
  }
});
