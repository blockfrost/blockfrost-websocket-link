import { describe, test, expect } from 'vitest';
import * as assetUtils from '../../../../src/utils/asset.js';
import * as fixtures from '../../fixtures/asset.js';

describe('asset utils', () => {
  for (const fixture of fixtures.transformAsset) {
    test(fixture.description, () => {
      // @ts-expect-error partial mock
      expect(assetUtils.transformAsset(fixture.input)).toMatchObject(fixture.result);
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
