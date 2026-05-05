/**
 * titane-tabs-labels.wdio.test.js — Desktop proof for updated Titane tab labels
 *
 * L1-L3: Static checks (always runs)
 * L4-L10: Runtime checks (requires TITANE_E2E_FULL=1)
 */

const fs = require('fs');
const path = require('path');

const FULL = process.env.TITANE_E2E_FULL === '1';
const TIMEOUT = 15000;
const testId = id => `[data-testid="${id}"]`;

describe('titane-tabs-labels (WDIO desktop)', () => {
  describe('L1-L3 — Static source checks', () => {
    it('L1 — TitanePage source contains updated labels', () => {
      const src = fs.readFileSync(
        path.resolve(__dirname, '../../src/pages/TitanePage.tsx'),
        'utf-8'
      );

      expect(src.includes('📊 Dashboard')).toBe(true);
      expect(src.includes('⚡ Progression')).toBe(true);
      expect(src.includes('🌱 Évolution')).toBe(true);
    });

    it('L2 — TitanePage source no longer contains legacy labels', () => {
      const src = fs.readFileSync(
        path.resolve(__dirname, '../../src/pages/TitanePage.tsx'),
        'utf-8'
      );

      expect(src.includes('📊 Vue')).toBe(false);
      expect(src.includes('⚡ XP')).toBe(false);
      expect(src.includes('🌱 Transform & Évo')).toBe(false);
    });

    it('L3 — All canonical tab data-testids are still present', () => {
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
      ].forEach(token => expect(src.includes(token)).toBe(true));
    });
  });

  describe('L4-L10 — Runtime UI checks', () => {
    before(function () {
      if (!FULL) this.skip();
    });

    before(async () => {
      await browser.url('/titane');
      await $(testId('tab-conversation')).waitForDisplayed({ timeout: TIMEOUT });
    });

    it('L4 — tab-overview displays Dashboard', async () => {
      const text = await (await $(testId('tab-overview'))).getText();
      expect(text).toContain('Dashboard');
    });

    it('L5 — tab-progression displays Progression', async () => {
      const text = await (await $(testId('tab-progression'))).getText();
      expect(text).toContain('Progression');
    });

    it('L6 — tab-transformation displays Évolution', async () => {
      const text = await (await $(testId('tab-transformation'))).getText();
      expect(text).toContain('Évolution');
    });

    it('L7 — legacy label Vue is absent', async () => {
      const bodyText = await $('body').getText();
      expect(bodyText.includes('📊 Vue')).toBe(false);
    });

    it('L8 — legacy label XP is absent', async () => {
      const bodyText = await $('body').getText();
      expect(bodyText.includes('⚡ XP')).toBe(false);
    });

    it('L9 — legacy label Transform & Évo is absent', async () => {
      const bodyText = await $('body').getText();
      expect(bodyText.includes('🌱 Transform & Évo')).toBe(false);
    });

    it('L10 — updated tabs remain clickable and selected', async () => {
      const overview = await $(testId('tab-overview'));
      await overview.click();
      expect(await overview.getAttribute('aria-selected')).toBe('true');

      const progression = await $(testId('tab-progression'));
      await progression.click();
      expect(await progression.getAttribute('aria-selected')).toBe('true');

      const transformation = await $(testId('tab-transformation'));
      await transformation.click();
      expect(await transformation.getAttribute('aria-selected')).toBe('true');
    });
  });
});
