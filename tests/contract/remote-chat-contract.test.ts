/**
 * TITANE∞ — Remote Chat Contract Tests (Vitest)
 *
 * Mocked tests for the conversation_generate flow via remote transport.
 * These run without a live server — all fetch() calls are mocked.
 *
 * Rule 16: every new integration ships with unit + contract tests.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Helpers ──────────────────────────────────────────────────

function makeIpcOk(content: unknown) {
  return { ok: true, content, error: undefined };
}

function makeIpcErr(error: string) {
  return { ok: false, content: null, error };
}

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
  // Clear sessionStorage between tests
  sessionStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
  sessionStorage.clear();
});

// ── Auth flow ─────────────────────────────────────────────────

describe('RemoteTransport — auth flow', () => {
  it('authenticate() stores tokens on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        access_token: 'access-abc',
        refresh_token: 'refresh-xyz',
      }),
    });

    const { initRemoteTransport } = await import('../../src/lib/remoteTransport');
    const transport = initRemoteTransport({ baseUrl: 'http://localhost:7420' });

    await transport.authenticate('my-secret');

    expect(sessionStorage.getItem('titane_remote_access_token')).toBe('access-abc');
    expect(sessionStorage.getItem('titane_remote_refresh_token')).toBe('refresh-xyz');
    expect(transport.isAuthenticated()).toBe(true);
  });

  it('authenticate() throws on bad secret', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ ok: false, error: 'invalid_secret' }),
    });

    const { initRemoteTransport } = await import('../../src/lib/remoteTransport');
    const transport = initRemoteTransport({ baseUrl: 'http://localhost:7420' });

    await expect(transport.authenticate('wrong-secret')).rejects.toThrow(
      'invalid_secret'
    );
    expect(transport.isAuthenticated()).toBe(false);
  });

  it('clearTokens() removes tokens and marks unauthenticated', async () => {
    sessionStorage.setItem('titane_remote_access_token', 'tok');
    sessionStorage.setItem('titane_remote_refresh_token', 'ref');

    const { initRemoteTransport } = await import('../../src/lib/remoteTransport');
    const transport = initRemoteTransport({ baseUrl: 'http://localhost:7420' });

    expect(transport.isAuthenticated()).toBe(true);
    transport.clearTokens();
    expect(transport.isAuthenticated()).toBe(false);
  });
});

// ── conversation_generate IPC contract ───────────────────────

describe('conversation_generate — IPC contract shape', () => {
  it('invoke returns content with expected fields on success', async () => {
    sessionStorage.setItem('titane_remote_access_token', 'valid-token');

    const expectedContent = {
      response: 'Bonjour, comment puis-je vous aider?',
      conversation_id: 'conv-123',
      meta: {
        mode: 'LOCAL',
        provider_used: 'ollama',
        latency_ms_total: 450,
        network_used: false,
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => makeIpcOk(expectedContent),
    });

    const { initRemoteTransport } = await import('../../src/lib/remoteTransport');
    const transport = initRemoteTransport({ baseUrl: 'http://localhost:7420' });

    // invoke() returns content directly (not the IpcContract wrapper)
    const content = await transport.invoke<typeof expectedContent>(
      'conversation_generate',
      {
        message: 'Bonjour',
        conversation_id: 'conv-123',
      }
    );

    expect(content).toBeTruthy();
    expect(content.response).toBeDefined();
    expect(content.meta).toBeDefined();
    expect(content.meta.provider_used).toBeDefined();
  });

  it('invoke returns content object on success', async () => {
    sessionStorage.setItem('titane_remote_access_token', 'valid-token');

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => makeIpcOk({ response: 'OK', meta: { provider_used: 'ollama' } }),
    });

    const { initRemoteTransport } = await import('../../src/lib/remoteTransport');
    const transport = initRemoteTransport({ baseUrl: 'http://localhost:7420' });

    // invoke() resolves with content directly
    const content = await transport.invoke<{
      response: string;
      meta: Record<string, unknown>;
    }>('conversation_generate', { message: 'test', conversation_id: 'test-conv' });

    expect(typeof content.response).toBe('string');
    expect(typeof content.meta.provider_used).toBe('string');
  });

  it('blocked command throws with error message', async () => {
    sessionStorage.setItem('titane_remote_access_token', 'valid-token');

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () =>
        makeIpcErr("command 'delete_all_data' not allowed via remote gateway"),
    });

    const { initRemoteTransport } = await import('../../src/lib/remoteTransport');
    const transport = initRemoteTransport({ baseUrl: 'http://localhost:7420' });

    // invoke() throws on ok:false — this is the IPC contract behavior
    await expect(transport.invoke('delete_all_data', {})).rejects.toThrow('not allowed');
  });
});

// ── Token refresh flow ────────────────────────────────────────

describe('RemoteTransport — token refresh on 401', () => {
  it('refreshes token transparently on 401 and retries', async () => {
    sessionStorage.setItem('titane_remote_access_token', 'expired-token');
    sessionStorage.setItem('titane_remote_refresh_token', 'refresh-token');

    // First call returns 401
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) });
    // Refresh call succeeds
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ ok: true, access_token: 'new-token' }),
    });
    // Retry original call succeeds
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => makeIpcOk({ response: 'success after refresh' }),
    });

    const { initRemoteTransport } = await import('../../src/lib/remoteTransport');
    const transport = initRemoteTransport({ baseUrl: 'http://localhost:7420' });

    const content = await transport.invoke<{ response: string }>(
      'conversation_generate',
      {
        message: 'test',
        conversation_id: 'c1',
      }
    );

    expect(typeof content.response).toBe('string');
    expect(sessionStorage.getItem('titane_remote_access_token')).toBe('new-token');
  });

  it('throws "Session expired" when refresh also fails', async () => {
    sessionStorage.setItem('titane_remote_access_token', 'expired');
    sessionStorage.setItem('titane_remote_refresh_token', 'bad-refresh');

    // First call: 401
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) });
    // Refresh: fails
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ ok: false }),
    });

    const { initRemoteTransport } = await import('../../src/lib/remoteTransport');
    const transport = initRemoteTransport({ baseUrl: 'http://localhost:7420' });

    await expect(
      transport.invoke('conversation_generate', { message: 'hi', conversation_id: 'c1' })
    ).rejects.toThrow('Session expired');

    expect(transport.isAuthenticated()).toBe(false);
  });
});

// ── Transport factory ─────────────────────────────────────────

describe('transport factory — context detection', () => {
  it('isTauriContext returns false in Node/Vitest environment', async () => {
    const { isTauriContext } = await import('../../src/lib/transport');
    // In Vitest/Node, window.__TAURI_INTERNALS__ is not set
    expect(isTauriContext()).toBe(false);
  });

  it('isRemoteContext reflects non-Tauri context', async () => {
    const { isRemoteContext } = await import('../../src/lib/transport');
    // In Node (tests), isRemoteContext returns false (window is undefined)
    const result = isRemoteContext();
    expect(typeof result).toBe('boolean');
  });
});
