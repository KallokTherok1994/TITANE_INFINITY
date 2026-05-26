/**
 * TITANE_INFINITY v34.4.0 — useChatConversationQuery
 *
 * Read-only fetch of a single chat conversation by id. Disabled when no
 * conversationId is supplied — keeps cache slots clean for the empty case.
 *
 * staleTime 5s — conversations are append-mostly; a refetch after a send
 * mutation is preferable to long cache reuse. Pair with
 * `useChatSendMutation` which invalidates this exact key on success.
 */
import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from '@tanstack/react-query';
import { secureInvoke } from '../../lib/security';
import { TAURI_COMMANDS } from '../../lib/tauriCommands';
import { queryKeys } from '../../lib/queryKeys';

export type ChatConversation = unknown;

type QueryOpts = Omit<
  UseQueryOptions<
    ChatConversation,
    Error,
    ChatConversation,
    ReturnType<typeof queryKeys.chat.conversation>
  >,
  'queryKey' | 'queryFn' | 'enabled'
> & { enabled?: boolean };

export function useChatConversationQuery(
  conversationId: string | null | undefined,
  options: QueryOpts = {}
): UseQueryResult<ChatConversation, Error> {
  const id = conversationId ?? '';
  const enabledByCaller = options.enabled ?? true;
  return useQuery({
    queryKey: queryKeys.chat.conversation(id),
    queryFn: () =>
      secureInvoke<ChatConversation>(TAURI_COMMANDS.CHAT_GET_CONVERSATION, {
        conversationId: id,
      }),
    staleTime: 5_000,
    ...options,
    enabled: enabledByCaller && id.length > 0,
  });
}
