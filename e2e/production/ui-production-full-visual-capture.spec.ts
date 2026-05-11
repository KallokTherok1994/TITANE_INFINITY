import { test, expect } from '@playwright/test';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

/**
 * ui-production-full-visual-capture.spec.ts
 *
 * TITANE v78: Full Visual UI Capture in Production Runtime
 *
 * Objective:
 * - Navigate all canonical routes in production-like browser
 * - Capture full-page + viewport screenshots
 * - Collect DOM structure evidence (root, heading, controls, tabs)
 * - Detect errors, blank pages, truth badges, disclosures
 * - Write JSONL artifact with visual proof
 *
 * Execution:
 * pnpm run build
 * pnpm exec playwright test e2e/production/ui-production-full-visual-capture.spec.ts --project chromium --workers=1
 *
 * Artifact Output:
 * artifacts/ui-visual/v78-production-visual-capture.jsonl
 * artifacts/ui-visual/screenshots/v78/production/<page-id>.png
 * artifacts/ui-visual/screenshots/v78/production/<page-id>-viewport.png
 */

const ARTIFACT_DIR = process.env.TITANE_UI_VISUAL_ARTIFACT_DIR || 'artifacts/ui-visual';
const SCREENSHOT_DIR = join(ARTIFACT_DIR, 'screenshots', 'v78', 'production');
const OUTPUT_ARTIFACT = join(ARTIFACT_DIR, 'v78-production-visual-capture.jsonl');

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
  sourceSpec: string;
}

async function safePage(page) {
  // Minimize console noise
  page.on('console', () => {});
  page.on('pageerror', () => {});
}

async function collectVisualEvidence(page, route: string): Promise<VisualProofRecord> {
  const safePageId =
    route.replace(/\//g, '-').replace(/^\-/, '').replace(/\?.*/, '') || 'root';
  const screenshotPath = join(SCREENSHOT_DIR, `${safePageId}.png`);
  const viewportScreenshotPath = join(SCREENSHOT_DIR, `${safePageId}-viewport.png`);

  try {
    // Navigate to route
    await page.goto(`http://localhost:5173${route}`, {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    });

    // Wait for initial hydration
    await page.waitForTimeout(1500);

    // Detect blank page
    const bodyText = await page.evaluate(() => document.body.innerText.trim());
    const blankPage = !bodyText || bodyText.length < 50;

    // Detect error boundary
    const errorBoundary = await page.evaluate(() => {
      const errorPatterns = ['Error', 'error', 'ERROR', 'failed', 'FAILED'];
      const pageText = document.body.innerText;
      return errorPatterns.some(p => pageText.includes(p) && pageText.includes('Stack'));
    });

    // Find root element
    const root = await page.evaluate(() => {
      const testIdRoot = document.querySelector('[data-testid^="page-"]');
      return {
        testId: testIdRoot?.getAttribute('data-testid') || null,
        found: !!testIdRoot,
      };
    });

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

    // Determine visual status
    let visualStatus = 'VISUAL_ACTIVE';
    if (truthElements.disclosure) visualStatus = 'VISUAL_GUARDED';
    if (blankPage) visualStatus = 'VISUAL_BROKEN';
    if (errorBoundary) visualStatus = 'VISUAL_BROKEN';

    return {
      schemaVersion: 'v78',
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
      screenshot: `screenshots/v78/production/${safePageId}.png`,
      viewportScreenshot: `screenshots/v78/production/${safePageId}-viewport.png`,
      visualStatus,
      blocker: null,
      sourceSpec: 'ui-production-full-visual-capture.spec.ts',
    };
  } catch (error) {
    return {
      schemaVersion: 'v78',
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
      sourceSpec: 'ui-production-full-visual-capture.spec.ts',
    };
  }
}

test.describe('TITANE UI — Full Visual Capture v78', () => {
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
      console.log(`[v78] Capturing ${route}...`);
      const record = await collectVisualEvidence(page, route);
      records.push(record);
    }

    // Write artifact
    const jsonlContent = records.map(r => JSON.stringify(r)).join('\n');
    writeFileSync(OUTPUT_ARTIFACT, jsonlContent);

    console.log(`[v78] Artifact written: ${OUTPUT_ARTIFACT}`);
    console.log(`[v78] Total routes captured: ${records.length}`);

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
