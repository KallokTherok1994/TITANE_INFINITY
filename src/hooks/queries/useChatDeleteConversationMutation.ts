/**
 * TITANE_INFINITY v34.4.0 — useChatDeleteConversationMutation
 *
 * Removes a conversation through `chat_delete_conversation` and evicts both
 * the specific conversation cache and the chat root prefix so adjacent
 * listings (suggestions, providers health) stay coherent.
 */
import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
  type UseMutationResult,
} from '@tanstack/react-query';
import { secureInvoke } from '../../lib/security';
import { TAURI_COMMANDS } from '../../lib/tauriCommands';
import { queryKeys } from '../../lib/queryKeys';

export interface ChatDeleteConversationVariables {
  conversationId: string;
}

export type ChatDeleteConversationResponse = unknown;

type MutationOpts = Omit<
  UseMutationOptions<
    ChatDeleteConversationResponse,
    Error,
    ChatDeleteConversationVariables
  >,
  'mutationFn'
>;

export function useChatDeleteConversationMutation(
  options: MutationOpts = {}
): UseMutationResult<
  ChatDeleteConversationResponse,
  Error,
  ChatDeleteConversationVariables
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: variables =>
      secureInvoke<ChatDeleteConversationResponse>(
        TAURI_COMMANDS.CHAT_DELETE_CONVERSATION,
        { ...variables }
      ),
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.chat.conversation(variables.conversationId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.chat.all });
      options.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
