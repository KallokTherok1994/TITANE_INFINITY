import { mergeConfig } from 'vitest/config';
import sharedTestConfig from './vitest.config';

/**
 * TITANE∞ - Configuration des tests d'intégration
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
    exclude: [
      'src/**/*',
      'node_modules'
    ],
    environment: 'happy-dom',
    reporters: ['default'],
    dir: '.',
    testTimeout: 60000,
  }
});
