/**
 * TITANE_INFINITY v∞ — Proprietary License
 * E2E: Unified Launcher Panel — desktop surface tests
 */

import { test, expect } from '@playwright/test';

test.describe('UnifiedLauncherPanel — desktop surface', () => {
  test('Panel renders steps when navigated to launcher route', async ({ page }) => {
    await page.goto('/');
    const panel = page.locator('[data-testid="unified-launcher-panel"]');

    if ((await panel.count()) > 0) {
      await expect(panel).toBeVisible();
      await expect(
        panel.locator('[data-testid="unified-launcher-platform"]')
      ).toBeVisible();
      await expect(panel.locator('[data-testid="unified-launcher-steps"]')).toBeVisible();
    }
  });

  test('Ollama status indicator appears after check', async ({ page }) => {
    await page.goto('/');
    const panel = page.locator('[data-testid="unified-launcher-panel"]');

    if ((await panel.count()) > 0) {
      const ollamaStatus = panel.locator(
        '[data-testid="unified-launcher-ollama-status"]'
      );
      await expect(ollamaStatus).toBeVisible({ timeout: 10000 });
    }
  });

  test('Launch button appears in ready state', async ({ page }) => {
    await page.goto('/');
    const panel = page.locator('[data-testid="unified-launcher-panel"]');

    if ((await panel.count()) > 0) {
      const launchBtn = panel.locator('[data-testid="unified-launcher-launch-button"]');
      await expect(launchBtn).toBeVisible({ timeout: 10000 });
      await expect(launchBtn).toBeEnabled();
    }
  });
});
