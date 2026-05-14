/**
 * TITANE_INFINITY v34.1.0 — useTransportState
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * Volatile Zustand store exposing the currently resolved transport for the
 * canonical TITANE client (`'tauri' | 'remote' | 'degraded'`).
 *
 * NO persistence — this state must be re-probed at every session so that a
 * stale value never poisons the UI after a network change, gateway restart,
 * or platform switch.
 */

import { create } from 'zustand';

export type ActiveTransport = 'tauri' | 'remote' | 'degraded';

export interface TransportState {
  /** Currently resolved transport, or 'degraded' before the first probe. */
  transport: ActiveTransport;
  /** Timestamp (ms epoch) of the last successful probe; 0 if never probed. */
  lastProbeAt: number;
  /** Update the transport explicitly (called by getActiveTransport). */
  setTransport: (next: ActiveTransport, probeAt?: number) => void;
}

export const useTransportState = create<TransportState>(set => ({
  transport: 'degraded',
  lastProbeAt: 0,
  setTransport: (next, probeAt) =>
    set({ transport: next, lastProbeAt: probeAt ?? Date.now() }),
}));

/**
 * Non-React accessor for code paths that cannot use hooks (services, async
 * transport probes). Returns a snapshot — does not subscribe.
 */
export function getTransportSnapshot(): {
  transport: ActiveTransport;
  lastProbeAt: number;
} {
  const s = useTransportState.getState();
  return { transport: s.transport, lastProbeAt: s.lastProbeAt };
}
