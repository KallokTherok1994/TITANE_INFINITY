/**
 * TITANE∞ — Unified Transport Factory
 *
 * Detects whether the code is running inside Tauri (desktop) or in a
 * remote browser context, and returns the appropriate transport.
 *
 * Usage:
 * ```ts
 * import { getTransport } from '@/lib/transport';
 *
 * const t = getTransport();
 * const result = await t.invoke('get_runtime_config');
 * ```
 *
 * Rule 5 (One Door): The transport factory is the single dispatch point.
 * No direct invoke() or fetch() calls should exist outside this layer.
 *
 * @module transport
 */

import { secureInvoke } from '@/lib/security';
import { getRemoteTransport, type RemoteTransport } from '@/lib/remoteTransport';

// ── Transport Interface ───────────────────────────────────────

export interface Transport {
  /**
   * Invoke a backend command and return the typed result.
   * Mirrors Tauri invoke() semantics: throws on error.
   */
  invoke<T = unknown>(command: string, payload?: Record<string, unknown>): Promise<T>;

  /** Whether this transport uses the remote HTTP gateway */
  readonly isRemote: boolean;
}

// ── Tauri Transport (in-process IPC) ─────────────────────────

class TauriTransport implements Transport {
  readonly isRemote = false;

  async invoke<T = unknown>(
    command: string,
    payload?: Record<string, unknown>
  ): Promise<T> {
    return secureInvoke<T>(command, payload ?? {});
  }
}

// ── Remote Transport Wrapper ──────────────────────────────────

class RemoteTransportWrapper implements Transport {
  readonly isRemote = true;
  private inner: RemoteTransport;

  constructor(remote: RemoteTransport) {
    this.inner = remote;
  }

  async invoke<T = unknown>(
    command: string,
    payload?: Record<string, unknown>
  ): Promise<T> {
    return this.inner.invoke<T>(command, payload);
  }
}

// ── Detection ────────────────────────────────────────────────

/**
 * Returns true when running inside a Tauri WebView.
 * Tauri injects `window.__TAURI_INTERNALS__` at startup.
 */
export function isTauriContext(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!(window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__
  );
}

/**
 * Returns true when the page is served by the TITANE remote gateway
 * (i.e. a browser accessing the axum server, not the Tauri WebView).
 *
 * Detection rules (all must be non-Tauri):
 *  1. `window.__TITANE_REMOTE__ === true` is injected by the axum static server, OR
 *  2. The URL search param `?titane_remote=1` is present (useful for manual testing).
 *
 * A plain Vite dev server or normal browser open is NOT a remote context.
 */
export function isRemoteContext(): boolean {
  if (typeof window === 'undefined') return false;
  if (isTauriContext()) return false;

  const w = window as Window & { __TITANE_REMOTE__?: boolean };
  if (w.__TITANE_REMOTE__ === true) return true;

  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('titane_remote') === '1') return true;
  } catch {
    // ignore
  }

  return false;
}

// ── Factory ───────────────────────────────────────────────────

let _transport: Transport | null = null;

/**
 * Get the active transport (Tauri or Remote).
 * Cached after first call.
 */
export function getTransport(): Transport {
  if (_transport) return _transport;

  if (isTauriContext()) {
    _transport = new TauriTransport();
  } else {
    _transport = new RemoteTransportWrapper(getRemoteTransport());
  }

  return _transport;
}

/**
 * Override the active transport (useful for testing or explicit remote mode).
 */
export function setTransport(t: Transport): void {
  _transport = t;
}

/**
 * Reset the transport cache (for tests).
 */
export function resetTransport(): void {
  _transport = null;
}
