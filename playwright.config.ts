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

export default defineConfig({
  // Test directories
  // Chemin absolu pour éviter les soucis de cwd (ex: exécutions via wrappers/tasks)
  testDir: resolve(CONFIG_DIR, 'e2e'),
  testMatch: '**/*.spec.ts',

  // Parallel execution
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,

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
    baseURL: process.env.TITANE_E2E_PORT ? `http://localhost:${process.env.TITANE_E2E_PORT}` : 'http://localhost:4000',
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
  webServer: {
    command: 'npx vite dev --host 127.0.0.1 --port 4000 --strictPort',
    url: process.env.TITANE_E2E_PORT ? `http://localhost:${process.env.TITANE_E2E_PORT}` : 'http://localhost:4000',
    reuseExistingServer: !process.env.CI,
    timeout: 180000, // 3min to start (CI heavy load)
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
