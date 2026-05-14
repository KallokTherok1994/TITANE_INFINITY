/**
 * TITANE_INFINITY v34.5.0 — useChatSendMutation (canonical PROD pipeline)
 *
 * TanStack Query mutation wrapping the OMEGA Pipeline v2 IPC command
 * `conversation_generate` — the **only** production chat dispatch surface
 * (the legacy `chat_generate` was the mock echo retained for smoke tests).
 *
 * Payload contract mirrors `ConversationGenerateArgs` (camelCase via serde):
 *   `{ message, conversationId, mode?, provider?, systemPrompt? }`.
 *
 * Honours IPC envelope `{ ok, content, error }` (Rule 6) — failures surface
 * via `onError`. After a successful send the cached conversation is
 * invalidated so a follow-up `useChatConversationQuery` refetches the
 * fresh transcript without ad-hoc setState.
 *
 * Scope discipline:
 *   - Does NOT replace the streaming pipeline (`chat_stream_message`) yet.
 *   - Does NOT replace `useChat*` legacy hooks; coexists additively until
 *     consumers migrate (Rule 1 minimal patch).
 *   - PROD model stays `gemma2:2b` (Ollama boundary truth) — never reads
 *     `OLLAMA_MODEL` dev env var.
 */
import { useMutation, useQueryClient, type UseMutationOptions, type UseMutationResult } from '@tanstack/react-query';
import { secureInvoke } from '../../lib/security';
import { TAURI_COMMANDS } from '../../lib/tauriCommands';
import { queryKeys } from '../../lib/queryKeys';

export interface ChatSendVariables {
  conversationId: string;
  /** The user message dispatched to the OMEGA Pipeline. */
  message: string;
  /** Optional conversation mode (e.g. `default`, `creative`). */
  mode?: string;
  /** Optional explicit provider override. Defaults to backend resolution. */
  provider?: string;
  /** Optional system prompt override. */
  systemPrompt?: string;
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
      secureInvoke<ChatSendResponse>(TAURI_COMMANDS.CONVERSATION_GENERATE, { ...variables }),
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.chat.conversation(variables.conversationId),
      });
      options.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
