/**
 * Playwright Global Setup for TITANE∞ E2E Tests
 * Mocks Tauri APIs for browser-based testing
 */

import { type FullConfig } from '@playwright/test';

async function globalSetup(_config: FullConfig) {
  // Setup is handled in the test files themselves
  console.log('🎭 TITANE∞ E2E Setup: Tauri APIs will be mocked per test');
}

export default globalSetup;
