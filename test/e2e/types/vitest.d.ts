import { Assertion } from 'vitest';
import { Responses } from '@blockfrost/blockfrost-js';
import type { toBeOneOf } from 'jest-extended';

interface CustomMatchers<R = unknown> {
  toBeOneOf(p: any): R;
  toBeNull(): void;
  toBeGreaterThan(expected: BigValue): void;
  toBeLessThan(expected: BigValue): void;
  toBeInRange(min: BigValue, max: BigValue): void;
  toBeGreaterThanOrEqual(expected: BigValue): void;
  toBeLessThanOrEqual(expected: BigValue): void;
  toBeBlake2b256Hash(): void;
  toBePoolBech32(): void;
  toBePositive(): void;
  toBeUnixTimestamp(): void;
  toBeCurrentTimestamp(options?: { tolerance?: number; ms?: boolean }): void;
  toBeAssetQuantity(): void;
  toBeAdaQuantity(): void;
  toBeAssetUnit(): void;
  toBeStakeAddress(): void;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
