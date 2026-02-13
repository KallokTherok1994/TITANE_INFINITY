/**
 * Playwright Custom Fixtures
 * 
 * Extends base test with Tauri IPC mocks when running without real backend
 */

import { test as base, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read mock script once at module load
const mockScript = fs.readFileSync(
  path.resolve(__dirname, './tauri-ipc-mock-inline.js'),
  'utf-8'
);

/**
 * Extended test with automatic Tauri mock injection
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    const isTauriMode = process.env.TITANE_E2E_TAURI === '1';

    if (!isTauriMode) {
      // Inject mocks before any navigation
      await page.addInitScript(mockScript);
    }

    await use(page);
  },
});

export { expect };
