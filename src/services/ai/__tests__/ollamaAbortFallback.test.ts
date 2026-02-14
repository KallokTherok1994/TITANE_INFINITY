import { describe, expect, it, vi } from 'vitest';

const abortError = new Error('Invoke aborted');
abortError.name = 'OLLAMA_ABORTED';

vi.mock('../providers/ollama', () => ({
  ollamaProvider: {
    name: 'ollama',
    isAvailable: vi.fn().mockResolvedValue(true),
    generate: vi.fn().mockRejectedValue(abortError),
    testConnection: vi.fn().mockResolvedValue({ success: false }),
    getStatus: vi.fn().mockResolvedValue({ status: 'offline' }),
    listModels: vi.fn().mockResolvedValue([]),
    getDefaultModel: vi.fn().mockReturnValue('local'),
  },
}));

vi.mock('../providers/tauriChat', () => ({
  tauriChatProvider: {
    name: 'tauri-backend',
    isAvailable: vi.fn().mockResolvedValue(false),
    generate: vi.fn(),
    testConnection: vi.fn().mockResolvedValue({ success: false }),
    getStatus: vi.fn().mockResolvedValue({ status: 'offline' }),
    listModels: vi.fn().mockResolvedValue([]),
    getDefaultModel: vi.fn().mockReturnValue('tauri'),
  },
}));

vi.mock('../providers/titaneLocal', () => ({
  titaneLocalProvider: {
    name: 'titane-local',
    isAvailable: vi.fn().mockResolvedValue(true),
    generate: vi.fn().mockResolvedValue({
      content: 'local fallback',
      provider: 'titane-local',
      timestamp: Date.now(),
      model: 'local',
    }),
    testConnection: vi.fn().mockResolvedValue({ success: true }),
    getStatus: vi.fn().mockResolvedValue({ status: 'healthy' }),
    listModels: vi.fn().mockResolvedValue([]),
    getDefaultModel: vi.fn().mockReturnValue('local'),
  },
}));

describe('aiOrchestrator fallback on ollama abort', () => {
  it('falls back to titane-local when ollama aborts', async () => {
    const { aiOrchestrator } = await import('../orchestrator');

    const response = await aiOrchestrator.generate('hello', [], {
      preferredProvider: 'local',
    });

    expect(response.provider).toBe('titane-local');
    expect(response.content.length).toBeGreaterThan(0);
  });
});
