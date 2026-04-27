/**
 * TITANE∞ — Remote Gateway Contract Tests (TypeScript)
 * Validates the { ok, content, error } contract for remote endpoints.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RemoteTransport } from '@/lib/remoteTransport';
import {
  isTauriContext,
  isRemoteContext,
  getTransport,
  resetTransport,
} from '@/lib/transport';

// ── Helpers ───────────────────────────────────────────────────

function mockFetch(data: unknown, status = 200) {
  return vi.fn().mockResolvedValue({
    status,
    json: async () => data,
  } as Response);
}

// ── IPC contract ──────────────────────────────────────────────

describe('RemoteTransport IPC contract', () => {
  let transport: RemoteTransport;

  beforeEach(() => {
    transport = new RemoteTransport({ baseUrl: 'http://localhost:7420' });
  });

  it('returns content on ok: true response', async () => {
    const payload = { hello: 'world' };
    global.fetch = mockFetch({ ok: true, content: payload }) as unknown as typeof fetch;

    // Inject fake token
    sessionStorage.setItem('titane_remote_access_token', 'fake-token');

    const result = await transport.invoke<typeof payload>('health_check');
    expect(result).toEqual(payload);
  });

  it('throws on ok: false response', async () => {
    global.fetch = mockFetch({
      ok: false,
      content: null,
      error: 'command_not_allowed',
    }) as unknown as typeof fetch;

    sessionStorage.setItem('titane_remote_access_token', 'fake-token');

    await expect(transport.invoke('forbidden_cmd')).rejects.toThrow(
      'command_not_allowed'
    );
  });

  it('throws when not authenticated', async () => {
    sessionStorage.removeItem('titane_remote_access_token');
    await expect(transport.invoke('health_check')).rejects.toThrow('Not authenticated');
  });

  it('authenticate stores tokens in sessionStorage', async () => {
    global.fetch = mockFetch({
      ok: true,
      access_token: 'access-123',
      refresh_token: 'refresh-456',
    }) as unknown as typeof fetch;

    await transport.authenticate('my-secret');

    expect(sessionStorage.getItem('titane_remote_access_token')).toBe('access-123');
    expect(sessionStorage.getItem('titane_remote_refresh_token')).toBe('refresh-456');
  });

  it('authenticate throws on wrong secret', async () => {
    global.fetch = mockFetch({
      ok: false,
      error: 'invalid_secret',
    }) as unknown as typeof fetch;

    await expect(transport.authenticate('wrong')).rejects.toThrow('invalid_secret');
  });

  it('clears tokens on 401 + failed refresh', async () => {
    let callCount = 0;
    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      callCount++;
      if ((url as string).includes('/api/invoke')) {
        return { status: 401, json: async () => ({ ok: false, error: 'expired' }) };
      }
      if ((url as string).includes('/api/auth/refresh')) {
        return { status: 200, json: async () => ({ ok: false }) };
      }
      return { status: 200, json: async () => ({ ok: true, content: {} }) };
    }) as unknown as typeof fetch;

    sessionStorage.setItem('titane_remote_access_token', 'expired-token');
    sessionStorage.setItem('titane_remote_refresh_token', 'expired-refresh');

    await expect(transport.invoke('any_cmd')).rejects.toThrow('Session expired');
    expect(sessionStorage.getItem('titane_remote_access_token')).toBeNull();
  });
});

// ── Transport factory ─────────────────────────────────────────

describe('Transport factory', () => {
  beforeEach(() => {
    resetTransport();
    // Clean window flags
    delete (window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__;
    delete (window as Window & { __TITANE_REMOTE__?: boolean }).__TITANE_REMOTE__;
  });

  it('isTauriContext returns false without Tauri internals', () => {
    expect(isTauriContext()).toBe(false);
  });

  it('isTauriContext returns true with __TAURI_INTERNALS__', () => {
    (window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__ = {};
    expect(isTauriContext()).toBe(true);
  });

  it('getTransport returns remote transport in browser context', () => {
    const t = getTransport();
    expect(t.isRemote).toBe(true);
  });

  it('getTransport returns Tauri transport in Tauri context', () => {
    (window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__ = {};
    const t = getTransport();
    expect(t.isRemote).toBe(false);
  });
});
