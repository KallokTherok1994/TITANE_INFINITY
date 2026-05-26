/**
 * TITANE_INFINITY v34.4.0 — Chat query/mutation hooks contract tests
 *
 * Strategy mirrors the v34.2.0 pilots: mock `secureInvoke`, assert each
 * hook calls the documented IPC command with the canonical payload shape.
 * Mutation hooks additionally assert cache invalidation via a spy on
 * `invalidateQueries`.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { renderHook } from '../../../test-utils/renderHook';

vi.mock('../../../lib/security', () => ({
  secureInvoke: vi.fn(async (_cmd: string, _payload?: unknown) => ({
    ok: true,
    value: _cmd,
  })),
}));

import { secureInvoke } from '../../../lib/security';
import { useChatProvidersHealthQuery } from '../../../hooks/queries/useChatProvidersHealthQuery';
import { useChatConversationQuery } from '../../../hooks/queries/useChatConversationQuery';
import { useChatSendMutation } from '../../../hooks/queries/useChatSendMutation';
import { useChatDeleteConversationMutation } from '../../../hooks/queries/useChatDeleteConversationMutation';
import { queryKeys } from '../../../lib/queryKeys';

const mockedSecureInvoke = vi.mocked(secureInvoke);

describe('Chat query/mutation hooks (v34.4.0)', () => {
  beforeEach(() => {
    mockedSecureInvoke.mockClear();
  });

  it('useChatProvidersHealthQuery calls chat_check_providers with empty payload', async () => {
    const { result } = renderHook(() => useChatProvidersHealthQuery());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedSecureInvoke).toHaveBeenCalledWith('chat_check_providers', {});
  });

  it('useChatConversationQuery is disabled when conversationId is empty', async () => {
    const { result } = renderHook(() => useChatConversationQuery(null));
    expect(result.current.isFetching).toBe(false);
    expect(mockedSecureInvoke).not.toHaveBeenCalled();
  });

  it('useChatConversationQuery calls chat_get_conversation with id payload', async () => {
    const { result } = renderHook(() => useChatConversationQuery('conv-1'));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedSecureInvoke).toHaveBeenCalledWith('chat_get_conversation', {
      conversationId: 'conv-1',
    });
  });

  it('useChatSendMutation invokes conversation_generate and invalidates conversation cache', async () => {
    const invalidateSpy = vi.spyOn(QueryClient.prototype, 'invalidateQueries');
    const { result } = renderHook(() => useChatSendMutation());
    await result.current.mutateAsync({ conversationId: 'conv-9', message: 'hello' });
    expect(mockedSecureInvoke).toHaveBeenCalledWith('conversation_generate', {
      conversationId: 'conv-9',
      message: 'hello',
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.chat.conversation('conv-9'),
    });
    invalidateSpy.mockRestore();
  });

  it('useChatDeleteConversationMutation invokes chat_delete_conversation and invalidates root + conversation', async () => {
    const invalidateSpy = vi.spyOn(QueryClient.prototype, 'invalidateQueries');
    const { result } = renderHook(() => useChatDeleteConversationMutation());
    await result.current.mutateAsync({ conversationId: 'conv-9' });
    expect(mockedSecureInvoke).toHaveBeenCalledWith('chat_delete_conversation', {
      conversationId: 'conv-9',
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.chat.conversation('conv-9'),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.chat.all });
    invalidateSpy.mockRestore();
  });
});
