import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * A11y WCAG AA — AudioCenterPage contrast + form-label hardening guard.
 *
 * Anti-regression: the audio center previously rendered five distinct
 * blocking failures under Axe `color-contrast` (serious) and `label`
 * (critical) on /admin?tab=audio:
 *   - `bg-cyan-600` active tab + Test button (3.61:1 with #fff)
 *   - `text-purple-400` PIPER engine badge (4.18:1 on alpha-blended bg)
 *   - `text-neutral-500` language/gender meta spans (2.97:1 on dark cards)
 *   - `<input type="range">` sliders missing aria-label (label critical)
 *
 * The hardened tokens are:
 *   - `bg-cyan-700` (active tab + Test button) → ~5.0:1 with #fff (AA)
 *   - `text-purple-200` / `text-amber-200` / `text-neutral-200` badges
 *   - `text-neutral-400` meta spans → ~7:1 on neutral-800 dark cards
 *   - explicit `aria-label={label}` on the slider `<input type="range">`
 */
describe('AudioCenterPage A11y — contrast + form-label hardening', () => {
  const SRC = readFileSync(
    resolve(process.cwd(), 'src/features/audio-center/AudioCenterPage.tsx'),
    'utf-8'
  );

  it('cyan tab + Test button use bg-cyan-700 (no bg-cyan-600 active class)', () => {
    // text-titanium-text-primary replaces text-white per design system migration:
    // dark mode → #f1f5f9 (~5:1 on cyan-700, AA), light mode → #0f172a (~8:1, AAA)
    expect(SRC).toMatch(/bg-cyan-700\s+text-titanium-text-primary/);
    expect(SRC).toMatch(/bg-cyan-700\s+hover:bg-cyan-600\s+text-titanium-text-primary/);
    expect(SRC).not.toMatch(/'bg-cyan-600\s+text-titanium-text-primary'/);
    expect(SRC).not.toMatch(
      /bg-cyan-600\s+hover:bg-cyan-500\s+text-titanium-text-primary/
    );
  });

  it('voice engine badges and meta spans use AA-compliant tokens', () => {
    expect(SRC).toMatch(/'bg-purple-500\/20\s+text-purple-200'/);
    expect(SRC).toMatch(/'bg-amber-500\/20\s+text-amber-200'/);
    expect(SRC).toMatch(/'bg-neutral-600\/50\s+text-neutral-200'/);
    expect(SRC).not.toMatch(/'bg-purple-500\/20\s+text-purple-400'/);
    expect(SRC).not.toMatch(/'bg-amber-500\/20\s+text-amber-400'/);
  });

  it('voice card meta spans use text-neutral-400 (AA on neutral-800)', () => {
    // The voice card row mentions language and gender; ensure no
    // text-neutral-500 leak on those spans.
    expect(SRC).toMatch(/text-xs\s+text-neutral-400">\{voice\.language\}/);
    expect(SRC).toMatch(/text-xs\s+text-neutral-400\s+capitalize">\{voice\.gender\}/);
  });

  it('Slider range input carries aria-label sourced from the label prop', () => {
    expect(SRC).toMatch(/<input\s+type="range"\s+aria-label=\{label\}/);
  });
});
