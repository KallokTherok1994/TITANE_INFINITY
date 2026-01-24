import { test, expect } from '@playwright/test';

test.describe('Internationalization', () => {
  test('should switch to English', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Select English
    await page.selectOption('select.language-switcher', 'en');

    // Verify English text
    await expect(page.locator('button[type="submit"]')).toContainText('Send');
  });

  test('should default to French', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Verify French text
    await expect(page.locator('button[type="submit"]')).toContainText('Envoyer');
  });

  test('should persist language choice', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Switch to English
    await page.selectOption('select.language-switcher', 'en');

    // Reload page
    await page.reload();

    // Verify still English
    await expect(page.locator('button[type="submit"]')).toContainText('Send');
  });
});
