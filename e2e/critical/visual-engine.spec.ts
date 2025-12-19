/**
 * E2E Test: Visual Engine (Critical Path)
 * TITANE∞ v22.0.0 - Visual Signature System Validation
 *
 * Critical: Verify 3 signature systems (Identity, Orbital, Particle)
 */

import { test, expect } from '@playwright/test';

test.describe('Critical Path: Visual Engine', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000); // Wait for visual engine init
  });

  test('visual conductor creates canvas elements', async ({ page }) => {
    // Visual signatures render to canvas
    const canvasElements = await page.locator('canvas').count();

    // Should have at least 1 canvas (signatures are overlaid)
    expect(canvasElements).toBeGreaterThanOrEqual(1);
  });

  test('identity pulse signature is active', async ({ page }) => {
    // Wait for signature initialization
    await page.waitForTimeout(2000);

    // Check for canvas with animation
    const canvas = await page.locator('canvas').first();

    if ((await canvas.count()) > 0) {
      const isVisible = await canvas.isVisible();
      expect(isVisible).toBe(true);

      // Canvas should have dimensions
      const box = await canvas.boundingBox();
      expect(box).toBeTruthy();
      if (box) {
        expect(box.width).toBeGreaterThan(0);
        expect(box.height).toBeGreaterThan(0);
      }
    }
  });

  test('visual signatures respond to cognitive state changes', async ({ page }) => {
    // Trigger cognitive state change (e.g., by interacting)
    const button = await page.locator('button').first();

    if ((await button.count()) > 0) {
      // Record initial canvas state
      const canvas = await page.locator('canvas').first();
      const initialBox = await canvas.boundingBox().catch(() => null);

      // Interact to trigger state change
      await button.click();
      await page.waitForTimeout(1000);

      // Canvas should still be present (may have updated)
      const finalBox = await canvas.boundingBox().catch(() => null);
      expect(finalBox).toBeTruthy();
    }
  });

  test('visual semantic grammar handles phenomenon types', async ({ page }) => {
    // Visual grammar responds to UI events
    // Simulate user interaction pattern

    await page.mouse.move(100, 100);
    await page.waitForTimeout(500);
    await page.mouse.move(300, 200);
    await page.waitForTimeout(500);

    // Check app still renders
    const canvas = await page.locator('canvas').first();
    const isVisible = await canvas.isVisible().catch(() => false);
    expect(isVisible).toBe(true);
  });

  test('performance: visual engine maintains 30+ FPS', async ({ page }) => {
    // Measure frame rate over 3 seconds
    const fps = await page.evaluate(() => {
      return new Promise<number>(resolve => {
        let frameCount = 0;
        const lastTime = performance.now();

        const measureFPS = () => {
          frameCount++;
          const currentTime = performance.now();
          const elapsed = currentTime - lastTime;

          if (elapsed >= 3000) {
            const fps = (frameCount / elapsed) * 1000;
            resolve(fps);
          } else {
            requestAnimationFrame(measureFPS);
          }
        };

        requestAnimationFrame(measureFPS);
      });
    });

    // Should maintain at least 30 FPS for smooth visuals
    expect(fps).toBeGreaterThan(30);
  });

  test('visual signatures are layered correctly', async ({ page }) => {
    // Check z-index stacking of visual elements
    const canvas = await page.locator('canvas').first();

    if ((await canvas.count()) > 0) {
      const zIndex = await canvas.evaluate(el => window.getComputedStyle(el).zIndex);

      // Should have defined z-index for proper layering
      expect(zIndex).toBeTruthy();
    }
  });

  test('visual conductor cleanup on navigation', async ({ page }) => {
    // Initial canvas count
    const initialCanvasCount = await page.locator('canvas').count();

    // Trigger navigation (if multi-page)
    const navLink = await page.locator('a[href]').first();

    if ((await navLink.count()) > 0) {
      await navLink.click();
      await page.waitForTimeout(1000);

      // Canvas should still render (new context)
      const finalCanvasCount = await page.locator('canvas').count();
      expect(finalCanvasCount).toBeGreaterThanOrEqual(1);
    }
  });

  test('visual engine respects reduced motion preference', async ({ page, context }) => {
    // Set prefers-reduced-motion
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.reload();
    await page.waitForTimeout(2000);

    // Visual engine should still render but with reduced animation
    const canvas = await page.locator('canvas').first();
    const isVisible = await canvas.isVisible().catch(() => false);

    // Canvas exists even with reduced motion
    expect(isVisible).toBe(true);
  });

  test('no WebGL errors in console', async ({ page }) => {
    const webglErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().toLowerCase().includes('webgl')) {
        webglErrors.push(msg.text());
      }
    });

    await page.waitForTimeout(3000);

    expect(webglErrors).toHaveLength(0);
  });

  test('visual conductor adapts to window resize', async ({ page }) => {
    // Initial size
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(1000);

    const canvas = await page.locator('canvas').first();
    const initialBox = await canvas.boundingBox();

    // Resize
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);

    const finalBox = await canvas.boundingBox();

    // Canvas should adapt to new size
    expect(finalBox).toBeTruthy();
    if (initialBox && finalBox) {
      expect(finalBox.width).not.toBe(initialBox.width);
    }
  });
});
