/**
 * Playwright Configuration for TITANE∞ v22.0.0
 *
 * E2E testing for Vite dev server (http://localhost:5173)
 * Critical Path Tests: App Launch, Chat, Visual Engine, Navigation, Resilience
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Test directories
  testDir: './e2e',
  testMatch: '**/*.spec.ts',

  // Parallel execution
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Timeouts
  timeout: 30000, // 30s per test
  expect: {
    timeout: 5000, // 5s for assertions
  },

  // Reporting
  reporter: process.env.CI ? [['html'], ['github']] : [['html'], ['list']],

  // Browser options
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
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
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],

  // Dev server configuration
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 2min to start
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
