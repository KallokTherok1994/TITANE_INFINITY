/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v34.0.13 — useSurfaceTruth
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Returns the canonical runtime "truth" facts of the currently rendered shell.
 * Used by `SurfaceTruthBadge` and by Playwright assertions to detect stale UI.
 *
 * Facts collected:
 *   - appVersion       : __APP_VERSION__ build-time constant
 *   - buildTimestamp   : __BUILD_TIMESTAMP__ build-time constant
 *   - storeVersion     : Zustand persist version of `titane-singularity-state-v34`
 *   - swScope          : service worker registration scope, when available
 *   - swController     : whether a controller worker is active
 *   - transport        : `tauri` | `web` (based on globals)
 *   - chunkHash        : module URL of this hook (carries Vite content hash)
 *   - dataSurfaceTruth : nearest `data-surface-truth` attribute on the DOM tree
 *
 * Pure read-only — no side effects, safe to call from anywhere.
 */

import { useEffect, useState } from 'react';

export interface SurfaceTruth {
  appVersion: string;
  buildTimestamp: string;
  storeVersion: number | null;
  swScope: string | null;
  swController: boolean;
  transport: 'tauri' | 'web';
  chunkHash: string;
  dataSurfaceTruth: string | null;
}

function readStoreVersion(): number | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem('titane-singularity-state-v34');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed?.version === 'number' ? parsed.version : null;
  } catch {
    return null;
  }
}

function readDataSurfaceTruth(): string | null {
  try {
    if (typeof document === 'undefined') return null;
    const node = document.querySelector('[data-surface-truth]');
    return node?.getAttribute('data-surface-truth') ?? null;
  } catch {
    return null;
  }
}

function readTransport(): 'tauri' | 'web' {
  try {
    if (
      typeof window !== 'undefined' &&
      (
        (window as unknown as Record<string, unknown>).__TAURI_INTERNALS__ ||
        (window as unknown as Record<string, unknown>).__TAURI__
      )
    ) {
      return 'tauri';
    }
  } catch {
    /* noop */
  }
  return 'web';
}

const CHUNK_HASH: string = (() => {
  try {
    return new URL(import.meta.url).pathname;
  } catch {
    return 'unknown';
  }
})();

export function useSurfaceTruth(): SurfaceTruth {
  const [truth, setTruth] = useState<SurfaceTruth>(() => ({
    appVersion: typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev',
    buildTimestamp:
      typeof __BUILD_TIMESTAMP__ !== 'undefined' ? __BUILD_TIMESTAMP__ : new Date(0).toISOString(),
    storeVersion: readStoreVersion(),
    swScope: null,
    swController: false,
    transport: readTransport(),
    chunkHash: CHUNK_HASH,
    dataSurfaceTruth: readDataSurfaceTruth(),
  }));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (typeof navigator === 'undefined' || !navigator.serviceWorker) return;
        const reg = await navigator.serviceWorker.getRegistration();
        if (cancelled) return;
        setTruth(prev => ({
          ...prev,
          swScope: reg?.scope ?? null,
          swController: !!navigator.serviceWorker.controller,
          dataSurfaceTruth: readDataSurfaceTruth(),
        }));
      } catch {
        /* noop */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return truth;
}

export default useSurfaceTruth;
