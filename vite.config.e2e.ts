import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['./test/e2e/tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    testTimeout: 20_000,
  },
});
