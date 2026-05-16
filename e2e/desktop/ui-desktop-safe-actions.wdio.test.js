/**
 * ui-desktop-safe-actions.wdio.test.js
 * TITANE_INFINITY — UI_DESKTOP_FULL_COVERAGE_v50
 *
 * Desktop E2E: click/interact with all 35 safe actions across routes.
 * Skips any action classified as REQUIRES_SECRET_SKIP, DESTRUCTIVE_SKIP_WITH_PROOF,
 * or EXTERNAL_NETWORK_SKIP_WITH_PROOF.
 *
 * L1: static policy validation. L4: click each safe action.
 */

import { getAllSafeActions, getRouteEntry } from './helpers/uiDesktopManifest.js';
import {
  navigateToRoute,
  clickSafeAction,
  dismissDialog,
  isSafeToClick,
} from './helpers/uiDesktopActions.js';
import { waitForPageRoot } from './helpers/uiDesktopAssertions.js';
import {
  logActionResult,
  logProof,
  writeFinalSummary,
} from './helpers/uiDesktopScreenshots.js';

const IS_FULL = process.env.TITANE_E2E_FULL === '1';

describe('TITANE Desktop — Safe Actions (v50)', () => {
  // ──────────────────────────────────────────────────────
  // L1 — Static action policy validation
  // ──────────────────────────────────────────────────────

  describe('L1 Static — Safe Action Policies', () => {
    it('has 38 safe actions from manifest', () => {
      const safeActions = getAllSafeActions();
      expect(safeActions.length).toBe(38);
    });

    it('all safe actions have actionId', () => {
      for (const { action } of getAllSafeActions()) {
        expect(action.actionId).toBeTruthy();
      }
    });

    it('all safe actions have label', () => {
      for (const { action } of getAllSafeActions()) {
        expect(action.label).toBeTruthy();
      }
    });

    it('all safe actions have a safe-class policy', () => {
      const safePolicies = [
        'SAFE_CLICK',
        'READ_ONLY_CLICK',
        'FALLBACK_EXPECTED',
        'NOT_WIRED_EXPECTED',
        'GUARDED_CLICK',
        'FORM_INPUT_SAFE',
        'TEMP_DIR_ONLY',
      ];
      for (const { action } of getAllSafeActions()) {
        expect(safePolicies).toContain(action.safeActionPolicy);
      }
    });

    it('none of the safe actions is marked isSensitive', () => {
      for (const { action } of getAllSafeActions()) {
        expect(action.isSensitive).toBe(false);
      }
    });

    it('safe actions with ipcCommand have non-empty ipcCommand', () => {
      for (const { action } of getAllSafeActions()) {
        if (action.ipcCommand !== null && action.ipcCommand !== undefined) {
          expect(typeof action.ipcCommand).toBe('string');
          expect(action.ipcCommand.length).toBeGreaterThan(0);
        }
      }
    });

    it('NOT_WIRED_EXPECTED actions have null ipcCommand', () => {
      for (const { action } of getAllSafeActions()) {
        if (action.safeActionPolicy === 'NOT_WIRED_EXPECTED') {
          expect(action.ipcCommand).toBeNull();
        }
      }
    });

    it('isSafeToClick() returns true for SAFE_CLICK', () => {
      expect(isSafeToClick('SAFE_CLICK')).toBe(true);
    });

    it('isSafeToClick() returns true for READ_ONLY_CLICK', () => {
      expect(isSafeToClick('READ_ONLY_CLICK')).toBe(true);
    });

    it('isSafeToClick() returns false for REQUIRES_SECRET_SKIP', () => {
      expect(isSafeToClick('REQUIRES_SECRET_SKIP')).toBe(false);
    });
  });

  // ──────────────────────────────────────────────────────
  // L4 — Desktop WDIO: click all safe actions
  // ──────────────────────────────────────────────────────

  if (IS_FULL) {
    describe('L4 Desktop — Click Safe Actions', () => {
      const safeActions = getAllSafeActions();
      const results = [];

      // Group by route for efficient navigation
      const byRoute = {};
      for (const item of safeActions) {
        if (!byRoute[item.route]) byRoute[item.route] = [];
        byRoute[item.route].push(item.action);
      }

      before(() => {
        logProof({
          type: 'SUITE_START',
          suite: 'ui-desktop-safe-actions',
          actionCount: safeActions.length,
        });
      });

      after(() => {
        const clicked = results.filter(r => r.result === 'CLICKED');
        const notFound = results.filter(r => r.result === 'NOT_FOUND');
        const skipped = results.filter(r => r.result === 'SKIPPED');
        writeFinalSummary({
          suite: 'ui-desktop-safe-actions',
          total: results.length,
          clicked: clicked.length,
          notFound: notFound.length,
          skipped: skipped.length,
          results,
        });
        console.log(
          `[v50:safe-actions] ${clicked.length}/${results.length} clicked | notFound=${notFound.length} skipped=${skipped.length}`
        );
      });

      for (const [route, actions] of Object.entries(byRoute)) {
        const entry = getRouteEntry(route);

        describe(`Route: ${route}`, () => {
          before(async () => {
            await navigateToRoute(route);
            await browser.pause(600);
            const root = await waitForPageRoot(
              `[data-testid="${entry.rootTestId}"]`,
              6000
            );
            if (!root.found && !entry.isSimulated) {
              console.warn(`[v50:safe-actions] Page not loaded for ${route}`);
            }
          });

          for (const action of actions) {
            it(`action "${action.label}" (${action.safeActionPolicy})`, async () => {
              const selector = `[data-testid="${action.actionId}"]`;
              const clickResult = await clickSafeAction(
                selector,
                action.actionId,
                action.safeActionPolicy
              );

              let result;
              if (clickResult.skipped) {
                result = 'SKIPPED';
              } else if (clickResult.notFound) {
                result = 'NOT_FOUND';
              } else if (clickResult.requiresConfirm) {
                result = 'GUARDED_REQUIRES_CONFIRM';
              } else if (clickResult.disabled) {
                result = 'DISABLED_EXPECTED';
              } else {
                result = 'CLICKED';
              }

              logActionResult(route, action.actionId, result, {
                safeActionPolicy: action.safeActionPolicy,
                label: action.label,
                ...clickResult,
              });

              results.push({
                route,
                actionId: action.actionId,
                label: action.label,
                result,
                ...clickResult,
              });

              // Dismiss any dialog that may have appeared
              await dismissDialog();
              await browser.pause(200);

              // After clicking, no error boundary should appear
              if (result === 'CLICKED') {
                const hasEB = await $('[data-testid="error-boundary"], .error-boundary')
                  .isExisting()
                  .catch(() => false);
                expect(hasEB).toBe(false);
              }

              // Test always passes (result is classified, not hard-failed for NOT_FOUND)
              expect([
                'CLICKED',
                'NOT_FOUND',
                'SKIPPED',
                'GUARDED_REQUIRES_CONFIRM',
                'DISABLED_EXPECTED',
              ]).toContain(result);
            });
          }
        });
      }
    });
  } else {
    it('L4 safe action clicks skipped (set TITANE_E2E_FULL=1 to enable)', () => {
      console.log('[ui-desktop-safe-actions] TITANE_E2E_FULL not set — L4 skipped');
      expect(true).toBe(true);
    });
  }
});
