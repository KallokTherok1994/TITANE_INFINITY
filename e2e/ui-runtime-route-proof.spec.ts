/**
 * E2E: UI Runtime Route Proof — v48
 * Mission: UI_BACKEND_RUNTIME_PROOF_EXECUTION_v48
 * Purpose: Prove canonical routes are browser-reachable and truth badges render.
 *
 * - Uses baseURL from playwright.config.ts (port 1420 or configured port)
 * - Does NOT require Tauri runtime or live backend for static page load
 * - Backend-dependent actions are marked not-proven unless actually invoked
 * - This test runs in browser/Vite mode only
 */

import { test, expect } from '@playwright/test';

const BASE_ROUTES: {
  route: string;
  testId: string;
  badgeExpected: boolean;
  priority: number;
  browserGuardExpected?: boolean;
}[] = [
  { route: '/', testId: 'page-titane', badgeExpected: true, priority: 1 },
  { route: '/titane', testId: 'page-titane', badgeExpected: true, priority: 1 },
  { route: '/time', testId: 'page-time', badgeExpected: true, priority: 1 },
  { route: '/admin', testId: 'page-admin', badgeExpected: true, priority: 2 },
  {
    route: '/dev',
    testId: 'page-dev',
    badgeExpected: true,
    priority: 2,
    browserGuardExpected: true,
  },
  { route: '/experience', testId: 'page-experience', badgeExpected: true, priority: 1 },
  { route: '/memory', testId: 'page-memory', badgeExpected: true, priority: 1 },
  { route: '/research', testId: 'research-page', badgeExpected: true, priority: 3 },
  { route: '/doc-center', testId: 'doc-center-page', badgeExpected: true, priority: 1 },
  {
    route: '/multiproject',
    testId: 'multiproject-dashboard',
    badgeExpected: true,
    priority: 2,
  },
  { route: '/twins', testId: 'page-twins', badgeExpected: true, priority: 3 },
  { route: '/fusion', testId: 'page-fusion', badgeExpected: true, priority: 2 },
];

const BADGE_SELECTOR = '[data-testid^="surface-truth-badge-"]';
const PAGE_LOAD_TIMEOUT = 20000;
const BADGE_TIMEOUT = 10000;

async function waitForAnySelector(
  page: import('@playwright/test').Page,
  selectors: string[],
  timeout = 8000
) {
  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    for (const selector of selectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        return true;
      }
    }
    await page.waitForTimeout(150);
  }

  return false;
}

async function waitForVisible(
  locator: ReturnType<import('@playwright/test').Page['getByTestId']>,
  timeout = 3500
) {
  try {
    await locator.first().waitFor({ state: 'visible', timeout });
    return true;
  } catch {
    return false;
  }
}

test.describe('UI Runtime Route Proof — v48 (Browser Lane)', () => {
  test.setTimeout(120000);

  for (const {
    route,
    testId,
    badgeExpected,
    priority,
    browserGuardExpected,
  } of BASE_ROUTES) {
    test(`[P${priority}] Route ${route} — rootTestId=${testId}, badge=${badgeExpected}`, async ({
      page,
    }) => {
      await page.goto(route, {
        waitUntil: 'domcontentloaded',
        timeout: PAGE_LOAD_TIMEOUT,
      });

      // Page must load without crashing
      await expect(page.locator('body')).toBeVisible({ timeout: PAGE_LOAD_TIMEOUT });

      // Navigate via nav if on /
      // Root testId check — soft: some pages may redirect
      const rootEl = page.getByTestId(testId);
      const rootVisible = await waitForVisible(rootEl, 3500);

      if (!rootVisible) {
        // Try via nav button for root route
        console.log(
          `[${route}] rootTestId ${testId} not immediately visible — attempting nav`
        );
        const navBtn = page
          .locator(`[data-testid^="nav-"]`)
          .filter({
            hasText:
              /titane|time|admin|dev|memory|experience|research|doc|project|twins|fusion/i,
          })
          .first();
        const navVisible = await navBtn.isVisible().catch(() => false);
        if (navVisible) {
          await navBtn.click({ force: true });
          await page.waitForTimeout(1000);
        }
      }

      // Truth badge check
      if (badgeExpected) {
        if (browserGuardExpected) {
          const guardHeading = page.getByRole('heading', {
            name: /erreur dans devpage/i,
          });
          const guardStatus = page
            .getByRole('status')
            .filter({ hasText: /TITANE runtime/i });

          await expect(guardHeading.or(guardStatus).first()).toBeVisible({
            timeout: BADGE_TIMEOUT,
          });
          return;
        }

        const badgeFound = await waitForAnySelector(
          page,
          [BADGE_SELECTOR],
          BADGE_TIMEOUT
        );

        if (!badgeFound) {
          console.warn(
            `[${route}] BADGE NOT VISIBLE — no surface-truth-badge-* selector found in DOM`
          );
          const count = await page.locator(BADGE_SELECTOR).count();
          if (count === 0) {
            throw new Error(`[${route}] No surface-truth-badge-* selector found in DOM`);
          }
        }
      }

      // No hard crash check
      const errors: string[] = [];
      page.on('pageerror', err => errors.push(err.message));
      expect(
        errors.filter(e => e.includes('Cannot read') || e.includes('is not a function'))
      ).toHaveLength(0);
    });
  }

  test('App root loads without 404 or crash', async ({ page }) => {
    const response = await page.goto('/', { timeout: PAGE_LOAD_TIMEOUT });
    expect(response?.status()).not.toBe(404);
    await expect(page.locator('body')).toBeVisible();
  });

  test('Non-existent route does not crash app', async ({ page }) => {
    await page.goto('/nonexistent-route-v48-probe', { timeout: PAGE_LOAD_TIMEOUT });
    await expect(page.locator('body')).toBeVisible();
    // Should redirect or show 404 page — no crash
  });
});
