// eslint-disable-next-line import/extensions
import { defineConfig } from 'vitest/config';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export default defineConfig({
  test: {
    include: ['./test/e2e/tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],

    setupFiles: ['./test/e2e/vitest.setup.ts', require.resolve('allure-vitest/setup')],
    testTimeout: 180_000,
    reporters: [
      'verbose',
      [
        'allure-vitest/reporter',
        {
          resultsDir: 'allure-test-reports/allure-results',
        },
      ],
    ],
  },
});
