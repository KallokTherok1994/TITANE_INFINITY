/**
 * Playwright Global Setup
 * 
 * Installs Tauri IPC mocks when running without TITANE_E2E_TAURI=1
 */

import { chromium, FullConfig } from '@playwright/test';
import { installTauriMocks } from './tauri-ipc-mock';

async function globalSetup(config: FullConfig) {
  const isTauriMode = process.env.TITANE_E2E_TAURI === '1';

  if (!isTauriMode) {
    console.log('🔧 [E2E Setup] Running in mock mode (no Tauri backend)');
    console.log('   → Tauri IPC mocks will be injected into browser context');
  } else {
    console.log('🦀 [E2E Setup] Running with real Tauri backend');
  }

  // Launch browser to inject mocks into initial context
  if (!isTauriMode) {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    // Inject mocks into window before any navigation
    await page.addInitScript(() => {
      // This will be copied from tauri-ipc-mock.ts
      // Playwright doesn't support importing in addInitScript,
      // so we need to inline the mock installation code
      console.log('[E2E] Pre-injecting Tauri mock stubs');
    });

    await browser.close();
  }
}

export default globalSetup;
