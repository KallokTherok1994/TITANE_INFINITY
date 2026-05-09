import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

import { uiPages } from './page-objects/uiPages.po.js';
import {
  captureFailureScreenshot,
  ensureArtifactsDir,
  gotoTopNavPage,
  waitAppReady,
  waitForTabActive,
} from './ui-driver.wdio.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const FULL = process.env.TITANE_E2E_FULL === '1';
const TIMEOUT = 20000;
const testId = id => `[data-testid="${id}"]`;

describe('time-runtime-truth (WDIO desktop)', () => {
  before(async () => {
    await ensureArtifactsDir();
  });

  afterEach(async function () {
    if (this.currentTest?.state === 'failed') {
      await captureFailureScreenshot(this.currentTest.fullTitle());
    }
  });

  describe('S1-S4 — Static source checks', () => {
    let src;

    before(() => {
      src = fs.readFileSync(
        path.resolve(__dirname, '../../src/pages/TimePage.tsx'),
        'utf-8'
      );
    });

    it('S1 — TimePage publishes page-time and time-runtime-source selectors', () => {
      expect(src.includes('data-testid="page-time"')).toBe(true);
      expect(src.includes('data-testid="time-runtime-source"')).toBe(true);
    });

    it('S2 — TimePage publishes snapshots runtime selectors', () => {
      expect(src.includes('data-testid="time-snapshots-section"')).toBe(true);
      expect(src.includes('data-testid="time-snapshot-runtime-note"')).toBe(true);
      expect(src.includes('data-testid="time-snapshot-list"')).toBe(true);
    });

    it('S3 — TimePage publishes timeline and cognitive selectors', () => {
      expect(src.includes('data-testid="time-timeline-section"')).toBe(true);
      expect(src.includes('data-testid="time-timeline-visible-count"')).toBe(true);
      expect(src.includes('data-testid="time-cognitive-section"')).toBe(true);
      expect(src.includes('data-testid="time-flow-state"')).toBe(true);
    });

    it('S4 — TimePage creates snapshots through titanForceSnapshotCurrent', () => {
      expect(src.includes('tauriClient.titanForceSnapshotCurrent()')).toBe(true);
    });
  });

  describe('R1-R8 — Runtime UI checks', () => {
    before(function () {
      if (!FULL) this.skip();
    });

    before(async () => {
      await waitAppReady();
      await gotoTopNavPage(uiPages.time);
      await $(testId('page-time')).waitForDisplayed({ timeout: TIMEOUT });
    });

    it('R1 — canonical /time surface opens and stays healthy', async () => {
      await browser.waitUntil(async () => (await browser.getUrl()).includes('/time'), {
        timeout: TIMEOUT,
        timeoutMsg: 'TIME route did not open',
      });
      assert.equal(await $(testId('page-time')).isDisplayed(), true);
    });

    it('R2 — runtime source is visible on the page header', async () => {
      const runtimeSource = await $(testId('time-runtime-source'));
      await runtimeSource.waitForDisplayed({ timeout: TIMEOUT });
      const attr = await runtimeSource.getAttribute('data-runtime-source');
      assert.ok(
        attr === 'persistence-active' || attr === 'degraded' || attr === 'uninitialized'
      );
    });

    it('R3 — agenda controls are active and manual event creation keeps runtime list alive', async () => {
      await $(testId('tab-time-agenda')).click();
      await waitForTabActive(testId('tab-time-agenda'), TIMEOUT);
      await $(testId('btn-time-add-manual')).click();

      await browser.waitUntil(
        async () =>
          browser.execute(() => {
            return (
              document.querySelectorAll('[data-testid="time-agenda-event"]').length >= 1
            );
          }),
        {
          timeout: TIMEOUT,
          timeoutMsg: 'No agenda event rendered after manual creation',
        }
      );
    });

    it('R4 — timeline section is active and publishes visible count', async () => {
      await $(testId('tab-time-timeline')).click();
      await waitForTabActive(testId('tab-time-timeline'), TIMEOUT);
      assert.equal(await $(testId('time-timeline-section')).isDisplayed(), true);
      const countText = await $(testId('time-timeline-visible-count')).getText();
      assert.match(countText, /\d+ événement/);
    });

    it('R5 — snapshots section is active and exposes runtime note', async () => {
      await $(testId('tab-time-snapshots')).click();
      await waitForTabActive(testId('tab-time-snapshots'), TIMEOUT);
      assert.equal(await $(testId('time-snapshots-section')).isDisplayed(), true);
      assert.equal(await $(testId('time-snapshot-runtime-note')).isDisplayed(), true);
    });

    it('R6 — creating a snapshot does not break the TIME runtime surface', async () => {
      await $(testId('btn-time-create-snapshot')).click();

      await browser.waitUntil(
        async () =>
          browser.execute(() => {
            const root = document.querySelector('[data-testid="time-snapshots-section"]');
            const note = document.querySelector(
              '[data-testid="time-snapshot-runtime-note"]'
            );
            return Boolean(root && note);
          }),
        {
          timeout: TIMEOUT,
          timeoutMsg: 'TIME snapshots section became unstable after snapshot creation',
        }
      );
    });

    it('R7 — cognitive flow toggle persists active state in localStorage', async () => {
      await $(testId('tab-time-cognitive')).click();
      await waitForTabActive(testId('tab-time-cognitive'), TIMEOUT);
      const toggle = await $(testId('btn-time-flow-toggle'));

      const isFlowActive = async () =>
        browser.execute(() => {
          const raw = localStorage.getItem('titane_cognitive_state');
          if (!raw) return false;
          try {
            const parsed = JSON.parse(raw);
            return parsed.flowActive === true;
          } catch {
            return false;
          }
        });

      if (await isFlowActive()) {
        await toggle.click();
        await browser.waitUntil(async () => !(await isFlowActive()), {
          timeout: TIMEOUT,
          timeoutMsg: 'Cognitive flow state could not be reset before activation check',
        });
      }

      await toggle.click();

      await browser.waitUntil(
        async () =>
          browser.execute(() => {
            const raw = localStorage.getItem('titane_cognitive_state');
            if (!raw) return false;
            try {
              const parsed = JSON.parse(raw);
              return parsed.flowActive === true && parsed.mode === 'deep-work';
            } catch {
              return false;
            }
          }),
        {
          timeout: TIMEOUT,
          timeoutMsg: 'Cognitive flow state was not persisted in localStorage',
        }
      );

      assert.equal(await $(testId('time-flow-state')).isDisplayed(), true);
    });

    it('R8 — returning to now keeps TIME canonical root healthy', async () => {
      await $(testId('tab-time-now')).click();
      await waitForTabActive(testId('tab-time-now'), TIMEOUT);
      assert.equal(await $(testId('time-current-segment')).isDisplayed(), true);
      assert.equal(await $(testId('page-time')).isDisplayed(), true);
    });
  });
});
