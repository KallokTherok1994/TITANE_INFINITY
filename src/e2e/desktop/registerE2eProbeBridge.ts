/**
 * TITANE∞ — E2E IPC Probe Bridge Registration (v62)
 *
 * Entry point for registering the E2E probe bridge from main.tsx.
 * Called once during app bootstrap — no-op unless TITANE_E2E_PROBE=1 in localStorage.
 *
 * This file is intentionally minimal to avoid import side effects in production.
 */

import { registerE2eIpcProbeBridge, isE2EProbeEnabled } from './e2eIpcProbeBridge';

/**
 * Initialises the E2E IPC probe bridge.
 * Safe to call unconditionally — internally gated on localStorage flag.
 *
 * Call once, early in app bootstrap (e.g. main.tsx), before React mounts.
 */
export function initE2EProbeBridge(): void {
  if (!isE2EProbeEnabled()) return;
  registerE2eIpcProbeBridge();
}
