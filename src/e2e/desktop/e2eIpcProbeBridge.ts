/**
 * TITANE∞ — E2E IPC Probe Bridge (v62)
 *
 * E2E-ONLY gate: this module registers window.__TITANE_E2E_IPC_PROBE__ ONLY
 * when localStorage.TITANE_E2E_PROBE === '1'.
 *
 * NEVER exposes arbitrary IPC. Uses only the v62 allowlist.
 * Redacts sensitive content. Fails closed if not in E2E mode or Tauri unavailable.
 *
 * Security model:
 *   - Activation requires explicit localStorage flag (set by WDIO spec only)
 *   - Only allowlisted read-only commands may be invoked
 *   - Response content is always redacted before returning
 *   - No home paths, tokens, keys, or secrets are returned
 *   - Bridge is confined to the Tauri WebView (same-origin, inaccessible from outside)
 *
 * STOPLINES enforced:
 *   - Bridge disabled unless TITANE_E2E_PROBE=1 in localStorage
 *   - Unknown commandId → COMMAND_NOT_ALLOWLISTED error (no invoke attempted)
 *   - Destructive patterns in commandId → COMMAND_BLOCKED_DESTRUCTIVE
 *   - No raw arbitrary command string passthrough
 *   - Response preview is always redacted
 *
 * @see e2eIpcProbeAllowlist.ts for the command whitelist
 */

import {
  E2E_IPC_PROBE_ALLOWLIST,
  isAllowlistedCommandId,
  listAllowedCommandIds,
  getAllowlistEntry,
} from './e2eIpcProbeAllowlist';

// ─── Constants ─────────────────────────────────────────────────────────────

export const BRIDGE_VERSION = 'v62';
const PROBE_FLAG_KEY = 'TITANE_E2E_PROBE';
const PROBE_FLAG_VALUE = '1';
const WINDOW_KEY = '__TITANE_E2E_IPC_PROBE__';

/** Patterns that are never allowed even if someone passes them as commandId */
const DESTRUCTIVE_PATTERNS = [
  'delete',
  'remove',
  'reset',
  'drop',
  'clear',
  'purge',
  'wipe',
  'push',
  'send',
  'upload',
  'sync_push',
  'write',
  'save',
  'execute',
  'exec',
  'eval',
  'run_',
  'shell',
];

// ─── Types ─────────────────────────────────────────────────────────────────

export interface ProbeResponse {
  ok: boolean;
  commandId: string;
  command: string | null;
  attempted: boolean;
  available: boolean;
  responseShape: string | null;
  contentPreviewRedacted: string | null;
  errorKind: string | null;
  errorMessageRedacted: string | null;
  latencyMs: number;
  proofLevel: string;
  safeToPersist: boolean;
  redactionApplied: boolean;
  bridgeVersion: string;
  source: 'APP_CONTEXT_TAURI_IPC_PROBE';
}

export interface E2EIpcProbeBridge {
  version: typeof BRIDGE_VERSION;
  enabled: true;
  listAllowedCommands: () => string[];
  invoke: (
    commandId: string,
    payload?: Record<string, unknown>
  ) => Promise<ProbeResponse>;
  getLastResult: () => ProbeResponse | null;
  clearLastResult: () => void;
}

// ─── Guards ─────────────────────────────────────────────────────────────────

/**
 * Returns true only when WDIO has explicitly set the E2E probe flag.
 * In normal/production use this flag is never set.
 */
export function isE2EProbeEnabled(): boolean {
  try {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem(PROBE_FLAG_KEY) === PROBE_FLAG_VALUE;
  } catch {
    return false;
  }
}

/**
 * Returns true if the commandId contains a destructive pattern.
 */
function isDestructiveCommandId(commandId: string): boolean {
  const lower = commandId.toLowerCase();
  return DESTRUCTIVE_PATTERNS.some(p => lower.includes(p));
}

// ─── Redaction ──────────────────────────────────────────────────────────────

/**
 * Redacts home paths and token-like strings from a message.
 */
function redactMessage(msg: string): string {
  return msg
    .replace(/\/home\/[^\s/]+/g, '[HOME_REDACTED]')
    .replace(/\/Users\/[^\s/]+/g, '[HOME_REDACTED]')
    .replace(/Bearer\s+\S+/gi, 'Bearer [TOKEN_REDACTED]')
    .replace(/"token"\s*:\s*"[^"]+"/g, '"token":"[REDACTED]"')
    .slice(0, 200);
}

/**
 * Extracts a safe shape description from a response object.
 * Returns field names only, never values.
 */
function extractResponseShape(response: unknown): string {
  if (response === null || response === undefined) return 'null';
  if (typeof response !== 'object') return typeof response;
  const keys = Object.keys(response as Record<string, unknown>);
  return `{${keys.slice(0, 8).join(',')}}`;
}

// ─── Bridge Registration ─────────────────────────────────────────────────────

let lastResult: ProbeResponse | null = null;

/**
 * Registers window.__TITANE_E2E_IPC_PROBE__ if E2E mode is enabled.
 * Safe no-op if flag is not set. Must be called after app bootstrap.
 */
export function registerE2eIpcProbeBridge(): void {
  if (typeof window === 'undefined') return;
  if (!isE2EProbeEnabled()) return;

  // Prevent double registration
  if ((window as unknown as Record<string, unknown>)[WINDOW_KEY]) return;

  const bridge: E2EIpcProbeBridge = {
    version: BRIDGE_VERSION,
    enabled: true,

    listAllowedCommands(): string[] {
      return listAllowedCommandIds();
    },

    async invoke(
      commandId: string,
      payload?: Record<string, unknown>
    ): Promise<ProbeResponse> {
      const tStart = performance.now();

      // Guard: destructive pattern
      if (isDestructiveCommandId(commandId)) {
        const result: ProbeResponse = {
          ok: false,
          commandId,
          command: null,
          attempted: false,
          available: false,
          responseShape: null,
          contentPreviewRedacted: null,
          errorKind: 'COMMAND_BLOCKED_DESTRUCTIVE',
          errorMessageRedacted: `commandId "${commandId}" matches destructive pattern and is blocked by E2E probe bridge`,
          latencyMs: Math.round(performance.now() - tStart),
          proofLevel: 'PROOF_DEPTH_BLOCKED_BY_SECURITY_GUARD',
          safeToPersist: true,
          redactionApplied: true,
          bridgeVersion: BRIDGE_VERSION,
          source: 'APP_CONTEXT_TAURI_IPC_PROBE',
        };
        lastResult = result;
        return result;
      }

      // Guard: not in allowlist
      if (!isAllowlistedCommandId(commandId)) {
        const result: ProbeResponse = {
          ok: false,
          commandId,
          command: null,
          attempted: false,
          available: false,
          responseShape: null,
          contentPreviewRedacted: null,
          errorKind: 'COMMAND_NOT_ALLOWLISTED',
          errorMessageRedacted: `commandId "${commandId}" is not in the v62 E2E probe allowlist`,
          latencyMs: Math.round(performance.now() - tStart),
          proofLevel: 'PROOF_DEPTH_BLOCKED_BY_SECURITY_GUARD',
          safeToPersist: true,
          redactionApplied: true,
          bridgeVersion: BRIDGE_VERSION,
          source: 'APP_CONTEXT_TAURI_IPC_PROBE',
        };
        lastResult = result;
        return result;
      }

      const entry = getAllowlistEntry(commandId)!;

      // Attempt IPC call via dynamic import (avoids breaking non-Tauri contexts)
      try {
        const { invoke: tauriInvoke } = await import('@tauri-apps/api/core');
        const response = await tauriInvoke(entry.command, payload ?? {});
        const latencyMs = Math.round(performance.now() - tStart);

        const result: ProbeResponse = {
          ok: true,
          commandId,
          command: entry.command,
          attempted: true,
          available: true,
          responseShape: extractResponseShape(response),
          contentPreviewRedacted: '[REDACTED — content not returned to test context]',
          errorKind: null,
          errorMessageRedacted: null,
          latencyMs,
          proofLevel: 'IPC_RESPONSE_PROVEN',
          safeToPersist: true,
          redactionApplied: true,
          bridgeVersion: BRIDGE_VERSION,
          source: 'APP_CONTEXT_TAURI_IPC_PROBE',
        };
        lastResult = result;
        return result;
      } catch (e: unknown) {
        const latencyMs = Math.round(performance.now() - tStart);
        const rawMsg = e instanceof Error ? e.message : String(e);
        const isNotFound = /not found|unknown command|No such command/i.test(rawMsg);
        const isNoTauri =
          /TAURI_INTERNALS|__TAURI__|ipc|invoke/i.test(rawMsg) &&
          !/found|command/i.test(rawMsg);

        let errorKind = 'COMMAND_ERROR';
        let proofLevel = 'PROOF_DEPTH_BLOCKED_BY_RUNTIME';
        if (isNoTauri) {
          errorKind = 'NO_TAURI_IPC_CONTEXT';
          proofLevel = 'PROOF_DEPTH_BLOCKED_BY_RUNTIME';
        } else if (isNotFound) {
          errorKind = 'COMMAND_NOT_FOUND';
          proofLevel = 'PROOF_DEPTH_BLOCKED_BY_MISSING_COMMAND';
        }

        const result: ProbeResponse = {
          ok: false,
          commandId,
          command: entry.command,
          attempted: true,
          available: false,
          responseShape: null,
          contentPreviewRedacted: null,
          errorKind,
          errorMessageRedacted: redactMessage(rawMsg),
          latencyMs,
          proofLevel,
          safeToPersist: true,
          redactionApplied: true,
          bridgeVersion: BRIDGE_VERSION,
          source: 'APP_CONTEXT_TAURI_IPC_PROBE',
        };
        lastResult = result;
        return result;
      }
    },

    getLastResult(): ProbeResponse | null {
      return lastResult;
    },

    clearLastResult(): void {
      lastResult = null;
    },
  };

  (window as unknown as Record<string, unknown>)[WINDOW_KEY] = bridge;
}

/**
 * Returns the bridge instance from window if registered, or null.
 * Used for internal introspection / tests.
 */
export function getE2EIpcProbeBridge(): E2EIpcProbeBridge | null {
  if (typeof window === 'undefined') return null;
  return (
    ((window as unknown as Record<string, unknown>)[WINDOW_KEY] as E2EIpcProbeBridge) ??
    null
  );
}

/**
 * Returns the allowlist map (for introspection in tests).
 */
export { E2E_IPC_PROBE_ALLOWLIST };
