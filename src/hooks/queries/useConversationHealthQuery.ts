/**
 * TITANE_INFINITY v34.2.0 — useConversationHealthQuery
 *
 * Pilot TanStack Query hook for `conversation_health_check` IPC.
 * staleTime 60s — conversation pipeline health is stable; refetched on focus disabled
 * by the global QueryClient defaults.
 */
import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from '@tanstack/react-query';
import { secureInvoke } from '../../lib/security';
import { TAURI_COMMANDS } from '../../lib/tauriCommands';
import { queryKeys } from '../../lib/queryKeys';

export type ConversationHealthSnapshot = unknown;

type QueryOpts = Omit<
  UseQueryOptions<
    ConversationHealthSnapshot,
    Error,
    ConversationHealthSnapshot,
    ReturnType<typeof queryKeys.conversation.health>
  >,
  'queryKey' | 'queryFn'
>;

export function useConversationHealthQuery(
  options: QueryOpts = {}
): UseQueryResult<ConversationHealthSnapshot, Error> {
  return useQuery({
    queryKey: queryKeys.conversation.health(),
    queryFn: () =>
      secureInvoke<ConversationHealthSnapshot>(
        TAURI_COMMANDS.CONVERSATION_HEALTH_CHECK,
        {}
      ),
    staleTime: 60_000,
    ...options,
  });
}
