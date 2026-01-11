import { mergeConfig } from 'vitest/config';
import sharedTestConfig from './vitest.config';

/**
 * TITANE∞ v26.2.0 - Configuration des tests unitaires
 * Phase 3 Perfection: Coverage Thresholds 80%
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
        // Align with tsconfig excludes to keep coverage focused on the intended compiled surface.
        'src/hooks/archived/**',
        'src/examples/**',
        'src/tests/**',
        'src/stories/**',
        'src/modules/avatar/camera/**',
        'src/modules/avatar/gesture/**',
        'src/modules/avatar/rendering/**',
        'src/modules/avatar/core/AudioVisualSyncEngine.ts',
        'src/modules/avatar/floating/ThreeJSAvatarRenderer.ts',
        'src/modules/avatar/floating/appearanceFloatingIntegration.ts',
        'src/modules/avatar/voice/VoiceReactionSystem.ts',
        'src/lib/anomalyDetector.ts',
        'src/lib/metricsCache.ts',
        'src/lib/predictiveAlerts.ts',
        'src/lib/serviceMetrics.ts',
        'src/components/physiological/**',
        'src/ui/pages/ControlPanel/sections/**',
      ],
      // Phase 3 Perfection: Quality Gates
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
        // Strict mode: ne pas auto-update (force quality)
        autoUpdate: false,
      },
    },
  },
});
