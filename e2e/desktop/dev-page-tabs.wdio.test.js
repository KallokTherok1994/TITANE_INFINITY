/**
 * dev-page-tabs.wdio.test.js — Desktop proof for DevPage tab data-testids
 *
 * L1-L5:  Static source checks (always runs)
 * L6-L13: Runtime UI checks (requires TITANE_E2E_FULL=1)
 */

import fs from 'node:fs';
import path from 'node:path';
import { waitForTabActive } from './ui-driver.wdio.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const FULL = process.env.TITANE_E2E_FULL === '1';
const TIMEOUT = 15000;
const testId = id => `[data-testid="${id}"]`;

const DEV_TAB_IDS = [
  'tab-dev-overview',
  'tab-dev-diagnostics',
  'tab-dev-operations',
  'tab-dev-validation',
  'tab-dev-security',
];

describe('dev-page-tabs (WDIO desktop)', () => {
  describe('L1-L5 — Static source checks', () => {
    let src;

    before(() => {
      src = fs.readFileSync(
        path.resolve(__dirname, '../../src/pages/DevPage.tsx'),
        'utf-8'
      );
    });

    it('L1 — DevPage source contains tab-dev-overview data-testid', () => {
      expect(src.includes('tab-dev-overview')).toBe(true);
    });

    it('L2 — DevPage source contains tab-dev-diagnostics data-testid', () => {
      expect(src.includes('tab-dev-diagnostics')).toBe(true);
    });

    it('L3 — DevPage source contains tab-dev-operations data-testid', () => {
      expect(src.includes('tab-dev-operations')).toBe(true);
    });

    it('L4 — DevPage source contains tab-dev-validation data-testid', () => {
      expect(src.includes('tab-dev-validation')).toBe(true);
    });

    it('L5 — DevPage source contains tab-dev-security data-testid', () => {
      expect(src.includes('tab-dev-security')).toBe(true);
    });
  });

  describe('L6-L13 — Runtime UI checks', () => {
    before(function () {
      if (!FULL) this.skip();
    });

    before(async () => {
      await browser.url('/dev');
      await $(testId('page-dev')).waitForDisplayed({ timeout: TIMEOUT });
      // Wait for the first tab to appear
      await $(testId('tab-dev-overview')).waitForDisplayed({ timeout: TIMEOUT });
    });

    it('L6 — page-dev root is present', async () => {
      expect(await $(testId('page-dev')).isDisplayed()).toBe(true);
    });

    it('L7 — tab-dev-overview is clickable and becomes active', async () => {
      await $(testId('tab-dev-overview')).click();
      await waitForTabActive(testId('tab-dev-overview'), TIMEOUT);
      expect(await $(testId('tab-dev-overview')).getAttribute('aria-selected')).toBe(
        'true'
      );
    });

    it('L8 — tab-dev-diagnostics is clickable and becomes active', async () => {
      await $(testId('tab-dev-diagnostics')).click();
      await waitForTabActive(testId('tab-dev-diagnostics'), TIMEOUT);
      expect(await $(testId('tab-dev-diagnostics')).getAttribute('aria-selected')).toBe(
        'true'
      );
    });

    it('L9 — tab-dev-diagnostics panel is visible after click', async () => {
      const panel = await $(testId('page-dev-diagnostics'));
      expect(await panel.isDisplayed()).toBe(true);
    });

    it('L10 — tab-dev-operations is clickable and becomes active', async () => {
      await $(testId('tab-dev-operations')).click();
      await waitForTabActive(testId('tab-dev-operations'), TIMEOUT);
      expect(await $(testId('tab-dev-operations')).getAttribute('aria-selected')).toBe(
        'true'
      );
    });

    it('L11 — tab-dev-operations panel is visible after click', async () => {
      const panel = await $(testId('page-dev-operations'));
      expect(await panel.isDisplayed()).toBe(true);
    });

    it('L12 — tab-dev-validation is clickable and becomes active', async () => {
      await $(testId('tab-dev-validation')).click();
      await waitForTabActive(testId('tab-dev-validation'), TIMEOUT);
      expect(await $(testId('tab-dev-validation')).getAttribute('aria-selected')).toBe(
        'true'
      );
    });

    it('L13 — tab-dev-security is clickable and becomes active', async () => {
      await $(testId('tab-dev-security')).click();
      await waitForTabActive(testId('tab-dev-security'), TIMEOUT);
      expect(await $(testId('tab-dev-security')).getAttribute('aria-selected')).toBe(
        'true'
      );
    });
  });
});
