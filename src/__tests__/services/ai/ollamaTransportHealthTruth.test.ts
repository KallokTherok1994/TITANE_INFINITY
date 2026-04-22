import { beforeEach, describe, expect, it, vi } from 'vitest';

const aiCheckOllamaStatusMock = vi.fn();

vi.mock('@/lib/tauriClient', () => ({
  tauriClient: {
    aiCheckOllamaStatus: aiCheckOllamaStatusMock,
  },
}));

describe('ollamaTransport health truth', () => {
  beforeEach(() => {
    vi.resetModules();
    aiCheckOllamaStatusMock.mockReset();
  });

  it('returns backend-reported model inventory instead of a static local placeholder', async () => {
    aiCheckOllamaStatusMock.mockResolvedValueOnce({
      ok: true,
      content: {
        available: true,
        url: 'https://ollama.example.trycloudflare.com',
        model: 'llama3.1:latest',
        models: ['llama3.1:latest', 'llama3.2:latest'],
        health: 'healthy',
      },
    });

    const { ollamaCheckHealth } =
      await import('@/services/ai/transports/ollamaTransport');
    const result = await ollamaCheckHealth();

    expect(aiCheckOllamaStatusMock).toHaveBeenCalledTimes(1);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.content.models).toEqual([
        { name: 'llama3.1:latest', modified_at: '', size: 0 },
        { name: 'llama3.2:latest', modified_at: '', size: 0 },
      ]);
    }
  });

  it('propagates backend offline truth instead of reporting a fake healthy placeholder', async () => {
    aiCheckOllamaStatusMock.mockResolvedValueOnce({
      ok: true,
      content: {
        available: false,
        url: 'https://ollama.example.trycloudflare.com',
        model: 'llama3.1:latest',
        models: ['llama3.1:latest'],
        health: 'offline',
      },
    });

    const { ollamaCheckHealth } =
      await import('@/services/ai/transports/ollamaTransport');
    const result = await ollamaCheckHealth();

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain('https://ollama.example.trycloudflare.com');
      expect(result.error.message).toContain('offline');
    }
  });
});
