/**
 * Playwright Configuration for TITANE∞ v22.0.0
 *
 * E2E testing for Vite dev server (http://localhost:5173)
 * Critical Path Tests: App Launch, Chat, Visual Engine, Navigation, Resilience
 */

import { defineConfig, devices } from '@playwright/test';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const CONFIG_DIR = dirname(fileURLToPath(import.meta.url));
const E2E_WATCH_SCRIPT = resolve(CONFIG_DIR, 'scripts/e2e/vite-e2e-watch.cjs');
// Start local dev server by default for deterministic E2E runs.
// Set TITANE_E2E_USE_WEBSERVER=0 when using an externally managed server.
const useWebServer = process.env.TITANE_E2E_USE_WEBSERVER !== '0';

export default defineConfig({
  // Test directories
  // Primary browser lane: canonical e2e folder.
  testDir: resolve(CONFIG_DIR, 'e2e'),
  testMatch: '**/*.{spec,test}.ts',

  // Parallel execution
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  outputDir: resolve(CONFIG_DIR, 'reports/playwright/test-results'),

  // Timeouts
  timeout: 60000, // 60s per test (relaxed for CI env)
  expect: {
    timeout: 10000, // 10s for assertions (relaxed)
  },

  // Reporting
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],

  // Browser options
  use: {
    baseURL: process.env.TITANE_E2E_PORT
      ? `http://127.0.0.1:${process.env.TITANE_E2E_PORT}`
      : 'http://127.0.0.1:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 30000, // 30s action timeout (CI environment)
  },

  // Test projects (browsers)
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'chromium-tests-e2e',
      testDir: resolve(CONFIG_DIR, 'tests/e2e'),
      testMatch: '**/*.{spec,test}.ts',
      testIgnore: ['**/control_panel.spec.ts', '**/accessibility.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
    // Firefox DISABLED: Requires libavif16 system dependency (cannot install in container)
    // Uncomment when running with: sudo npx playwright install-deps
    // Firefox DISABLED: Requires libavif16 system dependency (cannot install in container)
    // Uncomment when running with: sudo npx playwright install-deps
    // {
    //   name: 'firefox',
    //   use: {
    //     ...devices['Desktop Firefox'],
    //     viewport: { width: 1280, height: 720 },
    //   },
    // },

    // WebKit DISABLED: Requires libavif16 system dependency (cannot install in container)
    // Uncomment when running with: sudo npx playwright install-deps
    // {
    //   name: 'webkit',
    //   use: {
    //     ...devices['Desktop Safari'],
    //     viewport: { width: 1280, height: 720 },
    //   },
    // },
  ],

  // Dev server configuration
  // Use Tauri dev locally so runtime-dependent tests (chat/IPC) have a backend.
  // Keep Vite-only in CI where GUI/Tauri may be unavailable.
  webServer: useWebServer
    ? {
        command: `${process.execPath} ${E2E_WATCH_SCRIPT} --host 127.0.0.1 --port 5173 --strictPort`,
        cwd: CONFIG_DIR,
        url: process.env.TITANE_E2E_PORT
          ? `http://localhost:${process.env.TITANE_E2E_PORT}`
          : 'http://localhost:5173',
        reuseExistingServer: true,
        timeout: 180000, // 3min to start (CI heavy load)
        stdout: 'pipe',
        stderr: 'pipe',
      }
    : undefined,
});
