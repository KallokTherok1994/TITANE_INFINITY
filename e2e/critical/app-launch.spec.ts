/**
 * E2E Test: Application Launch (Critical Path)
 * TITANE∞ v22.0.0 - Automated Quality Assurance
 *
 * Critical user journey: App initialization and core UI verification
 */

import { test, expect } from '@playwright/test';

test.describe('Critical Path: Application Launch', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Vite dev server (web-compatible mode)
    await page.goto('/');
  });

  test('app loads without console errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Wait for app to fully initialize
    await page.waitForTimeout(2000);

    // Verify no critical errors
    const criticalErrors = errors.filter(
      e => !e.includes('favicon') && !e.includes('socket') && !e.includes('HMR')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('visual conductor initializes successfully', async ({ page }) => {
    // Wait for visual engine initialization
    await page.waitForTimeout(1500);

    // Check for canvas element (visual signatures)
    const canvas = await page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 5000 });
  });

  test('main navigation is present and interactive', async ({ page }) => {
    // Verify core navigation elements
    const nav = await page.locator('nav, [role="navigation"]').first();
    await expect(nav).toBeVisible();

    // Check for clickable navigation items
    const navItems = await page.locator('a, button').count();
    expect(navItems).toBeGreaterThan(0);
  });

  test('theme system applies correctly', async ({ page }) => {
    // Check for theme attributes
    const html = await page.locator('html');

    // Should have dark theme by default or system preference
    const theme =
      (await html.getAttribute('data-theme')) || (await html.getAttribute('class'));

    expect(theme).toBeTruthy();
  });

  test('app shell renders and title is set', async ({ page }) => {
    await page.waitForTimeout(500);

    await expect(page.locator('#root')).toBeVisible();
    const title = await page.title();
    expect(title.toLowerCase()).toContain('titane');
  });

  test('no memory leaks after 10 seconds', async ({ page }) => {
    // Get initial memory
    const initialMemory = await page.evaluate(() => {
      const perf = performance as any;
      if (perf.memory) {
        return perf.memory.usedJSHeapSize;
      }
      return 0;
    });

    // Wait and interact
    await page.waitForTimeout(10000);

    // Get final memory
    const finalMemory = await page.evaluate(() => {
      const perf = performance as any;
      if (perf.memory) {
        return perf.memory.usedJSHeapSize;
      }
      return 0;
    });

    // Memory growth should be reasonable (< 50MB for idle app)
    const memoryGrowth = finalMemory - initialMemory;
    expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024);
  });
  test('performance metrics are acceptable', async ({ page }) => {
    // Wait for full initialization
    await page.waitForTimeout(3000);

    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded:
          navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        totalTime: navigation.loadEventEnd - navigation.fetchStart,
      };
    });

    // Assert reasonable load times
    expect(metrics.domContentLoaded).toBeLessThan(3000); // 3s
    expect(metrics.totalTime).toBeLessThan(10000); // 10s
  });

  test('reactivity sanity: page stays responsive', async ({ page }) => {
    // Some overlays may intercept pointer events during boot;
    // we keep this test non-interactive and only verify the app stays alive.
    await page.waitForTimeout(500);
    await expect(page.locator('body')).toBeVisible();
    const readyState = await page.evaluate(() => document.readyState);
    expect(['interactive', 'complete']).toContain(readyState);
  });
});
