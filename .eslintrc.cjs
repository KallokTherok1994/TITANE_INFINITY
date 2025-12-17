// ═══════════════════════════════════════════════════════════════
// TITANE∞ v24 - ESLint Configuration (Optimisée)
// TypeScript strict + React Hooks
// ═══════════════════════════════════════════════════════════════

const hasStorybook = (() => {
  try {
    require.resolve('storybook');
    return true;
  } catch {
    return false;
  }
})();

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
    'plugin:react-hooks/recommended',
    'prettier',
    ...(hasStorybook ? ['plugin:storybook/recommended'] : []),
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    warnOnUnsupportedTypeScriptVersion: false,
    // Type-aware lint désactivé (performances)
    // project: ['./tsconfig.json'],
    // tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint', 'react-hooks'],
  ignorePatterns: [
    'dist',
    'build',
    'target',
    'node_modules',
    'src-tauri',
    '.tauri',
    '.vite',
    'backups',
    '*.cjs',
    '*.config.ts',
    '*.config.js',
    'vite.config.ts',
    'pnpm-lock.yaml',
    'Cargo.lock',
    '**/*.d.ts',
  ],
  rules: {
    // ─────────────────────────────────────────────────────────────
    // TypeScript Rules (performance)
    // ─────────────────────────────────────────────────────────────
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/prefer-nullish-coalescing': 'off',
    '@typescript-eslint/prefer-optional-chain': 'off',
    '@typescript-eslint/consistent-type-imports': 'off',

    // ─────────────────────────────────────────────────────────────
    // React Hooks
    // ─────────────────────────────────────────────────────────────
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // ─────────────────────────────────────────────────────────────
    // Règles générales
    // ─────────────────────────────────────────────────────────────
    'no-console': 'off',
    'prefer-const': 'warn',
    'no-var': 'error',
    eqeqeq: 'off',
    curly: 'off',
    'no-throw-literal': 'off',
    'prefer-promise-reject-errors': 'off',
  },
  overrides: [
    {
      // Config files (vite, eslint, etc.)
      files: ['*.config.ts', '*.config.js', 'vite.config.ts'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
      },
    },
    {
      // Noyau dynamique (autoriser any/t-comment)
      files: [
        'src/core/**/*',
        'src/utils/**/*',
        'src/components/experience/**/*',
        'src/services/**/*',
      ],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
      },
    },
    {
      // Monitoring temps réel
      files: ['src/components/SingularityMonitor*.tsx'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
    {
      // Pages (UIs modulaires)
      files: ['src/pages/**/*.tsx'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
    {
      // Désactiver règles strictes sur tests & archives
      files: [
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
        'tests/**/*.ts',
        'tests/**/*.tsx',
        'src/test/**/*',
        'src/hooks/archived/**/*',
      ],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        'react-hooks/rules-of-hooks': 'off',
        'react-hooks/exhaustive-deps': 'off',
      },
    },
    {
      // Legacy OMNIS engine (maintained separately)
      files: ['src/omnisEngine/**/*', 'src/services/ai/providers/omnis/**/*'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
  ],
};
