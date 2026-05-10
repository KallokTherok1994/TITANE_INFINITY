/**
 * ui-desktop-error-boundary-and-empty-state.wdio.test.js
 * TITANE_INFINITY — UI_DESKTOP_FULL_COVERAGE_v50
 *
 * Desktop E2E: verify that error boundaries are not unexpectedly triggered,
 * and that degraded/empty states are properly classified (not silent blanks).
 *
 * L1: static — all routes have error boundary strategy classified.
 * L4: navigate each route, scan for ErrorBoundary, classify degraded states.
 */

'use strict';

const { getAllRoutes, getRouteEntry, getSimulatedRoutes } = require('./helpers/uiDesktopManifest');
const { navigateToRoute } = require('./helpers/uiDesktopActions');
const {
  assertNoUnexpectedErrorBoundary,
  waitForPageRoot,
  waitForLoadingComplete,
  classifyPageState,
  hasAnySelector,
  DEGRADED_SELECTORS,
  ERROR_BOUNDARY_SELECTORS,
} = require('./helpers/uiDesktopAssertions');
const { logProof, writeFinalSummary } = require('./helpers/uiDesktopScreenshots');

const IS_FULL = process.env.TITANE_E2E_FULL === '1';

describe('TITANE Desktop — Error Boundaries & Empty States (v50)', () => {
  // ──────────────────────────────────────────────────────
  // L1 — Static: verify error boundary classification schema
  // ──────────────────────────────────────────────────────

  describe('L1 Static — Error Boundary Classification', () => {
    it('all routes have knownBlockers array', () => {
      for (const r of getAllRoutes()) {
        const entry = getRouteEntry(r);
        expect(Array.isArray(entry.knownBlockers)).toBe(true);
      }
    });

    it('simulated routes have SIMULATED_UI in knownBlockers', () => {
      for (const r of getSimulatedRoutes()) {
        const entry = getRouteEntry(r.route);
        const hasSimBlocker = entry.knownBlockers.some(b => b.includes('SIMULATED'));
        expect(hasSimBlocker).toBe(true);
      }
    });

    it('/performance has DISPLAY_ONLY in knownBlockers', () => {
      const entry = getRouteEntry('/performance');
      const hasDisplayOnly = entry.knownBlockers.some(b => b.includes('DISPLAY_ONLY'));
      expect(hasDisplayOnly).toBe(true);
    });

    it('error boundary selectors list is non-empty', () => {
      expect(ERROR_BOUNDARY_SELECTORS.length).toBeGreaterThan(0);
    });

    it('degraded state selectors list is non-empty', () => {
      expect(DEGRADED_SELECTORS.length).toBeGreaterThan(0);
    });

    it('all routes have desktopProofRequired field', () => {
      for (const r of getAllRoutes()) {
        const entry = getRouteEntry(r);
        expect(typeof entry.desktopProofRequired).toBe('boolean');
      }
    });

    it('simulated routes have desktopProofRequired=false', () => {
      for (const r of getSimulatedRoutes()) {
        expect(r.desktopProofRequired).toBe(false);
      }
    });

    it('non-simulated routes have desktopProofRequired=true', () => {
      const nonSim = getAllRoutes()
        .map(r => getRouteEntry(r))
        .filter(e => !e.isSimulated);
      for (const e of nonSim) {
        expect(e.desktopProofRequired).toBe(true);
      }
    });
  });

  // ──────────────────────────────────────────────────────
  // L4 — Desktop: navigate all routes, scan for error boundaries
  // ──────────────────────────────────────────────────────

  if (IS_FULL) {
    describe('L4 Desktop — Error Boundary + Empty State Scan', () => {
      const routes = getAllRoutes();
      const results = [];

      beforeAll(() => {
        logProof({ type: 'SUITE_START', suite: 'ui-desktop-error-boundary-and-empty-state', routeCount: routes.length });
      });

      afterAll(() => {
        const unexpectedEB = results.filter(r => r.hasUnexpectedErrorBoundary);
        const degraded = results.filter(r => r.pageState === 'DEGRADED');
        const blank = results.filter(r => r.pageState === 'BLANK');
        const live = results.filter(r => r.pageState === 'LIVE');

        writeFinalSummary({
          suite: 'ui-desktop-error-boundary-and-empty-state',
          total: results.length,
          live: live.length,
          degraded: degraded.length,
          blank: blank.length,
          unexpectedErrorBoundary: unexpectedEB.length,
          unexpectedRoutes: unexpectedEB.map(r => r.route),
          results,
        });

        console.log(`[v50:error-boundary] live=${live.length} degraded=${degraded.length} blank=${blank.length} unexpectedEB=${unexpectedEB.length}`);
      });

      for (const route of routes) {
        const entry = getRouteEntry(route);

        it(`no unexpected error boundary on ${route}`, async () => {
          await navigateToRoute(route);
          await browser.pause(600);
          await waitForLoadingComplete(5000);

          const pageState = await classifyPageState();
          const ebResult = await assertNoUnexpectedErrorBoundary(route, entry.isSimulated);
          const hasDegraded = await hasAnySelector(DEGRADED_SELECTORS);

          logProof({
            type: 'ERROR_BOUNDARY_SCAN',
            route,
            pageState,
            hasErrorBoundary: ebResult.hasErrorBoundary,
            isExpectedForSimulated: ebResult.isExpectedForSimulated,
            hasDegraded,
            isSimulated: entry.isSimulated,
          });

          results.push({
            route,
            pageState,
            hasErrorBoundary: ebResult.hasErrorBoundary,
            hasUnexpectedErrorBoundary: ebResult.unexpected === true,
            isExpectedForSimulated: ebResult.isExpectedForSimulated,
            hasDegraded,
            isSimulated: entry.isSimulated,
          });

          // Core assertion: no unexpected error boundaries on real (non-simulated) routes
          if (!entry.isSimulated) {
            expect(ebResult.unexpected).not.toBe(true);
          }

          // Core assertion: no silent blank pages on real routes
          if (!entry.isSimulated) {
            expect(['LIVE', 'DEGRADED', 'ERROR_BOUNDARY', 'LOADING']).toContain(pageState);
          }
        });
      }
    });
  } else {
    it('L4 error boundary scan skipped (set TITANE_E2E_FULL=1 to enable)', () => {
      console.log('[ui-desktop-error-boundary-and-empty-state] TITANE_E2E_FULL not set — L4 skipped');
      expect(true).toBe(true);
    });
  }
});
