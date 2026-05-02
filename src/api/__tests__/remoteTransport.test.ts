/**
 * TITANE∞ — remoteTransport unit tests
 *
 * Coverage:
 *  - getRemoteGatewayUrl / isRemoteGatewayAvailable
 *  - setRemoteGatewayUrl / clearRemoteGatewayUrl
 *  - remoteAuthenticate (success + failure)
 *  - remoteInvoke (success, 401 + auto-refresh, no URL, no token, fetch error)
 *  - probeRemoteGateway (success, HTTP error, network error)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getRemoteGatewayUrl,
  setRemoteGatewayUrl,
  clearRemoteGatewayUrl,
  isRemoteGatewayAvailable,
  remoteAuthenticate,
  remoteInvoke,
  probeRemoteGateway,
} from '../remoteTransport';

// ─────────────────────────────────────────────────────────────────
// Helpers — minimal localStorage / sessionStorage stubs
// ─────────────────────────────────────────────────────────────────

const localStore: Record<string, string> = {};
const sessionStore: Record<string, string> = {};

function setupStorageMocks() {
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => localStore[k] ?? null,
    setItem: (k: string, v: string) => {
      localStore[k] = v;
    },
    removeItem: (k: string) => {
      delete localStore[k];
    },
  });
  vi.stubGlobal('sessionStorage', {
    getItem: (k: string) => sessionStore[k] ?? null,
    setItem: (k: string, v: string) => {
      sessionStore[k] = v;
    },
    removeItem: (k: string) => {
      delete sessionStore[k];
    },
  });
}

function clearStores() {
  Object.keys(localStore).forEach(k => delete localStore[k]);
  Object.keys(sessionStore).forEach(k => delete sessionStore[k]);
}

// ─────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────

beforeEach(() => {
  setupStorageMocks();
  clearStores();
  vi.restoreAllMocks();
});

// 1. URL management
describe('Gateway URL management', () => {
  it('returns null when no URL stored', () => {
    expect(getRemoteGatewayUrl()).toBeNull();
    expect(isRemoteGatewayAvailable()).toBe(false);
  });

  it('stores and retrieves gateway URL', () => {
    setRemoteGatewayUrl('https://my-titane.trycloudflare.com');
    expect(getRemoteGatewayUrl()).toBe('https://my-titane.trycloudflare.com');
    expect(isRemoteGatewayAvailable()).toBe(true);
  });

  it('strips trailing slashes on store', () => {
    setRemoteGatewayUrl('https://my-titane.trycloudflare.com///');
    expect(getRemoteGatewayUrl()).toBe('https://my-titane.trycloudflare.com');
  });

  it('clearRemoteGatewayUrl removes URL and tokens', () => {
    setRemoteGatewayUrl('https://example.com');
    sessionStore['titane_remote_access_token'] = 'tok123';
    sessionStore['titane_remote_refresh_token'] = 'ref123';
    clearRemoteGatewayUrl();
    expect(getRemoteGatewayUrl()).toBeNull();
    expect(sessionStore['titane_remote_access_token']).toBeUndefined();
    expect(sessionStore['titane_remote_refresh_token']).toBeUndefined();
  });
});

// 2. Authentication
describe('remoteAuthenticate', () => {
  it('returns REMOTE_URL_NOT_CONFIGURED when no URL set', async () => {
    const result = await remoteAuthenticate('mysecret');
    expect(result.ok).toBe(false);
    expect(result.error).toBe('REMOTE_URL_NOT_CONFIGURED');
  });

  it('stores tokens on success', async () => {
    setRemoteGatewayUrl('https://gateway.example.com');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        json: async () => ({
          ok: true,
          access_token: 'acc_tok',
          refresh_token: 'ref_tok',
        }),
      })
    );
    const result = await remoteAuthenticate('correct_secret');
    expect(result.ok).toBe(true);
    expect(sessionStore['titane_remote_access_token']).toBe('acc_tok');
    expect(sessionStore['titane_remote_refresh_token']).toBe('ref_tok');
  });

  it('returns error on wrong secret', async () => {
    setRemoteGatewayUrl('https://gateway.example.com');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        json: async () => ({ ok: false, error: 'INVALID_SECRET' }),
      })
    );
    const result = await remoteAuthenticate('wrong');
    expect(result.ok).toBe(false);
    expect(result.error).toBe('INVALID_SECRET');
  });

  it('returns error on network failure', async () => {
    setRemoteGatewayUrl('https://gateway.example.com');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValueOnce(new TypeError('Failed to fetch'))
    );
    const result = await remoteAuthenticate('secret');
    expect(result.ok).toBe(false);
    expect(result.error).toContain('Failed to fetch');
  });
});

// 3. remoteInvoke
describe('remoteInvoke', () => {
  it('returns REMOTE_URL_NOT_CONFIGURED when no URL', async () => {
    const result = await remoteInvoke('health_check');
    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe('REMOTE_URL_NOT_CONFIGURED');
  });

  it('returns REMOTE_NOT_AUTHENTICATED when no token', async () => {
    setRemoteGatewayUrl('https://gateway.example.com');
    const result = await remoteInvoke('health_check');
    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe('REMOTE_NOT_AUTHENTICATED');
  });

  it('returns ok result with valid token', async () => {
    setRemoteGatewayUrl('https://gateway.example.com');
    sessionStore['titane_remote_access_token'] = 'valid_token';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        status: 200,
        json: async () => ({ ok: true, content: { ping: 'pong' } }),
      })
    );
    const result = await remoteInvoke<{ ping: string }>('health_check');
    expect(result.ok).toBe(true);
    expect(result.content?.ping).toBe('pong');
    expect(result.error).toBeNull();
  });

  it('auto-refreshes on 401 and retries', async () => {
    setRemoteGatewayUrl('https://gateway.example.com');
    sessionStore['titane_remote_access_token'] = 'expired_token';
    sessionStore['titane_remote_refresh_token'] = 'refresh_tok';
    const fetchMock = vi
      .fn()
      // First invoke call → 401
      .mockResolvedValueOnce({
        status: 401,
        json: async () => ({ ok: false, error: 'Unauthorized' }),
      })
      // Refresh call → new access token
      .mockResolvedValueOnce({
        json: async () => ({ ok: true, access_token: 'new_access_token' }),
      })
      // Retry invoke → success
      .mockResolvedValueOnce({
        status: 200,
        json: async () => ({ ok: true, content: { refreshed: true } }),
      });
    vi.stubGlobal('fetch', fetchMock);
    const result = await remoteInvoke<{ refreshed: boolean }>('health_check');
    expect(result.ok).toBe(true);
    expect(result.content?.refreshed).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('returns REMOTE_SESSION_EXPIRED when refresh fails after 401', async () => {
    setRemoteGatewayUrl('https://gateway.example.com');
    sessionStore['titane_remote_access_token'] = 'expired_token';
    sessionStore['titane_remote_refresh_token'] = 'expired_refresh';
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        status: 401,
        json: async () => ({ ok: false, error: 'Unauthorized' }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ ok: false, error: 'REFRESH_EXPIRED' }),
      });
    vi.stubGlobal('fetch', fetchMock);
    const result = await remoteInvoke('health_check');
    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe('REMOTE_SESSION_EXPIRED');
  });

  it('returns REMOTE_FETCH_ERROR on network failure', async () => {
    setRemoteGatewayUrl('https://gateway.example.com');
    sessionStore['titane_remote_access_token'] = 'tok';
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new TypeError('Network error')));
    const result = await remoteInvoke('health_check');
    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe('REMOTE_FETCH_ERROR');
    expect(result.error?.message).toContain('Network error');
  });

  it('forwards payload to fetch body', async () => {
    setRemoteGatewayUrl('https://gateway.example.com');
    sessionStore['titane_remote_access_token'] = 'tok';
    const fetchMock = vi.fn().mockResolvedValueOnce({
      status: 200,
      json: async () => ({ ok: true, content: null }),
    });
    vi.stubGlobal('fetch', fetchMock);
    await remoteInvoke('web_search', { query: 'IA 2026', max_results: 5 });
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string) as { command: string; payload: unknown };
    expect(body.command).toBe('web_search');
    expect((body.payload as { query: string }).query).toBe('IA 2026');
  });
});

// 4. Health probe
describe('probeRemoteGateway', () => {
  it('returns false when no URL configured and no argument given', async () => {
    expect(await probeRemoteGateway()).toBe(false);
  });

  it('returns true for healthy gateway', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          content: { status: 'ok', service: 'titane_remote' },
        }),
      })
    );
    expect(await probeRemoteGateway('https://gateway.example.com')).toBe(true);
  });

  it('returns false for non-ok HTTP response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      })
    );
    expect(await probeRemoteGateway('https://gateway.example.com')).toBe(false);
  });

  it('returns false on network error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValueOnce(new TypeError('Failed to fetch'))
    );
    expect(await probeRemoteGateway('https://unreachable.example.com')).toBe(false);
  });

  it('returns false when content.status is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: false, content: { status: 'degraded' } }),
      })
    );
    expect(await probeRemoteGateway('https://gateway.example.com')).toBe(false);
  });
});
