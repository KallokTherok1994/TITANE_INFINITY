/**
 * TITANE∞ v34.0.3 — Living Pulse global indicator
 *
 * Affiche en haut-droite un badge fixe représentant la santé runtime réelle :
 *   ● TITANE LIVE v34.0.3 · 23ms        (vert calme = backend OK)
 *   ◑ TITANE PARTIAL v34.0.3 · 412ms    (jaune pulsé = latence haute / partiel)
 *   ▽ TITANE DEGRADED v34.0.3 · timeout (rouge pulsé = backend KO)
 *
 * Probe canonique : `quick_health_check` toutes les 5 secondes via safeInvokeCanonical.
 * Couleur dérivée du résultat + latence mesurée localement.
 *
 * Mission : rendre la vivacité runtime IMMÉDIATEMENT visible (UI vΩ — v34.0.3).
 * Surface mapping : TopRight global overlay (App shell direct child).
 */

import React, { useEffect, useState, useRef } from 'react';
import { safeInvokeCanonical } from '@/utils/invoke';

type PulseStatus = 'LIVE' | 'PARTIAL' | 'DEGRADED' | 'PROBING';

interface PulseState {
  status: PulseStatus;
  latencyMs: number | null;
  lastError?: string;
  lastProbeAt: number;
}

// v34.0.4 fix (AH-v101): do NOT gate on isTauriRuntimeAvailable() — its singleton
// cache may lock to `false` when React mounts before window.__TAURI_INTERNALS__
// is injected, leaving the pulse permanently PARTIAL even when IPC works.
// Always attempt the IPC probe; safeInvokeCanonical reports NO_TRANSPORT
// honestly when the bridge is truly missing.
const PROBE_INTERVAL_MS = 5_000;
const PROBE_TIMEOUT_MS = 4_000; // tolerate cold-start of auto_evolution engine
const LATENCY_DEGRADED_THRESHOLD_MS = 2_500;
const TRANSPORT_PARTIAL_CODES = new Set<string>([
  'NO_TRANSPORT',
  'IPC_TIMEOUT',
  'IPC_MALFORMED_RESPONSE',
]);

const STATUS_META: Record<
  PulseStatus,
  { icon: string; label: string; colorClass: string; pulse: boolean }
> = {
  LIVE: {
    icon: '●',
    label: 'LIVE',
    colorClass: 'bg-emerald-900/80 text-emerald-200 border-emerald-500/60 shadow-emerald-500/20',
    pulse: false,
  },
  PARTIAL: {
    icon: '◑',
    label: 'PARTIAL',
    colorClass: 'bg-amber-900/80 text-amber-200 border-amber-500/60 shadow-amber-500/30',
    pulse: true,
  },
  DEGRADED: {
    icon: '▽',
    label: 'DEGRADED',
    colorClass: 'bg-red-900/80 text-red-200 border-red-500/70 shadow-red-500/40',
    pulse: true,
  },
  PROBING: {
    icon: '◌',
    label: 'PROBING',
    colorClass: 'bg-slate-800/80 text-slate-300 border-slate-500/60',
    pulse: true,
  },
};

function formatLatency(state: PulseState): string {
  if (state.status === 'PROBING') return '…';
  if (state.latencyMs == null) return 'timeout';
  if (state.latencyMs >= 1000) return `${(state.latencyMs / 1000).toFixed(1)}s`;
  return `${state.latencyMs}ms`;
}

export function GlobalRuntimePulse(): React.ReactElement {
  const [state, setState] = useState<PulseState>({
    status: 'PROBING',
    latencyMs: null,
    lastProbeAt: 0,
  });
  const cancelRef = useRef(false);

  useEffect(() => {
    cancelRef.current = false;

    const probe = async () => {
      const t0 = performance.now();
      const result = await safeInvokeCanonical<unknown>(
        'quick_health_check',
        {},
        PROBE_TIMEOUT_MS,
      );
      const dt = Math.round(performance.now() - t0);

      if (cancelRef.current) return;

      if (result.ok) {
        setState({
          status: dt > LATENCY_DEGRADED_THRESHOLD_MS ? 'PARTIAL' : 'LIVE',
          latencyMs: dt,
          lastProbeAt: Date.now(),
        });
        return;
      }

      const code = result.error?.code ?? 'IPC_FAIL';
      const message = result.error?.message ?? '';
      // Transport not ready (no Tauri bridge yet, timeout, malformed) → PARTIAL
      // Backend error returned (handler failed) → DEGRADED
      // v34.0.5 fix (AH-v102): security whitelist rejection surfaces as Error/IPC_ERROR
      // with a `Security:` prefixed message — classify as DEGRADED with explicit code
      // so operators see the broken layer (L1 TS whitelist) instead of silent partial.
      const isWhitelistRejection = /^Security:/i.test(message);
      const effectiveCode = isWhitelistRejection ? 'L1_WHITELIST_REJECT' : code;
      const status: PulseStatus = TRANSPORT_PARTIAL_CODES.has(effectiveCode)
        ? 'PARTIAL'
        : 'DEGRADED';
      setState({
        status,
        latencyMs: status === 'PARTIAL' ? null : dt,
        lastError: `${effectiveCode}${message ? ' :: ' + message.slice(0, 120) : ''}`,
        lastProbeAt: Date.now(),
      });
    };

    void probe();
    const id = setInterval(() => void probe(), PROBE_INTERVAL_MS);
    return () => {
      cancelRef.current = true;
      clearInterval(id);
    };
  }, []);

  const meta = STATUS_META[state.status];
  const version =
    typeof __APP_VERSION__ !== 'undefined' && __APP_VERSION__
      ? __APP_VERSION__
      : 'dev';

  return (
    <div
      data-testid="global-runtime-pulse"
      data-status={state.status}
      data-latency={state.latencyMs ?? -1}
      data-error={state.lastError ?? ''}
      role="status"
      aria-live="polite"
      aria-label={`TITANE runtime ${meta.label} v${version} latency ${formatLatency(state)}`}
      title={`TITANE ${meta.label} v${version} · ${formatLatency(state)}${state.lastError ? '\n' + state.lastError : ''}`}
      className={`fixed top-2 right-3 z-50 inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-mono font-semibold tracking-wide select-none shadow-lg backdrop-blur-sm ${meta.colorClass} ${meta.pulse ? 'animate-pulse' : ''}`}
    >
      <span aria-hidden="true" className="text-base leading-none">
        {meta.icon}
      </span>
      <span className="opacity-90">TITANE</span>
      <span>{meta.label}</span>
      <span className="opacity-70">v{version}</span>
      <span className="opacity-60">·</span>
      <span data-testid="global-runtime-pulse-latency">{formatLatency(state)}</span>
    </div>
  );
}

export default GlobalRuntimePulse;
