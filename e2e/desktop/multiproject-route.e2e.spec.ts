import { test, expect } from '@playwright/test';

test.describe('Desktop: MultiProject route proof', () => {
  test('renders the canonical /multiproject route on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/multiproject');

    await expect(page.getByTestId('nav-top-main')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('multiproject-dashboard')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('multiproject-agent-status')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('multiproject-project-list')).toBeVisible({ timeout: 15000 });
  });
});