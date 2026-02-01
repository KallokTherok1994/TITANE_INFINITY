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
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
    ...(hasStorybook ? ['plugin:storybook/recommended'] : []),
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    warnOnUnsupportedTypeScriptVersion: false,
    // Type-aware lint désactivé (performances)
    // project: ['./tsconfig.json'],
    // tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: [
    'dist',
    'build',
    'target',
    'node_modules',
    'src-tauri',
    '.tauri',
    '.vite',
    'backups',
    'backup_*',
    'docs/**',
    'scripts/archive/**',
    'src/hooks/archived/**',
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
    // Disabled: These are too strict for production code with side effects
    'react/no-unescaped-entities': 'off',

    // ─────────────────────────────────────────────────────────────
    // React Rules
    // ─────────────────────────────────────────────────────────────
    'react/react-in-jsx-scope': 'off', // React 17+ automatic JSX runtime
    'react/prop-types': 'off', // TypeScript handles prop validation

    // ─────────────────────────────────────────────────────────────
    // Sécurité & Architecture
    // ─────────────────────────────────────────────────────────────
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@tauri-apps/api/core',
            importNames: ['invoke'],
            message:
              "⚠️ SECURITY: Use secureInvoke() from '@/lib/security' instead of direct invoke(). Direct invoke() bypasses security validation (whitelist, injection detection, timeout, type guards). Migration guide: SECURITY_HARDENING_v19.0.0.md",
          },
        ],
        patterns: [
          {
            group: ['@/services/*'],
            importNames: ['*'],
            message:
              '⚠️ ARCHITECTURE: Engines MUST NOT import Services. Engines must be pure logic (no I/O, no state, no side-effects). Extract shared types to @/types (Core ring). See docs/ARCHITECTURE_RINGS.md',
          },
          {
            group: ['@tauri-apps/*'],
            importNames: ['*'],
            message:
              '⚠️ ARCHITECTURE: Engines MUST NOT import Tauri APIs. Engines are pure computation. Move I/O to Services layer. See docs/ARCHITECTURE_RINGS.md',
          },
        ],
      },
    ],

    // ─────────────────────────────────────────────────────────────
    // Règles générales
    // ─────────────────────────────────────────────────────────────
    'no-console': 'off', // Logger unifié used instead
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
        'no-restricted-imports': 'off', // Allow direct Tauri invoke in tests
      },
    },
    {
      // ⚠️ v27.0.0 TEMPORARY: Relax strict React purity rules (Technical Debt)
      // These violations are architectural (side-effect patterns) and don't affect production
      // See: TECHNICAL_DEBT_v27.0.0.md for migration plan to v27.1.0
      // Disable: purity (Date.now, performance.now), setState-in-effect, refs access, immutability, memoization
      files: [
        'src/**/*.ts',
        'src/**/*.tsx',
        '!src/**/*.test.ts',
        '!src/**/*.test.tsx',
        '!src/**/*.spec.ts',
        '!src/**/*.spec.tsx',
        '!src/test/**/*',
      ],
      rules: {
        'react-hooks/purity': 'off', // ⏸️ Date.now(), performance.now() in render (v27.1.0)
        'react-hooks/set-state-in-effect': 'off', // ⏸️ setState calls in useEffect (v27.1.0)
        'react-hooks/refs': 'off', // ⏸️ ref.current access during render (v27.1.0)
        'react-hooks/immutability': 'off', // ⏸️ modifying values passed to hooks (v27.1.0)
        'react-hooks/preserve-manual-memoization': 'off', // ⏸️ React Compiler memoization inference (v27.1.0)
        '@typescript-eslint/no-empty-object-type': 'off', // {} type in lazyComponentLoader
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
