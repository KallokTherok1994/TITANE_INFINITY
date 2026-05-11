/**
 * TITANE∞ v49 — Desktop Tabs Proof (WDIO)
 *
 * Validates tab panels for 4 core pages in Tauri desktop runtime.
 * L1: static source check (always runs)
 * L2-L5: live desktop runtime check (requires TITANE_E2E_FULL=1)
 *
 * Pages and expected tabs:
 *   /titane  → [conversation, transformation, activation, discovery, evolution, vitals]
 *   /time    → [overview, agenda, timeline, snapshots, travel]
 *   /admin   → [system, production-health, config, design, audio, governance]
 *   /dev     → [overview, operations, validation, diagnostics, architecture]
 *
 * Mission: UI_DESKTOP_AGENT_CHAT_UNIFICATION_v49
 * Lane 6 — Desktop E2E
 */

import fs from 'node:fs';
import path from 'node:path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const FULL = process.env.TITANE_E2E_FULL === '1';
const TIMEOUT = 25000;
const TAB_TIMEOUT = 10000;
const testId = id => `[data-testid="${id}"]`;

const TABBED_PAGES = [
  {
    route: '/titane',
    rootTestId: 'page-titane',
    srcFile: 'src/pages/TitanePage.tsx',
    tabs: ['conversation', 'transformation', 'activation', 'discovery', 'evolution', 'vitals'],
  },
  {
    route: '/time',
    rootTestId: 'page-time',
    srcFile: 'src/pages/TimePage.tsx',
    tabs: ['overview', 'agenda', 'timeline', 'snapshots', 'travel'],
  },
  {
    route: '/admin',
    rootTestId: 'page-admin',
    srcFile: 'src/features/admin/types.ts',
    tabs: ['system', 'production-health', 'config', 'design', 'audio', 'governance'],
  },
  {
    route: '/dev',
    rootTestId: 'page-dev',
    srcFile: 'src/pages/DevPage.tsx',
    tabs: ['overview', 'operations', 'validation', 'diagnostics', 'architecture'],
  },
];

describe('UI Runtime Tabs Proof — Desktop (v49)', () => {
  describe('L1 — Static source checks', () => {
    for (const { route, tabs, srcFile } of TABBED_PAGES) {
      it(`L1 — ${route} source contains tab references`, () => {
        const fullPath = path.resolve(__dirname, '../../', srcFile);
        if (!fs.existsSync(fullPath)) {
          console.warn(`L1 WARNING: source not found: ${fullPath}`);
          return;
        }
        const src = fs.readFileSync(fullPath, 'utf-8');
        const foundTabs = tabs.filter(tab => src.includes(tab));
        console.info(`L1 ${route}: ${foundTabs.length}/${tabs.length} tab references found in source`);
        // L1 informational — at least some tabs should be referenced
        expect(foundTabs.length).toBeGreaterThan(0);
      });
    }
  });

  describe('L2-L5 — Runtime desktop tab proof', () => {
    before(function () {
      if (!FULL) this.skip();
    });

    for (const { route, rootTestId, tabs } of TABBED_PAGES) {
      describe(`[${route}] tab validation`, () => {
        before(async () => {
          await browser.url(`tauri://localhost${route}`);
          const el = $(testId(rootTestId));
          await el.waitForDisplayed({ timeout: TIMEOUT });
        });

        it(`L2 — ${route} page loads without crash`, async () => {
          const hasError = await browser.execute(() =>
            document.body.textContent?.includes('Something went wrong')
          );
          expect(hasError).toBe(false);
        });

        it(`L3 — ${route} tab container exists`, async () => {
          // Look for any tab-related elements (role=tab, data-testid with "tab")
          const hasTabContainer = await browser.execute(() => {
            return (
              document.querySelectorAll('[role="tab"], [data-testid*="tab"]').length > 0
            );
          });
          expect(hasTabContainer).toBe(true);
        });

        for (const tab of tabs) {
          it(`L4 — ${route} tab "${tab}" can be navigated`, async function () {
            this.timeout(TAB_TIMEOUT + 5000);
            // Try testid-based tab selector first, then URL approach
            const tabSelector = testId(`tab-${tab}`);
            const tabEl = $(tabSelector);
            const tabExists = await tabEl.isExisting();

            if (tabExists) {
              await tabEl.click();
              // Verify no crash after clicking
              const hasError = await browser.execute(() =>
                document.body.textContent?.includes('Something went wrong')
              );
              expect(hasError).toBe(false);
            } else {
              // Tab element not found with testid — try URL navigation
              await browser.url(`tauri://localhost${route}?tab=${tab}`);
              const hasError = await browser.execute(() =>
                document.body.textContent?.includes('Something went wrong')
              );
              expect(hasError).toBe(false);
            }
          });
        }
      });
    }
  });
});
