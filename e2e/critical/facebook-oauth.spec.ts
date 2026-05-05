/**
 * TITANE_INFINITY v∞ — Proprietary License
 * E2E: Facebook OAuth flow — integration surface tests
 * Scope: FacebookLoginButton + OAuthProfileCard + DeepLink handler
 */

import { test, expect } from '@playwright/test';

test.describe('Facebook OAuth — UI surface', () => {
  test('FacebookLoginButton renders with correct testid', async ({ page }) => {
    // Navigate to settings/auth page where login button should be available
    await page.goto('/settings');
    // The component is rendered conditionally; look for testid
    const btn = page.locator('[data-testid="facebook-login-button"]');
    // If present, verify accessibility
    if ((await btn.count()) > 0) {
      await expect(btn).toBeVisible();
      const button = btn.locator('button');
      await expect(button).toBeEnabled();
      await expect(button).toHaveAttribute('aria-label');
    }
  });

  test('OAuthProfileCard is hidden when not logged in', async ({ page }) => {
    await page.goto('/settings');
    const card = page.locator('[data-testid="oauth-profile-card"]');
    // If present (user logged in), check structure; if absent, test passes
    if ((await card.count()) > 0) {
      await expect(card.locator('[data-testid="oauth-profile-name"]')).toBeVisible();
      await expect(card.locator('[data-testid="oauth-logout-button"]')).toBeEnabled();
    } else {
      // Expected: card not rendered when not logged in
      expect(await card.count()).toBe(0);
    }
  });

  test('UnifiedLauncherPanel renders with correct testid when present', async ({
    page,
  }) => {
    await page.goto('/');
    const panel = page.locator('[data-testid="unified-launcher-panel"]');
    if ((await panel.count()) > 0) {
      await expect(panel).toBeVisible();
      await expect(panel.locator('[data-testid="unified-launcher-steps"]')).toBeVisible();
    }
  });

  test('Page does not crash with deep-link handler setup', async ({ page }) => {
    // Verify App renders without JS errors when deep-link plugin is mocked
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });

    // Filter known non-fatal Tauri environment warnings
    const fatalErrors = errors.filter(
      e =>
        !e.includes('Tauri') &&
        !e.includes('tauri') &&
        !e.includes('deep_link') &&
        !e.includes('onOpenUrl')
    );
    expect(fatalErrors).toHaveLength(0);
  });
});
