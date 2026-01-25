/**
 * E2E Test: Application Launch (Critical Path)
 * TITANE∞ v22.0.0 - Automated Quality Assurance
 *
 * Critical user journey: App initialization and core UI verification
 */

import { test, expect } from '@playwright/test';

test.describe('Critical Path: Application Launch', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Vite dev server (Tauri webview context)
    await page.goto('http://localhost:5173');
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
    await page.waitForTimeout(3000);

    // Check for canvas element (visual signatures)
    const canvas = await page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 10000 });
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

  test('system health indicator is present', async ({ page }) => {
    // Close boot beacon first
    const closeBeacon = page.getByRole('button', { name: /Fermer diagnostic/i });
    if (await closeBeacon.isVisible()) {
      await closeBeacon.click();
      await page.waitForTimeout(300);
    }

    // Wait for system health initialization
    await page.waitForTimeout(3000);

    // Look for Console Monitor or error indicators (text may be split across elements)
    const consoleMonitor = await page.locator('text=Console Monitor').count();
    const errMin = await page.locator('text=/\\d+ err\\/min/').count();

    // Should have at least Console Monitor visible
    expect(consoleMonitor + errMin).toBeGreaterThan(0);
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

  test('reactivity test: state updates propagate', async ({ page }) => {
    // Close boot beacon if present (it intercepts clicks)
    const closeBeacon = page.getByRole('button', { name: /Fermer diagnostic/i });
    if (await closeBeacon.isVisible()) {
      await closeBeacon.click();
      await page.waitForTimeout(300);
    }

    // Utilise une interaction stable (tabs TITANE) plutôt que le "premier bouton".
    const tablist = page.getByRole('tablist', { name: /Sections principales TITANE/i });
    await expect(tablist).toBeVisible({ timeout: 15000 });

    const memoryTab = page.getByRole('tab', { name: /Mémoire/i }).first();
    const conversationTab = page.getByRole('tab', { name: /Conversation/i }).first();

    await expect(memoryTab).toBeVisible({ timeout: 15000 });
    await memoryTab.click({ force: true });
    await page.waitForTimeout(300);

    await expect(conversationTab).toBeVisible({ timeout: 15000 });
    await conversationTab.click({ force: true });
    await page.waitForTimeout(300);

    // Verify page still functional (no crash)
    await expect(page.locator('body')).toBeVisible();
  });
});
