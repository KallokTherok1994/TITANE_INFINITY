import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * A11y WCAG AA — Cloud Center primary CTA contrast guard.
 *
 * Anti-regression: the "Initialiser le Cloud Sync" button used to render with
 * background `var(--cloud-accent)` whose fallback `#8899aa` contrasts at
 * ~3.2:1 against white, failing serious color-contrast on /cloud.
 *
 * The hardened rule scopes `.btn-primary` under `.cloud-center` /
 * `.cc-container` to an AA-compliant background (var(--accent-primary,
 * #1d4ed8), ~8:1 against white). This test asserts the rule is present in
 * the stylesheet to prevent silent reverts.
 */
describe('CloudCenter A11y — primary CTA contrast hardening', () => {
  it('CloudCenter.css declares a scoped AA-compliant background for .btn-primary', () => {
    const cssPath = resolve(process.cwd(), 'src/pages/CloudCenter/CloudCenter.css');
    const css = readFileSync(cssPath, 'utf-8');

    expect(css).toMatch(
      /\.cloud-center\s+\.btn-primary[^{]*\{[^}]*background:\s*var\(--accent-primary,\s*#1d4ed8\)/
    );
    // The original under-contrast fallback must no longer be the only source
    // of truth for the cloud primary button.
    expect(css).toContain('#1d4ed8');
  });
});
