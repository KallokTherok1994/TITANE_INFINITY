import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('should pass axe checks', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toHaveLength(0);
  });

  test('should navigate with keyboard only', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Tab through elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Verify focus is visible
    const focused = await page.locator(':focus');
    await expect(focused).toHaveCSS('outline-width', /[^0]/);
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('[role="main"]')).toBeVisible();
    await expect(page.locator('[role="banner"]')).toBeVisible();
    const ariaElements = await page.locator('[aria-label]').count();
    expect(ariaElements).toBeGreaterThan(0);
  });
});
