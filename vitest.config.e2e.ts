// eslint-disable-next-line import/extensions
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['./test/e2e/tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],

    setupFiles: './test/e2e/vitest.setup.ts',
    testTimeout: 180_000,
  },
});
