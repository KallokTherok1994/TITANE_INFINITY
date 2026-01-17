module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
    mocha: true
  },
  globals: {
    describe: 'readonly',
    it: 'readonly',
    expect: 'readonly',
    browser: 'readonly',
    $: 'readonly',
    $$: 'readonly'
  },
  extends: [
    '../.eslintrc.cjs'
  ],
  rules: {
    '@typescript-eslint/no-var-requires': 'off',
    'no-undef': 'error'
  }
};
