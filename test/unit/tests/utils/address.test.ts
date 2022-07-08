import * as addressUtils from '../../../../src/utils/address';
import * as fixtures from '../../fixtures/address';
import { describe, test, expect } from 'vitest';

describe('address utils', () => {
  for (const fixture of fixtures.deriveAddress) {
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
  }
});
