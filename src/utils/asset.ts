import EmurgoCip from '@emurgo/cip14-js';
import { Balance } from 'types/address';
import { TokenBalance } from 'types/response';

export const getFingerprint = (policyId: string, assetName?: string): string =>
  new EmurgoCip(
    Uint8Array.from(Buffer.from(policyId, 'hex')),
    Uint8Array.from(Buffer.from(assetName ? assetName : '', 'hex')),
  ).fingerprint();

export const transformToken = (token: Balance): TokenBalance => {
  const policyIdSize = 56;
  const policyId = token.unit.slice(0, policyIdSize);
  const assetNameInHex = token.unit.slice(policyIdSize);
  const fingerprint = getFingerprint(policyId, assetNameInHex);
  return {
    ...token,
    fingerprint: fingerprint,
    decimals: 0,
  };
};
