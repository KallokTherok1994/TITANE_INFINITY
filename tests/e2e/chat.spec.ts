import { test, expect } from '@playwright/test';

test.describe('Chat Interface', () => {
  test('should send and receive message', async ({ page }) => {
    await page.goto('http://localhost:1420');

    // Wait for app to load
    await expect(page.locator('h1')).toContainText('TITANE');

    // Type message
    const input = page.locator('input[type="text"]');
    await input.fill('Hello, TITANE!');

    // Send message
    await page.locator('button[type="submit"]').click();

    // Verify message appears
    await expect(page.locator('.message')).toContainText('Hello, TITANE!');
  });

  test('should handle new conversation', async ({ page }) => {
    await page.goto('http://localhost:1420');

    // Click new conversation
    await page.keyboard.press('Control+n');

    // Verify new conversation started
    await expect(page.locator('.conversation-list')).toHaveCount(2);
  });

  test('should validate keyboard shortcuts', async ({ page }) => {
    await page.goto('http://localhost:1420');

    // Open search with Ctrl+K
    await page.keyboard.press('Control+k');
    await expect(page.locator('#search-input')).toBeFocused();

    // Close modal with Escape
    await page.keyboard.press('Escape');
    await expect(page.locator('.modal')).not.toBeVisible();
  });
});
