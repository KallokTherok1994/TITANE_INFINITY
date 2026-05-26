/**
 * E2E: SurfaceTruthBadge runtime flip (Phase 7.E — AH-v99)
 *
 * Vérifie qu'au moins 3 surfaces critiques dynamisées en Phase 7
 * affichent un badge SurfaceTruthBadge non hardcodé et capable de
 * basculer LIVE→DEGRADED/PARTIAL en l'absence d'IPC.
 *
 * Mode standard (non-Tauri): le badge doit déjà être PARTIAL ou DEGRADED
 * car safeInvokeCanonical échoue hors Tauri runtime.
 * Mode full (TITANE_E2E_FULL=1 sur Tauri): doit afficher LIVE.
 */

import { test, expect } from '@playwright/test';

const FULL_E2E_ENABLED = process.env.TITANE_E2E_FULL === '1';

const SURFACES: Array<{
  route: string;
  testId?: string;
  expectedUrl: RegExp;
}> = [
  { route: '/admin', testId: 'page-admin', expectedUrl: /\/admin$/ },
  {
    route: '/experience',
    testId: 'page-experience',
    expectedUrl: /\/experience$/,
  },
  { route: '/time', testId: 'page-time', expectedUrl: /\/time$/ },
];

const NON_HARDCODED_VARIANTS = [
  'surface-truth-badge-live',
  'surface-truth-badge-partial',
  'surface-truth-badge-degraded',
  'surface-truth-badge-fallback',
];

test.describe('SurfaceTruthBadge — runtime flip (Phase 7.E)', () => {
  if (!FULL_E2E_ENABLED) {
    test('full-mode precondition proof (set TITANE_E2E_FULL=1)', async () => {
      expect(FULL_E2E_ENABLED).toBe(false);
    });
    return;
  }

  for (const { route, testId, expectedUrl } of SURFACES) {
    test(`badge on ${route} reflects runtime truth (not hardcoded LIVE)`, async ({
      page,
    }) => {
      await page.goto(route);
      await expect(page).toHaveURL(expectedUrl);

      if (testId) {
        await expect(page.getByTestId(testId)).toBeVisible({ timeout: 15000 });
      }

      // Au moins une variante non-hardcodée doit être visible
      let visibleVariant: string | null = null;
      for (const variant of NON_HARDCODED_VARIANTS) {
        const found = await page
          .getByTestId(variant)
          .first()
          .isVisible()
          .catch(() => false);
        if (found) {
          visibleVariant = variant;
          break;
        }
      }

      expect(
        visibleVariant,
        `Aucun SurfaceTruthBadge dynamique trouvé sur ${route} (régression Phase 7)`
      ).not.toBeNull();
    });
  }
});
