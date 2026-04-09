import { act, renderHook, waitFor } from '@/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const saveResolvers: Array<() => void> = [];
const saveMessageMock = vi.fn(() => {
  return new Promise<void>(resolve => {
    saveResolvers.push(resolve);
  });
});
const clearModeMock = vi.fn();
const replaceMessagesMock = vi.fn();

const processMessageMock = vi.fn(async (content: string) => ({
  assistant_message: `ok:${content}`,
  conversation_id: 'conv-1',
  message_id: 'assistant-1',
  detected_intention: 'Question' as const,
  detected_emotion: { valence: 0, intensity: 0, energy: 0 },
  cognitive_tags: [],
  cognitive_summary: 'ok',
  metadata: {
    timestamp: Date.now(),
    provider_used: 'ollama',
    latency_ms: 12,
    tokens_used: 1,
    memory_effect: 'New' as const,
    links_to_contexts: [],
  },
  meta: {
    provider_used: 'ollama',
    provider_class: 'local' as const,
    mode: 'LOCAL' as const,
    reason_code: 'OK' as const,
    latency_ms_total: 12,
    timeout_ms: 30000,
    retries: 0,
    attempts: [],
    network_used: false,
    cache_hit: false,
    policy: 'default',
  },
}));

vi.mock('@/services/conversationEngine', () => ({
  processMessage: processMessageMock,
  healthCheck: vi.fn(async () => ({
    status: 'Healthy',
    anomalies_detected: [],
    repairs_applied: [],
    coherence_score: 1,
  })),
}));

vi.mock('@/hooks/useChatMemory', () => ({
  useChatMemory: vi.fn(() => ({
    saveMessage: saveMessageMock,
    clearMode: clearModeMock,
    replaceMessages: replaceMessagesMock,
  })),
}));

vi.mock('@/services/chat/moduleRouteContext', () => ({
  readActiveModuleContext: vi.fn(() => null),
}));

vi.mock('@/services/chat/chatMemorySingleDoor', () => ({
  buildChatContextEnvelope: vi.fn(),
}));

vi.mock('@/services/chatMemoryCompactor', () => ({
  chatMemoryCompactor: {
    flushPendingSaves: vi.fn(),
  },
}));

describe('useConversationEngine fallback meta truth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    saveResolvers.splice(0, saveResolvers.length);
    clearModeMock.mockReset();
    replaceMessagesMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('classifies network failures as offline network errors', async () => {
    const { buildConversationFallbackMeta } =
      await import('@/hooks/useConversationEngine');
    const meta = buildConversationFallbackMeta('Network request failed', 'gemini');

    expect(meta.reason_code).toBe('NETWORK_ERROR');
    expect(meta.mode).toBe('OFFLINE');
    expect(meta.provider_used).toBe('gemini');
    expect(meta.policy).toBe('conversation_hook_fallback');
  });

  it('classifies provider outages without inventing success', async () => {
    const { buildConversationFallbackMeta } =
      await import('@/hooks/useConversationEngine');
    const meta = buildConversationFallbackMeta(
      'No active AI provider could be reached for the request',
      'ollama'
    );

    expect(meta.reason_code).toBe('PROVIDER_UNAVAILABLE');
    expect(meta.mode).toBe('ERROR');
    expect(meta.provider_used).toBe('ollama');
    expect(meta.provider_class).toBe('local');
  });

  it('surfaces a governed provider recovery message when the backend reports provider unavailability', async () => {
    processMessageMock.mockResolvedValueOnce({
      assistant_message: 'backend provider unavailable',
      conversation_id: 'conv-provider-recovery',
      message_id: 'assistant-provider-recovery',
      detected_intention: 'Meta' as const,
      detected_emotion: { valence: 0, intensity: 0.2, energy: 0.1 },
      cognitive_tags: ['provider-recovery'],
      cognitive_summary: 'provider recovery path',
      metadata: {
        timestamp: Date.now(),
        provider_used: 'local-unavailable',
        latency_ms: 18,
        tokens_used: 0,
        memory_effect: 'New' as const,
        links_to_contexts: [],
      },
      meta: {
        provider_used: 'local-unavailable',
        provider_class: 'local' as const,
        mode: 'ERROR' as const,
        reason_code: 'PROVIDER_UNAVAILABLE' as const,
        latency_ms_total: 18,
        timeout_ms: 30000,
        retries: 0,
        attempts: [],
        network_used: false,
        cache_hit: false,
        policy: 'provider-recovery-test',
      },
    });

    const { useConversationEngine } = await import('@/hooks/useConversationEngine');
    const { result } = renderHook(() =>
      useConversationEngine({
        autoHealthCheck: false,
        providerPreference: 'ollama',
      })
    );

    let response: Awaited<ReturnType<typeof result.current.sendMessage>> | null = null;
    await act(async () => {
      response = await result.current.sendMessage('teste le provider local');
    });

    expect(response?.meta?.reason_code).toBe('PROVIDER_UNAVAILABLE');
    expect(response?.meta?.provider_used).toBe('local-unavailable');

    await waitFor(() => {
      expect(result.current.messages.at(-1)?.content).toContain(
        'mode récupération provider'
      );
    });

    expect(result.current.messages.at(-1)?.metadata?.providerMeta).toEqual(
      expect.objectContaining({
        provider_used: 'local-unavailable',
        reason_code: 'PROVIDER_UNAVAILABLE',
        mode: 'ERROR',
      })
    );
  });

  it('avoids overlapping health checks while a previous probe is still pending', async () => {
    vi.useFakeTimers();

    let releaseHealthCheck:
      | ((report: {
          status: string;
          anomalies_detected: string[];
          repairs_applied: string[];
          coherence_score: number;
        }) => void)
      | null = null;

    const { healthCheck } = await import('@/services/conversationEngine');
    vi.mocked(healthCheck).mockImplementationOnce(
      () =>
        new Promise(resolve => {
          releaseHealthCheck = resolve;
        })
    );

    const { useConversationEngine } = await import('@/hooks/useConversationEngine');
    renderHook(() => useConversationEngine({ autoHealthCheck: true }));

    await act(async () => {
      vi.advanceTimersByTime(30000);
      await Promise.resolve();
    });

    expect(vi.mocked(healthCheck)).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(30000);
      await Promise.resolve();
    });

    expect(vi.mocked(healthCheck)).toHaveBeenCalledTimes(1);

    await act(async () => {
      releaseHealthCheck?.({
        status: 'Healthy',
        anomalies_detected: [],
        repairs_applied: [],
        coherence_score: 1,
      });
      await Promise.resolve();
    });
  });

  it('does not wait for slow persistence before calling processMessage', async () => {
    const { useConversationEngine } = await import('@/hooks/useConversationEngine');
    const { result } = renderHook(() =>
      useConversationEngine({ autoHealthCheck: false })
    );

    let sendPromise: Promise<unknown>;
    await act(async () => {
      sendPromise = result.current.sendMessage('ping');
      await Promise.resolve();
    });

    expect(processMessageMock).toHaveBeenCalledTimes(1);
    expect(saveResolvers.length).toBeGreaterThan(0);
    expect(processMessageMock.mock.invocationCallOrder[0]).toBeGreaterThan(
      saveMessageMock.mock.invocationCallOrder[0] ?? 0
    );

    while (saveResolvers.length > 0) {
      const resolve = saveResolvers.shift();
      resolve?.();
    }

    await waitFor(() => {
      expect(result.current.messages.some(message => message.role === 'assistant')).toBe(
        true
      );
    });

    await act(async () => {
      await sendPromise!;
    });
  });

  it('flushes chat persistence after saving the assistant reply', async () => {
    const { chatMemoryCompactor } = await import('@/services/chatMemoryCompactor');
    const { useConversationEngine } = await import('@/hooks/useConversationEngine');
    const { result } = renderHook(() =>
      useConversationEngine({ autoHealthCheck: false })
    );

    await act(async () => {
      await result.current.sendMessage('memo-check');
    });

    while (saveResolvers.length > 0) {
      const resolve = saveResolvers.shift();
      resolve?.();
    }

    await waitFor(() => {
      expect(saveMessageMock).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'assistant',
          content: 'ok:memo-check',
        })
      );
    });

    await waitFor(() => {
      expect(chatMemoryCompactor.flushPendingSaves).toHaveBeenCalled();
    });
  });

  it('clears persisted mode history when the chat is reset', async () => {
    const { useConversationEngine } = await import('@/hooks/useConversationEngine');
    const { result } = renderHook(() =>
      useConversationEngine({ autoHealthCheck: false })
    );

    act(() => {
      result.current.clearMessages();
    });

    expect(clearModeMock).toHaveBeenCalledTimes(1);
  });

  it('persists message deletions so removed entries do not reappear after reload', async () => {
    const { useConversationEngine } = await import('@/hooks/useConversationEngine');
    const { result } = renderHook(() =>
      useConversationEngine({ autoHealthCheck: false })
    );

    await act(async () => {
      await result.current.appendLocalExchange('Mémoire à enlever', 'Réponse à enlever');
    });

    const firstMessageId = result.current.messages[0]?.id;
    expect(firstMessageId).toBeTruthy();

    act(() => {
      result.current.deleteMessage(firstMessageId!);
    });

    expect(replaceMessagesMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          role: 'assistant',
          content: 'Réponse à enlever',
        }),
      ])
    );
  });
});
