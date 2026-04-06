import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  loadContext: vi.fn(),
  ollamaCheckHealth: vi.fn(),
  ollamaGenerate: vi.fn(),
  secureInvoke: vi.fn(),
}));

vi.mock('../../memoryIntegration', () => ({
  memoryIntegration: {
    loadContext: mocks.loadContext,
  },
}));

vi.mock('../../retryStrategy', () => ({
  withRetry: async (fn: () => Promise<unknown>) => await fn(),
  getRetryConfig: () => ({ retries: 1 }),
}));

vi.mock('../../apiCache', () => ({
  withCache: async (
    _provider: string,
    _message: string,
    _history: unknown,
    fn: () => Promise<unknown>
  ) => await fn(),
  CACHE_TTL: 60_000,
}));

vi.mock('../../transports/ollamaTransport', () => ({
  getTransportMode: () => 'IPC',
  ollamaCheckHealth: mocks.ollamaCheckHealth,
  ollamaGenerate: mocks.ollamaGenerate,
}));

vi.mock('@/lib/security', () => ({
  secureInvoke: mocks.secureInvoke,
}));

describe('Provider memory reuse truth', () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.loadContext.mockReset();
    mocks.ollamaCheckHealth.mockReset();
    mocks.ollamaGenerate.mockReset();
    mocks.secureInvoke.mockReset();

    mocks.ollamaCheckHealth.mockResolvedValue({
      ok: true,
      provider: 'ollama',
      content: { models: [{ name: 'gemma2:2b', modified_at: '', size: 0 }] },
    });

    mocks.ollamaGenerate.mockResolvedValue({
      ok: true,
      provider: 'ollama',
      content: {
        content: 'Reponse Ollama',
        model: 'gemma2:2b',
        latency_ms: 12,
      },
    });

    mocks.secureInvoke.mockImplementation(async (command: string) => {
      if (command === 'chat_generate_gemini') {
        return {
          ok: true,
          data: {
            content: 'Reponse Gemini',
            model: 'gemini-2.0-flash',
            tokens: 42,
            finish_reason: 'stop',
          },
          error: null,
        };
      }

      if (command === 'get_gemini_key_status') {
        return {
          ok: true,
          data: { configured: true },
        };
      }

      return {
        ok: true,
        data: null,
        error: null,
      };
    });
  });

  it('ollama reuses injected system history instead of reloading memory context', async () => {
    const { ollamaProvider } = await import('../ollama');

    const response = await ollamaProvider.generate('Question actuelle', [
      {
        role: 'system',
        content: 'Systeme enrichi deja injecte',
        timestamp: Date.now(),
      },
      {
        role: 'user',
        content: 'Historique utilisateur',
        timestamp: Date.now(),
      },
    ]);

    expect(mocks.loadContext).not.toHaveBeenCalled();
    expect(mocks.ollamaGenerate).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.stringContaining('Systeme enrichi deja injecte'),
        prompt: expect.not.stringContaining('user: Systeme enrichi deja injecte'),
      })
    );
    expect(response.metadata).toMatchObject({
      memoryContextInjected: true,
      memoryContextSource: 'system-history',
    });
  });

  it('gemini reuses injected system history instead of reloading memory context', async () => {
    const { geminiProvider } = await import('../gemini');

    const response = await geminiProvider.generate('Question actuelle', [
      {
        role: 'system',
        content: 'Systeme enrichi deja injecte',
        timestamp: Date.now(),
      },
      {
        role: 'user',
        content: 'Historique utilisateur',
        timestamp: Date.now(),
      },
    ]);

    expect(mocks.loadContext).not.toHaveBeenCalled();
    const generationCall = mocks.secureInvoke.mock.calls.find(
      call => call[0] === 'chat_generate_gemini'
    );
    expect(generationCall?.[1]).toMatchObject({
      request: {
        message: 'Question actuelle',
        history: expect.arrayContaining([
          expect.objectContaining({
            role: 'system',
            content: 'Systeme enrichi deja injecte',
          }),
        ]),
      },
    });
    expect(response.metadata).toMatchObject({
      memoryContextInjected: true,
      memoryContextSource: 'system-history',
    });
  });

  it('titane-local reuses injected memory block instead of reloading memory context', async () => {
    const { titaneLocalProvider } = await import('../titaneLocal');

    const response = await titaneLocalProvider.generate('Donne-moi un statut', [
      {
        role: 'system',
        content:
          'Systeme enrichi deja injecte\n\n📋 **Contexte Mémoire LTM** :\n• Projets actifs: Atlas\n• Décisions récentes: Stabiliser le routeur',
        timestamp: Date.now(),
      },
      {
        role: 'user',
        content: 'Historique utilisateur',
        timestamp: Date.now(),
      },
    ]);

    expect(mocks.loadContext).not.toHaveBeenCalled();
    expect(response.content).toContain('Projets actifs: Atlas');
    expect(response.content).toContain('Décisions récentes: Stabiliser le routeur');
    expect(response.metadata).toMatchObject({
      memory_context_source: 'system-history',
    });
  });
});
