/**
 * Smoke Tests (v19.0 Task 7)
 *
 * ⚠️ LEGACY E2E TESTS - TAURI-ONLY MODE
 * Ces tests utilisaient un serveur HTTP localhost:1420 qui n'existe plus.
 * En mode Tauri asset-only (tauri://localhost), ces tests nécessitent
 * une approche différente avec @tauri-apps/cli-driver ou tests manuels.
 *
 * TODO: Migrer vers Tauri E2E testing ou désactiver ces tests.
 */

import { test } from '@playwright/test';

test.describe.skip('Smoke Tests (LEGACY - HTTP mode disabled)', () => {
  test('app launches without errors', async () => {
    // OBSOLETE: Tauri no longer uses HTTP dev server
    // await page.goto('http://localhost:1420');

    console.warn('⚠️ Test skipped: Tauri asset-only mode - no HTTP server');
  });

  test('navigation works correctly', async () => {
    console.warn('⚠️ Test skipped: Tauri asset-only mode - no HTTP server');
  });

  test('dark theme is applied by default', async () => {
    console.warn('⚠️ Test skipped: Tauri asset-only mode - no HTTP server');
  });
});
