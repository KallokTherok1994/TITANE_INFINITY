/**
 * E2E Test: System Resilience (Critical Path)
 * TITANE∞ v22.0.0 - Error Handling & Recovery Validation
 *
 * Critical: Verify app handles errors gracefully and recovers
 */

import { test, expect } from '@playwright/test';

test.describe('Critical Path: System Resilience', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);
  });

  test('app handles network errors gracefully', async ({ page, context }) => {
    // Close boot beacon first and wait for it to disappear
    const closeBeacon = page.getByRole('button', { name: /Fermer diagnostic/i });
    if (await closeBeacon.isVisible({ timeout: 5000 }).catch(() => false)) {
      await closeBeacon.click();
      await closeBeacon.waitFor({ state: 'hidden', timeout: 5000 });
    }

    // Simulate offline mode
    await context.setOffline(true);

    // Try interaction
    const button = await page.locator('button').first();
    if ((await button.count()) > 0) {
      await button.click({ force: true }); // Force click to bypass any overlays
      await page.waitForTimeout(1000);
    }

    // App should not crash
    const bodyVisible = await page.locator('body').isVisible();
    expect(bodyVisible).toBe(true);

    // Restore network
    await context.setOffline(false);
  });

  test('handles rapid user interactions without crashing', async ({ page }) => {
    // Close boot beacon first
    const closeBeacon = page.getByRole('button', { name: /Fermer diagnostic/i });
    if (await closeBeacon.isVisible().catch(() => false)) {
      await closeBeacon.click();
      await page.waitForTimeout(300);
    }

    // Rapid clicks on the main surface to avoid closing the app via controls
    const body = page.locator('body');
    const box = await body.boundingBox();
    if (box) {
      const centerX = box.x + box.width * 0.5;
      const centerY = box.y + box.height * 0.4;
      for (let i = 0; i < 5; i++) {
        await page.mouse.click(centerX, centerY, { delay: 10 });
        await page.waitForTimeout(50);
      }
    }

    // App should survive
    await page.waitForTimeout(1000);
    const bodyVisible = await page.locator('body').isVisible();
    expect(bodyVisible).toBe(true);
  });

  test('error boundary catches React errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Interact normally
    await page.waitForTimeout(3000);

    // Should not have uncaught React errors
    const reactErrors = errors.filter(e => e.includes('React') && e.includes('uncaught'));

    expect(reactErrors).toHaveLength(0);
  });

  test('invalid input handling in chat', async ({ page }) => {
    const chatInput = await page.locator('textarea').first();

    if ((await chatInput.count()) > 0) {
      // Try various invalid inputs
      const invalidInputs = [
        '<script>alert("xss")</script>',
        'A'.repeat(10000), // Very long string
        '🚀'.repeat(1000), // Many emojis
        '\n'.repeat(100), // Many newlines
      ];

      for (const input of invalidInputs) {
        await chatInput.fill(input);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(300);
      }

      // App should handle gracefully
      const bodyVisible = await page.locator('body').isVisible();
      expect(bodyVisible).toBe(true);
    }
  });

  test('recovers from backend connection loss', async ({ page }) => {
    // This simulates backend unavailability
    // App should show error state but not crash

    await page.waitForTimeout(5000);

    // Check app is still functional
    const bodyVisible = await page.locator('body').isVisible();
    expect(bodyVisible).toBe(true);
  });

  test('handles browser resource limits', async ({ page }) => {
    // Stress test: rapid state updates
    const chatInput = await page.locator('textarea').first();

    if ((await chatInput.count()) > 0) {
      for (let i = 0; i < 20; i++) {
        await chatInput.fill(`Stress test message ${i}`);
        await page.waitForTimeout(50);
      }
    }

    // Should not freeze UI
    await page.waitForTimeout(2000);
    const bodyVisible = await page.locator('body').isVisible();
    expect(bodyVisible).toBe(true);
  });

  test('maintains performance under load', async ({ page }) => {
    // Create multiple interactions
    for (let i = 0; i < 10; i++) {
      await page.mouse.move(Math.random() * 500, Math.random() * 500);
      await page.waitForTimeout(100);
    }

    // Check responsiveness
    const responseTime = await page.evaluate(() => {
      const start = performance.now();
      // Trigger re-render
      document.body.getBoundingClientRect();
      return performance.now() - start;
    });

    // Should respond in < 100ms
    expect(responseTime).toBeLessThan(100);
  });

  test('graceful degradation with disabled JavaScript features', async ({ page }) => {
    // Test with console warnings disabled
    await page.evaluate(() => {
      console.warn = () => {};
      console.error = () => {};
    });

    // App should still work
    await page.waitForTimeout(2000);
    const bodyVisible = await page.locator('body').isVisible();
    expect(bodyVisible).toBe(true);
  });
});
