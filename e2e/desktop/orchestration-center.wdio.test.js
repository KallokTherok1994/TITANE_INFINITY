/**
 * orchestration-center.wdio.test.js — Desktop smoke proof for /orchestration-center
 *
 * Source: src/pages/OrchestrationMetaCenter.tsx
 * Root testid: page-orchestration-meta-center
 *
 * L1:    Static source check (always runs)
 * L2-L5: Runtime smoke checks (requires TITANE_E2E_FULL=1)
 */

import fs from 'node:fs';
import path from 'node:path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const FULL = process.env.TITANE_E2E_FULL === '1';
const TIMEOUT = 20000;
const testId = id => `[data-testid="${id}"]`;

describe('orchestration-center (WDIO desktop)', () => {
  describe('L1 — Static source check', () => {
    it('L1 — OrchestrationMetaCenter source contains canonical root testid', () => {
      const src = fs.readFileSync(
        path.resolve(__dirname, '../../src/pages/OrchestrationMetaCenter.tsx'),
        'utf-8'
      );
      expect(src.includes('page-orchestration-meta-center')).toBe(true);
    });
  });

  describe('L2-L5 — Runtime smoke checks', () => {
    before(function () {
      if (!FULL) this.skip();
    });

    before(async () => {
      await browser.url('/orchestration-center');
      await $(testId('page-orchestration-meta-center')).waitForDisplayed({ timeout: TIMEOUT });
    });

    it('L2 — page-orchestration-meta-center root is displayed', async () => {
      expect(await $(testId('page-orchestration-meta-center')).isDisplayed()).toBe(true);
    });

    it('L3 — page loads without crash (no error boundary)', async () => {
      const errorBoundaries = await $$('[data-error-boundary="true"]');
      // Error boundaries should exist but not be in error state
      for (const el of errorBoundaries) {
        const hasError = await el.getAttribute('data-error');
        expect(hasError).not.toBe('true');
      }
    });

    it('L4 — page title or heading is present', async () => {
      const hasH1orH2 = await browser.execute(() => {
        return document.querySelectorAll('h1, h2').length > 0;
      });
      expect(hasH1orH2).toBe(true);
    });

    it('L5 — URL remains on /orchestration-center (no unexpected redirect)', async () => {
      const pathname = await browser.execute(() => window.location.pathname);
      expect(pathname).toBe('/orchestration-center');
    });
  });
});
