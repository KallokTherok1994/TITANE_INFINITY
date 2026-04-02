import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/security', () => {
  return {
    secureInvoke: vi.fn(),
  };
});

import { secureInvoke } from '@/lib/security';
import {
  getStaticPromptContext,
  processMessage,
  resetStaticPromptContextCache,
} from '@/services/conversationEngine';

describe('conversationEngine.processMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetStaticPromptContextCache();
    localStorage.clear();
  });

  it('normalizes missing metadata with safe defaults', async () => {
    vi.mocked(secureInvoke)
      .mockResolvedValueOnce('c1') // createNewConversation
      .mockResolvedValueOnce(null) // persistentMemoryGetContext
      .mockResolvedValueOnce({
        content: 'Hello',
        conversationId: 'c1',
        messageId: 'm1',
        metadata: undefined,
      }); // conversationGenerate

    const response = await processMessage('Hi');

    expect(response.metadata).toBeDefined();
    expect(response.metadata.provider_used).toBe('fallback');
    expect(response.metadata.latency_ms).toBe(0);
    expect(response.metadata.tokens_used).toBe(0);
    expect(response.metadata.memory_effect).toBe('New');
    expect(Array.isArray(response.metadata.links_to_contexts)).toBe(true);
  });

  it('preserves provided metadata values when valid', async () => {
    vi.mocked(secureInvoke)
      .mockResolvedValueOnce('c2') // createNewConversation
      .mockResolvedValueOnce(null) // persistentMemoryGetContext
      .mockResolvedValueOnce({
        content: 'Ok',
        conversationId: 'c2',
        messageId: 'm2',
        metadata: {
          timestamp: 123,
          provider_used: 'local',
          latency_ms: 42,
          tokens_used: 7,
          memory_effect: 'Recall',
          links_to_contexts: ['a', 1, null, 'b'],
        },
      });

    const response = await processMessage('Hi');

    expect(response.metadata.timestamp).toBe(123);
    expect(response.metadata.provider_used).toBe('local');
    expect(response.metadata.latency_ms).toBe(42);
    expect(response.metadata.tokens_used).toBe(7);
    expect(response.metadata.memory_effect).toBe('Recall');
    expect(response.metadata.links_to_contexts).toEqual(['a', 'b']);
  });

  it('wraps conversation_generate payload under args', async () => {
    vi.mocked(secureInvoke)
      .mockResolvedValueOnce(null) // persistentMemoryGetContext
      .mockResolvedValueOnce({
        content: 'Ok',
        conversationId: 'c3',
        messageId: 'm3',
        metadata: {},
      }); // conversationGenerate

    await processMessage('Hi', { conversationId: 'c3' });

    const generateCall = vi
      .mocked(secureInvoke)
      .mock.calls.find(([command]) => command === 'conversation_generate');

    expect(generateCall).toBeDefined();
    expect(generateCall?.[1]).toEqual(
      expect.objectContaining({
        args: expect.objectContaining({
          message: 'Hi',
          conversationId: 'c3',
        }),
      })
    );
  });

  it('forwards the selected provider to conversation_generate', async () => {
    vi.mocked(secureInvoke)
      .mockResolvedValueOnce(null) // persistentMemoryGetContext
      .mockResolvedValueOnce({
        content: 'Ok',
        conversationId: 'c4',
        messageId: 'm4',
        metadata: {},
      }); // conversationGenerate

    await processMessage('Hi', {
      conversationId: 'c4',
      providerPreference: 'ollama',
    });

    const generateCall = vi
      .mocked(secureInvoke)
      .mock.calls.find(([command]) => command === 'conversation_generate');

    expect(generateCall?.[1]).toEqual(
      expect.objectContaining({
        args: expect.objectContaining({
          provider: 'ollama',
        }),
      })
    );
  });

  it('skips frontend persistent memory prefetch for explicit memory queries', async () => {
    vi.mocked(secureInvoke).mockResolvedValueOnce({
      content: 'OK',
      conversationId: 'c5',
      messageId: 'm5',
      metadata: {},
    });

    await processMessage('Memorise sans developper: code=ORION-482-LICHEN.', {
      conversationId: 'c5',
      providerPreference: 'ollama',
    });

    expect(
      vi
        .mocked(secureInvoke)
        .mock.calls.some(([command]) => command === 'persistent_memory_get_context')
    ).toBe(false);

    const generateCall = vi
      .mocked(secureInvoke)
      .mock.calls.find(([command]) => command === 'conversation_generate');

    expect(generateCall?.[1]).toEqual(
      expect.objectContaining({
        args: expect.objectContaining({
          conversationId: 'c5',
          provider: 'ollama',
        }),
      })
    );
  });

  it('treats personal fact recall prompts as explicit memory queries', async () => {
    vi.mocked(secureInvoke).mockResolvedValueOnce({
      content: 'INCONNU',
      conversationId: 'c6',
      messageId: 'm6',
      metadata: {},
    });

    await processMessage(
      "Je ne t'ai jamais donné mon code fantôme. Quel est mon code fantôme ? Si tu ne sais pas, réponds INCONNU.",
      {
        conversationId: 'c6',
        providerPreference: 'ollama',
      }
    );

    expect(
      vi
        .mocked(secureInvoke)
        .mock.calls.some(([command]) => command === 'persistent_memory_get_context')
    ).toBe(false);

    const generateCall = vi
      .mocked(secureInvoke)
      .mock.calls.find(([command]) => command === 'conversation_generate');

    expect(generateCall?.[1]).toEqual(
      expect.objectContaining({
        args: expect.objectContaining({
          conversationId: 'c6',
          provider: 'ollama',
          message:
            "Je ne t'ai jamais donné mon code fantôme. Quel est mon code fantôme ? Si tu ne sais pas, réponds INCONNU.",
        }),
      })
    );
  });

  it('reuses static prompt fragments for near-identical calls', async () => {
    localStorage.setItem(
      'titane_persona_profile',
      JSON.stringify({ tone: 'balanced', verbosity: 'balanced' })
    );
    localStorage.setItem(
      'titane_cognitive_state',
      JSON.stringify({ flowActive: true, energy: 88, mode: 'focus' })
    );

    const first = getStaticPromptContext('default', 1_000);
    const second = getStaticPromptContext('default', 1_500);
    const third = getStaticPromptContext('default', 4_000);

    expect(first).toBe(second);
    expect(third).not.toBe(second);
  });
});
