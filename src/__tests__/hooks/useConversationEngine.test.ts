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
const awardExperienceMock = vi.fn(async () => null);
const getExperienceStateMock = vi.fn(() => ({
  totalXp: 145,
  level: 1,
  domains: {
    chat: { xp: 120 },
    cognitive: { xp: 25 },
  },
}));

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
    model_requested: 'gemma2:2b',
    model_used: 'gemma2:2b',
    fallback_used: false,
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

vi.mock('@/services/experienceService', () => ({
  awardExperience: awardExperienceMock,
  getExperienceState: getExperienceStateMock,
}));

describe('useConversationEngine fallback meta truth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    saveResolvers.splice(0, saveResolvers.length);
    clearModeMock.mockReset();
    replaceMessagesMock.mockReset();
    awardExperienceMock.mockReset();
    awardExperienceMock.mockResolvedValue(null);
    getExperienceStateMock.mockReset();
    getExperienceStateMock.mockReturnValue({
      totalXp: 145,
      level: 1,
      domains: {
        chat: { xp: 120 },
        cognitive: { xp: 25 },
      },
    });
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

  it('classifies rate limit failures as a governed temporary block', async () => {
    const { buildConversationFallbackMeta } =
      await import('@/hooks/useConversationEngine');
    const meta = buildConversationFallbackMeta(
      'GitHub Copilot rate limit exceeded. Retry after 42 seconds (429)',
      'gemini'
    );

    expect(meta.reason_code).toBe('RATE_LIMIT');
    expect(meta.mode).toBe('OFFLINE');
    expect(meta.network_used).toBe(true);
    expect(meta.provider_used).toBe('gemini');
  });

  it('does not let late history hydration overwrite optimistic in-memory messages', async () => {
    const { mergeRestoredConversationMessages } =
      await import('@/hooks/useConversationEngine');

    expect(
      mergeRestoredConversationMessages(
        [
          {
            id: 'live-user-1',
            role: 'user',
            content: 'Android UI smoke message',
            timestamp: 1,
          },
        ],
        [
          {
            id: 'restored-1',
            role: 'assistant',
            content: 'historique ancien',
            timestamp: 0,
          },
        ]
      )
    ).toEqual([
      {
        id: 'live-user-1',
        role: 'user',
        content: 'Android UI smoke message',
        timestamp: 1,
      },
    ]);
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
    expect(result.current.messages.at(-1)?.metadata?.providerUsed).toBe(
      'local-unavailable'
    );
    expect(result.current.messages.at(-1)?.metadata?.requestedProvider).toBe('ollama');
  });

  it('preserves truthful degraded assistant content for fallback offline responses', async () => {
    processMessageMock.mockResolvedValueOnce({
      assistant_message: 'Réponse dégradée mais valide via mode offline gouverné.',
      conversation_id: 'conv-offline-truth',
      message_id: 'assistant-offline-truth',
      detected_intention: 'Meta' as const,
      detected_emotion: { valence: 0, intensity: 0.1, energy: 0.1 },
      cognitive_tags: ['offline-truth'],
      cognitive_summary: 'offline truth path',
      metadata: {
        timestamp: Date.now(),
        provider_used: 'ollama',
        latency_ms: 10,
        tokens_used: 0,
        memory_effect: 'New' as const,
        links_to_contexts: [],
      },
      meta: {
        provider_used: 'ollama',
        provider_class: 'local' as const,
        mode: 'OFFLINE' as const,
        reason_code: 'FALLBACK_OFFLINE' as const,
        latency_ms_total: 10,
        timeout_ms: 30000,
        retries: 0,
        attempts: [],
        network_used: false,
        cache_hit: false,
        policy: 'offline-truth-test',
      },
    });

    const { useConversationEngine } = await import('@/hooks/useConversationEngine');
    const { result } = renderHook(() =>
      useConversationEngine({
        autoHealthCheck: false,
        providerPreference: 'auto',
      })
    );

    await act(async () => {
      await result.current.sendMessage('donne la vérité offline');
    });

    await waitFor(() => {
      expect(result.current.messages.at(-1)?.content).toBe(
        'Réponse dégradée mais valide via mode offline gouverné.'
      );
    });

    expect(result.current.messages.at(-1)?.metadata?.providerMeta).toEqual(
      expect.objectContaining({
        reason_code: 'FALLBACK_OFFLINE',
        mode: 'OFFLINE',
      })
    );
  });

  it('persists canonical citations and the real provider on the assistant message metadata', async () => {
    processMessageMock.mockResolvedValueOnce({
      assistant_message: 'Réponse avec sources',
      conversation_id: 'conv-citations',
      message_id: 'assistant-citations',
      detected_intention: 'Question' as const,
      detected_emotion: { valence: 0, intensity: 0.1, energy: 0.1 },
      cognitive_tags: ['inline-citations'],
      cognitive_summary: 'citation path',
      metadata: {
        timestamp: Date.now(),
        provider_used: 'ollama-runtime',
        latency_ms: 22,
        tokens_used: 4,
        memory_effect: 'New' as const,
        links_to_contexts: [],
        citations: [
          {
            url: 'https://example.com/source-a',
            title: 'Source A',
            excerpt: 'Extrait A',
            accessed_at: '2026-04-18T10:00:00Z',
            locator_text: 'p=2, c≈40',
          },
        ],
      },
      meta: {
        provider_used: 'ollama-runtime',
        provider_class: 'local' as const,
        mode: 'LOCAL' as const,
        reason_code: 'OK' as const,
        latency_ms_total: 22,
        timeout_ms: 30000,
        retries: 0,
        attempts: [],
        network_used: false,
        cache_hit: false,
        policy: 'citation-test',
      },
    });

    const { useConversationEngine } = await import('@/hooks/useConversationEngine');
    const { result } = renderHook(() =>
      useConversationEngine({
        autoHealthCheck: false,
        providerPreference: 'ollama',
      })
    );

    await act(async () => {
      await result.current.sendMessage('montre les sources');
    });

    const assistantMessage = result.current.messages.at(-1);
    expect(assistantMessage?.metadata?.providerUsed).toBe('ollama-runtime');
    expect(assistantMessage?.metadata?.citations).toEqual([
      {
        url: 'https://example.com/source-a',
        title: 'Source A',
        excerpt: 'Extrait A',
        accessed_at: '2026-04-18T10:00:00Z',
        locator_text: 'p=2, c≈40',
      },
    ]);
  });

  it('persists model requested/used truth on the assistant message metadata', async () => {
    processMessageMock.mockResolvedValueOnce({
      assistant_message: 'Réponse avec vérité modèle',
      conversation_id: 'conv-model-truth',
      message_id: 'assistant-model-truth',
      detected_intention: 'Question' as const,
      detected_emotion: { valence: 0, intensity: 0.1, energy: 0.1 },
      cognitive_tags: ['model-truth'],
      cognitive_summary: 'model truth path',
      metadata: {
        timestamp: Date.now(),
        provider_used: 'ollama-runtime',
        model_requested: 'gemma2:2b',
        model_used: 'llama3.2:latest',
        fallback_used: true,
        latency_ms: 22,
        tokens_used: 4,
        memory_effect: 'New' as const,
        links_to_contexts: [],
      },
      meta: {
        provider_used: 'ollama-runtime',
        provider_class: 'local' as const,
        mode: 'LOCAL' as const,
        reason_code: 'OK' as const,
        latency_ms_total: 22,
        timeout_ms: 30000,
        retries: 0,
        attempts: [],
        network_used: false,
        cache_hit: false,
        policy: 'model-truth-test',
      },
    });

    const { useConversationEngine } = await import('@/hooks/useConversationEngine');
    const { result } = renderHook(() =>
      useConversationEngine({
        autoHealthCheck: false,
        providerPreference: 'ollama',
      })
    );

    await act(async () => {
      await result.current.sendMessage('montre le modèle utilisé');
    });

    const assistantMessage = result.current.messages.at(-1);
    expect(assistantMessage?.metadata?.modelRequested).toBe('gemma2:2b');
    expect(assistantMessage?.metadata?.modelUsed).toBe('llama3.2:latest');
    expect(assistantMessage?.metadata?.fallbackUsed).toBe(true);
  });

  it('preserves the full assistant payload including its terminal marker in hook state', async () => {
    const longAssistantPayload = [
      '# Audit de réponse',
      '',
      'Voici une réponse longue et structurée qui ne doit perdre aucun suffixe lors du transit frontend.',
      '',
      '- Conserver l introduction',
      '- Conserver les blocs markdown',
      '',
      '> Citation de contrôle',
      '',
      '## Bloc terminal',
      'OMEGA-HOOK-TERMINAL-MARKER',
    ].join('\n');

    processMessageMock.mockResolvedValueOnce({
      assistant_message: longAssistantPayload,
      conversation_id: 'conv-long-answer',
      message_id: 'assistant-long-answer',
      detected_intention: 'Question' as const,
      detected_emotion: { valence: 0.1, intensity: 0.2, energy: 0.1 },
      cognitive_tags: ['long-answer'],
      cognitive_summary: 'long answer integrity path',
      metadata: {
        timestamp: Date.now(),
        provider_used: 'ollama-runtime',
        latency_ms: 37,
        tokens_used: 128,
        memory_effect: 'New' as const,
        links_to_contexts: ['omega:conversation'],
      },
      meta: {
        provider_used: 'ollama-runtime',
        provider_class: 'local' as const,
        mode: 'LOCAL' as const,
        reason_code: 'OK' as const,
        latency_ms_total: 37,
        timeout_ms: 30000,
        retries: 0,
        attempts: [],
        network_used: false,
        cache_hit: false,
        policy: 'long-answer-integrity',
      },
    });

    const { useConversationEngine } = await import('@/hooks/useConversationEngine');
    const { result } = renderHook(() =>
      useConversationEngine({
        autoHealthCheck: false,
        providerPreference: 'ollama',
      })
    );

    await act(async () => {
      await result.current.sendMessage('valide la réponse complète');
    });

    const assistantMessage = result.current.messages.at(-1);
    expect(assistantMessage?.content).toBe(longAssistantPayload);
    expect(assistantMessage?.content).toContain('OMEGA-HOOK-TERMINAL-MARKER');
    expect(assistantMessage?.content.length).toBe(longAssistantPayload.length);
  });

  it('captures journal runtime metadata for the active conversation surface', async () => {
    const { useConversationEngine } = await import('@/hooks/useConversationEngine');
    const { result } = renderHook(() =>
      useConversationEngine({
        autoHealthCheck: false,
        providerPreference: 'ollama',
      })
    );

    await act(async () => {
      await result.current.sendMessage('corrige le journal omega');
    });

    while (saveResolvers.length > 0) {
      const resolve = saveResolvers.shift();
      resolve?.();
    }

    await waitFor(() => {
      expect(result.current.messages.at(-1)?.metadata?.saveStatus).toBe('saved');
    });

    const assistantMessage = result.current.messages.at(-1);
    expect(assistantMessage?.metadata?.latencyMs).toBe(12);
    expect(assistantMessage?.metadata?.tokensUsed).toBe(1);
    expect(assistantMessage?.metadata?.memoryEffect).toBe('New');
    expect(assistantMessage?.metadata?.webSearchStatus).toBe('unused');
    expect(assistantMessage?.metadata?.xpTrace).toEqual({
      chatXP: 120,
      cognitiveXP: 25,
      totalXP: 145,
      level: 1,
      lastGainDomain: 'chat',
      lastGainAmount: expect.any(Number),
      lastGainTimestamp: expect.any(Number),
    });
    expect(assistantMessage?.metadata?.qualityScore).toBeGreaterThan(0);
    expect(assistantMessage?.metadata?.actionsPerformed).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Pipeline OMEGA exécuté',
          status: 'done',
        }),
      ])
    );
    expect(awardExperienceMock).toHaveBeenCalled();
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
