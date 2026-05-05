/**
 * memory-subtabs.wdio.test.js — Desktop proof for MemorySection sub-tab data-testids
 *
 * Covers commit a94abae8a: `data-testid={\`memory-tab-${tab.id}\`}` in MemorySection.tsx
 *
 * L1-L4:  Static source checks (always runs)
 * L5-L10: Runtime UI checks (requires TITANE_E2E_FULL=1)
 */

import fs from 'node:fs';
import path from 'node:path';
import { waitForTabActive } from './ui-driver.wdio.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const FULL = process.env.TITANE_E2E_FULL === '1';
const TIMEOUT = 15000;
const testId = id => `[data-testid="${id}"]`;

const MEMORY_SUB_TAB_IDS = [
  'memory-tab-overview',
  'memory-tab-dashboard',
  'memory-tab-tree',
  'memory-tab-search',
];

describe('memory-subtabs (WDIO desktop)', () => {
  describe('L1-L4 — Static source checks', () => {
    let src;

    before(() => {
      src = fs.readFileSync(
        path.resolve(__dirname, '../../src/components/sections/MemorySection.tsx'),
        'utf-8'
      );
    });

    it('L1 — MemorySection source contains memory-tab-overview data-testid', () => {
      expect(src.includes('memory-tab-overview')).toBe(true);
    });

    it('L2 — MemorySection source contains memory-tab-dashboard data-testid', () => {
      expect(src.includes('memory-tab-dashboard')).toBe(true);
    });

    it('L3 — MemorySection source contains memory-tab-tree data-testid', () => {
      expect(src.includes('memory-tab-tree')).toBe(true);
    });

    it('L4 — MemorySection source contains memory-tab-search data-testid', () => {
      expect(src.includes('memory-tab-search')).toBe(true);
    });
  });

  describe('L5-L10 — Runtime UI checks', () => {
    before(function () {
      if (!FULL) this.skip();
    });

    before(async () => {
      await browser.url('/titane');
      await $(testId('tab-conversation')).waitForDisplayed({ timeout: TIMEOUT });
      // Navigate to memory tab first
      await $(testId('tab-memory')).click();
      await waitForTabActive(testId('tab-memory'), TIMEOUT);
      // Wait for memory section to render sub-tabs
      await $(testId('memory-tab-overview')).waitForDisplayed({ timeout: TIMEOUT });
    });

    it('L5 — memory-tab-overview is displayed', async () => {
      const el = await $(testId('memory-tab-overview'));
      expect(await el.isDisplayed()).toBe(true);
    });

    it('L6 — memory-tab-overview is clickable and becomes active', async () => {
      await $(testId('memory-tab-overview')).click();
      await waitForTabActive(testId('memory-tab-overview'), TIMEOUT);
      expect(await $(testId('memory-tab-overview')).getAttribute('aria-selected')).toBe('true');
    });

    it('L7 — memory-tab-dashboard is clickable and becomes active', async () => {
      await $(testId('memory-tab-dashboard')).click();
      await waitForTabActive(testId('memory-tab-dashboard'), TIMEOUT);
      expect(await $(testId('memory-tab-dashboard')).getAttribute('aria-selected')).toBe('true');
    });

    it('L8 — memory-tab-tree is clickable and becomes active', async () => {
      await $(testId('memory-tab-tree')).click();
      await waitForTabActive(testId('memory-tab-tree'), TIMEOUT);
      expect(await $(testId('memory-tab-tree')).getAttribute('aria-selected')).toBe('true');
    });

    it('L9 — memory-tab-search is clickable and becomes active', async () => {
      await $(testId('memory-tab-search')).click();
      await waitForTabActive(testId('memory-tab-search'), TIMEOUT);
      expect(await $(testId('memory-tab-search')).getAttribute('aria-selected')).toBe('true');
    });

    it('L10 — all 4 memory sub-tab data-testids are present in DOM', async () => {
      for (const id of MEMORY_SUB_TAB_IDS) {
        const el = await $(testId(id));
        expect(await el.isExisting()).toBe(true);
      }
    });
  });
});
