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
});
