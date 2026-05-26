/**
 * TITANE_INFINITY v34.2.0 — useDevtoolsMemoryHealthQuery
 *
 * Pilot TanStack Query hook for `devtools_memory_health` IPC.
 * staleTime 30s — devtools memory health drifts slowly; useful in DevTools/Diagnostic panels.
 */
import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from '@tanstack/react-query';
import { secureInvoke } from '../../lib/security';
import { TAURI_COMMANDS } from '../../lib/tauriCommands';
import { queryKeys } from '../../lib/queryKeys';

export type DevtoolsMemoryHealthSnapshot = unknown;

type QueryOpts = Omit<
  UseQueryOptions<
    DevtoolsMemoryHealthSnapshot,
    Error,
    DevtoolsMemoryHealthSnapshot,
    ReturnType<typeof queryKeys.devtools.memoryHealth>
  >,
  'queryKey' | 'queryFn'
>;

export function useDevtoolsMemoryHealthQuery(
  options: QueryOpts = {}
): UseQueryResult<DevtoolsMemoryHealthSnapshot, Error> {
  return useQuery({
    queryKey: queryKeys.devtools.memoryHealth(),
    queryFn: () =>
      secureInvoke<DevtoolsMemoryHealthSnapshot>(
        TAURI_COMMANDS.DEVTOOLS_MEMORY_HEALTH,
        {}
      ),
    staleTime: 30_000,
    ...options,
  });
}
