/**
 * admin-tabs.wdio.test.js — Desktop proof for AdminPage tab data-testids
 *
 * Source: src/features/admin/AdminPage.tsx + types.ts
 * Tabs: system, config, audio, design, governance, anti-regression, production-health, remote-keys
 *
 * L1-L3:  Static source checks (always runs)
 * L4-L13: Runtime UI checks (requires TITANE_E2E_FULL=1)
 */

import fs from 'node:fs';
import path from 'node:path';
import { waitForTabActive } from './ui-driver.wdio.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const FULL = process.env.TITANE_E2E_FULL === '1';
const TIMEOUT = 15000;
const testId = id => `[data-testid="${id}"]`;

const ADMIN_TAB_IDS = [
  'tab-admin-system',
  'tab-admin-config',
  'tab-admin-audio',
  'tab-admin-design',
  'tab-admin-governance',
  'tab-admin-anti-regression',
  'tab-admin-production-health',
  'tab-admin-remote-keys',
];

describe('admin-tabs (WDIO desktop)', () => {
  describe('L1-L3 — Static source checks', () => {
    let src;

    before(() => {
      src = fs.readFileSync(
        path.resolve(__dirname, '../../src/features/admin/AdminPage.tsx'),
        'utf-8'
      );
    });

    it('L1 — AdminPage source contains page-admin root testid', () => {
      expect(src.includes('data-testid="page-admin"')).toBe(true);
    });

    it('L2 — AdminPage source contains dynamic tab-admin-${tab.id} pattern', () => {
      expect(src.includes('tab-admin-')).toBe(true);
    });

    it('L3 — AdminPage source contains page-admin-content panel testid', () => {
      expect(src.includes('data-testid="page-admin-content"')).toBe(true);
    });
  });

  describe('L4-L13 — Runtime UI checks', () => {
    before(function () {
      if (!FULL) this.skip();
    });

    before(async () => {
      await browser.url('/admin');
      await $(testId('page-admin')).waitForDisplayed({ timeout: TIMEOUT });
      await $(testId('tab-admin-system')).waitForDisplayed({ timeout: TIMEOUT });
    });

    it('L4 — page-admin root is present', async () => {
      expect(await $(testId('page-admin')).isDisplayed()).toBe(true);
    });

    it('L5 — tab-admin-system is clickable and becomes active', async () => {
      await $(testId('tab-admin-system')).click();
      await waitForTabActive(testId('tab-admin-system'), TIMEOUT);
      expect(await $(testId('tab-admin-system')).getAttribute('aria-selected')).toBe(
        'true'
      );
    });

    it('L6 — tab-admin-config is clickable and becomes active', async () => {
      await $(testId('tab-admin-config')).click();
      await waitForTabActive(testId('tab-admin-config'), TIMEOUT);
      expect(await $(testId('tab-admin-config')).getAttribute('aria-selected')).toBe(
        'true'
      );
    });

    it('L7 — tab-admin-audio is clickable and becomes active', async () => {
      await $(testId('tab-admin-audio')).click();
      await waitForTabActive(testId('tab-admin-audio'), TIMEOUT);
      expect(await $(testId('tab-admin-audio')).getAttribute('aria-selected')).toBe(
        'true'
      );
    });

    it('L8 — tab-admin-design is clickable and becomes active', async () => {
      await $(testId('tab-admin-design')).click();
      await waitForTabActive(testId('tab-admin-design'), TIMEOUT);
      expect(await $(testId('tab-admin-design')).getAttribute('aria-selected')).toBe(
        'true'
      );
    });

    it('L9 — tab-admin-governance is clickable and becomes active', async () => {
      await $(testId('tab-admin-governance')).click();
      await waitForTabActive(testId('tab-admin-governance'), TIMEOUT);
      expect(await $(testId('tab-admin-governance')).getAttribute('aria-selected')).toBe(
        'true'
      );
    });

    it('L10 — tab-admin-anti-regression is clickable and becomes active', async () => {
      await $(testId('tab-admin-anti-regression')).click();
      await waitForTabActive(testId('tab-admin-anti-regression'), TIMEOUT);
      expect(
        await $(testId('tab-admin-anti-regression')).getAttribute('aria-selected')
      ).toBe('true');
    });

    it('L11 — tab-admin-production-health is clickable and becomes active', async () => {
      await $(testId('tab-admin-production-health')).click();
      await waitForTabActive(testId('tab-admin-production-health'), TIMEOUT);
      expect(
        await $(testId('tab-admin-production-health')).getAttribute('aria-selected')
      ).toBe('true');
    });

    it('L12 — tab-admin-remote-keys is clickable and becomes active', async () => {
      await $(testId('tab-admin-remote-keys')).click();
      await waitForTabActive(testId('tab-admin-remote-keys'), TIMEOUT);
      expect(await $(testId('tab-admin-remote-keys')).getAttribute('aria-selected')).toBe(
        'true'
      );
    });

    it('L13 — page-admin-content panel is always present after tab navigation', async () => {
      const panel = await $(testId('page-admin-content'));
      expect(await panel.isDisplayed()).toBe(true);
    });
  });
});
