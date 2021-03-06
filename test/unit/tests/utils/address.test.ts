import * as addressUtils from '../../../../src/utils/address';
import * as fixtures from '../../fixtures/address';

describe('address utils', () => {
  fixtures.deriveAddress.forEach(fixture => {
    test(fixture.description, () => {
      expect(
        addressUtils.deriveAddress(
          fixture.publicKey,
          fixture.type,
          fixture.addressIndex,
          fixture.isTestnet,
        ),
      ).toMatchObject(fixture.result);
    });
  });
});
