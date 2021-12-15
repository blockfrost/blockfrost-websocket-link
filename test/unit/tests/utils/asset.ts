import * as assetUtils from 'utils/asset';
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
});
