// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ v26.2.0 — VITEST BROWSER MODE CONFIGURATION
//   WebGL/Three.js performance tests in real browser environment
// ═══════════════════════════════════════════════════════════════════════════

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { browser as playwrightBrowser } from '@vitest/browser-playwright';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tauri-apps/api/core': path.resolve(__dirname, './src/__mocks__/tauri.mock.ts'),
    },
  },

  test: {
    // Browser mode configuration for WebGL/Three.js tests
    browser: {
      enabled: true,
      provider: playwrightBrowser,
      name: 'chromium',
      headless: true,
      screenshotOnFailure: false,
    },

    // Only run browser-specific tests
    include: [
      'src/tests/browser/**/*.test.ts',
      'src/modules/avatar/floating/floating.perf.test.ts',
    ],

    // Performance test timeouts
    testTimeout: 60000, // 1 minute for WebGL tests
    hookTimeout: 30000,

    // Coverage (optional for browser tests)
    coverage: {
      enabled: false, // Disable for browser tests (focus on node coverage)
    },

    // Globals for Three.js/WebGL
    globals: true,
    environment: 'jsdom', // Fallback if browser mode fails

    // Retry flaky browser tests
    retry: 1,

    // Sequential execution for browser tests
    threads: false,
    singleThread: true,
  },
});
