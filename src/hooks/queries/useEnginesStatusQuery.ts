/**
 * TITANE_INFINITY v34.2.0 — useEnginesStatusQuery
 *
 * Pilot TanStack Query hook for `get_engines_status` IPC.
 * staleTime 15s — engine status changes during long runs; refetchInterval 30s so
 * dashboards stay live without hammering the IPC bus.
 */
import { useQuery, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';
import { secureInvoke } from '../../lib/security';
import { TAURI_COMMANDS } from '../../lib/tauriCommands';
import { queryKeys } from '../../lib/queryKeys';

export type EnginesStatusSnapshot = unknown;

type QueryOpts = Omit<
  UseQueryOptions<EnginesStatusSnapshot, Error, EnginesStatusSnapshot, ReturnType<typeof queryKeys.engines.status>>,
  'queryKey' | 'queryFn'
>;

export function useEnginesStatusQuery(
  options: QueryOpts = {}
): UseQueryResult<EnginesStatusSnapshot, Error> {
  return useQuery({
    queryKey: queryKeys.engines.status(),
    queryFn: () => secureInvoke<EnginesStatusSnapshot>(TAURI_COMMANDS.GET_ENGINES_STATUS, {}),
    staleTime: 15_000,
    refetchInterval: 30_000,
    ...options,
  });
}
