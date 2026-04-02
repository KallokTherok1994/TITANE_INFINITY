// TOTAL_DEV v28.1.0 — Unlock Smoke Test
// Test du déverrouillage avec mot de passe correct

import { test, expect } from '@playwright/test';

test.describe('TOTAL_DEV Unlock Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/total-dev');
    await page.waitForLoadState('load');
    await page.waitForSelector('[data-testid="total-dev-header"]', { timeout: 10000 });
  });

  test('Unlock with correct password Kanele1994', async ({ page }) => {
    // Verify initial LOCKED state
    const lockBadge = page.locator('[data-testid="lock-badge"]');
    await expect(lockBadge).toContainText('LOCKED');

    // Find password input and fill with correct password
    const passwordInput = page.locator('input[type="password"]').first();
    await expect(passwordInput).toBeVisible();
    await passwordInput.fill('Kanele1994');

    // Click UNLOCK button
    const unlockBtn = page.locator('button[data-testid="total-dev-unlock-btn"]');
    await expect(unlockBtn).toBeEnabled();
    await unlockBtn.click();

    // Wait for unlock to complete (badge should change to UNLOCKED)
    await page.waitForTimeout(2000);

    // Verify badge now shows UNLOCKED
    await expect(lockBadge).toContainText('UNLOCKED');

    // Verify tabs are now visible (unlocked state)
    const consoleTab = page.locator('button[data-testid="total-dev-tab-console"]');
    const gitTab = page.locator('button[data-testid="total-dev-tab-git"]');
    const filesTab = page.locator('button[data-testid="total-dev-tab-files"]');
    const actionsTab = page.locator('button[data-testid="total-dev-tab-actions"]');

    await expect(consoleTab).toBeVisible();
    await expect(gitTab).toBeVisible();
    await expect(filesTab).toBeVisible();
    await expect(actionsTab).toBeVisible();
  });

  test('Unlock fails with incorrect password', async ({ page }) => {
    // Verify initial LOCKED state
    const lockBadge = page.locator('[data-testid="lock-badge"]');
    await expect(lockBadge).toContainText('LOCKED');

    // Fill with wrong password
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill('wrongpassword');

    const unlockBtn = page.locator('button[data-testid="total-dev-unlock-btn"]');
    await unlockBtn.click();

    // Wait for error message
    await page.waitForTimeout(1000);

    // Verify still LOCKED
    await expect(lockBadge).toContainText('LOCKED');

    // Verify error message appears
    const errorMsg = page.locator('.total-dev-unlock-error');
    await expect(errorMsg).toBeVisible();
    await expect(errorMsg).toContainText('Token invalide');
  });
});
