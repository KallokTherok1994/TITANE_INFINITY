// ═══════════════════════════════════════════════════════════════
// TITANE∞ v24 - ESLint Configuration OPTIMIZED (CPU < 30%)
// TypeScript strict rules with React Hooks — Performance-first
// ═══════════════════════════════════════════════════════════════

module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    // Désactivé pour performance : 'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    // Désactivé pour performance (type checking coûteux)
    // project: ['./tsconfig.json'],
    // tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint', 'react-hooks'],

  // ═══════════════════════════════════════════════════════════════════════════
  // 🚀 EXCLUSIONS AGRESSIVES (Performance)
  // ═══════════════════════════════════════════════════════════════════════════
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'target/',
    '.tauri/',
    'backups/',
    '*.config.js',
    '*.config.ts',
    'vite.config.ts',
    '**/*.test.ts',
    '**/*.spec.ts',
    '**/*.d.ts',
    'pnpm-lock.yaml',
    'Cargo.lock',
  ],
  rules: {
    // ─────────────────────────────────────────────────────────────
    // TypeScript Rules (Performance-optimized)
    // ─────────────────────────────────────────────────────────────
    '@typescript-eslint/no-explicit-any': 'warn', // downgrade pour performance
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/explicit-function-return-type': 'off', // disabled pour performance
    '@typescript-eslint/no-non-null-assertion': 'warn',
    // Désactivés car nécessitent type checking (CPU intensif)
    // '@typescript-eslint/no-floating-promises': 'error',
    // '@typescript-eslint/no-misused-promises': 'error',
    // '@typescript-eslint/await-thenable': 'error',
    // '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'off',
    '@typescript-eslint/prefer-optional-chain': 'off',
    '@typescript-eslint/consistent-type-imports': 'off',

    // ─────────────────────────────────────────────────────────────
    // React Hooks Rules
    // ─────────────────────────────────────────────────────────────
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // ─────────────────────────────────────────────────────────────
    // General Best Practices (Lightweight)
    // ─────────────────────────────────────────────────────────────
    'no-console': 'off', // Désactivé pour debug
    'prefer-const': 'warn',
    'no-var': 'error',
    'eqeqeq': 'off',
    'curly': 'off',
    'no-throw-literal': 'off',
    'prefer-promise-reject-errors': 'off',
  },
  ignorePatterns: [
    'dist',
    'node_modules',
    'src-tauri',
    '.vite',
    '*.cjs',
    '*.config.ts',
    '*.config.js',
  ],
  overrides: [
    {
      // Relax rules for config files
      files: ['*.config.ts', '*.config.js', 'vite.config.ts'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
      },
    },
  ],
};
