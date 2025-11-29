import { mergeConfig } from 'vitest/config';
import sharedTestConfig from './vitest.config';

export default mergeConfig(sharedTestConfig, {
  test: {
    name: 'unit-core',
    include: [
      'src/**/*.{test,spec}.{ts,tsx}',
      'tests/unit/**/*.{test,spec}.{ts,tsx}'
    ],
    exclude: [
      'tests/integration/**/*',
      'tests/e2e/**/*'
    ],
    environment: 'happy-dom'
  }
});
