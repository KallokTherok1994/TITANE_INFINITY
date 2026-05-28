import { mergeConfig } from 'vitest/config';
import sharedTestConfig from './vitest.config';

/**
 * TITANE∞ — Unit coverage config (used by: pnpm test:coverage:unit)
 *
 * Inherits full test scope from vitest.config.ts — no artificial exclusions.
 * Override: coverage output → coverage/unit/
 *
 * For authoritative test results use: pnpm run test (vitest.config.ts, 9500+ tests)
 */
export default mergeConfig(sharedTestConfig, {
  test: {
    name: 'unit-core',
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'json-summary'],
      reportsDirectory: 'coverage/unit',
      exclude: [
        'node_modules/',
        '**/*.css',
        '**/*.svg',
        'src/assets/**',
        'src/styles/**',
        'src/test/',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
        '**/__mocks__/**',
        '**/mocks/**',
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
        autoUpdate: false,
      },
    },
  },
});
