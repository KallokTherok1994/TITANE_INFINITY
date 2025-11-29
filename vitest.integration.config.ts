import { mergeConfig } from 'vitest/config';
import sharedTestConfig from './vitest.config';

export default mergeConfig(sharedTestConfig, {
  test: {
    name: 'integration-core',
    include: [
      'tests/integration/**/*.{test,spec}.{ts,tsx}',
      'tests/chat/**/*.{test,spec}.{ts,tsx}'
    ],
    environment: 'happy-dom',
    reporters: ['default'],
    dir: '.'
  }
});
