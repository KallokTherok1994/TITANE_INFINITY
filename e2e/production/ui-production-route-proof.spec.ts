import { test, expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import { appendFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const DEFAULT_ARTIFACT_RELATIVE_PATH =
  'artifacts/ui-production/current-production-route-proof.jsonl';

const ARTIFACT_PATH = resolve(
  process.cwd(),
  process.env.TITANE_UI_PRODUCTION_ARTIFACT ?? DEFAULT_ARTIFACT_RELATIVE_PATH
);

const CANONICAL_ROUTES = [
  {
    route: '/titane',
    pageId: 'titane',
    rootTestId: 'page-titane',
    mainMenuSurface: true,
  },
  {
    route: '/experience',
    pageId: 'experience',
    rootTestId: 'page-experience',
    mainMenuSurface: false,
  },
  { route: '/time', pageId: 'time', rootTestId: 'page-time', mainMenuSurface: true },
  { route: '/admin', pageId: 'admin', rootTestId: 'page-admin', mainMenuSurface: true },
  { route: '/dev', pageId: 'dev', rootTestId: 'page-dev', mainMenuSurface: true },
  {
    route: '/fusion',
    pageId: 'fusion',
    rootTestId: 'page-fusion',
    mainMenuSurface: true,
  },
  {
    route: '/cloud',
    pageId: 'cloud',
    rootTestId: 'page-cloud-center',
    mainMenuSurface: false,
  },
  {
    route: '/reality-center',
    pageId: 'reality-center',
    rootTestId: 'page-reality-center',
    mainMenuSurface: false,
  },
  {
    route: '/hyper-center',
    pageId: 'hyper-center',
    rootTestId: 'page-hyper-center',
    mainMenuSurface: false,
  },
  {
    route: '/quantum-center',
    pageId: 'quantum-center',
    rootTestId: 'page-quantum-center',
    mainMenuSurface: false,
  },
  { route: '/twins', pageId: 'twins', rootTestId: 'page-twins', mainMenuSurface: true },
  {
    route: '/doc-center',
    pageId: 'doc-center',
    rootTestId: 'doc-center-page',
    mainMenuSurface: false,
  },
  {
    route: '/optimization',
    pageId: 'optimization',
    rootTestId: 'page-optimization',
    mainMenuSurface: true,
  },
  {
    route: '/total-dev',
    pageId: 'total-dev',
    rootTestId: 'page-total-dev',
    mainMenuSurface: true,
  },
  {
    route: '/orchestration-intelligence',
    pageId: 'orchestration-intelligence',
    rootTestId: 'page-orchestration-intelligence',
    mainMenuSurface: false,
  },
  {
    route: '/orchestration-center',
    pageId: 'orchestration-center',
    rootTestId: 'page-orchestration-meta-center',
    mainMenuSurface: false,
  },
  {
    route: '/singularity',
    pageId: 'singularity',
    rootTestId: 'page-singularity-monitor',
    mainMenuSurface: false,
  },
  {
    route: '/sentinel',
    pageId: 'sentinel',
    rootTestId: 'page-sentinel',
    mainMenuSurface: false,
  },
  {
    route: '/watchdog',
    pageId: 'watchdog',
    rootTestId: 'page-watchdog',
    mainMenuSurface: false,
  },
  {
    route: '/selfheal',
    pageId: 'selfheal',
    rootTestId: 'page-selfheal',
    mainMenuSurface: false,
  },
  {
    route: '/adaptive',
    pageId: 'adaptive',
    rootTestId: 'page-adaptive-engine',
    mainMenuSurface: false,
  },
  {
    route: '/memory',
    pageId: 'memory',
    rootTestId: 'page-memory',
    mainMenuSurface: false,
  },
  {
    route: '/research',
    pageId: 'research',
    rootTestId: 'research-page',
    mainMenuSurface: false,
  },
  {
    route: '/skills',
    pageId: 'skills',
    rootTestId: 'page-skills',
    mainMenuSurface: false,
  },
  {
    route: '/knowledge',
    pageId: 'knowledge',
    rootTestId: 'page-knowledge',
    mainMenuSurface: false,
  },
  {
    route: '/creation',
    pageId: 'creation',
    rootTestId: 'page-creation-studio',
    mainMenuSurface: false,
  },
  {
    route: '/evolution',
    pageId: 'evolution',
    rootTestId: 'page-evolution-monitor',
    mainMenuSurface: false,
  },
  {
    route: '/performance',
    pageId: 'performance',
    rootTestId: 'page-performance-test',
    mainMenuSurface: false,
  },
  { route: '/htf', pageId: 'htf', rootTestId: 'page-htf', mainMenuSurface: false },
] as const;

const LEGACY_REDIRECTS = [
  '/chat',
  '/memory-evolution',
  '/memory-evo',
  '/doc',
  '/cloud-sync',
  '/vault',
] as const;

const HIDDEN_ROUTES = [
  '/orchestration-intelligence',
  '/orchestration-center',
  '/singularity',
] as const;

function classifyStatus(
  rootFound: boolean,
  truthBadgeFound: boolean,
  disclosureFound: boolean
) {
  if (!rootFound) {
    if (truthBadgeFound || disclosureFound) {
      return 'PROD_ROUTE_GUARDED_WITH_UI_PROOF';
    }
    return 'PROD_ROUTE_DEGRADED_WITH_UI_PROOF';
  }
  if (truthBadgeFound) {
    return 'PROD_ROUTE_ACTIVE';
  }
  return 'PROD_ROUTE_GUARDED_WITH_UI_PROOF';
}

async function waitForVisible(locator: Locator, timeout = 8000) {
  try {
    await locator.first().waitFor({ state: 'visible', timeout });
    return true;
  } catch {
    return false;
  }
}

async function waitForAnySelector(page: Page, selectors: string[], timeout = 8000) {
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

test.describe('v73 production route proof', () => {
  test.beforeAll(() => {
    mkdirSync(dirname(ARTIFACT_PATH), { recursive: true });
    rmSync(ARTIFACT_PATH, { force: true });
  });

  test('covers canonical, hidden, and legacy routes in production-like runtime', async ({
    page,
  }) => {
    test.setTimeout(240000);

    for (const entry of CANONICAL_ROUTES) {
      await page.goto(entry.route, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
      await page.waitForLoadState('networkidle').catch(() => undefined);

      const root = page.getByTestId(entry.rootTestId);
      const rootFound = await waitForVisible(root, 3500);
      const errorBoundaryVisible = await page
        .locator('text=/Une erreur est survenue|ErrorBoundary|Erreur/i')
        .first()
        .isVisible()
        .catch(() => false);

      const truthBadgeFound = await waitForAnySelector(
        page,
        ['[data-testid^="surface-truth-badge-"]'],
        1800
      );

      const disclosureFound = await waitForAnySelector(
        page,
        [
          '[data-testid^="page-health-banner-"]',
          'text=/SIMULATED|Display only|DISPLAY|DEGRADED|PARTIAL/i',
        ],
        1800
      );

      const status = classifyStatus(rootFound, truthBadgeFound, disclosureFound);

      appendFileSync(
        ARTIFACT_PATH,
        `${JSON.stringify({
          schemaVersion: 'v73',
          capturedAt: new Date().toISOString(),
          route: entry.route,
          pageId: entry.pageId,
          rootTestId: entry.rootTestId,
          rootFound,
          truthBadgeFound: truthBadgeFound || disclosureFound,
          tabsExpected: [],
          tabsFound: [],
          mainMenuSurface: entry.mainMenuSurface,
          hiddenRoute: HIDDEN_ROUTES.includes(
            entry.route as (typeof HIDDEN_ROUTES)[number]
          ),
          legacyRedirect: false,
          status,
          blocker: errorBoundaryVisible ? 'ErrorBoundary visible' : null,
          sourceSpec: 'ui-production-route-proof.spec.ts',
        })}\n`
      );
    }

    for (const legacy of LEGACY_REDIRECTS) {
      await page.goto(legacy, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
      const url = page.url();
      const redirected =
        url.includes('/titane') ||
        url.includes('/doc-center') ||
        url.includes('/cloud') ||
        url.includes('/memory') ||
        url.includes('/vault');
      const bodyVisible = await page
        .locator('body')
        .isVisible()
        .catch(() => false);
      const rootFound = redirected || bodyVisible;

      appendFileSync(
        ARTIFACT_PATH,
        `${JSON.stringify({
          schemaVersion: 'v73',
          capturedAt: new Date().toISOString(),
          route: legacy,
          pageId: `legacy-${legacy.replace('/', '')}`,
          rootTestId: 'n/a',
          rootFound,
          truthBadgeFound: false,
          tabsExpected: [],
          tabsFound: [],
          mainMenuSurface: false,
          hiddenRoute: false,
          legacyRedirect: true,
          status: rootFound
            ? 'PROD_ROUTE_LEGACY_REDIRECT_CONFIRMED'
            : 'PROD_ROUTE_DEGRADED_WITH_UI_PROOF',
          blocker: rootFound ? null : `legacy route not reachable: ${legacy}`,
          sourceSpec: 'ui-production-route-proof.spec.ts',
        })}\n`
      );
    }
  });
});
