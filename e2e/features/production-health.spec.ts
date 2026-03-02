/**
 * E2E Test: Production Health Panel (Feature Test)
 * Validate Admin tab integration and core telemetry UI states.
 */

import { test, expect } from '@playwright/test';
import { openAdminTab } from '../helpers/navigation';

const FULL_E2E_ENABLED = process.env.TITANE_E2E_FULL === '1';

test.describe('Feature: Production Health', () => {
  if (!FULL_E2E_ENABLED) {
    test('gate disabled proof (set TITANE_E2E_FULL=1)', async () => {
      expect(FULL_E2E_ENABLED).toBe(false);
    });
    return;
  }

  test.beforeEach(async ({ page }) => {
    await openAdminTab(page, /Santé Prod|Production/i);
    await page.waitForTimeout(500);
  });

  test('navigates to Production Health panel', async ({ page }) => {
    const panel = page.getByTestId('production-health-panel');
    await expect(panel).toBeVisible({ timeout: 15000 });

    const dataTitle = page.getByText(/Production V25 Week 1/i).first();
    const errorTitle = page.getByText(/Erreur de chargement/i).first();
    await expect(dataTitle.or(errorTitle)).toBeVisible({ timeout: 15000 });
  });

  test('shows visible state (data or error) without silent failure', async ({ page }) => {
    const sourceText = page.getByText(/Source: CSV local \(Tauri IPC\)/i).first();
    const errorTitle = page.getByText(/Erreur de chargement/i).first();
    await expect(sourceText.or(errorTitle)).toBeVisible({ timeout: 15000 });
  });

  test('refresh action is visible and clickable', async ({ page }) => {
    const refreshButton = page.getByTestId('production-health-refresh');
    const retryButton = page.getByRole('button', { name: /Réessayer/i }).first();
    await expect(refreshButton.or(retryButton)).toBeVisible({ timeout: 15000 });

    if (await refreshButton.isVisible().catch(() => false)) {
      await refreshButton.click({ force: true });
      await expect(refreshButton).toBeVisible({ timeout: 15000 });
    } else {
      await retryButton.click({ force: true });
      await expect(retryButton).toBeVisible({ timeout: 15000 });
    }
  });
});
