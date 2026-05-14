/**
 * TITANE_INFINITY v34.4.0 — useChatProvidersHealthQuery
 *
 * Lightweight liveness probe for chat providers (Ollama / remote endpoints).
 * Distinct from `useProvidersStatusQuery` (v34.2.0) which carries fuller
 * provider snapshot metadata: this hook calls `chat_check_providers` to
 * report only reachability and stays cheap to refetch frequently.
 *
 * staleTime 15s — provider liveness can flip quickly when Ollama restarts.
 */
import { useQuery, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';
import { secureInvoke } from '../../lib/security';
import { TAURI_COMMANDS } from '../../lib/tauriCommands';
import { queryKeys } from '../../lib/queryKeys';

export type ChatProvidersHealth = unknown;

type QueryOpts = Omit<
  UseQueryOptions<ChatProvidersHealth, Error, ChatProvidersHealth, ReturnType<typeof queryKeys.chat.providersHealth>>,
  'queryKey' | 'queryFn'
>;

export function useChatProvidersHealthQuery(
  options: QueryOpts = {}
): UseQueryResult<ChatProvidersHealth, Error> {
  return useQuery({
    queryKey: queryKeys.chat.providersHealth(),
    queryFn: () => secureInvoke<ChatProvidersHealth>(TAURI_COMMANDS.CHAT_CHECK_PROVIDERS, {}),
    staleTime: 15_000,
    ...options,
  });
}
