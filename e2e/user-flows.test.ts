/**
 * User Flow Tests (v19.0 Task 7)
 *
 * ⚠️ LEGACY E2E TESTS - TAURI-ONLY MODE
 * Ces tests utilisaient un serveur HTTP localhost:1420 qui n'existe plus.
 * En mode Tauri asset-only (tauri://localhost), ces tests nécessitent
 * une approche différente avec @tauri-apps/cli-driver ou tests manuels.
 *
 * TODO: Migrer vers Tauri E2E testing ou désactiver ces tests.
 */

import { test } from '@playwright/test';

test.describe.skip('User Flows (LEGACY - HTTP mode disabled)', () => {
  test('chat flow: send message and receive response', async () => {
    console.warn('⚠️ Test skipped: Tauri asset-only mode - no HTTP server');
  });

  test('engine navigation: visit all engine pages', async () => {
    console.warn('⚠️ Test skipped: Tauri asset-only mode - no HTTP server');
  });

  test('settings: change theme and verify persistence', async () => {
    console.warn('⚠️ Test skipped: Tauri asset-only mode - no HTTP server');
    // Note: Theme persistence testing would require Tauri E2E setup
  });
});
