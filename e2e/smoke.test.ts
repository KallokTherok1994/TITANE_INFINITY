/**
 * Smoke Tests (v19.0 Task 7)
 *
 * Basic app functionality tests
 */

import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('app launches without errors', async ({ page }) => {
    // Note: In real Tauri E2E, you'd launch the Tauri binary
    // For now, we'll test against dev server or built app
    await page.goto('http://localhost:1420'); // Tauri dev server default

    // Check app loaded
    await expect(page).toHaveTitle(/TITANE/i);

    // Check no console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Wait for app to initialize
    await page.waitForTimeout(2000);

    expect(errors).toHaveLength(0);
  });

  test('navigation works correctly', async ({ page }) => {
    await page.goto('http://localhost:1420');

    // Check main navigation links exist
    const navLinks = page.locator('nav a');
    await expect(navLinks).not.toHaveCount(0);
  });

  test('dark theme is applied by default', async ({ page }) => {
    await page.goto('http://localhost:1420');

    // Check for dark theme class or CSS variable
    const html = page.locator('html');
    const isDark = await html.evaluate((el) => {
      return el.classList.contains('dark') ||
             getComputedStyle(el).getPropertyValue('--theme').includes('dark');
    });

    expect(isDark).toBeTruthy();
  });
});
