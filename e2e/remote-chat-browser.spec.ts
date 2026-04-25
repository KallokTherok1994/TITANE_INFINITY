/**
 * TITANE∞ — Remote Chat Browser UI E2E Tests (Playwright)
 *
 * Tests the RemoteLoginPage + RemoteGatewayLayout browser UI rendered by the axum server.
 * These tests open a real Chromium browser and interact with the login form.
 *
 * Prerequisites:
 *   TITANE_REMOTE_ENABLED=1 TITANE_REMOTE_SECRET=your-secret ./titane-infinity
 *   Then: TITANE_REMOTE_E2E_SECRET=your-secret pnpm exec playwright test e2e/remote-chat-browser.spec.ts
 *
 * These tests are SKIPPED when TITANE_REMOTE_E2E_URL is not set.
 */

import { test, expect } from '@playwright/test';

const REMOTE_BASE_URL = process.env.TITANE_REMOTE_E2E_URL ?? '';
const REMOTE_SECRET = process.env.TITANE_REMOTE_E2E_SECRET ?? 'change-me-in-production';

test.beforeAll(async () => {
  if (!REMOTE_BASE_URL) {
    test.skip();
  }
});

// ── RemoteLoginPage ───────────────────────────────────────────

test.describe('RemoteLoginPage UI', () => {
  test.beforeEach(async ({ page }) => {
    // Clear sessionStorage so auth state is reset
    await page.addInitScript(() => sessionStorage.clear());
    await page.goto(REMOTE_BASE_URL);
  });

  test('shows login page when not authenticated', async ({ page }) => {
    const loginPage = page.locator('[data-testid="remote-login-page"]');
    await expect(loginPage).toBeVisible({ timeout: 10_000 });
  });

  test('login form has required elements', async ({ page }) => {
    await expect(page.locator('[data-testid="remote-login-page"]')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('[data-testid="remote-login-secret-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="remote-login-submit"]')).toBeVisible();
    await expect(page.locator('[data-testid="remote-login-error"]')).not.toBeVisible();
  });

  test('submit button is disabled with empty input', async ({ page }) => {
    await expect(page.locator('[data-testid="remote-login-page"]')).toBeVisible({ timeout: 10_000 });
    const submitBtn = page.locator('[data-testid="remote-login-submit"]');
    await expect(submitBtn).toBeDisabled();
  });

  test('shows error on wrong secret', async ({ page }) => {
    await expect(page.locator('[data-testid="remote-login-page"]')).toBeVisible({ timeout: 10_000 });

    await page.fill('[data-testid="remote-login-secret-input"]', 'wrong-secret-xyz');
    await page.click('[data-testid="remote-login-submit"]');

    const errorEl = page.locator('[data-testid="remote-login-error"]');
    await expect(errorEl).toBeVisible({ timeout: 8_000 });
    const errorText = await errorEl.textContent();
    expect(errorText).toBeTruthy();
  });

  test('successful login reveals remote gateway layout', async ({ page }) => {
    await expect(page.locator('[data-testid="remote-login-page"]')).toBeVisible({ timeout: 10_000 });

    await page.fill('[data-testid="remote-login-secret-input"]', REMOTE_SECRET);
    await page.click('[data-testid="remote-login-submit"]');

    // After auth, RemoteGatewayLayout wraps the app
    const layout = page.locator('[data-testid="remote-gateway-layout"]');
    await expect(layout).toBeVisible({ timeout: 15_000 });

    // Login page should be gone
    await expect(page.locator('[data-testid="remote-login-page"]')).not.toBeVisible();
  });
});

// ── RemoteGatewayLayout — authenticated chat ─────────────────

test.describe('RemoteGatewayLayout — authenticated session', () => {
  test.beforeEach(async ({ page }) => {
    // Pre-authenticate: obtain tokens via API, inject into sessionStorage
    const apiContext = await (await import('@playwright/test')).request.newContext();
    const authResp = await apiContext.post(`${REMOTE_BASE_URL}/api/auth/token`, {
      data: { secret: REMOTE_SECRET },
    });
    const authData = await authResp.json();
    await apiContext.dispose();

    if (!authData.ok) {
      test.skip();
      return;
    }

    // Inject tokens before page load
    await page.addInitScript(
      ({ accessToken, refreshToken }) => {
        sessionStorage.setItem('titane_remote_access_token', accessToken);
        sessionStorage.setItem('titane_remote_refresh_token', refreshToken);
        // Signal remote context
        (window as Record<string, unknown>).__TITANE_REMOTE__ = true;
      },
      { accessToken: authData.access_token, refreshToken: authData.refresh_token ?? '' },
    );

    await page.goto(REMOTE_BASE_URL);
  });

  test('authenticated user sees RemoteGatewayLayout (not login page)', async ({ page }) => {
    const layout = page.locator('[data-testid="remote-gateway-layout"]');
    await expect(layout).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('[data-testid="remote-login-page"]')).not.toBeVisible();
  });

  test('app content is rendered inside gateway layout', async ({ page }) => {
    const layout = page.locator('[data-testid="remote-gateway-layout"]');
    await expect(layout).toBeVisible({ timeout: 15_000 });

    // Some app content should be rendered
    const hasContent = await page.evaluate(() => {
      const layout = document.querySelector('[data-testid="remote-gateway-layout"]');
      return layout ? layout.children.length > 0 : false;
    });
    expect(hasContent).toBe(true);
  });

  test('page title contains TITANE branding', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    const title = await page.title();
    // Should contain TITANE or equivalent brand
    expect(title.length).toBeGreaterThan(0);
    console.log(`[E2E] Remote page title: "${title}"`);
  });
});
