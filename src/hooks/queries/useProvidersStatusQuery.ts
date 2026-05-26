/**
 * TITANE_INFINITY v34.2.0 — useProvidersStatusQuery
 *
 * Pilot TanStack Query hook for `chat_get_providers_status` IPC.
 * staleTime 30s — provider status (Ollama up/down, remote reachable, model loaded) doesn't
 * flip every second.
 */
import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from '@tanstack/react-query';
import { secureInvoke } from '../../lib/security';
import { TAURI_COMMANDS } from '../../lib/tauriCommands';
import { queryKeys } from '../../lib/queryKeys';

export type ProvidersStatusSnapshot = unknown;

type QueryOpts = Omit<
  UseQueryOptions<
    ProvidersStatusSnapshot,
    Error,
    ProvidersStatusSnapshot,
    ReturnType<typeof queryKeys.providers.status>
  >,
  'queryKey' | 'queryFn'
>;

export function useProvidersStatusQuery(
  options: QueryOpts = {}
): UseQueryResult<ProvidersStatusSnapshot, Error> {
  return useQuery({
    queryKey: queryKeys.providers.status(),
    queryFn: () =>
      secureInvoke<ProvidersStatusSnapshot>(TAURI_COMMANDS.CHAT_GET_PROVIDERS_STATUS, {}),
    staleTime: 30_000,
    ...options,
  });
}
