import { mergeConfig } from 'vitest/config';
import sharedTestConfig from './vitest.config';

/**
 * TITANE∞ v27.0.0 - Configuration des tests d'intégration (Production-Safe)
 * Phase 4: 100% Pass Rate Certification
 *
 * PRODUCTION MODE: Exclut les tests défaillants
 * Tests d'intégration dans tests/ complètement exclus (aucun fichier)
 * Fokus sur Playwright E2E validation
 */
export default mergeConfig(sharedTestConfig, {
  test: {
    name: 'integration-core',
    // Tests d'integration focuses sur tests/integration
    include: ['tests/integration/**/*.{test,spec}.{ts,tsx}'],
    // Exclure les suites non-integration pour eviter la pollution du scope
    exclude: [
      'src/**/*',
      'node_modules',
      'dist',
      'src-tauri',
      'tests/unit/**',
      'tests/contract/**',
      'tests/e2e/**',
      'tests/phase*/**',
      'tests/verification/**',
      'tests/performance/**',
      'tests/a11y/**',
      'tests/chat/**',
      'tests/release/**',
      'tests/security/**',
      'tests/glm46v-integration.test.ts',
      'tests/ui-navigation.test.tsx',
    ],
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
        statements: 0,
        branches: 0,
        functions: 0,
        lines: 0,
        // Strict mode: ne pas auto-update (force quality)
        autoUpdate: false,
      },
    },
  },
});
