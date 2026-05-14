/**
 * TITANE_INFINITY v34.5.0 — scripts/ui-audit/test-coverage-matrix.test.ts
 *
 * Couverture Vitest pour la matrice de couverture tests (Rule 16).
 */
import { describe, it, expect } from 'vitest';
import { hasRustInlineTest, buildCoverageMatrix } from '../../../scripts/ui-audit/test-coverage-matrix.mjs';

describe('test-coverage-matrix — hasRustInlineTest', () => {
  it('détecte #[cfg(test)] mod tests', () => {
    expect(hasRustInlineTest('#[cfg(test)]\nmod tests { #[test] fn ok() {} }')).toBe(true);
  });

  it('détecte un #[test] isolé', () => {
    expect(hasRustInlineTest('#[test]\nfn smoke() {}')).toBe(true);
  });

  it('renvoie false sur un source Rust sans tests', () => {
    expect(hasRustInlineTest('pub fn foo() -> u32 { 0 }')).toBe(false);
  });
});

describe('test-coverage-matrix — buildCoverageMatrix (smoke)', () => {
  it('produit des totaux cohérents sur le repo TITANE', async () => {
    const report = await buildCoverageMatrix();
    expect(report.version).toBe('v34.5.0');
    expect(report.totals.total).toBeGreaterThan(100);
    expect(report.totals.covered).toBeGreaterThanOrEqual(0);
    expect(report.totals.covered + report.totals.uncovered).toBe(report.totals.total);
    expect(report.totals.coverageRatio).toBeGreaterThanOrEqual(0);
    expect(report.totals.coverageRatio).toBeLessThanOrEqual(1);
    expect(report.totals.tsTotal + report.totals.rustTotal).toBe(report.totals.total);
  }, 30000);
});
