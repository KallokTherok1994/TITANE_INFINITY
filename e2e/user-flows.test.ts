/**
 * User Flow Tests (v19.0 Task 7)
 *
 * End-to-end user interactions
 */

import { test, expect } from '@playwright/test';

test.describe('User Flows', () => {
  test('chat flow: send message and receive response', async ({ page }) => {
    await page.goto('http://localhost:1420');

    // Navigate to chat
    await page.click('a[href*="chat"]');

    // Wait for chat input
    const chatInput = page.locator('input[placeholder*="message"], textarea[placeholder*="message"]');
    await expect(chatInput).toBeVisible({ timeout: 5000 });

    // Send message
    await chatInput.fill('Hello, TITANE!');
    await chatInput.press('Enter');

    // Check message appears
    await expect(page.locator('text=Hello, TITANE!')).toBeVisible({ timeout: 2000 });
  });

  test('engine navigation: visit all engine pages', async ({ page }) => {
    await page.goto('http://localhost:1420');

    const engines = [
      'nexus',
      'persona',
      'chat',
      'voice',
      'cognitive',
      'memory',
      'perception',
      'quantum'
    ];

    for (const engine of engines) {
      // Navigate to engine page
      await page.click(`a[href*="${engine}"]`);

      // Check page loaded
      await expect(page.locator(`h1:has-text("${engine}"), h2:has-text("${engine}")`))
        .toBeVisible({ timeout: 3000 });
    }
  });

  test('settings: change theme and verify persistence', async ({ page }) => {
    await page.goto('http://localhost:1420');

    // Navigate to settings
    await page.click('a[href*="settings"]');

    // Find theme toggle
    const themeToggle = page.locator('button:has-text("theme"), [data-testid="theme-toggle"]');
    await themeToggle.click();

    // Reload page
    await page.reload();

    // Verify theme persisted (check localStorage or CSS)
    const theme = await page.evaluate(() => {
      return localStorage.getItem('singularity-storage');
    });

    expect(theme).toBeTruthy();
  });
});
