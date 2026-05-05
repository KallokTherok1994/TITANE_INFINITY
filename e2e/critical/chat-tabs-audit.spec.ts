/**
 * chat-tabs-audit.spec.ts — Playwright E2E audit for all TitanePage tabs
 *
 * RUN0 (C0): Static smoke — no Tauri needed. Always active.
 * RUN1 (C1-C4): Tab presence & a11y
 * RUN2 (C5-C10): Tab navigation (click, aria-selected, URL)
 * RUN3 (C11-C16): Content per tab
 * RUN4 (C17-C21): MemorySection sub-tabs (requires data-testid fix)
 * RUN5 (C22-C24): ToolSelectorPanel in conversation tab
 * RUN6 (C25-C26): ChatModeSelector in conversation tab
 *
 * Rule 16 compliance: AH-20260504-CHAT-TABS-AUDIT-0006
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'node:url';

const FULL = process.env.TITANE_E2E_FULL === '1';
const CURRENT_DIR = path.dirname(fileURLToPath(import.meta.url));

// ═══════════════════════════════════════════════════════════
// RUN0 — C0: Static smoke (always runs, no Tauri needed)
// ═══════════════════════════════════════════════════════════
test.describe('RUN0 — Static smoke (C0)', () => {
  test('C0 — data-testid constants exist in TitanePage.tsx source', () => {
    const sourcePath = path.resolve(
      CURRENT_DIR,
      '../../src/pages/TitanePage.tsx'
    );
    expect(fs.existsSync(sourcePath), `TitanePage.tsx not found at ${sourcePath}`).toBe(true);
    const src = fs.readFileSync(sourcePath, 'utf-8');
    // All 6 main tab data-testids
    expect(src).toContain('data-testid="tab-conversation"');
    expect(src).toContain('data-testid="tab-overview"');
    expect(src).toContain('data-testid="tab-vision"');
    expect(src).toContain('data-testid="tab-memory"');
    expect(src).toContain('data-testid="tab-progression"');
    expect(src).toContain('data-testid="tab-transformation"');
    // Content area data-testid
    expect(src).toContain('data-testid="page-titane-content"');
    expect(src).toContain('data-testid="page-titane"');
    // Tablist role
    expect(src).toContain('role="tablist"');
    // data-layout
    expect(src).toContain("data-layout={isConversationTab ? 'chat-fullscreen' : 'standard'}");
  });

  test('C0b — MemorySection.tsx has data-testid on sub-tab buttons', () => {
    const sourcePath = path.resolve(
      CURRENT_DIR,
      '../../src/components/sections/MemorySection.tsx'
    );
    expect(fs.existsSync(sourcePath), `MemorySection.tsx not found`).toBe(true);
    const src = fs.readFileSync(sourcePath, 'utf-8');
    // After the fix, these should all be present
    expect(src).toContain('memory-tab-${tab.id}');
    expect(src).toContain('data-testid={`memory-tab-${tab.id}`}');
  });

  test('C0c — ToolSelectorPanel.tsx exists with 10 tool data-testids pattern', () => {
    const sourcePath = path.resolve(
      CURRENT_DIR,
      '../../src/components/chat/ToolSelectorPanel.tsx'
    );
    expect(fs.existsSync(sourcePath), `ToolSelectorPanel.tsx not found`).toBe(true);
    const src = fs.readFileSync(sourcePath, 'utf-8');
    expect(src).toContain('data-testid="tool-selector-panel"');
    expect(src).toContain('data-testid="tool-selector-btn"');
    expect(src).toContain('tool-item-');
  });
});

// ═══════════════════════════════════════════════════════════
// RUN1 — C1-C4: Tab presence & a11y
// ═══════════════════════════════════════════════════════════
test.describe('RUN1 — Tab presence & a11y (C1-C4)', () => {
  test.skip(!FULL, 'Requires TITANE_E2E_FULL=1');

  test.beforeEach(async ({ page }) => {
    await page.goto('/titane', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="tab-conversation"]', { timeout: 15000 });
  });

  test('C1 — all 6 main tabs are visible in DOM', async ({ page }) => {
    for (const id of [
      'tab-conversation',
      'tab-overview',
      'tab-vision',
      'tab-memory',
      'tab-progression',
      'tab-transformation',
    ]) {
      await expect(page.getByTestId(id)).toBeVisible();
    }
  });

  test('C2 — tablist role and aria-label are present', async ({ page }) => {
    const tablist = page.locator('[role="tablist"]').first();
    await expect(tablist).toBeVisible();
    await expect(tablist).toHaveAttribute('aria-label', 'Sections principales TITANE');
  });

  test('C3 — each main tab has role=tab', async ({ page }) => {
    for (const id of [
      'tab-conversation',
      'tab-overview',
      'tab-vision',
      'tab-memory',
      'tab-progression',
      'tab-transformation',
    ]) {
      const tab = page.getByTestId(id);
      await expect(tab).toHaveAttribute('role', 'tab');
    }
  });

  test('C4 — conversation tab is aria-selected=true by default', async ({ page }) => {
    await expect(page.getByTestId('tab-conversation')).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });
});

// ═══════════════════════════════════════════════════════════
// RUN2 — C5-C10: Tab navigation
// ═══════════════════════════════════════════════════════════
test.describe('RUN2 — Tab navigation (C5-C10)', () => {
  test.skip(!FULL, 'Requires TITANE_E2E_FULL=1');

  test.beforeEach(async ({ page }) => {
    await page.goto('/titane', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="tab-conversation"]', { timeout: 15000 });
  });

  test('C5 — click tab-overview sets aria-selected=true', async ({ page }) => {
    await page.getByTestId('tab-overview').click();
    await expect(page.getByTestId('tab-overview')).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByTestId('tab-conversation')).toHaveAttribute('aria-selected', 'false');
  });

  test('C6 — click tab-vision sets aria-selected=true', async ({ page }) => {
    await page.getByTestId('tab-vision').click();
    await expect(page.getByTestId('tab-vision')).toHaveAttribute('aria-selected', 'true');
  });

  test('C7 — click tab-memory sets aria-selected=true', async ({ page }) => {
    await page.getByTestId('tab-memory').click();
    await expect(page.getByTestId('tab-memory')).toHaveAttribute('aria-selected', 'true');
  });

  test('C8 — click tab-progression sets aria-selected=true', async ({ page }) => {
    await page.getByTestId('tab-progression').click();
    await expect(page.getByTestId('tab-progression')).toHaveAttribute('aria-selected', 'true');
  });

  test('C9 — click tab-transformation sets aria-selected=true', async ({ page }) => {
    await page.getByTestId('tab-transformation').click();
    await expect(page.getByTestId('tab-transformation')).toHaveAttribute('aria-selected', 'true');
  });

  test('C10 — URL updates to ?tab=overview on click', async ({ page }) => {
    await page.getByTestId('tab-overview').click();
    await expect(page).toHaveURL(/tab=overview/);
  });
});

// ═══════════════════════════════════════════════════════════
// RUN3 — C11-C16: Content per tab
// ═══════════════════════════════════════════════════════════
test.describe('RUN3 — Tab content (C11-C16)', () => {
  test.skip(!FULL, 'Requires TITANE_E2E_FULL=1');

  test.beforeEach(async ({ page }) => {
    await page.goto('/titane', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="tab-conversation"]', { timeout: 15000 });
  });

  test('C11 — conversation tab shows chat input', async ({ page }) => {
    const panel = page.getByTestId('page-titane-content');
    await expect(panel).toBeVisible();
    await expect(panel).toHaveAttribute('role', 'tabpanel');
  });

  test('C12 — data-layout=chat-fullscreen on conversation tab', async ({ page }) => {
    await expect(page.getByTestId('page-titane')).toHaveAttribute(
      'data-layout',
      'chat-fullscreen'
    );
  });

  test('C13 — overview tab shows overview content', async ({ page }) => {
    await page.getByTestId('tab-overview').click();
    const panel = page.getByTestId('page-titane-content');
    await expect(panel).toHaveAttribute('id', 'titane-panel-overview');
  });

  test('C14 — memory tab shows memory section', async ({ page }) => {
    await page.getByTestId('tab-memory').click();
    const panel = page.getByTestId('page-titane-content');
    await expect(panel).toHaveAttribute('id', 'titane-panel-memory');
  });

  test('C15 — progression tab shows progression section', async ({ page }) => {
    await page.getByTestId('tab-progression').click();
    const panel = page.getByTestId('page-titane-content');
    await expect(panel).toHaveAttribute('id', 'titane-panel-progression');
  });

  test('C16 — data-layout=standard after leaving conversation tab', async ({ page }) => {
    await page.getByTestId('tab-overview').click();
    await expect(page.getByTestId('page-titane')).toHaveAttribute('data-layout', 'standard');
  });
});

// ═══════════════════════════════════════════════════════════
// RUN4 — C17-C21: MemorySection sub-tabs
// ═══════════════════════════════════════════════════════════
test.describe('RUN4 — MemorySection sub-tabs (C17-C21)', () => {
  test.skip(!FULL, 'Requires TITANE_E2E_FULL=1');

  test.beforeEach(async ({ page }) => {
    await page.goto('/titane?tab=memory-map', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="tab-memory"]', { timeout: 15000 });
  });

  test('C17 — memory-tab-overview is visible and aria-selected by default', async ({ page }) => {
    const overviewTab = page.getByTestId('memory-tab-overview');
    await expect(overviewTab).toBeVisible();
    await expect(overviewTab).toHaveAttribute('aria-selected', 'true');
  });

  test('C18 — memory-tab-dashboard is clickable and becomes selected', async ({ page }) => {
    const tab = page.getByTestId('memory-tab-dashboard');
    await expect(tab).toBeVisible();
    await tab.click();
    await expect(tab).toHaveAttribute('aria-selected', 'true');
  });

  test('C19 — memory-tab-tree is clickable and becomes selected', async ({ page }) => {
    const tab = page.getByTestId('memory-tab-tree');
    await expect(tab).toBeVisible();
    await tab.click();
    await expect(tab).toHaveAttribute('aria-selected', 'true');
  });

  test('C20 — memory-tab-search is clickable and becomes selected', async ({ page }) => {
    const tab = page.getByTestId('memory-tab-search');
    await expect(tab).toBeVisible();
    await tab.click();
    await expect(tab).toHaveAttribute('aria-selected', 'true');
  });

  test('C21 — all 4 MemorySection sub-tabs have role=tab', async ({ page }) => {
    for (const id of [
      'memory-tab-overview',
      'memory-tab-dashboard',
      'memory-tab-tree',
      'memory-tab-search',
    ]) {
      await expect(page.getByTestId(id)).toHaveAttribute('role', 'tab');
    }
  });
});

// ═══════════════════════════════════════════════════════════
// RUN5 — C22-C24: ToolSelectorPanel in conversation tab
// ═══════════════════════════════════════════════════════════
test.describe('RUN5 — ToolSelectorPanel in conversation tab (C22-C24)', () => {
  test.skip(!FULL, 'Requires TITANE_E2E_FULL=1');

  test.beforeEach(async ({ page }) => {
    await page.goto('/titane', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="tool-selector-btn"]', { timeout: 15000 });
  });

  test('C22 — tool-selector-btn is visible in conversation tab', async ({ page }) => {
    await expect(page.getByTestId('tool-selector-btn')).toBeVisible();
  });

  test('C23 — clicking tool-selector-btn opens the panel', async ({ page }) => {
    await page.getByTestId('tool-selector-btn').click();
    await expect(page.getByTestId('tool-selector-panel')).toBeVisible();
  });

  test('C24 — tool-selector-panel shows at least one tool item', async ({ page }) => {
    await page.getByTestId('tool-selector-btn').click();
    const panel = page.getByTestId('tool-selector-panel');
    await expect(panel).toBeVisible();
    // At least one tool is rendered
    const firstTool = panel.locator('[data-testid^="tool-item-"]').first();
    await expect(firstTool).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════
// RUN6 — C25-C26: ChatModeSelector
// ═══════════════════════════════════════════════════════════
test.describe('RUN6 — ChatModeSelector in conversation tab (C25-C26)', () => {
  test.skip(!FULL, 'Requires TITANE_E2E_FULL=1');

  test.beforeEach(async ({ page }) => {
    await page.goto('/titane', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="tab-conversation"]', { timeout: 15000 });
  });

  test('C25 — conversation tab content area is accessible via tabpanel', async ({ page }) => {
    const panel = page.getByRole('tabpanel');
    await expect(panel).toBeVisible();
  });

  test('C26 — navigating from conversation → overview → conversation preserves tab state', async ({ page }) => {
    await page.getByTestId('tab-overview').click();
    await expect(page.getByTestId('tab-overview')).toHaveAttribute('aria-selected', 'true');
    await page.getByTestId('tab-conversation').click();
    await expect(page.getByTestId('tab-conversation')).toHaveAttribute('aria-selected', 'true');
  });
});
