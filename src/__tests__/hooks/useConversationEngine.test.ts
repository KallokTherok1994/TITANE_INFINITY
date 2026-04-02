import { act, renderHook, waitFor } from '@/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const saveResolvers: Array<() => void> = [];
const saveMessageMock = vi.fn(() => {
  return new Promise<void>(resolve => {
    saveResolvers.push(resolve);
  });
});

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
});
