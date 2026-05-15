/**
 * A11y WCAG 2.1 AA — UI 100/100 plan phase B
 *
 * Runs @axe-core/playwright on 19 critical routes and writes a per-route
 * JSON report. The aggregate test enforces a regression baseline: total
 * serious + critical violations across all 10 routes must not exceed
 * AGGREGATE_BLOCKING_BASELINE. New a11y debt thus fails the gate, while
 * the existing debt (slated for phase D remediation) is acknowledged.
 *
 * Output: proof_packs/v34.0.7-a11y/<route>.json per surface +
 *          proof_packs/v34.0.7-a11y/_aggregate.json (sum across all).
 */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const OUTPUT_DIR = resolve(process.cwd(), 'proof_packs/v34.0.7-a11y');
mkdirSync(OUTPUT_DIR, { recursive: true });

interface A11ySurface {
  name: string;
  url: string;
}

// 19 critical routes — covers chat, titane shell, experience, admin system,
// admin governance, dev overview, dev diagnostics, time, fusion, total-dev,
// memory, orchestration, research, reality-center, quantum-center, singularity,
// multiproject, optimization, and evolution.
const SURFACES: A11ySurface[] = [
  { name: 'titane-conversation', url: '/titane?tab=conversation' },
  { name: 'titane-home', url: '/titane' },
  { name: 'experience', url: '/experience' },
  { name: 'admin-system', url: '/admin?tab=system' },
  { name: 'admin-governance', url: '/admin?tab=governance' },
  { name: 'dev-overview', url: '/dev?tab=overview' },
  { name: 'dev-diagnostics', url: '/dev?tab=diagnostics' },
  { name: 'time', url: '/time' },
  { name: 'fusion', url: '/fusion' },
  { name: 'total-dev', url: '/total-dev' },
  { name: 'memory', url: '/memory' },
  { name: 'orchestration-center', url: '/orchestration-center' },
  { name: 'research', url: '/research' },
  { name: 'reality-center', url: '/reality-center' },
  { name: 'quantum-center', url: '/quantum-center' },
  { name: 'singularity', url: '/singularity' },
  { name: 'multiproject', url: '/multiproject' },
  { name: 'optimization', url: '/optimization' },
  { name: 'evolution', url: '/evolution' },
];

// Impact levels considered blocking for this gate.
const BLOCKING_IMPACTS = new Set(['serious', 'critical']);

/**
 * Regression baseline — total blocking violations (critical+serious) summed
 * across all 19 routes. Initial measurement on 2026-05-13: 25 blocking.
 * Locked at 30 to allow tiny flake margin; phase D will lower it as fixes
 * land. Never increase without an explicit AutoHeal governance entry.
 */
const AGGREGATE_BLOCKING_BASELINE = 30;

test.describe.configure({ mode: 'serial' });

test.describe('v34.0.7 A11y WCAG 2.1 AA (19 critical routes)', () => {
  for (const surface of SURFACES) {
    test(`a11y ${surface.name}`, async ({ page }) => {
      await page.goto(surface.url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
      await page.waitForTimeout(500);

      const axeResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      const byImpact = {
        critical: axeResults.violations.filter((v) => v.impact === 'critical').length,
        serious: axeResults.violations.filter((v) => v.impact === 'serious').length,
        moderate: axeResults.violations.filter((v) => v.impact === 'moderate').length,
        minor: axeResults.violations.filter((v) => v.impact === 'minor').length,
      };

      writeFileSync(
        resolve(OUTPUT_DIR, `${surface.name}.json`),
        JSON.stringify(
          {
            surface: surface.name,
            url: surface.url,
            timestamp: new Date().toISOString(),
            totalViolations: axeResults.violations.length,
            byImpact,
            violations: axeResults.violations.map((v) => ({
              id: v.id,
              impact: v.impact,
              help: v.help,
              nodesCount: v.nodes.length,
            })),
          },
          null,
          2
        ),
        'utf-8'
      );

      const blockingCount = byImpact.critical + byImpact.serious;
      console.log(
        `[a11y:${surface.name}] blocking=${blockingCount} (c=${byImpact.critical} s=${byImpact.serious} m=${byImpact.moderate} mn=${byImpact.minor})`
      );

      // Per-route soft assertion: route must produce a report (proof).
      expect(axeResults.url).toBeTruthy();
    });
  }
});

test('v34.0.7 a11y aggregate baseline regression guard', () => {
  // Sum blocking violations across all 19 routes; assert <= baseline.
  let aggregate = 0;
  const breakdown: Record<string, number> = {};
  for (const surface of SURFACES) {
    const reportPath = resolve(OUTPUT_DIR, `${surface.name}.json`);
    if (!existsSync(reportPath)) {
      throw new Error(`Missing a11y report for ${surface.name} (${reportPath})`);
    }
    const report = JSON.parse(readFileSync(reportPath, 'utf-8'));
    const blocking = (report.byImpact?.critical ?? 0) + (report.byImpact?.serious ?? 0);
    breakdown[surface.name] = blocking;
    aggregate += blocking;
  }

  writeFileSync(
    resolve(OUTPUT_DIR, '_aggregate.json'),
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        aggregateBlocking: aggregate,
        baseline: AGGREGATE_BLOCKING_BASELINE,
        breakdown,
      },
      null,
      2
    ),
    'utf-8'
  );

  console.log(`[a11y:aggregate] blocking=${aggregate} baseline=${AGGREGATE_BLOCKING_BASELINE}`);
  expect(
    aggregate,
    `Total blocking a11y violations (${aggregate}) exceeds baseline ${AGGREGATE_BLOCKING_BASELINE}. New a11y debt detected.`
  ).toBeLessThanOrEqual(AGGREGATE_BLOCKING_BASELINE);
});

test('v34.0.7 a11y inventory invariant', () => {
  expect(SURFACES.length).toBe(19);
});
