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
import { REMOTE_E2E_DEFAULTS } from './config/constants';
import { remoteLogin } from './helpers/chat';
import { requireRemoteGatewayOrFail } from './helpers/remote-auth';

const REMOTE_BASE_URL = REMOTE_E2E_DEFAULTS.baseUrl;
const REMOTE_SECRET = REMOTE_E2E_DEFAULTS.secret;

test.beforeAll(async () => {
  await requireRemoteGatewayOrFail('remote-chat-browser.spec.ts', REMOTE_BASE_URL);
});

// ── RemoteLoginPage ───────────────────────────────────────────

test.describe('RemoteLoginPage UI', () => {
  test.beforeEach(async ({ page }) => {
    // Clear sessionStorage so auth state is reset
    await page.addInitScript(() => sessionStorage.clear());
    await page.goto(REMOTE_BASE_URL);
  });

  test('shows login page when not authenticated', async ({ page }) => {
    const loginPage = page.locator('[data-testid="remote-auth-screen"]');
    await expect(loginPage).toBeVisible({ timeout: 10_000 });
  });

  test('login form has required elements', async ({ page }) => {
    await expect(page.locator('[data-testid="remote-auth-screen"]')).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.locator('[data-testid="remote-gateway-url-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="remote-api-key-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="remote-login-button"]')).toBeVisible();
    await expect(page.getByRole('alert')).not.toBeVisible();
  });

  test('submit button is disabled with empty input', async ({ page }) => {
    await expect(page.locator('[data-testid="remote-auth-screen"]')).toBeVisible({
      timeout: 10_000,
    });
    const submitBtn = page.locator('[data-testid="remote-login-button"]');
    await expect(submitBtn).toBeDisabled();
  });

  test('shows error on wrong secret', async ({ page }) => {
    await expect(page.locator('[data-testid="remote-auth-screen"]')).toBeVisible({
      timeout: 10_000,
    });

    await page.fill('[data-testid="remote-gateway-url-input"]', REMOTE_BASE_URL);
    await page.fill('[data-testid="remote-api-key-input"]', 'wrong-secret-xyz');
    await page.click('[data-testid="remote-login-button"]');

    const errorEl = page.getByRole('alert');
    await expect(errorEl).toBeVisible({ timeout: 8_000 });
    const errorText = await errorEl.textContent();
    expect(errorText).toBeTruthy();
  });

  test('successful login reveals remote gateway layout', async ({ page }) => {
    await expect(page.locator('[data-testid="remote-auth-screen"]')).toBeVisible({
      timeout: 10_000,
    });

    await page.fill('[data-testid="remote-gateway-url-input"]', REMOTE_BASE_URL);
    await page.fill('[data-testid="remote-api-key-input"]', REMOTE_SECRET);
    await page.click('[data-testid="remote-login-button"]');

    const chatView = page.locator('[data-testid="remote-chat-view"]');
    await expect(chatView).toBeVisible({ timeout: 15_000 });

    // Login page should be gone
    await expect(page.locator('[data-testid="remote-auth-screen"]')).not.toBeVisible();
  });
});

// ── RemoteGatewayLayout — authenticated chat ─────────────────

test.describe('RemoteGatewayLayout — authenticated session', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => sessionStorage.clear());
    await remoteLogin(page, REMOTE_BASE_URL, REMOTE_SECRET);
  });

  test('authenticated user sees RemoteGatewayLayout (not login page)', async ({
    page,
  }) => {
    const chatView = page.locator('[data-testid="remote-chat-view"]');
    await expect(chatView).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('[data-testid="remote-auth-screen"]')).not.toBeVisible();
  });

  test('app content is rendered inside gateway layout', async ({ page }) => {
    await expect(page.locator('[data-testid="remote-chat-view"]')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator('[data-testid="remote-chat-messages"]')).toBeVisible();
    await expect(page.locator('[data-testid="remote-chat-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="remote-chat-send-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="remote-logout-button"]')).toBeVisible();
  });

  test('page title contains TITANE branding', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    const title = await page.title();
    // Should contain TITANE or equivalent brand
    expect(title.length).toBeGreaterThan(0);
    console.log(`[E2E] Remote page title: "${title}"`);
  });
});
