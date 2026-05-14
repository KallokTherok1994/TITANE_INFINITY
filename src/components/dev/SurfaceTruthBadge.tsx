/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v34.0.13 — SURFACE TRUTH BADGE (dev/diagnostic overlay)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Toggle: Ctrl+Alt+T  OR  localStorage.setItem('titane_surface_truth', '1').
 *
 * Renders an overlay listing the canonical runtime facts of the currently
 * loaded shell so the operator can instantly answer: "is this the build I
 * just deployed, or am I looking at a stale cached UI?".
 *
 * Read-only — never mutates state.
 *
 * data-testid:
 *   - "surface-truth-toggle"  (mounted whenever the component is enabled)
 *   - "surface-truth-badge"   (visible only when the overlay is open)
 */

import { useEffect, useState } from 'react';
import { useSurfaceTruth } from '@/hooks/useSurfaceTruth';

export interface SurfaceTruthBadgeProps {
  /** Force-enable for tests, bypassing env/localStorage gating. */
  forceEnabled?: boolean;
  /** Force-open the overlay for tests. */
  defaultOpen?: boolean;
}

function isEnabledByDefault(): boolean {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) return true;
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('titane_surface_truth') === '1';
    }
  } catch {
    /* noop */
  }
  return false;
}

export function SurfaceTruthBadge({
  forceEnabled,
  defaultOpen = false,
}: SurfaceTruthBadgeProps = {}): JSX.Element | null {
  const enabled = forceEnabled ?? isEnabledByDefault();
  const [open, setOpen] = useState(defaultOpen);
  const truth = useSurfaceTruth();

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === 'undefined') return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.ctrlKey && e.altKey && (e.key === 't' || e.key === 'T')) {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled]);

  if (!enabled) return null;

  // v35.1.2 — In mobile viewport (≤479px), anchor toggle to top-right to avoid
  // intercepting bottom-right chat-send button (E2E proof: e2e/critical/
  // chat-bubble-desktop-width.spec.ts mobile≤479px).
  const isMobileViewport =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(max-width: 479px)').matches;

  return (
    <>
      <button
        type="button"
        data-testid="surface-truth-toggle"
        aria-label="Toggle TITANE surface truth"
        onClick={() => setOpen(prev => !prev)}
        style={{
          position: 'fixed',
          ...(isMobileViewport
            ? { top: 8, right: 8 }
            : { bottom: 8, right: 8 }),
          zIndex: 9999,
          fontFamily: 'monospace',
          fontSize: 10,
          padding: '4px 8px',
          background: 'rgba(16,24,40,0.85)',
          color: '#10b981',
          border: '1px solid rgba(16,185,129,0.35)',
          borderRadius: 4,
          cursor: 'pointer',
        }}
      >
        v{truth.appVersion}
      </button>
      {open && (
        <div
          data-testid="surface-truth-badge"
          role="region"
          aria-label="TITANE surface truth"
          style={{
            position: 'fixed',
            bottom: 36,
            right: 8,
            zIndex: 9999,
            maxWidth: 360,
            padding: '8px 12px',
            background: 'rgba(8,12,20,0.95)',
            color: '#e5e7eb',
            border: '1px solid rgba(16,185,129,0.45)',
            borderRadius: 6,
            fontFamily: 'monospace',
            fontSize: 11,
            lineHeight: 1.45,
            boxShadow: '0 6px 24px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ color: '#10b981', marginBottom: 4 }}>
            TITANE∞ surface truth
          </div>
          <div data-testid="surface-truth-version">version: {truth.appVersion}</div>
          <div data-testid="surface-truth-build">build: {truth.buildTimestamp}</div>
          <div data-testid="surface-truth-store">
            store: titane-singularity-state-v34 (v{truth.storeVersion ?? '∅'})
          </div>
          <div data-testid="surface-truth-sw">
            sw: {truth.swController ? 'controller-active' : 'no-controller'}
            {truth.swScope ? ` · ${truth.swScope}` : ''}
          </div>
          <div data-testid="surface-truth-transport">transport: {truth.transport}</div>
          <div data-testid="surface-truth-chunk" style={{ wordBreak: 'break-all' }}>
            chunk: {truth.chunkHash}
          </div>
          <div data-testid="surface-truth-attr">
            data-surface-truth: {truth.dataSurfaceTruth ?? '∅'}
          </div>
        </div>
      )}
    </>
  );
}

export default SurfaceTruthBadge;
