/**
 * TITANE_INFINITY v34.3.0 — Command Palette E2E (Rule 16).
 *
 * Critical path: ⌘K opens the palette, typing filters items, navigating to
 * the Monitoring agent dashboard lands on /sentinel.
 */
import { test, expect } from '@playwright/test';

test.describe('Command Palette ⌘K', () => {
  test('opens with Ctrl+K, filters, navigates to monitoring dashboard', async ({ page }) => {
    await page.goto('/titane');
    await page.waitForLoadState('domcontentloaded');

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
