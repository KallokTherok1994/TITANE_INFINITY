import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Accessibility', () => {
  test('should pass axe checks', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await injectAxe(page);
    await checkA11y(page);
  });

  test('should navigate with keyboard only', async ({ page }) => {
    await page.goto('http://localhost:5173');

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

    await expect(page.locator('[role="main"]')).toBeVisible();
    await expect(page.locator('[role="banner"]')).toBeVisible();
    await expect(page.locator('[aria-label]')).toHaveCount.greaterThan(0);
  });
});
