/**
 * TITANE_INFINITY v34.4.0 — useChatSendMutation
 *
 * TanStack Query mutation for `chat_generate`. Honours the canonical IPC
 * envelope `{ ok, content, error }` exposed by Rule 6 — failures surface
 * via `onError`. After a successful send the cached conversation is
 * invalidated so a follow-up `useChatConversationQuery` refetches the
 * fresh transcript without ad-hoc setState.
 *
 * Scope discipline:
 *   - Does NOT replace the streaming pipeline (`chat_stream_message`) yet.
 *   - Does NOT replace `useChat*` legacy hooks; coexists additively until
 *     consumers migrate (Rule 1 minimal patch).
 */
import { useMutation, useQueryClient, type UseMutationOptions, type UseMutationResult } from '@tanstack/react-query';
import { secureInvoke } from '../../lib/security';
import { TAURI_COMMANDS } from '../../lib/tauriCommands';
import { queryKeys } from '../../lib/queryKeys';

export interface ChatSendVariables {
  conversationId: string;
  prompt: string;
  /** Optional explicit provider override. Defaults to backend resolution. */
  provider?: string;
  /** Optional explicit model override. PROD pipeline keeps `gemma2:2b` by default. */
  model?: string;
}

export type ChatSendResponse = unknown;

type MutationOpts = Omit<
  UseMutationOptions<ChatSendResponse, Error, ChatSendVariables>,
  'mutationFn'
>;

export function useChatSendMutation(
  options: MutationOpts = {}
): UseMutationResult<ChatSendResponse, Error, ChatSendVariables> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables) =>
      secureInvoke<ChatSendResponse>(TAURI_COMMANDS.CHAT_GENERATE, { ...variables }),
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.chat.conversation(variables.conversationId),
      });
      options.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
