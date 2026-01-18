/**
 * Playwright Configuration for TITANE∞
 *
 * Focus: Critical-path, web-compatible E2E against the local Vite dev server.
 * Governance gate: 3 scenarios Playwright only (critical path)
 */

import { chromium, defineConfig } from '@playwright/test';

const chromiumExecutable =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || chromium.executablePath();

export default defineConfig({
  // Global setup for Tauri mocking
  globalSetup: './playwright.global-setup.ts',

  // Test directories
  // Governance gate: 3 scenarios Playwright only (critical path)
  testDir: './e2e/critical',
  testMatch: [
    'app-launch.spec.ts',
    'chat-interaction.spec.ts',
    'engine-navigation.spec.ts',
  ],

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
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],

  // Browser options
  use: {
    baseURL: 'http://127.0.0.1:1420',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    launchOptions: {
      // Prefer bundled Playwright Chromium to avoid snap confinement issues; allow override via env.
      executablePath: chromiumExecutable,
      args: ['--disable-dev-shm-usage'],
    },
    // Mock Tauri APIs for E2E testing
    contextOptions: {
      permissions: ['clipboard-read', 'clipboard-write'],
    },
  },

  // Single-browser project (bundled Chromium)
  projects: [{ name: 'chromium' }],

  // Dev server configuration
  webServer: {
    command:
      'node node_modules/vite/bin/vite.js dev --config vite.config.ts --port 1420 --strictPort --host 127.0.0.1',
    url: 'http://127.0.0.1:1420',
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 2min to start
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
