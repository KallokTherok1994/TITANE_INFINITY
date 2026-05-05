/**
 * fusion-page.wdio.test.js — Desktop smoke proof for /fusion (PerfectFusionDashboard)
 *
 * Source: src/pages/PerfectFusionDashboard.tsx
 * Root testid: page-fusion
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

describe('fusion-page (WDIO desktop)', () => {
  describe('L1 — Static source check', () => {
    it('L1 — PerfectFusionDashboard source contains canonical root testid', () => {
      const src = fs.readFileSync(
        path.resolve(__dirname, '../../src/pages/PerfectFusionDashboard.tsx'),
        'utf-8'
      );
      expect(src.includes('data-testid="page-fusion"')).toBe(true);
    });
  });

  describe('L2-L5 — Runtime smoke checks', () => {
    before(function () {
      if (!FULL) this.skip();
    });

    before(async () => {
      await browser.url('/fusion');
      await $(testId('page-fusion')).waitForDisplayed({ timeout: TIMEOUT });
    });

    it('L2 — page-fusion root is displayed', async () => {
      expect(await $(testId('page-fusion')).isDisplayed()).toBe(true);
    });

    it('L3 — page loads without crash', async () => {
      const hasError = await browser.execute(() => {
        return document.body.textContent.includes('Something went wrong');
      });
      expect(hasError).toBe(false);
    });

    it('L4 — page title or heading is present', async () => {
      const hasH1orH2 = await browser.execute(() => {
        return document.querySelectorAll('h1, h2').length > 0;
      });
      expect(hasH1orH2).toBe(true);
    });

    it('L5 — URL remains on /fusion (no unexpected redirect)', async () => {
      const pathname = await browser.execute(() => window.location.pathname);
      expect(pathname).toBe('/fusion');
    });
  });
});
