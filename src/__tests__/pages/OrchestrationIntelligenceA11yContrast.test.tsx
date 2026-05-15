import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * A11y WCAG AA — Orchestration Intelligence Center tab descriptions contrast guard.
 *
 * Anti-regression: the 7 tab description spans used to render with
 * `text-xs opacity-70`, producing:
 *   - On active `bg-purple-600`: white@70% (#e0b7fe) on #9810fa = 3.26:1 (fail)
 *   - On inactive `bg-gray-800`: text-gray-400@70% (#747d8b) on #1e2939 = 3.52:1 (fail)
 * Both below the WCAG AA 4.5:1 threshold for normal text.
 *
 * The hardened source removes the `opacity-70` modifier so the desc inherits
 * the parent state-aware color at full alpha:
 *   - Active: text-white on bg-purple-600 (~5.9:1, AA)
 *   - Inactive: text-gray-400 on bg-gray-800 (~4.83:1, AA)
 * Smaller `text-xs` font alone still provides visual hierarchy with the label.
 */
describe('OrchestrationIntelligenceCenter A11y — tab desc contrast hardening', () => {
  it('tab description span does not use opacity-70 (would drop below AA 4.5:1)', () => {
    const tsxPath = resolve(
      process.cwd(),
      'src/modules/OrchestrationIntelligenceCenter.tsx',
    );
    const src = readFileSync(tsxPath, 'utf-8');

    // No opacity-70 modifier anywhere in the module (covers desc + future spans)
    expect(src).not.toMatch(/text-xs\s+opacity-70/);
    expect(src).not.toMatch(/opacity-70\s+text-xs/);
    // The desc span must remain present (regression on visual hierarchy)
    expect(src).toMatch(/<span\s+className="text-xs">\{tab\.desc\}<\/span>/);
  });
});
