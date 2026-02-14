import { describe, expect, it, vi, beforeEach } from 'vitest';

const invokeMock = vi.fn();

vi.mock('@tauri-apps/api/core', () => ({
  invoke: invokeMock,
}));

vi.mock('@/monitoring', () => ({
  default: {
    trackRequest: vi.fn(),
    addBreadcrumb: vi.fn(),
    trackError: vi.fn(),
  },
}));

describe('secureInvoke AbortError normalization', () => {
  beforeEach(() => {
    invokeMock.mockReset();
  });

  it('normalizes AbortError for ollama commands', async () => {
    const abortError = new Error('Fetch is aborted');
    abortError.name = 'AbortError';
    invokeMock.mockRejectedValueOnce(abortError);

    const { secureInvoke } = await import('@/lib/security');

    await expect(secureInvoke('ollama_query', { prompt: 'ping' })).rejects.toMatchObject({
      name: 'OLLAMA_ABORTED',
      message: 'Invoke aborted',
    });
  });
});
