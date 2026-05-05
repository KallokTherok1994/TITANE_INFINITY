/**
 * time-page-tabs.wdio.test.js — Desktop proof for TimePage tab data-testids
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

const TIME_TAB_IDS = [
  'tab-time-now',
  'tab-time-agenda',
  'tab-time-timeline',
  'tab-time-snapshots',
  'tab-time-cognitive',
];

describe('time-page-tabs (WDIO desktop)', () => {
  describe('L1-L5 — Static source checks', () => {
    let src;

    before(() => {
      src = fs.readFileSync(
        path.resolve(__dirname, '../../src/pages/TimePage.tsx'),
        'utf-8'
      );
    });

    it('L1 — TimePage source contains tab-time-now data-testid', () => {
      expect(src.includes('tab-time-now')).toBe(true);
    });

    it('L2 — TimePage source contains tab-time-agenda data-testid', () => {
      expect(src.includes('tab-time-agenda')).toBe(true);
    });

    it('L3 — TimePage source contains tab-time-timeline data-testid', () => {
      expect(src.includes('tab-time-timeline')).toBe(true);
    });

    it('L4 — TimePage source contains tab-time-snapshots data-testid', () => {
      expect(src.includes('tab-time-snapshots')).toBe(true);
    });

    it('L5 — TimePage source contains tab-time-cognitive data-testid', () => {
      expect(src.includes('tab-time-cognitive')).toBe(true);
    });
  });

  describe('L6-L13 — Runtime UI checks', () => {
    before(function () {
      if (!FULL) this.skip();
    });

    before(async () => {
      await browser.url('/time');
      await $(testId('page-time')).waitForDisplayed({ timeout: TIMEOUT });
      await $(testId('tab-time-now')).waitForDisplayed({ timeout: TIMEOUT });
    });

    it('L6 — page-time root is present', async () => {
      expect(await $(testId('page-time')).isDisplayed()).toBe(true);
    });

    it('L7 — tab-time-now is clickable and becomes active', async () => {
      await $(testId('tab-time-now')).click();
      await waitForTabActive(testId('tab-time-now'), TIMEOUT);
      expect(await $(testId('tab-time-now')).getAttribute('aria-selected')).toBe('true');
    });

    it('L8 — tab-time-agenda is clickable and becomes active', async () => {
      await $(testId('tab-time-agenda')).click();
      await waitForTabActive(testId('tab-time-agenda'), TIMEOUT);
      expect(await $(testId('tab-time-agenda')).getAttribute('aria-selected')).toBe(
        'true'
      );
    });

    it('L9 — tab-time-timeline is clickable and becomes active', async () => {
      await $(testId('tab-time-timeline')).click();
      await waitForTabActive(testId('tab-time-timeline'), TIMEOUT);
      expect(await $(testId('tab-time-timeline')).getAttribute('aria-selected')).toBe(
        'true'
      );
    });

    it('L10 — tab-time-snapshots is clickable and becomes active', async () => {
      await $(testId('tab-time-snapshots')).click();
      await waitForTabActive(testId('tab-time-snapshots'), TIMEOUT);
      expect(await $(testId('tab-time-snapshots')).getAttribute('aria-selected')).toBe(
        'true'
      );
    });

    it('L11 — tab-time-cognitive is clickable and becomes active', async () => {
      await $(testId('tab-time-cognitive')).click();
      await waitForTabActive(testId('tab-time-cognitive'), TIMEOUT);
      expect(await $(testId('tab-time-cognitive')).getAttribute('aria-selected')).toBe(
        'true'
      );
    });

    it('L12 — all 5 time tab data-testids are present in DOM', async () => {
      for (const id of TIME_TAB_IDS) {
        expect(await $(testId(id)).isExisting()).toBe(true);
      }
    });

    it('L13 — navigating back to tab-time-now restores active state', async () => {
      await $(testId('tab-time-now')).click();
      await waitForTabActive(testId('tab-time-now'), TIMEOUT);
      expect(await $(testId('tab-time-now')).getAttribute('aria-selected')).toBe('true');
    });
  });
});
