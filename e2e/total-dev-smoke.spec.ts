// TOTAL_DEV v28.1.0 — Smoke Test E2E
// Tests basic navigation, UI rendering, IPC integrity

import { test, expect } from '@playwright/test';

test.describe('TOTAL_DEV GOD DEV Sovereign Space', () => {
  test.beforeEach(async ({ page }) => {
    // Load the app
    await page.goto('/');
    // Wait for initial load ('networkidle' breaks: app polls Ollama continuously)
    await page.waitForLoadState('load');
  });

  test('Route /total-dev RENDERS and NAV shows TOTAL_DEV item', async ({ page }) => {
    // Navigate to /total-dev
    await page.goto('/total-dev');
    await page.waitForLoadState('load');
    // Wait for React hydration — lazy-loaded page may take extra time
    await page.waitForSelector('[data-testid="total-dev-header"]', { timeout: 10000 });

    // Verify page title or unique marker
    const heading = page.locator('[data-testid="total-dev-header"]');
    await expect(heading).toBeVisible({ timeout: 10000 });

    // Verify TOTAL_DEV nav item exists
    const navItem = page.locator('text=TOTAL_DEV').first();
    await expect(navItem).toBeVisible({ timeout: 10000 });
  });

  test('LockBadge renders with LOCKED state initially', async ({ page }) => {
    await page.goto('/total-dev');
    await page.waitForLoadState('load');

    // Check lock badge visibility
    const lockBadge = page.locator('[data-testid="lock-badge"]');
    await expect(lockBadge).toBeVisible();

    // Check lock status text
    const lockStatus = page.locator('text=LOCKED').first();
    await expect(lockStatus).toBeVisible();
  });

  test('UnlockPanel displays and accepts input', async ({ page }) => {
    await page.goto('/total-dev');
    await page.waitForLoadState('load');

    // Find password input
    const passwordInput = page.locator('input[placeholder*="unlock"]').first();
    await expect(passwordInput).toBeVisible();

    // Try entering incorrect password (should not unlock)
    await passwordInput.fill('wrong');
    const submitBtn = page.locator('button:has-text("UNLOCK")');
    await submitBtn.click();

    // Lock badge should still show LOCKED (after 2s)
    await page.waitForTimeout(1000);
    const lockStatus = page.locator('text=LOCKED').first();
    await expect(lockStatus).toBeVisible();
  });

  test('Tabs (Chat, Console, Git, Files, Actions) render correctly', async ({ page }) => {
    // BLOCKED_TAURI: tabs only render after TOTAL_DEV UNLOCK (Tauri IPC SHA-256)
    // Must be certified via pnpm e2e:desktop with built binary
    test.skip(true, 'BLOCKED_TAURI: tab area requires lockState=UNLOCKED via Tauri IPC');
  });

  test('ChatDevPanel loads with QWEN-Coder context', async ({ page }) => {
    await page.goto('/total-dev');
    await page.waitForLoadState('load');

    // ChatDevPanel is rendered in locked state inside total-dev-locked-chat
    // The textarea and send button are always visible (not gated behind unlock)
    const chatInput = page.locator('textarea.total-dev-chat-input');
    await expect(chatInput).toBeVisible({ timeout: 5000 });

    // Verify SEND button
    const sendBtn = page.locator('button.total-dev-btn--primary');
    await expect(sendBtn).toBeVisible();
  });

  test('ConsoleDevPanel structure correct', async ({ page }) => {
    // BLOCKED_TAURI: ConsoleDevPanel tab only renders after TOTAL_DEV UNLOCK
    test.skip(
      true,
      'BLOCKED_TAURI: console tab requires lockState=UNLOCKED via Tauri IPC'
    );
  });

  test('DevActionsPanel shows 12 action buttons', async ({ page }) => {
    // BLOCKED_TAURI: DevActionsPanel tab only renders after TOTAL_DEV UNLOCK
    test.skip(
      true,
      'BLOCKED_TAURI: actions tab requires lockState=UNLOCKED via Tauri IPC'
    );
  });

  test('No console errors in TOTAL_DEV page', async ({ page, context }) => {
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/total-dev');
    await page.waitForLoadState('load');
    await page.waitForTimeout(2000);

    // Filter out expected CORS, external, Tauri-IPC-not-available errors (browser mode),
    // and known browser-mode security whitelist errors (load_ui_theme, total_dev_session_status)
    const criticalErrors = errors.filter(
      e =>
        !e.includes('CORS') &&
        !e.includes('Failed to fetch') &&
        !e.includes('Ollama') &&
        !e.includes('invoke') &&
        !e.includes('__TAURI__') &&
        !e.includes('tauri') &&
        !e.includes('IPC') &&
        !e.includes('ipc') &&
        !e.includes('[Security]') &&
        !e.includes('[Monitoring]') &&
        !e.includes('[UIThemeProvider]') &&
        !e.includes('whitelist') &&
        !e.includes('load_ui_theme') &&
        !e.includes('total_dev_session_status')
    );

    expect(criticalErrors.length).toBe(0);
  });

  test('Route persists on navigation away and back', async ({ page }) => {
    await page.goto('/total-dev');
    await page.waitForLoadState('load');

    // Navigate to home
    await page.goto('/');
    await page.waitForLoadState('load');

    // Navigate back to /total-dev
    await page.goto('/total-dev');
    await page.waitForLoadState('load');

    // TOTAL_DEV should still be visible
    const heading = page.locator('[data-testid="total-dev-header"]');
    await expect(heading).toBeVisible({ timeout: 10000 });
  });
});
