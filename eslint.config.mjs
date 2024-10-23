import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import prettier from 'eslint-plugin-prettier';
import unicorn from 'eslint-plugin-unicorn';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: [
      '**/dist',
      '**/node_modules',
      '**/.eslintrc.js',
      '**/jest.config.js',
      '**/babel.config.js',
      '**/test',
    ],
  },
  ...fixupConfigRules(
    compat.extends(
      'eslint:recommended',
      'plugin:@typescript-eslint/eslint-recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:import/recommended',
      'prettier',
      'plugin:unicorn/recommended',
    ),
  ),
  {
    plugins: {
      '@typescript-eslint': fixupPluginRules(typescriptEslint),
      prettier,
      unicorn: fixupPluginRules(unicorn),
    },

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },

    rules: {
      'no-console': 'off',
      'unicorn/no-negated-condition': 'off',
      'unicorn/no-null': 'off',
      'unicorn/prefer-type-error': 'off',
      'no-extra-boolean-cast': 'off',
      'newline-after-var': ['error', 'always'],
      'arrow-parens': [2, 'as-needed'],
      'prettier/prettier': 2,
      eqeqeq: ['error', 'always'],
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/prefer-node-protocol': 0,
      'import/extensions': ['error', 'always'],
      'import/no-unresolved': 'off',
      'unicorn/no-anonymous-default-export': 'off',
      'unicorn/consistent-existence-index-check': 'off',
    },
  },
];
