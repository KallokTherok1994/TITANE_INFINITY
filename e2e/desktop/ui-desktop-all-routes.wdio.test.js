/**
 * ui-desktop-all-routes.wdio.test.js
 * TITANE_INFINITY — UI_DESKTOP_FULL_COVERAGE_v50
 *
 * Desktop E2E: verify all 29 canonical routes load (or are honestly classified as
 * SIMULATED/DEGRADED/NOT_FOUND). Confirms each route has a root data-testid
 * and produces no blank/white page.
 *
 * L1 (static) runs always.
 * L4 (desktop WDIO) requires TITANE_E2E_FULL=1.
 */

'use strict';

const { getAllRoutes, getRouteEntry, getSummary, getSimulatedRoutes } = require('./helpers/uiDesktopManifest');
const { pageRootSelector } = require('./helpers/uiDesktopSelectors');
const { assertPageClassification, classifyPageState, waitForLoadingComplete } = require('./helpers/uiDesktopAssertions');
const { logRouteResult, writeFinalSummary, logProof } = require('./helpers/uiDesktopScreenshots');

const IS_FULL = process.env.TITANE_E2E_FULL === '1';

describe('TITANE Desktop — All Routes (v50)', () => {
  // ──────────────────────────────────────────────────────
  // L1 — Static manifest validity (always runs)
  // ──────────────────────────────────────────────────────

  describe('L1 Static — Route Manifest', () => {
    it('manifest has 29 canonical routes', () => {
      const routes = getAllRoutes();
      expect(routes.length).toBe(29);
    });

    it('all routes start with /', () => {
      const routes = getAllRoutes();
      for (const r of routes) {
        expect(r.startsWith('/')).toBe(true);
      }
    });

    it('all routes have a rootTestId', () => {
      const routes = getAllRoutes();
      for (const r of routes) {
        const entry = getRouteEntry(r);
        expect(entry.rootTestId).toBeTruthy();
        expect(typeof entry.rootTestId).toBe('string');
      }
    });

    it('all routes have a truthClass', () => {
      const routes = getAllRoutes();
      const validClasses = [
        'MIXED_LIVE_AND_STATIC',
        'LIVE_TAURI',
        'LIVE_TAURI_SERVICE_BRIDGE',
        'LIVE_TAURI_GOVERNED',
        'LIVE_TAURI_WITH_FALLBACK',
        'SIMULATED_UI',
        'LIVE_CONTAINER_WITH_LAZY_FALLBACK_UI',
      ];
      for (const r of routes) {
        const entry = getRouteEntry(r);
        expect(validClasses).toContain(entry.truthClass);
      }
    });

    it('exactly 2 SIMULATED_UI routes exist', () => {
      const simulated = getSimulatedRoutes();
      expect(simulated.length).toBe(2);
      const simulatedRoutes = simulated.map(r => r.route);
      expect(simulatedRoutes).toContain('/orchestration-intelligence');
      expect(simulatedRoutes).toContain('/quantum-center');
    });

    it('manifest summary matches expected counts', () => {
      const summary = getSummary();
      expect(summary.routeCount).toBe(29);
      expect(summary.tabCount).toBe(22);
      expect(summary.aliasCount).toBe(65);
      expect(summary.mission).toBe('UI_DESKTOP_FULL_COVERAGE_v50');
    });

    it('all routes have a pageComponent', () => {
      const routes = getAllRoutes();
      for (const r of routes) {
        const entry = getRouteEntry(r);
        expect(entry.pageComponent).toBeTruthy();
      }
    });

    it('all routes have a pageId', () => {
      const routes = getAllRoutes();
      for (const r of routes) {
        const entry = getRouteEntry(r);
        expect(entry.pageId).toBeTruthy();
      }
    });

    it('/performance is DISPLAY_ONLY status', () => {
      const entry = getRouteEntry('/performance');
      expect(entry.status).toBe('DISPLAY_ONLY');
    });

    it('/orchestration-intelligence is SIMULATED_UI', () => {
      const entry = getRouteEntry('/orchestration-intelligence');
      expect(entry.isSimulated).toBe(true);
    });

    it('/quantum-center is SIMULATED_UI', () => {
      const entry = getRouteEntry('/quantum-center');
      expect(entry.isSimulated).toBe(true);
    });

    it('/titane root testId is "page-titane"', () => {
      const entry = getRouteEntry('/titane');
      expect(entry.rootTestId).toBe('page-titane');
    });

    it('/admin truthClass includes LIVE', () => {
      const entry = getRouteEntry('/admin');
      expect(entry.truthClass).toContain('LIVE');
    });

    it('all routes have selectors.root defined', () => {
      const routes = getAllRoutes();
      for (const r of routes) {
        const entry = getRouteEntry(r);
        expect(entry.selectors?.root).toMatch(/^\[data-testid=/);
      }
    });

    it('all routes have testCoverage.routeTest defined', () => {
      const routes = getAllRoutes();
      for (const r of routes) {
        const entry = getRouteEntry(r);
        expect(entry.testCoverage?.routeTest).toContain('wdio.test.js');
      }
    });
  });

  // ──────────────────────────────────────────────────────
  // L4 — Desktop WDIO live navigation (requires TITANE_E2E_FULL=1)
  // ──────────────────────────────────────────────────────

  if (IS_FULL) {
    describe('L4 Desktop — Navigate All 29 Routes', () => {
      const routes = getAllRoutes();
      const results = [];

      beforeAll(() => {
        logProof({ type: 'SUITE_START', suite: 'ui-desktop-all-routes', routeCount: routes.length });
      });

      afterAll(() => {
        const loaded = results.filter(r => r.loaded);
        const simulated = results.filter(r => r.classification?.includes('SIMULATED'));
        const degraded = results.filter(r => r.classification?.includes('DEGRADED'));
        const errorBoundary = results.filter(r => r.classification?.includes('ERROR_BOUNDARY'));
        const notFound = results.filter(r => !r.loaded && !r.classification?.includes('SIMULATED'));

        writeFinalSummary({
          suite: 'ui-desktop-all-routes',
          total: routes.length,
          loaded: loaded.length,
          simulatedClassified: simulated.length,
          degraded: degraded.length,
          errorBoundary: errorBoundary.length,
          notFound: notFound.length,
          results,
        });

        console.log(`[v50:routes] ${loaded.length}/${routes.length} routes loaded | simulated=${simulated.length} degraded=${degraded.length} err=${errorBoundary.length} notFound=${notFound.length}`);
      });

      for (const route of routes) {
        const entry = getRouteEntry(route);
        const label = `${route} (${entry.pageComponent}) [${entry.truthClass}]`;

        it(`navigate to ${label}`, async () => {
          const hash = route.startsWith('/') ? route.slice(1) : route;
          await browser.url(`tauri://localhost/#/${hash}`);
          await browser.pause(600);
          await waitForLoadingComplete(5000);

          const rootSelector = `[data-testid="${entry.rootTestId}"]`;
          const classification = await assertPageClassification(rootSelector, entry.isSimulated, entry.isDisplayOnly);
          
          logRouteResult(route, classification.classification, {
            rootTestId: entry.rootTestId,
            truthClass: entry.truthClass,
            selector: rootSelector,
          });

          results.push({ route, ...classification });

          // For simulated routes: accept any state
          if (entry.isSimulated) {
            expect(['SIMULATED_NOT_FOUND_EXPECTED', 'SIMULATED_WITH_ERROR_BOUNDARY_EXPECTED', 'LIVE_LOADED', 'DEGRADED_CLASSIFIED']).toContain(classification.classification);
            return;
          }

          // For real routes: page must at least exist (may be DEGRADED)
          expect(['LIVE_LOADED', 'DEGRADED_CLASSIFIED', 'DISPLAY_ONLY_LOADED']).toContain(classification.classification);
        });
      }
    });
  } else {
    it('L4 desktop navigation skipped (set TITANE_E2E_FULL=1 to enable)', () => {
      console.log('[ui-desktop-all-routes] TITANE_E2E_FULL not set — L4 skipped');
      expect(true).toBe(true);
    });
  }
});
