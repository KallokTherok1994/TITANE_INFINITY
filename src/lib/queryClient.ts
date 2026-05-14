/**
 * TITANE_INFINITY v34.1.0 — TanStack Query QueryClient
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * Canonical QueryClient used by the entire app. Defaults align with the
 * UN SEUL TITANE VIVANT doctrine:
 *
 *   - staleTime: 30s — cache results long enough to skip duplicate IPC calls
 *     across simultaneous components, but short enough that the runtime
 *     truth never drifts.
 *   - gcTime: 5 min — keep results in memory for back/forward navigation.
 *   - refetchOnWindowFocus: false — Tauri windows lose focus often; we never
 *     want a focus event to trigger a storm of IPC invocations.
 *   - retry: 1 — IPC failures are surfaced quickly so the UI can degrade.
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});
