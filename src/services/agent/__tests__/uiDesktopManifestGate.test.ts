/**
 * uiDesktopManifestGate.test.ts
 * TITANE_INFINITY — UI_DESKTOP_FULL_COVERAGE_v50
 *
 * Unit tests for the v50 desktop manifest (static schema gate).
 * Verifies manifest structure, route/tab/action counts, truthClass validity,
 * safeActionPolicy classification, and sentitiveActionPolicy counts.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(__dirname, '../../../../');
const MANIFEST_PATH = resolve(
  ROOT,
  'docs/ui/desktop/generated/UI_DESKTOP_ROUTE_MANIFEST_v50.json'
);

const VALID_TRUTH_CLASSES = [
  'MIXED_LIVE_AND_STATIC',
  'LIVE_TAURI',
  'LIVE_TAURI_SERVICE_BRIDGE',
  'LIVE_TAURI_GOVERNED',
  'LIVE_TAURI_WITH_FALLBACK',
  'SIMULATED_UI',
  'LIVE_CONTAINER_WITH_LAZY_FALLBACK_UI',
];

const VALID_SAFE_POLICIES = [
  'SAFE_CLICK',
  'READ_ONLY_CLICK',
  'FALLBACK_EXPECTED',
  'NOT_WIRED_EXPECTED',
  'GUARDED_CLICK',
  'FORM_INPUT_SAFE',
  'TEMP_DIR_ONLY',
  'REQUIRES_CONFIRMATION',
  'REQUIRES_SECRET_SKIP',
  'DESTRUCTIVE_SKIP_WITH_PROOF',
  'EXTERNAL_NETWORK_SKIP_WITH_PROOF',
];

function loadManifest() {
  expect(existsSync(MANIFEST_PATH)).toBe(true);
  return JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
}

describe('UI Desktop Manifest Gate (v50)', () => {
  describe('Manifest file existence and structure', () => {
    it('manifest file exists', () => {
      expect(existsSync(MANIFEST_PATH)).toBe(true);
    });

    it('manifest parses as valid JSON', () => {
      const content = readFileSync(MANIFEST_PATH, 'utf8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it('manifest has mission = UI_DESKTOP_FULL_COVERAGE_v50', () => {
      const m = loadManifest();
      expect(m.mission).toBe('UI_DESKTOP_FULL_COVERAGE_v50');
    });

    it('manifest has version field', () => {
      const m = loadManifest();
      expect(typeof m.version).toBe('string');
    });

    it('manifest has generated ISO timestamp', () => {
      const m = loadManifest();
      expect(m.generated).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe('Route counts', () => {
    it('routeCount = 29', () => {
      const m = loadManifest();
      expect(m.routeCount).toBe(29);
    });

    it('routes array has 29 entries', () => {
      const m = loadManifest();
      expect(m.routes.length).toBe(29);
    });

    it('tabCount = 22', () => {
      const m = loadManifest();
      expect(m.tabCount).toBe(22);
    });

    it('aliasCount = 65', () => {
      const m = loadManifest();
      expect(m.aliasCount).toBe(65);
    });
  });

  describe('Route field completeness', () => {
    it('all routes have route field starting with /', () => {
      const m = loadManifest();
      for (const r of m.routes) {
        expect(r.route).toBeTruthy();
        expect(r.route.startsWith('/')).toBe(true);
      }
    });

    it('all routes have pageId', () => {
      const m = loadManifest();
      for (const r of m.routes) {
        expect(r.pageId).toBeTruthy();
      }
    });

    it('all routes have pageComponent', () => {
      const m = loadManifest();
      for (const r of m.routes) {
        expect(r.pageComponent).toBeTruthy();
      }
    });

    it('all routes have rootTestId', () => {
      const m = loadManifest();
      for (const r of m.routes) {
        expect(r.rootTestId).toBeTruthy();
        expect(typeof r.rootTestId).toBe('string');
      }
    });

    it('all routes have truthClass from valid set', () => {
      const m = loadManifest();
      for (const r of m.routes) {
        expect(VALID_TRUTH_CLASSES).toContain(r.truthClass);
      }
    });

    it('all routes have isSimulated boolean', () => {
      const m = loadManifest();
      for (const r of m.routes) {
        expect(typeof r.isSimulated).toBe('boolean');
      }
    });

    it('all routes have desktopProofRequired boolean', () => {
      const m = loadManifest();
      for (const r of m.routes) {
        expect(typeof r.desktopProofRequired).toBe('boolean');
      }
    });

    it('all routes have selectors.root matching data-testid pattern', () => {
      const m = loadManifest();
      for (const r of m.routes) {
        expect(r.selectors?.root).toMatch(/^\[data-testid=/);
      }
    });

    it('all routes have testCoverage.routeTest ending in wdio.test.js', () => {
      const m = loadManifest();
      for (const r of m.routes) {
        expect(r.testCoverage?.routeTest).toContain('wdio.test.js');
      }
    });

    it('all routes have knownBlockers array', () => {
      const m = loadManifest();
      for (const r of m.routes) {
        expect(Array.isArray(r.knownBlockers)).toBe(true);
      }
    });
  });

  describe('Simulated route classification', () => {
    it('exactly 2 routes are SIMULATED_UI', () => {
      const m = loadManifest();
      const sim = m.routes.filter((r: any) => r.isSimulated);
      expect(sim.length).toBe(2);
    });

    it('/orchestration-intelligence is simulated', () => {
      const m = loadManifest();
      const r = m.routes.find((r: any) => r.route === '/orchestration-intelligence');
      expect(r).toBeDefined();
      expect(r.isSimulated).toBe(true);
    });

    it('/quantum-center is simulated', () => {
      const m = loadManifest();
      const r = m.routes.find((r: any) => r.route === '/quantum-center');
      expect(r).toBeDefined();
      expect(r.isSimulated).toBe(true);
    });

    it('simulated routes have desktopProofRequired=false', () => {
      const m = loadManifest();
      const sim = m.routes.filter((r: any) => r.isSimulated);
      for (const r of sim) {
        expect(r.desktopProofRequired).toBe(false);
      }
    });
  });

  describe('Tab structure', () => {
    it('exactly 4 routes have tabs', () => {
      const m = loadManifest();
      const withTabs = m.routes.filter((r: any) => r.tabCount > 0);
      expect(withTabs.length).toBe(4);
    });

    it('/titane has 6 tabs', () => {
      const m = loadManifest();
      const r = m.routes.find((r: any) => r.route === '/titane');
      expect(r.tabCount).toBe(6);
      expect(r.tabs.length).toBe(6);
    });

    it('/time has 5 tabs', () => {
      const m = loadManifest();
      const r = m.routes.find((r: any) => r.route === '/time');
      expect(r.tabCount).toBe(5);
    });

    it('/admin has 6 tabs', () => {
      const m = loadManifest();
      const r = m.routes.find((r: any) => r.route === '/admin');
      expect(r.tabCount).toBe(6);
    });

    it('/dev has 5 tabs', () => {
      const m = loadManifest();
      const r = m.routes.find((r: any) => r.route === '/dev');
      expect(r.tabCount).toBe(5);
    });

    it('all tabs have tabId, label, testId, selector', () => {
      const m = loadManifest();
      for (const route of m.routes) {
        for (const tab of route.tabs) {
          expect(tab.tabId).toBeTruthy();
          expect(tab.label).toBeTruthy();
          expect(tab.testId).toBeTruthy();
          expect(tab.selector).toBeTruthy();
        }
      }
    });
  });

  describe('Action classification', () => {
    it('all visibleActions have safeActionPolicy', () => {
      const m = loadManifest();
      for (const route of m.routes) {
        for (const action of route.visibleActions || []) {
          expect(action.safeActionPolicy).toBeTruthy();
          expect(VALID_SAFE_POLICIES).toContain(action.safeActionPolicy);
        }
      }
    });

    it('safe actions total = 35', () => {
      const m = loadManifest();
      const total = m.routes.reduce(
        (s: number, r: any) => s + (r.safeActions?.length || 0),
        0
      );
      expect(total).toBe(35);
    });

    it('sensitive actions total = 13', () => {
      const m = loadManifest();
      const total = m.routes.reduce(
        (s: number, r: any) => s + (r.sensitiveActions?.length || 0),
        0
      );
      expect(total).toBe(13);
    });

    it('all sensitive actions have isSensitive=true', () => {
      const m = loadManifest();
      for (const route of m.routes) {
        for (const action of route.sensitiveActions || []) {
          expect(action.isSensitive).toBe(true);
        }
      }
    });

    it('all safe actions have isSensitive=false', () => {
      const m = loadManifest();
      for (const route of m.routes) {
        for (const action of route.safeActions || []) {
          expect(action.isSensitive).toBe(false);
        }
      }
    });
  });

  describe('Specific route integrity', () => {
    it('/titane rootTestId = "page-titane"', () => {
      const m = loadManifest();
      const r = m.routes.find((r: any) => r.route === '/titane');
      expect(r?.rootTestId).toBe('page-titane');
    });

    it('/memory truthClass = LIVE_TAURI_SERVICE_BRIDGE', () => {
      const m = loadManifest();
      const r = m.routes.find((r: any) => r.route === '/memory');
      expect(r?.truthClass).toBe('LIVE_TAURI_SERVICE_BRIDGE');
    });

    it('/research truthClass = LIVE_TAURI_GOVERNED', () => {
      const m = loadManifest();
      const r = m.routes.find((r: any) => r.route === '/research');
      expect(r?.truthClass).toBe('LIVE_TAURI_GOVERNED');
    });

    it('/performance isDisplayOnly = true', () => {
      const m = loadManifest();
      const r = m.routes.find((r: any) => r.route === '/performance');
      expect(r?.isDisplayOnly).toBe(true);
    });

    it('/admin truthClass contains LIVE', () => {
      const m = loadManifest();
      const r = m.routes.find((r: any) => r.route === '/admin');
      expect(r?.truthClass).toContain('LIVE');
    });

    it('/cloud truthClass = LIVE_TAURI', () => {
      const m = loadManifest();
      const r = m.routes.find((r: any) => r.route === '/cloud');
      expect(r?.truthClass).toBe('LIVE_TAURI');
    });
  });
});
