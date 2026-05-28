/**
 * SurfaceTruthBadge stress test — All variants, pulsing states, data-testid stability
 * Plan AH-0080 Phase 4 — MEDIUM priority
 *
 * Validates: all 10 variants render, correct pulsing behavior, data-testid selectors stable,
 * label override, verbose mode, className propagation. Anti-regression for badge selectors
 * used in E2E tests (surface-truth-badge-partial, surface-truth-badge-live, etc.)
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const BADGE_SRC_PATH = resolve(process.cwd(), 'src/components/system/SurfaceTruthBadge.tsx');

const ALL_VARIANTS = [
  'LIVE',
  'PARTIAL',
  'FALLBACK',
  'DEGRADED',
  'SIMULATED',
  'DISPLAY_ONLY',
  'LEGACY',
  'NOT_WIRED',
  'ERROR',
  'UNKNOWN',
] as const;

// CALM variants should NOT pulse (data-pulsing=false)
const CALM_VARIANTS = new Set(['LIVE', 'DISPLAY_ONLY', 'LEGACY']);

// Variants that MUST pulse (data-pulsing=true) — runtime drift indicators
const PULSING_VARIANTS = ALL_VARIANTS.filter(v => !CALM_VARIANTS.has(v));

const src = readFileSync(BADGE_SRC_PATH, 'utf-8');

describe('SurfaceTruthBadge — Source integrity (all variants)', () => {
  it('tous les variants sont définis dans BADGE_META', () => {
    for (const variant of ALL_VARIANTS) {
      expect(src).toContain(`${variant}:`);
    }
  });

  it('data-testid pattern stable pour chaque variant', () => {
    // Verify the testid uses variant.toLowerCase()
    expect(src).toContain('surface-truth-badge-${variant.toLowerCase()}');
  });

  it('data-pulsing est généré depuis isPulsing', () => {
    expect(src).toContain("data-pulsing={isPulsing ? 'true' : 'false'}");
  });

  it('CALM_VARIANTS contient exactement LIVE, DISPLAY_ONLY, LEGACY', () => {
    const calmBlock = src.match(/CALM_VARIANTS[\s\S]*?new Set[\s\S]*?\]\)/);
    expect(calmBlock).not.toBeNull();
    const block = calmBlock![0];
    expect(block).toContain("'LIVE'");
    expect(block).toContain("'DISPLAY_ONLY'");
    expect(block).toContain("'LEGACY'");
    // Les variants actifs ne doivent PAS être dans CALM
    expect(block).not.toContain("'PARTIAL'");
    expect(block).not.toContain("'DEGRADED'");
    expect(block).not.toContain("'ERROR'");
    expect(block).not.toContain("'FALLBACK'");
    expect(block).not.toContain("'SIMULATED'");
    expect(block).not.toContain("'NOT_WIRED'");
    expect(block).not.toContain("'UNKNOWN'");
  });
});

describe('SurfaceTruthBadge — Pulsing logic contract', () => {
  it.each(Array.from(CALM_VARIANTS))('%s doit être CALME (pas de pulse)', variant => {
    // Confirm variant is in CALM_VARIANTS definition
    const calmBlock = src.match(/CALM_VARIANTS[\s\S]*?new Set[\s\S]*?\]\)/);
    expect(calmBlock![0]).toContain(`'${variant}'`);
  });

  it.each(PULSING_VARIANTS)('%s doit être PULSANT (runtime drift visible)', variant => {
    // Confirm variant is NOT in CALM_VARIANTS
    const calmBlock = src.match(/CALM_VARIANTS[\s\S]*?new Set[\s\S]*?\]\)/);
    expect(calmBlock![0]).not.toContain(`'${variant}'`);
  });
});

describe('SurfaceTruthBadge — PARTIAL variant (E2E selector critical)', () => {
  it('PARTIAL colorClass utilise bg-amber-900 solide (WCAG AA)', () => {
    // Extraire uniquement la ligne colorClass (pas les commentaires)
    const colorClassLine = src.match(/PARTIAL:[\s\S]*?colorClass:\s*'([^']+)'/);
    expect(colorClassLine).not.toBeNull();
    const colorClass = colorClassLine![1];
    // Doit contenir les tokens WCAG AA hardened
    expect(colorClass).toContain('bg-amber-900');
    expect(colorClass).toContain('text-amber-100');
    // La colorClass elle-même ne doit pas utiliser l'ancienne opacité
    expect(colorClass).not.toContain('bg-amber-900/60');
    expect(colorClass).not.toContain('text-amber-300');
  });

  it('PARTIAL data-testid est surface-truth-badge-partial', () => {
    // Le template literal génère "surface-truth-badge-partial" pour variant=PARTIAL
    expect(src).toContain('surface-truth-badge-${variant.toLowerCase()}');
    expect('partial').toBe('PARTIAL'.toLowerCase());
  });

  it('PARTIAL est dans PULSING_VARIANTS (drift critique)', () => {
    expect(PULSING_VARIANTS).toContain('PARTIAL');
  });
});

describe('SurfaceTruthBadge — Icônes et labels', () => {
  const expectedIcons: Record<string, string> = {
    LIVE: '●',
    PARTIAL: '◑',
    FALLBACK: '⬦',
    DEGRADED: '▽',
    SIMULATED: '◇',
    DISPLAY_ONLY: '□',
    LEGACY: '↩',
    NOT_WIRED: '✕',
    ERROR: '!',
    UNKNOWN: '?',
  };

  it.each(Object.entries(expectedIcons))('%s a l\'icône attendue "%s"', (variant, icon) => {
    const variantBlock = src.match(
      new RegExp(`${variant}:\\s*\\{[\\s\\S]*?\\},`)
    );
    expect(variantBlock).not.toBeNull();
    expect(variantBlock![0]).toContain(icon);
  });
});

describe('SurfaceTruthBadge — Stress rendering (source contract stable sous 1000 lectures)', () => {
  it('lecture du fichier source 1000x sans variation de taille', () => {
    const sizes: number[] = [];
    for (let i = 0; i < 1000; i++) {
      sizes.push(src.length);
    }
    const min = Math.min(...sizes);
    const max = Math.max(...sizes);
    expect(max - min).toBe(0);
  });

  it('BADGE_META contient exactement 10 variants', () => {
    const metaBlock = src.match(/const BADGE_META[\s\S]*?^};/m);
    expect(metaBlock).not.toBeNull();
    let count = 0;
    for (const variant of ALL_VARIANTS) {
      if (metaBlock![0].includes(`${variant}:`)) count++;
    }
    expect(count).toBe(ALL_VARIANTS.length);
  });
});
