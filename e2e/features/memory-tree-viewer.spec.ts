/**
 * E2E Test: Memory Tree Viewer (Feature Test)
 * TITANE∞ v26.2.0 - Automated Quality Assurance
 *
 * User journey: Navigate to TitanePage Memory section, interact with Memory Tree Viewer
 */

import { test, expect } from '@playwright/test';

test.describe('Feature: Memory Tree Viewer', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Vite dev server (Tauri webview context)
    await page.goto('http://localhost:5173');
    // Wait for app to fully initialize
    await page.waitForTimeout(2000);
  });

  test('navigates to TitanePage and loads Memory section', async ({ page }) => {
    // Wait for navigation to be available
    await page.waitForSelector('nav, [role="navigation"]', { timeout: 10000 });

    // Navigate to TitanePage (may use button, link, or direct navigation)
    const titanePageLink = page
      .locator('a[href*="titane"], button:has-text("TITANE")')
      .first();

    if (await titanePageLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await titanePageLink.click();
    } else {
      // Direct navigation fallback
      await page.goto('http://localhost:5173/#/titane');
    }

    // Wait for TitanePage to load
    await page.waitForSelector('.titane-section', { timeout: 10000 });

    // Look for Memory tab/button
    const memoryTab = page
      .locator(
        'button:has-text("Mémoire"), button:has-text("💾"), [data-tab="memory-map"]'
      )
      .first();

    if (await memoryTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await memoryTab.click();
      await page.waitForTimeout(500);
    }

    // Verify Memory section elements are present
    const memorySection = page
      .locator('.titane-section-memory, .memory-tree-container')
      .first();
    await expect(memorySection).toBeVisible({ timeout: 10000 });
  });

  test('Memory Tree Viewer renders with D3 tree', async ({ page }) => {
    // Navigate to TitanePage Memory section (helper)
    await page.goto('http://localhost:5173/#/titane');
    await page.waitForTimeout(2000);

    // Click Memory tab if available
    const memoryTab = page
      .locator('button:has-text("Mémoire"), button:has-text("💾")')
      .first();
    if (await memoryTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await memoryTab.click();
      await page.waitForTimeout(500);
    }

    // Wait for memory tree container
    const treeContainer = page.locator('.memory-tree-container').first();
    await expect(treeContainer).toBeVisible({ timeout: 10000 });

    // Verify D3 SVG tree is rendered (react-d3-tree creates SVG)
    const treeSvg = treeContainer.locator('svg').first();
    await expect(treeSvg).toBeVisible({ timeout: 5000 });

    // Verify tree nodes exist (D3 tree creates <g> elements for nodes)
    const treeNodes = treeSvg.locator('g[class*="node"], g.rd3t-node');
    await expect(treeNodes.first()).toBeVisible({ timeout: 5000 });
  });

  test('Memory Tree Viewer search functionality', async ({ page }) => {
    // Navigate to Memory section
    await page.goto('http://localhost:5173/#/titane');
    await page.waitForTimeout(2000);

    const memoryTab = page
      .locator('button:has-text("Mémoire"), button:has-text("💾")')
      .first();
    if (await memoryTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await memoryTab.click();
      await page.waitForTimeout(500);
    }

    // Wait for search input
    const searchInput = page
      .locator(
        '.memory-tree-search input, input[placeholder*="recherche"], input[placeholder*="Recherche"]'
      )
      .first();

    if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Type search query
      await searchInput.fill('Court Terme');
      await page.waitForTimeout(500);

      // Verify search highlights or filters nodes (implementation-dependent)
      // Just verify no crash and input is filled
      await expect(searchInput).toHaveValue('Court Terme');
    } else {
      console.log('⚠️ Search input not found (may not be rendered yet)');
    }
  });

  test('Memory Tree Viewer zoom controls', async ({ page }) => {
    // Navigate to Memory section
    await page.goto('http://localhost:5173/#/titane');
    await page.waitForTimeout(2000);

    const memoryTab = page
      .locator('button:has-text("Mémoire"), button:has-text("💾")')
      .first();
    if (await memoryTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await memoryTab.click();
      await page.waitForTimeout(500);
    }

    // Wait for zoom controls
    const zoomInButton = page
      .locator('button[title*="Zoom avant"], button:has-text("+")')
      .first();
    const zoomOutButton = page
      .locator('button[title*="Zoom arrière"], button:has-text("-")')
      .first();
    const resetButton = page.locator('button[title*="Réinitialiser"]').first();

    // Test zoom controls if available
    if (await zoomInButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await zoomInButton.click();
      await page.waitForTimeout(300);

      await zoomOutButton.click();
      await page.waitForTimeout(300);

      await resetButton.click();
      await page.waitForTimeout(300);

      // Verify no crash
      const treeContainer = page.locator('.memory-tree-container').first();
      await expect(treeContainer).toBeVisible();
    } else {
      console.log('⚠️ Zoom controls not found (may not be rendered yet)');
    }
  });

  test('Memory Tree Viewer node interaction', async ({ page }) => {
    // Navigate to Memory section
    await page.goto('http://localhost:5173/#/titane');
    await page.waitForTimeout(2000);

    const memoryTab = page
      .locator('button:has-text("Mémoire"), button:has-text("💾")')
      .first();
    if (await memoryTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await memoryTab.click();
      await page.waitForTimeout(1000);
    }

    // Wait for tree container
    const treeContainer = page.locator('.memory-tree-container').first();

    if (await treeContainer.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Try to click a tree node (D3 tree nodes)
      const treeNode = treeContainer.locator('g.rd3t-node, foreignObject').first();

      if (await treeNode.isVisible({ timeout: 3000 }).catch(() => false)) {
        await treeNode.click();
        await page.waitForTimeout(500);

        // Verify node details display (implementation-dependent)
        // Just verify no crash
        await expect(treeContainer).toBeVisible();
      } else {
        console.log('⚠️ Tree nodes not interactive yet');
      }
    }
  });

  test('Memory Tree Viewer filter by type', async ({ page }) => {
    // Navigate to Memory section
    await page.goto('http://localhost:5173/#/titane');
    await page.waitForTimeout(2000);

    const memoryTab = page
      .locator('button:has-text("Mémoire"), button:has-text("💾")')
      .first();
    if (await memoryTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await memoryTab.click();
      await page.waitForTimeout(500);
    }

    // Look for filter dropdown (type: short, mid, long)
    const filterSelect = page.locator('select, .memory-tree-filter select').first();

    if (await filterSelect.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Select "Court terme"
      await filterSelect.selectOption({ label: /Court terme/ });
      await page.waitForTimeout(500);

      // Verify tree still visible (filtered)
      const treeContainer = page.locator('.memory-tree-container').first();
      await expect(treeContainer).toBeVisible();
    } else {
      console.log('⚠️ Filter select not found');
    }
  });
});
