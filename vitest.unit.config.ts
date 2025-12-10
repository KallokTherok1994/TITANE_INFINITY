import { mergeConfig } from 'vitest/config';
import sharedTestConfig from './vitest.config';

/**
 * TITANE∞ - Configuration des tests unitaires
 *
 * Inclut TOUS les tests dans src/ (y compris E2E dans src/__tests__)
 * et tests/unit/
 */
export default mergeConfig(sharedTestConfig, {
  test: {
    name: 'unit-core',
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'tests/unit/**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      // tests/integration et tests/chat sont traités par integration config
      'tests/integration/**/*',
      'tests/chat/**/*',
      'tests/e2e/**/*',
      'node_modules',
    ],
    environment: 'happy-dom',
  },
});
