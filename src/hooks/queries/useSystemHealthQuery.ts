/**
 * TITANE_INFINITY v34.2.0 — useSystemHealthQuery
 *
 * Pilot TanStack Query hook for `get_system_health` IPC.
 * Replaces the ad-hoc useEffect+setState pattern used previously by system surfaces.
 *
 * staleTime 10s — system health drifts fast; refetchInterval is intentionally OFF so
 * dashboards stay battery-aware. Callers that need polling can use `refetchInterval`
 * locally via `useSystemHealthQuery({ refetchInterval: 5_000 })`.
 */
import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from '@tanstack/react-query';
import { secureInvoke } from '../../lib/security';
import { TAURI_COMMANDS } from '../../lib/tauriCommands';
import { queryKeys } from '../../lib/queryKeys';

export type SystemHealthSnapshot = unknown;

type QueryOpts = Omit<
  UseQueryOptions<
    SystemHealthSnapshot,
    Error,
    SystemHealthSnapshot,
    ReturnType<typeof queryKeys.system.health>
  >,
  'queryKey' | 'queryFn'
>;

export function useSystemHealthQuery(
  options: QueryOpts = {}
): UseQueryResult<SystemHealthSnapshot, Error> {
  return useQuery({
    queryKey: queryKeys.system.health(),
    queryFn: () =>
      secureInvoke<SystemHealthSnapshot>(TAURI_COMMANDS.GET_SYSTEM_HEALTH, {}),
    staleTime: 10_000,
    ...options,
  });
}
