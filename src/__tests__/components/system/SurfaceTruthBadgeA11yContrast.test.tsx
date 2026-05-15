import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * A11y WCAG AA — SurfaceTruthBadge PARTIAL variant contrast guard.
 *
 * Anti-regression: the PARTIAL badge previously used
 * `bg-amber-900/60 text-amber-300`. With 60% background opacity on light
 * surface bleed-through, Axe measured ~2.26:1 (text-amber-300 #fcd34d on
 * blended #b0856a) on /htf — far below WCAG AA 4.5:1 for normal text.
 *
 * The hardened tokens are `bg-amber-900 text-amber-100` (solid amber-900
 * #78350f with amber-100 #fef3c7 ≈ 10:1), which holds AA across every page
 * background where the global SurfaceTruthBadge can render.
 */
describe('SurfaceTruthBadge A11y — PARTIAL variant contrast hardening', () => {
  it('PARTIAL colorClass uses solid bg-amber-900 with text-amber-100', () => {
    const src = readFileSync(
      resolve(process.cwd(), 'src/components/system/SurfaceTruthBadge.tsx'),
      'utf-8',
    );

    // Locate the PARTIAL meta entry and its colorClass on the following lines.
    const partialBlock = src.match(/PARTIAL:\s*\{[\s\S]*?\},/);
    expect(partialBlock).not.toBeNull();
    const partial = partialBlock![0];

    // Hardened tokens must be present.
    expect(partial).toMatch(/colorClass:\s*'bg-amber-900\s+text-amber-100\s+border\s+border-amber-700\/50'/);

    // Failed legacy tokens must not reappear in the colorClass declaration.
    const colorClassLine = partial.match(/colorClass:\s*'[^']*'/)?.[0] ?? '';
    expect(colorClassLine).not.toMatch(/bg-amber-900\/60/);
    expect(colorClassLine).not.toMatch(/text-amber-300/);
  });
});
