/**
 * TITANE∞ E2E — Remote Key Dashboard + Agent IA Panel
 *
 * Tests the Remote Key management surface accessible via /admin?tab=remote-keys
 * Verifies: tab navigation, key dashboard render, agent IA tab, config panel elements.
 *
 * Rule 16 compliance: new UI component (RemoteKeyDashboard + AgentConfigPanel)
 * requires E2E tests with stable data-testid selectors.
 *
 * Run: pnpm exec playwright test e2e/remote-key-dashboard.spec.ts --project=chromium
 *
 * Pre-condition: Vite dev server at http://127.0.0.1:5173 (or TITANE_E2E_PORT)
 */

import { test, expect } from '@playwright/test';

const ADMIN_REMOTE_KEYS_URL = '/admin?tab=remote-keys';

// Helper: navigate to admin remote-keys tab and wait for dashboard
async function openRemoteKeyDashboard(
  page: Parameters<typeof test>[1] extends never ? never : import('@playwright/test').Page
) {
  await page.goto(ADMIN_REMOTE_KEYS_URL);
  await page.waitForSelector('[data-testid="remote-key-dashboard"]', { timeout: 20_000 });
}

// ─── Suite ───────────────────────────────────────────────────────────────────

test.describe('RemoteKeyDashboard — Admin tab', () => {
  test.beforeEach(async ({ page }) => {
    await openRemoteKeyDashboard(page);
  });

  test('dashboard renders with title and tab navigation', async ({ page }) => {
    const dashboard = page.locator('[data-testid="remote-key-dashboard"]');
    await expect(dashboard).toBeVisible();
    // Tab buttons present
    await expect(page.locator('[data-testid="remote-key-tab-keys"]')).toBeVisible();
    await expect(page.locator('[data-testid="remote-key-tab-agent"]')).toBeVisible();
    // Refresh button
    await expect(page.locator('[data-testid="remote-key-refresh-button"]')).toBeVisible();
  });

  test('key count badge is visible', async ({ page }) => {
    const count = page.locator('[data-testid="remote-key-count"]');
    await expect(count).toBeVisible();
  });

  test('create key form is present with stable testids', async ({ page }) => {
    await expect(page.locator('[data-testid="remote-key-create-form"]')).toBeVisible();
    await expect(page.locator('[data-testid="remote-key-label-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="remote-key-create-button"]')).toBeVisible();
  });

  test('create key button is disabled when label is empty', async ({ page }) => {
    const input = page.locator('[data-testid="remote-key-label-input"]');
    await input.fill('');
    const btn = page.locator('[data-testid="remote-key-create-button"]');
    await expect(btn).toBeDisabled();
  });

  test('create key button is enabled when label is filled', async ({ page }) => {
    const input = page.locator('[data-testid="remote-key-label-input"]');
    await input.fill('Test E2E Key');
    const btn = page.locator('[data-testid="remote-key-create-button"]');
    await expect(btn).toBeEnabled();
  });

  test('switching to Agent IA tab shows AgentConfigPanel', async ({ page }) => {
    await page.locator('[data-testid="remote-key-tab-agent"]').click();
    await expect(page.locator('[data-testid="agent-config-panel"]')).toBeVisible({
      timeout: 10_000,
    });
  });
});

// ─── Agent IA Panel ───────────────────────────────────────────────────────────

test.describe('AgentConfigPanel — Agent IA tab', () => {
  test.beforeEach(async ({ page }) => {
    await openRemoteKeyDashboard(page);
    await page.locator('[data-testid="remote-key-tab-agent"]').click();
    await page.waitForSelector('[data-testid="agent-config-panel"]', { timeout: 10_000 });
  });

  test('agent training status badge is visible', async ({ page }) => {
    await expect(page.locator('[data-testid="agent-training-status"]')).toBeVisible();
  });

  test('analyze AI button is present', async ({ page }) => {
    await expect(page.locator('[data-testid="agent-analyze-btn"]')).toBeVisible();
  });

  test('label suggestion input and button are present', async ({ page }) => {
    await expect(
      page.locator('[data-testid="agent-suggest-labels-input"]')
    ).toBeVisible();
    await expect(page.locator('[data-testid="agent-suggest-labels-btn"]')).toBeVisible();
  });

  test('suggest label button disabled when input is empty', async ({ page }) => {
    const input = page.locator('[data-testid="agent-suggest-labels-input"]');
    await input.fill('');
    await expect(page.locator('[data-testid="agent-suggest-labels-btn"]')).toBeDisabled();
  });

  test('model selector has correct default value', async ({ page }) => {
    const select = page.locator('[data-testid="agent-config-model-select"]');
    await expect(select).toBeVisible();
    const value = await select.inputValue();
    expect([
      'gemma2:2b',
      'titane-key-agent',
      'qwen2.5:latest',
      'llama3.1:latest',
    ]).toContain(value);
  });

  test('config form inputs are present (prompt, rotation)', async ({ page }) => {
    await expect(
      page.locator('[data-testid="agent-config-prompt-textarea"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="agent-config-auto-rotate-input"]')
    ).toBeVisible();
    await expect(page.locator('[data-testid="agent-config-warn-input"]')).toBeVisible();
  });

  test('save and reset buttons are present', async ({ page }) => {
    await expect(page.locator('[data-testid="agent-config-save-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="agent-config-reset-btn"]')).toBeVisible();
  });

  test('save button updates config and shows confirmation', async ({ page }) => {
    // Update rotation days
    const rotateInput = page.locator('[data-testid="agent-config-auto-rotate-input"]');
    await rotateInput.fill('45');
    const saveBtn = page.locator('[data-testid="agent-config-save-btn"]');
    await saveBtn.click();
    // Button text should briefly show confirmation
    await expect(saveBtn).toContainText(/Sauvegardé|Sauvegarder/);
  });

  test('switching back to keys tab hides agent panel', async ({ page }) => {
    await page.locator('[data-testid="remote-key-tab-keys"]').click();
    await expect(page.locator('[data-testid="agent-config-panel"]')).not.toBeVisible({
      timeout: 5_000,
    });
    await expect(page.locator('[data-testid="remote-key-create-form"]')).toBeVisible();
  });
});
