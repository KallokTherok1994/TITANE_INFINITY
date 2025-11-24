/**
 * Playwright Configuration for Tauri (v19.0 Task 7)
 *
 * E2E testing for TITANE∞ Tauri app
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Tauri apps should run sequentially
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // One Tauri instance at a time
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'tauri',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Global timeout
  timeout: 60000, // 60s for Tauri app operations
});
