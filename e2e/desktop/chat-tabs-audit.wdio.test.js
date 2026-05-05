/**
 * chat-tabs-audit.wdio.test.js — WDIO desktop audit for TitanePage tabs
 *
 * T1-T3: Static (no app launch required)
 * T4-T23: require TITANE_E2E_FULL=1 + desktop app running
 *
 * Rule 16 compliance: AH-20260504-CHAT-TABS-AUDIT-0006
 */

const { assert } = require('assert');
const fs = require('fs');
const path = require('path');

const FULL = process.env.TITANE_E2E_FULL === '1';

// ─── helpers ───────────────────────────────────────────────
const testId = id => `[data-testid="${id}"]`;
const TIMEOUT = 15000;

describe('chat-tabs-audit (WDIO desktop)', () => {
  // ═══════════════════════════════════════════════════════
  // T1-T4: Static code compliance (always runs)
  // ═══════════════════════════════════════════════════════
  describe('T1-T4 — Static compliance', () => {
    it('T1 — TitanePage.tsx contains all 6 main tab data-testids', () => {
      const src = fs.readFileSync(
        path.resolve(__dirname, '../../src/pages/TitanePage.tsx'),
        'utf-8'
      );
      [
        'data-testid="tab-conversation"',
        'data-testid="tab-overview"',
        'data-testid="tab-vision"',
        'data-testid="tab-memory"',
        'data-testid="tab-progression"',
        'data-testid="tab-transformation"',
        'data-testid="page-titane-content"',
      ].forEach(selector => {
        if (!src.includes(selector)) {
          throw new Error(`Missing in TitanePage.tsx: ${selector}`);
        }
      });
    });

    it('T2 — MemorySection.tsx has data-testid on sub-tab buttons', () => {
      const src = fs.readFileSync(
        path.resolve(__dirname, '../../src/components/sections/MemorySection.tsx'),
        'utf-8'
      );
      if (!src.includes('data-testid={`memory-tab-${tab.id}`}')) {
        throw new Error('MemorySection.tsx missing data-testid on sub-tab buttons');
      }
    });

    it('T3 — chatToolsRegistry.ts exports 10 tools', () => {
      const src = fs.readFileSync(
        path.resolve(__dirname, '../../src/features/chat/chatToolsRegistry.ts'),
        'utf-8'
      );
      if (!src.includes('CHAT_TOOLS')) {
        throw new Error('chatToolsRegistry.ts missing CHAT_TOOLS export');
      }
      // Count tool id declarations
      const matches = src.match(/id:\s*['"`][\w_]+['"`]/g) || [];
      if (matches.length < 10) {
        throw new Error(`Expected at least 10 tool ids, found ${matches.length}`);
      }
    });

    it('T4 — TitanePage.tsx contains updated tab labels', () => {
      const src = fs.readFileSync(
        path.resolve(__dirname, '../../src/pages/TitanePage.tsx'),
        'utf-8'
      );
      if (!src.includes('📊 Dashboard')) {
        throw new Error('Missing updated label: 📊 Dashboard');
      }
      if (!src.includes('⚡ Progression')) {
        throw new Error('Missing updated label: ⚡ Progression');
      }
      if (!src.includes('🌱 Évolution')) {
        throw new Error('Missing updated label: 🌱 Évolution');
      }
    });
  });

  // ═══════════════════════════════════════════════════════
  // T5-T10: Tab presence & a11y (TITANE_E2E_FULL=1)
  // ═══════════════════════════════════════════════════════
  describe('T5-T10 — Tab presence & a11y', () => {
    before(function () {
      if (!FULL) this.skip();
    });

    before(async () => {
      await browser.url('/titane');
      await $(testId('tab-conversation')).waitForDisplayed({ timeout: TIMEOUT });
    });

    it('T5 — all 6 main tabs are visible', async () => {
      for (const id of [
        'tab-conversation',
        'tab-overview',
        'tab-vision',
        'tab-memory',
        'tab-progression',
        'tab-transformation',
      ]) {
        const el = await $(testId(id));
        expect(await el.isDisplayed()).toBe(true);
      }
    });

    it('T6 — tablist has role=tablist', async () => {
      const tablist = await $('[role="tablist"]');
      expect(await tablist.isDisplayed()).toBe(true);
    });

    it('T7 — each main tab has role=tab', async () => {
      for (const id of [
        'tab-conversation',
        'tab-overview',
        'tab-vision',
        'tab-memory',
        'tab-progression',
        'tab-transformation',
      ]) {
        const el = await $(testId(id));
        const role = await el.getAttribute('role');
        expect(role).toBe('tab');
      }
    });

    it('T8 — conversation tab is aria-selected=true by default', async () => {
      const el = await $(testId('tab-conversation'));
      expect(await el.getAttribute('aria-selected')).toBe('true');
    });

    it('T9 — page-titane-content has role=tabpanel', async () => {
      const el = await $(testId('page-titane-content'));
      expect(await el.getAttribute('role')).toBe('tabpanel');
    });

    it('T10 — page-titane has data-layout=chat-fullscreen on conversation tab', async () => {
      const el = await $(testId('page-titane'));
      expect(await el.getAttribute('data-layout')).toBe('chat-fullscreen');
    });
  });

  // ═══════════════════════════════════════════════════════
  // T11-T14: Tab navigation (TITANE_E2E_FULL=1)
  // ═══════════════════════════════════════════════════════
  describe('T11-T14 — Tab navigation', () => {
    before(function () {
      if (!FULL) this.skip();
    });

    before(async () => {
      await browser.url('/titane');
      await $(testId('tab-conversation')).waitForDisplayed({ timeout: TIMEOUT });
    });

    it('T11 — clicking tab-overview → aria-selected=true', async () => {
      await (await $(testId('tab-overview'))).click();
      await browser.pause(400);
      const el = await $(testId('tab-overview'));
      expect(await el.getAttribute('aria-selected')).toBe('true');
    });

    it('T12 — clicking tab-memory → aria-selected=true', async () => {
      await (await $(testId('tab-memory'))).click();
      await browser.pause(400);
      expect(await (await $(testId('tab-memory'))).getAttribute('aria-selected')).toBe(
        'true'
      );
    });

    it('T13 — data-layout=standard after leaving conversation', async () => {
      await (await $(testId('tab-overview'))).click();
      await browser.pause(300);
      expect(await (await $(testId('page-titane'))).getAttribute('data-layout')).toBe(
        'standard'
      );
    });

    it('T14 — back to conversation tab restores data-layout=chat-fullscreen', async () => {
      await (await $(testId('tab-conversation'))).click();
      await browser.pause(300);
      expect(await (await $(testId('page-titane'))).getAttribute('data-layout')).toBe(
        'chat-fullscreen'
      );
    });
  });

  // ═══════════════════════════════════════════════════════
  // T15-T18: MemorySection sub-tabs (TITANE_E2E_FULL=1)
  // ═══════════════════════════════════════════════════════
  describe('T15-T18 — MemorySection sub-tabs', () => {
    before(function () {
      if (!FULL) this.skip();
    });

    before(async () => {
      await browser.url('/titane?tab=memory-map');
      await $(testId('tab-memory')).waitForDisplayed({ timeout: TIMEOUT });
      await browser.pause(800);
    });

    it('T15 — memory-tab-overview is visible and selected by default', async () => {
      const el = await $(testId('memory-tab-overview'));
      expect(await el.isDisplayed()).toBe(true);
      expect(await el.getAttribute('aria-selected')).toBe('true');
    });

    it('T16 — memory-tab-dashboard is clickable', async () => {
      const el = await $(testId('memory-tab-dashboard'));
      expect(await el.isDisplayed()).toBe(true);
      await el.click();
      await browser.pause(300);
      expect(await el.getAttribute('aria-selected')).toBe('true');
    });

    it('T17 — memory-tab-tree is clickable', async () => {
      const el = await $(testId('memory-tab-tree'));
      expect(await el.isDisplayed()).toBe(true);
      await el.click();
      await browser.pause(300);
      expect(await el.getAttribute('aria-selected')).toBe('true');
    });

    it('T18 — memory-tab-search is clickable', async () => {
      const el = await $(testId('memory-tab-search'));
      expect(await el.isDisplayed()).toBe(true);
      await el.click();
      await browser.pause(300);
      expect(await el.getAttribute('aria-selected')).toBe('true');
    });
  });

  // ═══════════════════════════════════════════════════════
  // T19-T23: ToolSelectorPanel and labels in conversation tab (TITANE_E2E_FULL=1)
  // ═══════════════════════════════════════════════════════
  describe('T19-T23 — ToolSelectorPanel and labels in conversation tab', () => {
    before(function () {
      if (!FULL) this.skip();
    });

    before(async () => {
      await browser.url('/titane');
      await $(testId('tab-conversation')).waitForDisplayed({ timeout: TIMEOUT });
    });

    it('T19 — tool-selector-btn is visible in conversation tab', async () => {
      const btn = await $(testId('tool-selector-btn'));
      expect(await btn.isDisplayed()).toBe(true);
    });

    it('T20 — clicking tool-selector-btn opens the panel', async () => {
      await (await $(testId('tool-selector-btn'))).click();
      await browser.pause(400);
      const panel = await $(testId('tool-selector-panel'));
      expect(await panel.isDisplayed()).toBe(true);
    });

    it('T21 — panel contains at least one tool-item', async () => {
      const toolItem = await $('[data-testid^="tool-item-"]');
      expect(await toolItem.isDisplayed()).toBe(true);
    });

    it('T22 — updated tab labels are visible in runtime UI', async () => {
      await browser.url('/titane');
      await $(testId('tab-conversation')).waitForDisplayed({ timeout: TIMEOUT });

      const overview = await $(testId('tab-overview'));
      const progression = await $(testId('tab-progression'));
      const evolution = await $(testId('tab-transformation'));

      expect(await overview.getText()).toContain('Dashboard');
      expect(await progression.getText()).toContain('Progression');
      expect(await evolution.getText()).toContain('Évolution');
    });

    it('T23 — legacy tab labels are not visible in runtime UI', async () => {
      const bodyText = await $('body').getText();
      expect(bodyText.includes('📊 Vue')).toBe(false);
      expect(bodyText.includes('⚡ XP')).toBe(false);
      expect(bodyText.includes('🌱 Transform & Évo')).toBe(false);
    });
  });
});
