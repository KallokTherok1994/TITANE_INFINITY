/**
 * E2E Test: TIME Module v3 — 7 onglets canoniques (Phase 4 + Phase 6)
 *
 * Vérifie que la page /time expose les 7 onglets (now / agenda / memory /
 * timeline / cognitive / snapshots / twin) et que les nouvelles sections
 * v3 (memory + twin) sont rendues avec leurs surfaces canoniques.
 *
 * Skip gracieux si TITANE_E2E_FULL != 1 — l'environnement web pur n'a pas
 * accès aux IPC Tauri.
 */

import { test, expect } from '@playwright/test';

const FULL_E2E_ENABLED = process.env.TITANE_E2E_FULL === '1';

const TIME_TABS = [
  'tab-time-now',
  'tab-time-agenda',
  'tab-time-memory',
  'tab-time-timeline',
  'tab-time-cognitive',
  'tab-time-snapshots',
  'tab-time-twin',
];

test.describe('TIME module v3 — 7 onglets canoniques', () => {
  if (!FULL_E2E_ENABLED) {
    test('precondition proof (set TITANE_E2E_FULL=1)', async () => {
      expect(FULL_E2E_ENABLED).toBe(false);
    });
    return;
  }

  test.beforeEach(async ({ page }) => {
    await page.goto('/time');
    await expect(page.getByTestId('page-time')).toBeVisible({ timeout: 15000 });
  });

  test('expose les 7 onglets canoniques', async ({ page }) => {
    for (const id of TIME_TABS) {
      await expect(page.getByTestId(id)).toBeVisible({ timeout: 10000 });
    }
  });

  test('onglet memory rend la section Ebbinghaus avec stats', async ({ page }) => {
    await page.getByTestId('tab-time-memory').click();
    await expect(page.getByTestId('time-section-memory')).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByTestId('time-memory-stats')).toBeVisible();
    await expect(page.getByTestId('time-metric-memory-total')).toBeVisible();
    await expect(page.getByTestId('time-metric-memory-active')).toBeVisible();
    await expect(page.getByTestId('time-metric-memory-consolidated')).toBeVisible();
    await expect(page.getByTestId('time-metric-memory-strength')).toBeVisible();
    await expect(page.getByTestId('time-memory-refresh')).toBeEnabled();
    await expect(page.getByTestId('time-memory-consolidate')).toBeEnabled();
  });

  test('onglet twin rend health + alignment', async ({ page }) => {
    await page.getByTestId('tab-time-twin').click();
    await expect(page.getByTestId('time-section-twin')).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByTestId('time-twin-health')).toBeVisible();
    await expect(page.getByTestId('time-twin-alignment')).toBeVisible();
    await expect(page.getByTestId('time-metric-twin-overall')).toBeVisible();
    await expect(page.getByTestId('time-metric-twin-energy')).toBeVisible();
    await expect(page.getByTestId('time-metric-twin-align-score')).toBeVisible();
    await expect(page.getByTestId('time-metric-twin-active-goals')).toBeVisible();
    await expect(page.getByTestId('time-twin-refresh')).toBeEnabled();
    await expect(page.getByTestId('time-twin-tick')).toBeEnabled();
  });

  test('navigation entre les 7 onglets ne casse pas la surface', async ({ page }) => {
    for (const id of TIME_TABS) {
      await page.getByTestId(id).click();
      await expect(page.getByTestId(id)).toHaveAttribute('aria-selected', 'true');
    }
  });
});
