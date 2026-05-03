import { beforeEach, describe, expect, it, vi } from 'vitest';

const secureInvokeMock = vi.fn();

vi.mock('@/lib/security', () => ({
  secureInvoke: secureInvokeMock,
}));

vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn(),
}));

describe('chatEngine.commands request defaults cache', () => {
  beforeEach(() => {
    vi.resetModules();
    secureInvokeMock.mockReset();
  });

  it('clamps oversized chat payloads before Tauri dispatch', async () => {
    secureInvokeMock
      .mockResolvedValueOnce({
        ok: true,
        content: {
          temperature: 0.4,
          maxOutputTokens: 111,
          provider: 'ollama',
          enableStreaming: true,
        },
        error: null,
      })
      .mockResolvedValueOnce({
        conversation_id: 'conv-oversized',
        message_id: 'msg-oversized',
        provider: 'ollama',
        content: 'safe',
        token_count: 10,
        latency_ms: 1,
        timestamp: 1,
        stop_reason: 'complete',
        profile: 'balanced',
      });

    const module = await import('../../../services/tauri/chatEngine.commands');

    await module.generateResponse({
      userMessage: 'A'.repeat(13050),
      maxOutputTokens: 50000,
    });

    const generateCall = secureInvokeMock.mock.calls[1];
    expect(generateCall?.[0]).toBe('generate_response');
    expect(generateCall?.[1]?.payload?.user_message).toHaveLength(12000);
    expect(generateCall?.[1]?.payload?.max_output_tokens).toBe(32768);
  });

  it('invalidates cached request defaults after configuration changes', async () => {
    secureInvokeMock
      .mockResolvedValueOnce({
        ok: true,
        content: {
          temperature: 0.4,
          maxOutputTokens: 111,
          provider: 'ollama',
          enableStreaming: true,
        },
        error: null,
      })
      .mockResolvedValueOnce({
        conversation_id: 'conv-1',
        message_id: 'msg-1',
        provider: 'ollama',
        content: 'first',
        token_count: 10,
        latency_ms: 1,
        timestamp: 1,
        stop_reason: 'complete',
        profile: 'balanced',
      })
      .mockResolvedValueOnce({
        ok: true,
        content: {
          temperature: 0.9,
          maxOutputTokens: 222,
          provider: 'gemini',
          enableStreaming: true,
        },
        error: null,
      })
      .mockResolvedValueOnce({
        conversation_id: 'conv-2',
        message_id: 'msg-2',
        provider: 'gemini',
        content: 'second',
        token_count: 12,
        latency_ms: 1,
        timestamp: 2,
        stop_reason: 'complete',
        profile: 'balanced',
      });

    const module = await import('../../../services/tauri/chatEngine.commands');

    await module.generateResponse({ userMessage: 'Bonjour' });
    expect(secureInvokeMock).toHaveBeenNthCalledWith(2, 'generate_response', {
      payload: expect.objectContaining({
        temperature: 0.4,
        max_output_tokens: 111,
        provider: 'ollama',
      }),
    });

    module.invalidateRequestDefaultsCache();

    await module.generateResponse({ userMessage: 'Salut' });
    expect(secureInvokeMock).toHaveBeenNthCalledWith(4, 'generate_response', {
      payload: expect.objectContaining({
        temperature: 0.9,
        max_output_tokens: 222,
        provider: 'gemini',
      }),
    });
  });

  it('falls back to the stable runtime token budget when request defaults are unavailable', async () => {
    secureInvokeMock
      .mockRejectedValueOnce(new Error('request defaults unavailable'))
      .mockResolvedValueOnce({
        conversation_id: 'conv-fallback',
        message_id: 'msg-fallback',
        provider: 'auto',
        content: 'fallback',
        token_count: 15,
        latency_ms: 2,
        timestamp: 3,
        stop_reason: 'complete',
        profile: 'balanced',
      });

    const module = await import('../../../services/tauri/chatEngine.commands');

    await module.generateResponse({ userMessage: 'Déploie une réponse complète' });

    expect(secureInvokeMock).toHaveBeenNthCalledWith(2, 'generate_response', {
      payload: expect.objectContaining({
        max_output_tokens: 32768,
      }),
    });
  });

  it('normalizes the backend completion model when present', async () => {
    secureInvokeMock
      .mockResolvedValueOnce({
        ok: true,
        content: {
          temperature: 0.4,
          maxOutputTokens: 111,
          provider: 'ollama',
          enableStreaming: true,
        },
        error: null,
      })
      .mockResolvedValueOnce({
        conversation_id: 'conv-model',
        message_id: 'msg-model',
        provider: 'ollama',
        model: 'gemma2:2b',
        content: 'modele reel',
        token_count: 10,
        latency_ms: 1,
        timestamp: 4,
        stop_reason: 'complete',
        profile: 'balanced',
      });

    const module = await import('../../../services/tauri/chatEngine.commands');

    const result = await module.generateResponse({ userMessage: 'Quel modele ?' });

    expect(result.provider).toBe('ollama');
    expect(result.model).toBe('gemma2:2b');
  });
});
