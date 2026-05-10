/**
 * ui-desktop-control-inventory.wdio.test.js
 * TITANE_INFINITY — UI_DESKTOP_FULL_COVERAGE_v50
 *
 * Desktop E2E: DOM crawler — discovers all interactive elements per route,
 * counts buttons/inputs/links/data-testids, and outputs a live inventory.
 *
 * L1 static: verify static inventory JSON is consistent.
 * L4 desktop: crawl DOM of each route, output live counts to JSON.
 */

import { writeFileSync, mkdirSync } from 'fs';
import {resolve, dirname} from 'path';

import { getAllRoutes, getRouteEntry, getSimulatedRoutes } from './helpers/uiDesktopManifest.js';
import { scanInteractiveElements, assertPageHasTitle, classifyPageState } from './helpers/uiDesktopAssertions.js';
import { navigateToRoute } from './helpers/uiDesktopActions.js';
import { logProof, writeFinalSummary } from './helpers/uiDesktopScreenshots.js';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const IS_FULL = process.env.TITANE_E2E_FULL === '1';

const LIVE_INVENTORY_PATH = resolve(__dirname, '../../docs/ui/desktop/generated/UI_DESKTOP_CONTROL_INVENTORY_LIVE_v50.json');

describe('TITANE Desktop — Control Inventory (v50)', () => {
  // ──────────────────────────────────────────────────────
  // L1 — Static checks on registry-derived inventory
  // ──────────────────────────────────────────────────────

  describe('L1 Static — Static Control Inventory', () => {
    it('29 routes are in manifest', () => {
      expect(getAllRoutes().length).toBe(29);
    });

    it('all routes have rootTestId defined', () => {
      for (const r of getAllRoutes()) {
        const entry = getRouteEntry(r);
        expect(entry.rootTestId).toBeTruthy();
      }
    });

    it('2 simulated routes are properly classified', () => {
      const sim = getSimulatedRoutes();
      expect(sim.length).toBe(2);
    });

    it('routes with tabs have tab selectors defined', () => {
      for (const r of getAllRoutes()) {
        const entry = getRouteEntry(r);
        for (const tab of entry.tabs) {
          expect(tab.selector).toBeTruthy();
          expect(typeof tab.selector).toBe('string');
        }
      }
    });

    it('visible actions have safeActionPolicy defined', () => {
      for (const r of getAllRoutes()) {
        const entry = getRouteEntry(r);
        for (const action of entry.visibleActions) {
          expect(action.safeActionPolicy).toBeTruthy();
        }
      }
    });
  });

  // ──────────────────────────────────────────────────────
  // L4 — Live DOM crawl per route
  // ──────────────────────────────────────────────────────

  if (IS_FULL) {
    describe('L4 Desktop — DOM Inventory Crawl', () => {
      const routes = getAllRoutes();
      const liveInventory = [];

      before(() => {
        mkdirSync(resolve(__dirname, '../../docs/ui/desktop/generated'), { recursive: true });
        logProof({ type: 'SUITE_START', suite: 'ui-desktop-control-inventory', routeCount: routes.length });
      });

      after(() => {
        // Write live inventory JSON
        try {
          writeFileSync(LIVE_INVENTORY_PATH, JSON.stringify({
            generated: new Date().toISOString(),
            mission: 'UI_DESKTOP_FULL_COVERAGE_v50',
            source: 'LIVE_DOM_CRAWL',
            routes: liveInventory,
          }, null, 2));
          console.log(`[v50:inventory] Live inventory written to: ${LIVE_INVENTORY_PATH}`);
        } catch (e) {
          console.warn('[v50:inventory] Failed to write live inventory:', e.message);
        }

        const total = liveInventory.reduce((s, r) => s + r.counts.buttons + r.counts.inputs, 0);
        writeFinalSummary({ suite: 'ui-desktop-control-inventory', routes: liveInventory.length, totalInteractiveElements: total });
        console.log(`[v50:inventory] Scanned ${liveInventory.length} routes, ${total} interactive elements total`);
      });

      for (const route of routes) {
        const entry = getRouteEntry(route);

        it(`scan DOM of ${route} (${entry.pageComponent})`, async () => {
          await navigateToRoute(route);
          await browser.pause(600);

          const rootSelector = `[data-testid="${entry.rootTestId}"]`;
          const rootEl = await $(rootSelector);
          const rootExists = await rootEl.isExisting().catch(() => false);

          const pageState = await classifyPageState();
          const titleInfo = await assertPageHasTitle();
          const counts = await scanInteractiveElements();

          const routeData = {
            route,
            pageId: entry.pageId,
            pageComponent: entry.pageComponent,
            rootTestId: entry.rootTestId,
            truthClass: entry.truthClass,
            isSimulated: entry.isSimulated,
            rootExists,
            pageState,
            title: titleInfo.text,
            hasTitle: titleInfo.hasTitle,
            counts,
            tabsFromRegistry: entry.tabs.length,
            actionsFromRegistry: entry.visibleActions.length,
          };

          liveInventory.push(routeData);

          logProof({ type: 'CONTROL_INVENTORY', route, pageState, counts, rootExists });

          // For simulated: any state is acceptable
          if (entry.isSimulated) {
            expect(pageState).toBeDefined();
            return;
          }

          // For real routes: must not be fully blank
          const knownBlankRoutes = []; // no known-blank routes; update if found
          if (!knownBlankRoutes.includes(route)) {
            expect(['LIVE', 'DEGRADED', 'LOADING']).toContain(pageState);
          }
        });
      }
    });
  } else {
    it('L4 DOM crawl skipped (set TITANE_E2E_FULL=1 to enable)', () => {
      console.log('[ui-desktop-control-inventory] TITANE_E2E_FULL not set — L4 skipped');
      expect(true).toBe(true);
    });
  }
});
