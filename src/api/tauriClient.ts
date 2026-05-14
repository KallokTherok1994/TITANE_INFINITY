/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║ TITANE∞ v30.0.0 - Tauri Client Wrapper (SECURED)                            ║
// ║ Type-safe communication layer with automatic error handling                 ║
// ║ Intégration module security: whitelist, anti-injection, anti-loop          ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

import { secureInvoke } from '@/lib/security';

type TauriIpcEnvelope<T> = {
  ok: boolean;
  content?: T;
  error?: unknown;
};

function unwrapTauriResult<T>(result: T | TauriIpcEnvelope<T>): T {
  if (result && typeof result === 'object' && 'ok' in result) {
    const envelope = result as TauriIpcEnvelope<T>;

    if (!envelope.ok) {
      const reason =
        envelope.error instanceof Error
          ? envelope.error.message
          : typeof envelope.error === 'string'
            ? envelope.error
            : 'Unknown IPC error';

      throw new Error(reason);
    }

    return envelope.content as T;
  }

  return result as T;
}

/**
 * Unified Tauri command invocation with type safety
 *
 * Wraps secureInvoke with:
 * - Command whitelist validation
 * - Anti-injection protection
 * - Anti-loop detection
 * - Automatic error handling and logging
 * - Type-safe request/response
 * - Consistent error message formatting
 *
 * @template T - Expected response type
 * @param cmd - Command name (must match backend #[tauri::command])
 * @param payload - Optional command payload
 * @param validator - Optional type guard for response validation
 * @returns Promise resolving to typed response
 * @throws Error with formatted message on failure
 *
 * @example
 * ```typescript
 * // Simple command without payload
 * const status = await tauri<SystemStatus>('get_system_status');
 *
 * // Command with payload and validator
 * await tauri<MemoryState>('memory_get_state', {}, isMemoryState);
 * ```
 */
export async function tauri<T>(
  cmd: string,
  payload?: Record<string, unknown>,
  validator?: (val: unknown) => val is T
): Promise<T> {
  try {
    const result = await secureInvoke<T | TauriIpcEnvelope<T>>(
      cmd,
      payload ?? {},
      {},
      validator as ((val: unknown) => val is T | TauriIpcEnvelope<T>) | undefined
    );
    return unwrapTauriResult(result);
  } catch (error: unknown) {
    // Format error message consistently
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : 'Unknown Tauri invocation error';

    console.error(`[Tauri Error] Command "${cmd}" failed:`, errorMessage);
    throw new Error(`Tauri command "${cmd}" failed: ${errorMessage}`);
  }
}

/**
 * Tauri command with retry logic
 *
 * Automatically retries failed commands with exponential backoff.
 * Includes all security protections from secureInvoke.
 *
 * @template T - Expected response type
 * @param cmd - Command name
 * @param payload - Optional command payload
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param initialDelay - Initial delay in ms (default: 1000)
 * @param validator - Optional type guard for response validation
 * @returns Promise resolving to typed response
 *
 * @example
 * ```typescript
 * // Retry up to 3 times with exponential backoff
 * const data = await tauriWithRetry<MemoryState>('memory_get_state');
 * ```
 */
export async function tauriWithRetry<T>(
  cmd: string,
  payload?: Record<string, unknown>,
  maxRetries: number = 3,
  initialDelay: number = 1000,
  validator?: (val: unknown) => val is T
): Promise<T> {
  let lastError: Error | null = null;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await tauri<T>(cmd, payload, validator);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        console.warn(
          `[Tauri Retry] Attempt ${attempt + 1}/${maxRetries} failed for "${cmd}". Retrying in ${delay}ms...`
        );
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }

  // All retries exhausted
  throw new Error(
    `Command "${cmd}" failed after ${maxRetries} retries: ${lastError?.message}`
  );
}

/**
 * Batch invoke multiple commands in parallel
 *
 * Executes multiple Tauri commands concurrently and returns results
 * in the same order as the input commands. All commands are protected
 * by secureInvoke validations.
 *
 * @param commands - Array of command configurations with optional validators
 * @returns Promise resolving to array of results
 *
 * @example
 * ```typescript
 * const [status, metrics, graph] = await tauriBatch([
 *   { cmd: 'get_system_status', validator: isSystemStatus },
 *   { cmd: 'helios_get_metrics' },
 *   { cmd: 'nexus_get_graph' }
 * ]);
 * ```
 */
export async function tauriBatch<T = unknown>(
  commands: Array<{
    cmd: string;
    payload?: Record<string, unknown>;
    validator?: (val: unknown) => val is T;
  }>
): Promise<T[]> {
  const promises = commands.map(({ cmd, payload, validator }) =>
    tauri<T>(cmd, payload, validator)
  );
  return Promise.all(promises);
}

/**
 * Check if Tauri API is available
 *
 * Useful for detecting whether the app is running in Tauri context
 * or as a regular web app.
 *
 * @returns true if Tauri API is available
 */
export function isTauriAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const candidate = window as Window & {
    __TAURI__?: unknown;
    __TAURI_INTERNALS__?: unknown;
    isTauri?: boolean;
  };

  return Boolean(
    candidate.__TAURI__ || candidate.__TAURI_INTERNALS__ || candidate.isTauri
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  v34.1.0 — Hierarchical transport resolver                                 */
/*                                                                            */
/*  TITANE clients pick exactly one transport per session:                    */
/*    1. 'tauri'    — running inside the desktop runtime (One Door direct).   */
/*    2. 'remote'   — browser/PC ami/mobile, going through the Remote Gateway.*/
/*    3. 'degraded' — neither path is reachable; UI shows visible limits.     */
/*                                                                            */
/*  The resolver is cached for 30s to avoid hammering the network on every    */
/*  render. The cache key is the global module scope (single-window apps).    */
/* ────────────────────────────────────────────────────────────────────────── */

export type ActiveTransport = 'tauri' | 'remote' | 'degraded';

export interface GetActiveTransportOptions {
  /** Force a fresh probe even if a recent result is cached. */
  force?: boolean;
  /** Override fetch (for tests). */
  fetchImpl?: typeof fetch;
  /** Override the gateway probe URL. */
  remoteUrl?: string;
  /** Fetch timeout in ms (default 2000). */
  timeoutMs?: number;
}

const TRANSPORT_CACHE_TTL_MS = 30_000;
let transportCache: { value: ActiveTransport; at: number } | null = null;

function readRemoteUrl(): string {
  const viteEnv =
    typeof import.meta !== 'undefined' &&
    typeof (import.meta as ImportMeta & { env?: Record<string, string> }).env !== 'undefined'
      ? ((import.meta as ImportMeta & { env: Record<string, string> }).env
          .VITE_TITANE_REMOTE_URL as string | undefined)
      : undefined;
  if (viteEnv) return viteEnv;
  if (typeof window !== 'undefined' && window.localStorage) {
    const stored = window.localStorage.getItem('titane_remote_url');
    if (stored) return stored;
  }
  return '';
}

async function probeRemoteHealth(
  remoteUrl: string,
  fetchImpl: typeof fetch,
  timeoutMs: number
): Promise<boolean> {
  if (!remoteUrl) return false;
  const ctrl =
    typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = ctrl ? setTimeout(() => ctrl.abort(), timeoutMs) : null;
  try {
    const res = await fetchImpl(`${remoteUrl}/api/health`, {
      method: 'GET',
      signal: ctrl?.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Resolve which transport is currently usable by this client.
 * Result is cached for 30 seconds; pass `{ force: true }` to bypass.
 *
 * The resolver also pushes the result into `useTransportState` so that
 * components subscribed to that store re-render automatically.
 */
export async function getActiveTransport(
  opts: GetActiveTransportOptions = {}
): Promise<ActiveTransport> {
  const now = Date.now();
  if (
    !opts.force &&
    transportCache &&
    now - transportCache.at < TRANSPORT_CACHE_TTL_MS
  ) {
    return transportCache.value;
  }

  let resolved: ActiveTransport;
  if (isTauriAvailable()) {
    resolved = 'tauri';
  } else {
    const fetchImpl =
      opts.fetchImpl ??
      (typeof fetch !== 'undefined' ? fetch.bind(globalThis) : null);
    const remoteUrl = opts.remoteUrl ?? readRemoteUrl();
    if (fetchImpl && remoteUrl) {
      const healthy = await probeRemoteHealth(
        remoteUrl,
        fetchImpl,
        opts.timeoutMs ?? 2000
      );
      resolved = healthy ? 'remote' : 'degraded';
    } else {
      resolved = 'degraded';
    }
  }

  transportCache = { value: resolved, at: now };

  // Push into the volatile transport store so UI subscribers (badge, gateway
  // layout, debugging surfaces) get the truth without a separate call.
  try {
    const mod = await import('@/state/useTransportState');
    mod.useTransportState.getState().setTransport(resolved, now);
  } catch {
    /* dynamic import failure must never break the IPC critical path */
  }

  return resolved;
}

/** Test-only — clears the 30s transport cache. */
export function __resetActiveTransportCacheForTests__(): void {
  transportCache = null;
}
