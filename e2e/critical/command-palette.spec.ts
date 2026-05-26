/**
 * TITANE_INFINITY v34.3.0 — Command Palette E2E (Rule 16).
 *
 * Critical path: ⌘K opens the palette, typing filters items, navigating to
 * the Monitoring agent dashboard lands on /sentinel.
 */
import { test, expect } from '@playwright/test';

test.describe('Command Palette ⌘K', () => {
  test('opens with Ctrl+K, filters, navigates to monitoring dashboard', async ({
    page,
  }) => {
    await page.goto('/titane');
    await page.waitForLoadState('domcontentloaded');
    // v35.1.2 — wait for React app-ready beacon before keyboard event;
    // domcontentloaded alone fires before Suspense lazy resolution and the
    // CommandPalette window keydown handler may not yet be registered.
    await page.waitForSelector('[data-testid="app-ready"][data-state="ready"]', {
      state: 'attached',
      timeout: 10_000,
    });

    await page.keyboard.press('Control+K');
    const input = page.getByTestId('command-palette-input');
    await expect(input).toBeVisible({ timeout: 5_000 });

    await input.fill('monitoring');
    const item = page.getByTestId('command-item-agent-monitoring');
    await expect(item).toBeVisible();
    await item.click();

    await expect(page).toHaveURL(/\/sentinel/);
  });
});
