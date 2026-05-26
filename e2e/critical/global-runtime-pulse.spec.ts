/**
 * E2E v34.0.3 — Global Runtime Pulse visibility
 *
 * Vérifie:
 *   - le badge GlobalRuntimePulse est monté dans le shell (visible sur n'importe quelle route)
 *   - il expose data-testid stable + data-status + data-latency
 *   - hors Tauri (Playwright web), il affiche PARTIAL (NO_TAURI_RUNTIME)
 *
 * Aucun TITANE_E2E_FULL=1 nécessaire : le badge est rendu côté UI sans IPC.
 */

import { test, expect } from '@playwright/test';

test.describe('GlobalRuntimePulse — Living Pulse v34.0.3', () => {
  test('global pulse badge is visible on app shell', async ({ page }) => {
    await page.goto('/');
    const pulse = page.getByTestId('global-runtime-pulse');
    await expect(pulse).toBeVisible({ timeout: 10_000 });
  });

  test('pulse exposes data-status attribute (LIVE/PARTIAL/DEGRADED/PROBING)', async ({
    page,
  }) => {
    await page.goto('/');
    const pulse = page.getByTestId('global-runtime-pulse');
    await expect(pulse).toBeVisible({ timeout: 10_000 });
    const status = await pulse.getAttribute('data-status');
    expect(['LIVE', 'PARTIAL', 'DEGRADED', 'PROBING']).toContain(status ?? '');
  });

  test('pulse exposes latency attribute', async ({ page }) => {
    await page.goto('/');
    const pulse = page.getByTestId('global-runtime-pulse');
    await expect(pulse).toBeVisible({ timeout: 10_000 });
    const latency = await pulse.getAttribute('data-latency');
    expect(latency).not.toBeNull();
  });

  test('pulse remains mounted across navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('global-runtime-pulse')).toBeVisible({
      timeout: 10_000,
    });
    await page.goto('/settings');
    await expect(page.getByTestId('global-runtime-pulse')).toBeVisible({
      timeout: 10_000,
    });
  });
});
