import { beforeEach, describe, expect, it, vi } from 'vitest';

const invokeMock = vi.fn();

vi.mock('@tauri-apps/api/core', () => ({
  invoke: invokeMock,
}));

describe('ollamaTransport abort mapping', () => {
  beforeEach(() => {
    invokeMock.mockReset();
  });

  it('maps AbortError to OLLAMA_ABORTED in IPC mode', async () => {
    vi.resetModules();

    const abortError = new Error('Fetch is aborted');
    abortError.name = 'AbortError';
    invokeMock.mockRejectedValueOnce(abortError);

    if (typeof window !== 'undefined') {
      (window as unknown as { __TAURI__?: unknown }).__TAURI__ = {};
    } else {
      (globalThis as unknown as { window?: { __TAURI__?: unknown } }).window = {
        __TAURI__: {},
      };
    }

    const { ollamaGenerate } = await import('@/services/ai/transports/ollamaTransport');

    const result = await ollamaGenerate({
      model: 'test-model',
      prompt: 'ping',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('OLLAMA_ABORTED');
      expect(result.error.retryable).toBe(false);
    }
  });
});
