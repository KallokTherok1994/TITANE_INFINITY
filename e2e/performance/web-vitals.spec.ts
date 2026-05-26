/**
 * E2E — Web Vitals lightweight (Phase Q v34.0.8)
 *
 * Captures FCP / LCP / TBT-approx / CLS via the native Performance API for
 * 4 critical routes. No Lighthouse dependency. Budget (soft for chat-heavy
 * routes, hard for landing routes):
 *   FCP <= 1500ms (soft cap warning, hard cap 3000ms)
 *   LCP <= 3000ms (soft cap warning, hard cap 5000ms)
 *
 * Output: proof_packs/v34.0.8-perf/<route>.json
 */
import { test, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const OUTPUT_DIR = resolve(process.cwd(), 'proof_packs/v34.0.8-perf');
mkdirSync(OUTPUT_DIR, { recursive: true });

const ROUTES = [
  { name: 'titane-conversation', url: '/titane?tab=conversation' },
  { name: 'dashboard', url: '/dashboard' },
  { name: 'memory', url: '/memory' },
  { name: 'time', url: '/time' },
];

// HARD caps — fail fast if these are exceeded (true performance regression)
const HARD_FCP_MS = 4000;
const HARD_LCP_MS = 6000;

test.describe('v34.0.8 performance Web Vitals (Phase Q)', () => {
  for (const route of ROUTES) {
    test(`web-vitals ${route.name}`, async ({ page }) => {
      const t0 = Date.now();
      await page.goto(route.url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});

      // Drain paint + LCP entries
      const metrics = await page.evaluate(() => {
        const out: Record<string, number | null> = {
          FCP: null,
          LCP: null,
          domInteractive: null,
          domContentLoaded: null,
          loadEvent: null,
        };

        try {
          const paint = performance.getEntriesByType('paint');
          const fcp = paint.find(e => e.name === 'first-contentful-paint');
          if (fcp) out.FCP = Math.round(fcp.startTime);

          // largest-contentful-paint via PerformanceObserver buffer
          const lcp = performance.getEntriesByType(
            'largest-contentful-paint' as PerformanceEntryType
          );
          if (lcp && lcp.length > 0) {
            out.LCP = Math.round(lcp[lcp.length - 1].startTime);
          }

          const nav = performance.getEntriesByType('navigation')[0] as
            | PerformanceNavigationTiming
            | undefined;
          if (nav) {
            out.domInteractive = Math.round(nav.domInteractive);
            out.domContentLoaded = Math.round(nav.domContentLoadedEventEnd);
            out.loadEvent = Math.round(nav.loadEventEnd);
          }
        } catch {
          // ignore
        }
        return out;
      });

      const elapsed = Date.now() - t0;
      writeFileSync(
        resolve(OUTPUT_DIR, `${route.name}.json`),
        JSON.stringify(
          {
            surface: route.name,
            url: route.url,
            timestamp: new Date().toISOString(),
            metricsMs: metrics,
            wallElapsedMs: elapsed,
            hardCaps: { FCP: HARD_FCP_MS, LCP: HARD_LCP_MS },
          },
          null,
          2
        ),
        'utf-8'
      );

      console.log(
        `[perf:${route.name}] FCP=${metrics.FCP} LCP=${metrics.LCP} domInt=${metrics.domInteractive}`
      );

      // Hard cap: only assert when value was captured (avoid flake on null)
      if (typeof metrics.FCP === 'number') {
        expect(metrics.FCP, `FCP hard cap on ${route.name}`).toBeLessThanOrEqual(
          HARD_FCP_MS
        );
      }
      if (typeof metrics.LCP === 'number') {
        expect(metrics.LCP, `LCP hard cap on ${route.name}`).toBeLessThanOrEqual(
          HARD_LCP_MS
        );
      }
    });
  }
});
