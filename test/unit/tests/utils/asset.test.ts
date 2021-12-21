import * as assetUtils from '../../../../src/utils/asset';
import * as fixtures from '../../fixtures/asset';

describe('asset utils', () => {
  fixtures.transformAsset.forEach(fixture => {
    test(fixture.description, () => {
      expect(assetUtils.transformAsset(fixture.input)).toMatchObject(fixture.result);
    });
  });

  fixtures.getAssetBalance.forEach(fixture => {
    test(fixture.description, () => {
      expect(
        assetUtils
          .getAssetBalance(fixture.asset, fixture.sent_sum, fixture.received_sum)
          .toString(),
      ).toBe(fixture.result);
    });
  });

  fixtures.sumAssetBalances.forEach(fixture => {
    test(fixture.description, () => {
      expect(assetUtils.sumAssetBalances(fixture.list)).toStrictEqual(fixture.result);
    });
  });
});
