import { test, expect, type ConsoleMessage, type Page } from '@playwright/test';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

/**
 * ui-production-full-visual-capture.spec.ts
 *
 * TITANE v79: Full Visual UI Capture in Production Runtime (strict)
 *
 * Objective:
 * - Navigate all canonical routes in production-like browser
 * - Capture full-page + viewport screenshots
 * - Collect DOM structure evidence using per-route rootTestId selectors
 * - Detect errors, blank pages, truth badges, disclosures
 * - Enforce strict status: rootFound=false → VISUAL_BROKEN
 * - Write JSONL artifact with visual proof
 *
 * Execution (v79):
 * pnpm run build
 * TITANE_UI_VISUAL_ARTIFACT=artifacts/ui-visual/v79-production-visual-capture.jsonl \
 * TITANE_UI_VISUAL_SCREENSHOT_DIR=artifacts/ui-visual/screenshots/v79/production \
 * pnpm exec playwright test e2e/production/ui-production-full-visual-capture.spec.ts --project chromium --workers=1
 */

const SCHEMA_VERSION = process.env.TITANE_UI_VISUAL_SCHEMA_VERSION || 'v79';
const ARTIFACT_DIR = process.env.TITANE_UI_VISUAL_ARTIFACT_DIR || 'artifacts/ui-visual';
const SCREENSHOT_DIR =
  process.env.TITANE_UI_VISUAL_SCREENSHOT_DIR ||
  join(ARTIFACT_DIR, 'screenshots', SCHEMA_VERSION, 'production');
const OUTPUT_ARTIFACT =
  process.env.TITANE_UI_VISUAL_ARTIFACT ||
  join(ARTIFACT_DIR, `${SCHEMA_VERSION}-production-visual-capture.jsonl`);

// Per-route rootTestId map (from uiSurfaceRegistry)
// Routes not in this map fall back to generic [data-testid^="page-"] scan
const ROOT_TESTID_MAP: Record<string, string> = {
  '/titane': 'page-titane',
  '/experience': 'page-experience',
  '/time': 'page-time',
  '/admin': 'page-admin',
  '/dev': 'page-dev',
  '/fusion': 'page-fusion',
  '/cloud': 'page-cloud',
  '/twins': 'page-twins',
  '/optimization': 'page-optimization',
  '/total-dev': 'page-total-dev',
  '/memory': 'page-memory',
  '/doc-center': 'doc-center-page',
  '/research': 'research-page',
  '/orchestration-center': 'page-orchestration-meta-center',
  '/orchestration-intelligence': 'page-orchestration-intelligence',
  '/reality-center': 'page-reality-center',
  '/hyper-center': 'page-hyper-center',
  '/quantum-center': 'page-quantum-center',
  '/singularity': 'page-singularity',
  '/sentinel': 'page-sentinel',
  '/watchdog': 'page-watchdog',
  '/selfheal': 'page-selfheal',
  '/adaptive': 'page-adaptive',
  '/skills': 'page-skills',
  '/knowledge': 'page-knowledge',
  '/creation': 'page-creation',
  '/evolution': 'page-evolution',
  '/performance': 'page-performance',
  '/htf': 'htf-module-page',
};

// Canonical routes from uiSurfaceRegistry
const CANONICAL_ROUTES = [
  '/titane',
  '/experience',
  '/time',
  '/admin',
  '/dev',
  '/fusion',
  '/cloud',
  '/twins',
  '/optimization',
  '/total-dev',
  '/memory',
  '/doc-center',
  '/research',
  '/orchestration-center',
  '/orchestration-intelligence',
  '/reality-center',
  '/hyper-center',
  '/quantum-center',
  '/singularity',
  '/sentinel',
  '/watchdog',
  '/selfheal',
  '/adaptive',
  '/skills',
  '/knowledge',
  '/creation',
  '/evolution',
  '/performance',
  '/htf',
];

// Main menu routes (high priority)
const MAIN_MENU_ROUTES = [
  '/titane',
  '/time',
  '/admin',
  '/dev',
  '/fusion',
  '/twins',
  '/optimization',
  '/total-dev',
];

interface VisualProofRecord {
  schemaVersion: string;
  capturedAt: string;
  runtime: string;
  route: string;
  pageId: string;
  rootTestId: string;
  rootFound: boolean;
  headingFound: boolean;
  blankPage: boolean;
  errorBoundary: boolean;
  truthBadgeFound: boolean;
  disclosureFound: boolean;
  topNavActive: string | null;
  tabsExpected: string[];
  tabsFound: string[];
  controlsFound: string[];
  buttonsFound: string[];
  inputsFound: string[];
  selectsFound: string[];
  linksFound: string[];
  agentOverlayState: 'present' | 'absent' | 'collapsed' | 'blocking' | 'non_blocking';
  screenshot: string | null;
  viewportScreenshot: string | null;
  visualStatus: string;
  blocker: string | null;
  errorBoundaryText?: string | null;
  pageErrors?: string[];
  consoleErrors?: string[];
  sourceSpec: string;
}

async function safePage(page: Page) {
  return page;
}

async function collectVisualEvidence(page: Page, route: string): Promise<VisualProofRecord> {
  const safePageId =
    route.replace(/\//g, '-').replace(/^\-/, '').replace(/\?.*/, '') || 'root';
  const screenshotPath = join(SCREENSHOT_DIR, `${safePageId}.png`);
  const viewportScreenshotPath = join(SCREENSHOT_DIR, `${safePageId}-viewport.png`);
  const expectedRootTestId = ROOT_TESTID_MAP[route] || null;
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  const onConsole = (msg: ConsoleMessage) => {
    const type = msg.type();
    if (type === 'error' || type === 'warning') {
      consoleErrors.push(msg.text().slice(0, 500));
    }
  };
  const onPageError = (err: Error) => {
    pageErrors.push(String(err?.message || err).slice(0, 500));
  };

  try {
    page.on('console', onConsole);
    page.on('pageerror', onPageError);

    // Navigate to route
    await page.goto(`http://localhost:5173${route}`, {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    });

    // Wait for React hydration: wait for expected root or networkidle fallback
    if (expectedRootTestId) {
      try {
        await page.waitForSelector(`[data-testid="${expectedRootTestId}"]`, {
          timeout: 12000,
        });
      } catch {
        // Not found in 12s — try networkidle then re-check
        try {
          await page.waitForLoadState('networkidle', { timeout: 5000 });
        } catch {
          // network still busy — continue classification
        }
        await page.waitForTimeout(1000);
      }
    } else {
      await page.waitForTimeout(2500);
    }

    // Detect blank page
    const bodyText = await page.evaluate(() => document.body.innerText.trim());
    const blankPage = !bodyText || bodyText.length < 50;

    // Detect error boundary
    const errorBoundaryState = await page.evaluate(() => {
      const boundary = document.querySelector('[data-testid="titane-error-boundary"]');
      if (!boundary) {
        return { visible: false, text: null };
      }
      const style = window.getComputedStyle(boundary);
      const rect = boundary.getBoundingClientRect();
      const visible =
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        rect.width > 0 &&
        rect.height > 0;
      return {
        visible,
        text: (boundary.textContent || '').trim().slice(0, 500),
      };
    });
    const errorBoundary = errorBoundaryState.visible;

    // Find root element using per-route selector, falling back to generic scan
    const root = await page.evaluate((expectedId: string | null) => {
      // First try per-route known testId
      if (expectedId) {
        const specific = document.querySelector(`[data-testid="${expectedId}"]`);
        if (specific) {
          return { testId: expectedId, found: true };
        }
      }
      // Fallback: generic page- prefix scan
      const generic = document.querySelector('[data-testid^="page-"]');
      if (generic) {
        return { testId: generic.getAttribute('data-testid'), found: true };
      }
      return { testId: null, found: false };
    }, expectedRootTestId);

    // Find heading
    const heading = await page.evaluate(() => {
      const h = document.querySelector('h1, h2, [role="heading"]');
      return h?.innerText || null;
    });

    // Find truth badge / disclosure
    const truthElements = await page.evaluate(() => {
      const badge = document.querySelector(
        '[data-testid*="truth"], [data-testid*="badge"]'
      );
      const disclosure = document.querySelector(
        '[data-testid*="disclosure"], [data-testid*="guard"]'
      );
      return {
        badge: !!badge,
        disclosure: !!disclosure,
      };
    });

    // Collect controls
    const controls = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
        .map(b => ({
          label: b.innerText,
          testId: b.getAttribute('data-testid'),
        }))
        .slice(0, 20);

      const inputs = Array.from(document.querySelectorAll('input'))
        .map(i => ({
          type: i.getAttribute('type'),
          placeholder: i.getAttribute('placeholder'),
          testId: i.getAttribute('data-testid'),
        }))
        .slice(0, 10);

      const selects = Array.from(document.querySelectorAll('select, [role="combobox"]'))
        .map(s => ({
          label: s.getAttribute('aria-label'),
          testId: s.getAttribute('data-testid'),
        }))
        .slice(0, 10);

      const tabs = Array.from(
        document.querySelectorAll('[role="tab"], [data-testid*="tab"]')
      )
        .map(t => ({
          label: t.innerText,
          testId: t.getAttribute('data-testid'),
        }))
        .slice(0, 10);

      const links = Array.from(document.querySelectorAll('a'))
        .map(a => ({
          href: a.getAttribute('href'),
          label: a.innerText,
        }))
        .slice(0, 10);

      return { buttons, inputs, selects, tabs, links };
    });

    // Get top nav active state
    const topNavActive = await page.evaluate(() => {
      const activeNav = document.querySelector(
        '[data-testid*="nav"][aria-current], [data-testid*="nav"][data-active]'
      );
      return activeNav?.getAttribute('data-testid') || null;
    });

    // Detect agent overlay
    const agentOverlay = await page.evaluate(() => {
      const overlay = document.querySelector(
        '[data-testid*="agent"], [data-testid*="overlay"]'
      );
      if (!overlay) return 'absent';
      const styles = window.getComputedStyle(overlay);
      if (styles.display === 'none') return 'absent';
      if (styles.zIndex && parseInt(styles.zIndex) > 9000) return 'blocking';
      return 'non_blocking';
    });

    // Capture screenshots
    mkdirSync(SCREENSHOT_DIR, { recursive: true });
    await page.screenshot({ path: screenshotPath, fullPage: true });
    await page.screenshot({ path: viewportScreenshotPath });

    // Determine visual status (strict)
    // rootFound=false MUST result in VISUAL_BROKEN or VISUAL_DEGRADED — never VISUAL_ACTIVE
    let visualStatus = 'VISUAL_ACTIVE';
    let blocker: string | null = null;
    if (truthElements.disclosure) visualStatus = 'VISUAL_GUARDED';
    if (!root.found) {
      visualStatus = 'VISUAL_BROKEN';
      blocker = `root selector missing: expected [data-testid="${expectedRootTestId || 'page-*'}"] not found`;
    }
    if (blankPage) {
      visualStatus = 'VISUAL_BROKEN';
      blocker = blocker || 'blank page — body text < 50 chars';
    }
    if (errorBoundary) {
      visualStatus = 'VISUAL_BROKEN';
      blocker =
        blocker ||
        `ErrorBoundary visible in DOM${errorBoundaryState.text ? `: ${errorBoundaryState.text.slice(0, 120)}` : ''}`;
    }

    page.off('console', onConsole);
    page.off('pageerror', onPageError);

    return {
      schemaVersion: SCHEMA_VERSION,
      capturedAt: new Date().toISOString(),
      runtime: 'production-preview',
      route,
      pageId: safePageId,
      rootTestId: root.testId || '',
      rootFound: root.found,
      headingFound: !!heading,
      blankPage,
      errorBoundary,
      truthBadgeFound: truthElements.badge,
      disclosureFound: truthElements.disclosure,
      topNavActive: topNavActive,
      tabsExpected: [],
      tabsFound: controls.tabs.map(t => t.label),
      controlsFound: [],
      buttonsFound: controls.buttons.map(b => b.label),
      inputsFound: controls.inputs.map(i => i.placeholder || i.type),
      selectsFound: controls.selects.map(s => s.label),
      linksFound: controls.links.map(l => l.label),
      agentOverlayState: agentOverlay,
      screenshot: `screenshots/${SCHEMA_VERSION}/production/${safePageId}.png`,
      viewportScreenshot: `screenshots/${SCHEMA_VERSION}/production/${safePageId}-viewport.png`,
      visualStatus,
      blocker,
      errorBoundaryText: errorBoundaryState.text,
      pageErrors,
      consoleErrors,
      sourceSpec: 'ui-production-full-visual-capture.spec.ts',
    };
  } catch (error) {
    page.off('console', onConsole);
    page.off('pageerror', onPageError);
    return {
      schemaVersion: SCHEMA_VERSION,
      capturedAt: new Date().toISOString(),
      runtime: 'production-preview',
      route,
      pageId: safePageId,
      rootTestId: '',
      rootFound: false,
      headingFound: false,
      blankPage: true,
      errorBoundary: false,
      truthBadgeFound: false,
      disclosureFound: false,
      topNavActive: null,
      tabsExpected: [],
      tabsFound: [],
      controlsFound: [],
      buttonsFound: [],
      inputsFound: [],
      selectsFound: [],
      linksFound: [],
      agentOverlayState: 'absent',
      screenshot: null,
      viewportScreenshot: null,
      visualStatus: 'VISUAL_BROKEN',
      blocker: `Navigation failed: ${error.message}`,
      errorBoundaryText: null,
      pageErrors,
      consoleErrors,
      sourceSpec: 'ui-production-full-visual-capture.spec.ts',
    };
  }
}

test.describe('TITANE UI — Full Visual Capture v79 (strict)', () => {
  test.beforeAll(async ({ browser }) => {
    mkdirSync(ARTIFACT_DIR, { recursive: true });
    mkdirSync(SCREENSHOT_DIR, { recursive: true });
  });

  test('capture all canonical routes with full visual proof', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();

    await safePage(page);

    const records: VisualProofRecord[] = [];

    // Prioritize main menu routes first
    const routesToCapture = [
      ...MAIN_MENU_ROUTES,
      ...CANONICAL_ROUTES.filter(r => !MAIN_MENU_ROUTES.includes(r)),
    ];

    for (const route of routesToCapture) {
      console.log(`[v80] Capturing ${route}...`);
      const record = await collectVisualEvidence(page, route);
      records.push(record);
    }

    // Write artifact
    const jsonlContent = records.map(r => JSON.stringify(r)).join('\n');
    writeFileSync(OUTPUT_ARTIFACT, jsonlContent);

    console.log(`[v80] Artifact written: ${OUTPUT_ARTIFACT}`);
    console.log(`[v80] Total routes captured: ${records.length}`);

    // Verify artifact
    const saved = readFileSync(OUTPUT_ARTIFACT, 'utf-8');
    const parsed = saved
      .split('\n')
      .filter(Boolean)
      .map(l => JSON.parse(l));
    expect(parsed.length).toBeGreaterThan(0);

    await context.close();
  });
});
