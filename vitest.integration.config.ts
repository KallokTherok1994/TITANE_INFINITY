import { mergeConfig } from 'vitest/config';
import sharedTestConfig from './vitest.config';

/**
 * TITANE∞ v26.2.0 - Configuration des tests d'intégration
 * Phase 3 Perfection: Coverage Thresholds 70%
 *
 * IMPORTANT: Cette config inclut UNIQUEMENT les tests d'intégration
 * situés dans tests/integration et tests/chat.
 * Les tests E2E dans src/__tests__/e2e-* sont traités par unit config.
 */
export default mergeConfig(sharedTestConfig, {
  test: {
    name: 'integration-core',
    include: [
      // UNIQUEMENT les tests dans tests/
      'tests/integration/**/*.{test,spec}.{ts,tsx}',
      'tests/chat/**/*.{test,spec}.{ts,tsx}',
    ],
    // Exclure explicitement src/ pour éviter double exécution
    exclude: ['src/**/*', 'node_modules'],
    environment: 'happy-dom',
    reporters: ['default'],
    dir: '.',
    testTimeout: 60000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'json-summary'],
      reportsDirectory: 'coverage/integration',
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
      // Phase 3 Perfection: Quality Gates (70% for integration)
      thresholds: {
        statements: 70,
        branches: 70,
        functions: 70,
        lines: 70,
        // Strict mode: ne pas auto-update (force quality)
        autoUpdate: false,
      },
    },
  },
});
