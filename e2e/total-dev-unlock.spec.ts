// TOTAL_DEV v28.1.0 — Unlock Smoke Test
// Test du déverrouillage avec mot de passe correct

import { test, expect } from '@playwright/test';

test.describe('TOTAL_DEV Unlock Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/total-dev');
    await page.waitForLoadState('load');
    await page.waitForSelector('[data-testid="total-dev-header"]', { timeout: 10000 });
  });

  test('Browser fallback stays locked even with correct password outside Tauri', async ({
    page,
  }) => {
    const lockBadge = page.locator('[data-testid="lock-badge"]');
    const errorMsg = page.locator('.total-dev-unlock-error');

    await expect(lockBadge).toContainText('LOCKED');

    const passwordInput = page.locator('input[type="password"]').first();
    await expect(passwordInput).toBeVisible();
    await passwordInput.fill('Kanele1994');

    const unlockBtn = page.locator('button[data-testid="total-dev-unlock-btn"]');
    await expect(unlockBtn).toBeEnabled();
    await unlockBtn.click();

    await expect(errorMsg).toBeVisible();
    await expect(errorMsg).toContainText('TOTAL_DEV requires the Tauri runtime');
    await expect(lockBadge).toContainText('LOCKED');
  });

  test('Unlock with incorrect password stays locked in browser fallback', async ({
    page,
  }) => {
    const lockBadge = page.locator('[data-testid="lock-badge"]');
    const errorMsg = page.locator('.total-dev-unlock-error');

    await expect(lockBadge).toContainText('LOCKED');

    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill('wrongpassword');

    const unlockBtn = page.locator('button[data-testid="total-dev-unlock-btn"]');
    await unlockBtn.click();

    await expect(errorMsg).toBeVisible();
    await expect(errorMsg).toContainText('TOTAL_DEV requires the Tauri runtime');
    await expect(lockBadge).toContainText('LOCKED');
  });
});
