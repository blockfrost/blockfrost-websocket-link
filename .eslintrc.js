module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
  },
  plugins: ['@typescript-eslint', 'prettier', 'unicorn'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:unicorn/recommended',
  ],
  rules: {
    'no-console': 'off',
    'unicorn/no-null': 'off',
    'no-extra-boolean-cast': 'off',
    'newline-after-var': ['error', 'always'],
    'arrow-parens': [2, 'as-needed'],
    'prettier/prettier': 2,
    eqeqeq: ['error', 'always'],
    'unicorn/prefer-module': 0,
    'unicorn/prefer-node-protocol': 0,
  },
};
