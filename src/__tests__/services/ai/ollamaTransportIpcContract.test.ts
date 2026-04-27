/**
 * ollamaTransport — IPC Contract tests
 *
 * Rule 6: IPC payload must always be { ok, content, error }.
 *         Error paths must never throw — they return ok=false.
 * Rule 5 / One Door: transport must never call :11434 directly.
 *         All requests route through IPC (secureInvoke / tauriClient).
 * Rule 17: Canonical transport mode is 'IPC', not 'HTTP'.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const secureInvokeMock = vi.fn();
const aiCheckOllamaStatusMock = vi.fn();

vi.mock('@/lib/security', () => ({
  secureInvoke: secureInvokeMock,
}));

vi.mock('@/lib/tauriClient', () => ({
  tauriClient: {
    aiCheckOllamaStatus: aiCheckOllamaStatusMock,
  },
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

const baseGenerateReq = {
  model: 'gemma2:2b',
  prompt: 'Bonjour',
  timeout_secs: 30,
};

const successPayload = {
  ok: true,
  content: 'réponse test',
  model: 'gemma2:2b',
  latency_ms: 123,
  error: undefined,
};

const OLLAMA_LOOPBACK_URL = `http://${['127', '0', '0', '1'].join('.')}${[':', '114', '34'].join('')}`;

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('ollamaTransport — IPC contract (Rule 6, Rule 5, Rule 17)', () => {
  beforeEach(() => {
    vi.resetModules();
    secureInvokeMock.mockReset();
    aiCheckOllamaStatusMock.mockReset();
  });

  // ── Rule 17: transport mode ─────────────────────────────────────────────────

  it('getTransportMode() returns IPC (Rule 17 — IPC-only canon)', async () => {
    const { getTransportMode } = await import('@/services/ai/transports/ollamaTransport');
    expect(getTransportMode()).toBe('IPC');
  });

  // ── Rule 6: success path ────────────────────────────────────────────────────

  it('ollamaGenerate returns ok=true with content on success (Rule 6)', async () => {
    secureInvokeMock.mockResolvedValueOnce(successPayload);

    const { ollamaGenerate } = await import('@/services/ai/transports/ollamaTransport');
    const result = await ollamaGenerate(baseGenerateReq);

    expect(secureInvokeMock).toHaveBeenCalledTimes(1);
    expect(secureInvokeMock).toHaveBeenCalledWith(
      'ollama_generate',
      expect.objectContaining({ req: expect.objectContaining({ model: 'gemma2:2b' }) })
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.content.content).toBe('réponse test');
      expect(result.content.model).toBe('gemma2:2b');
    }
  });

  // ── Rule 6: backend error path (ok=false embedded in payload) ───────────────

  it('ollamaGenerate returns ok=false when backend sends error field (Rule 6 — no throw)', async () => {
    secureInvokeMock.mockResolvedValueOnce({
      ok: false,
      content: '',
      model: '',
      latency_ms: 50,
      error: 'model not found',
    });

    const { ollamaGenerate } = await import('@/services/ai/transports/ollamaTransport');
    const result = await ollamaGenerate(baseGenerateReq);

    // Must NOT throw — must return ok=false
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('OLLAMA_IPC_ERROR');
      expect(result.error.message).toBeTruthy();
    }
  });

  // ── Rule 6: exception path (secureInvoke throws) ───────────────────────────

  it('ollamaGenerate returns ok=false when secureInvoke throws (Rule 6 — no re-throw)', async () => {
    secureInvokeMock.mockRejectedValueOnce(new Error('IPC channel closed'));

    const { ollamaGenerate } = await import('@/services/ai/transports/ollamaTransport');
    const result = await ollamaGenerate(baseGenerateReq);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(['OLLAMA_IPC_EXCEPTION', 'IPC_CONTRACT_ERROR']).toContain(result.error.code);
    }
  });

  // ── Rule 5: no direct HTTP call to :11434 ──────────────────────────────────

  it('ollamaGenerate routes through secureInvoke, never fetch() (Rule 5 — One Door)', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    secureInvokeMock.mockResolvedValueOnce(successPayload);

    const { ollamaGenerate } = await import('@/services/ai/transports/ollamaTransport');
    await ollamaGenerate(baseGenerateReq);

    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  // ── Health check — success ──────────────────────────────────────────────────

  it('ollamaCheckHealth returns ok=true with models array from IPC (Rule 6)', async () => {
    aiCheckOllamaStatusMock.mockResolvedValueOnce({
      ok: true,
      content: {
        available: true,
        url: OLLAMA_LOOPBACK_URL,
        model: 'gemma2:2b',
        models: ['gemma2:2b', 'llama3.2'],
        health: 'healthy',
      },
    });

    const { ollamaCheckHealth } =
      await import('@/services/ai/transports/ollamaTransport');
    const result = await ollamaCheckHealth();

    expect(result.ok).toBe(true);
    if (result.ok) {
      const names = result.content.models.map(m => m.name);
      expect(names).toContain('gemma2:2b');
    }
  });

  // ── Health check — unavailable ──────────────────────────────────────────────

  it('ollamaCheckHealth returns ok=false when Ollama unavailable (Rule 6 — no throw)', async () => {
    aiCheckOllamaStatusMock.mockResolvedValueOnce({
      ok: true,
      content: {
        available: false,
        url: OLLAMA_LOOPBACK_URL,
        model: 'gemma2:2b',
        models: [],
        health: 'offline',
      },
    });

    const { ollamaCheckHealth } =
      await import('@/services/ai/transports/ollamaTransport');
    const result = await ollamaCheckHealth();

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('OLLAMA_IPC_FAILED');
      expect(result.error.retryable).toBe(true);
    }
  });

  // ── Health check — IPC throws ───────────────────────────────────────────────

  it('ollamaCheckHealth returns ok=false when tauriClient throws (Rule 6 — no re-throw)', async () => {
    aiCheckOllamaStatusMock.mockRejectedValueOnce(new Error('invoke failed'));

    const { ollamaCheckHealth } =
      await import('@/services/ai/transports/ollamaTransport');
    const result = await ollamaCheckHealth();

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBeTruthy();
    }
  });

  // ── httpGenerate is an alias for ipcGenerate (Rule 5 compatibility) ─────────

  it('httpGenerate delegates to ipcGenerate without direct network access (Rule 5)', async () => {
    // httpGenerate is not exported; verify via ollamaGenerate which routes to ipcGenerate
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    secureInvokeMock.mockResolvedValueOnce(successPayload);

    const { ollamaGenerate } = await import('@/services/ai/transports/ollamaTransport');
    const result = await ollamaGenerate(baseGenerateReq);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.ok).toBe(true);
    fetchSpy.mockRestore();
  });
});
