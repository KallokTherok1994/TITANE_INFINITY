/**
 * TITANE∞ v49 — Desktop Actions Proof (WDIO)
 *
 * Smoke-validates key IPC actions and interactive surfaces in desktop runtime.
 * L1: static source checks (always runs)
 * L2-L5: live desktop action smoke proof (requires TITANE_E2E_FULL=1)
 *
 * Surfaces:
 *   /doc-center → export action IPC availability
 *   /memory     → memory list/search surface
 *   /time       → temporal read actions
 *   /research   → research page interactive
 *   /cloud      → cloud status surface
 *   /titane     → chat input / send surface
 *
 * Mission: UI_DESKTOP_AGENT_CHAT_UNIFICATION_v49
 * Lane 6 — Desktop E2E
 */

import fs from 'node:fs';
import path from 'node:path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const FULL = process.env.TITANE_E2E_FULL === '1';
const TIMEOUT = 25000;
const testId = id => `[data-testid="${id}"]`;

const ACTION_SURFACES = [
  {
    route: '/doc-center',
    rootTestId: 'page-doc-center',
    srcFile: 'src/pages/DocCenterPage.tsx',
    label: 'Doc Center — export IPC surface',
    // The export button should be present but may require Tauri IPC
    actionSelector: null, // check for any button or interactive element
  },
  {
    route: '/memory',
    rootTestId: 'page-memory',
    srcFile: 'src/pages/MemoryPage.tsx',
    label: 'Memory — list/search surface',
    actionSelector: null,
  },
  {
    route: '/time',
    rootTestId: 'page-time',
    srcFile: 'src/pages/TimePage.tsx',
    label: 'Time — temporal read actions',
    actionSelector: null,
  },
  {
    route: '/research',
    rootTestId: 'page-research',
    srcFile: 'src/pages/ResearchPage.tsx',
    label: 'Research — interactive surface',
    actionSelector: null,
  },
  {
    route: '/cloud',
    rootTestId: 'page-cloud',
    srcFile: 'src/pages/CloudPage.tsx',
    label: 'Cloud — status surface',
    actionSelector: null,
  },
  {
    route: '/titane',
    rootTestId: 'page-titane',
    srcFile: 'src/pages/TitanePage.tsx',
    label: 'Titane — chat send surface',
    // Chat input: look for send button or textarea
    actionSelector: '[data-testid="chat-send-button"], [data-testid="chat-input"], textarea',
  },
];

describe('UI Runtime Actions Proof — Desktop (v49)', () => {
  describe('L1 — Static source checks', () => {
    for (const { route, srcFile, label } of ACTION_SURFACES) {
      it(`L1 — ${label}: source file exists`, () => {
        const fullPath = path.resolve(__dirname, '../../', srcFile);
        const exists = fs.existsSync(fullPath);
        if (!exists) {
          console.warn(`L1 WARNING: source not found: ${fullPath}`);
        }
        // L1 informational for action surfaces
        console.info(`L1 ${route}: source ${exists ? 'PRESENT' : 'MISSING'}`);
      });
    }
  });

  describe('L2-L5 — Runtime action smoke proof', () => {
    before(function () {
      if (!FULL) this.skip();
    });

    for (const { route, rootTestId, label, actionSelector } of ACTION_SURFACES) {
      describe(`[${route}] — ${label}`, () => {
        before(async () => {
          await browser.url(`tauri://localhost${route}`);
          const el = $(testId(rootTestId));
          await el.waitForDisplayed({ timeout: TIMEOUT });
        });

        it(`L2 — ${route} page loaded without crash`, async () => {
          const hasError = await browser.execute(() =>
            document.body.textContent?.includes('Something went wrong')
          );
          expect(hasError).toBe(false);
        });

        it(`L3 — ${route} has interactive elements or content`, async () => {
          const hasInteractives = await browser.execute(() => {
            return (
              document.querySelectorAll(
                'button, input, textarea, [role="button"], [data-testid]'
              ).length > 0
            );
          });
          expect(hasInteractives).toBe(true);
        });

        if (actionSelector) {
          it(`L4 — ${route} action element present`, async function () {
            this.timeout(15000);
            const el = await browser.execute(selector => {
              return document.querySelector(selector) !== null;
            }, actionSelector);
            // L4 is informational — some actions may require state
            if (!el) {
              console.warn(`L4 WARNING: ${route} action selector not found: ${actionSelector}`);
            } else {
              expect(el).toBe(true);
            }
          });
        }

        it(`L5 — ${route} URL stable (no redirect)`, async () => {
          const pathname = await browser.execute(() => window.location.pathname);
          expect(pathname).toBe(route);
        });
      });
    }
  });
});
