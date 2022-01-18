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

  fixtures.transformUtxo.forEach(fixture => {
    test(fixture.description, () => {
      expect(addressUtils.transformUtxo(fixture.utxo)).toStrictEqual(fixture.result);
    });
  });

  fixtures.bech32PoolToHex.forEach(fixture => {
    test(`bech32PoolToHex: ${fixture.description}`, () => {
      expect(addressUtils.bech32PoolToHex(fixture.poolId)).toStrictEqual(fixture.result);
    });
  });
});
