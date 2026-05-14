/**
 * TITANE_INFINITY v34.1.0 — RemoteTransport tests
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  RemoteTransport,
  RemoteMemoryLocalPersistenceError,
  __resetRemoteTransportForTests__,
} from '../../api/transports/RemoteTransport';

const FAKE_BASE = 'https://gw.test';

function makeFetch(handlers: Record<string, (body: unknown) => unknown>) {
  return vi.fn(async (url: string, init?: RequestInit) => {
    const path = new URL(url).pathname;
    const body = init?.body ? JSON.parse(init.body as string) : undefined;
    const handler = handlers[path];
    if (!handler) {
      return { ok: false, status: 404, json: async () => ({ ok: false, error: 'not found' }) };
    }
    const result = handler(body);
    return { ok: true, status: 200, json: async () => result };
  }) as unknown as typeof fetch;
}

describe('RemoteTransport', () => {
  beforeEach(() => {
    __resetRemoteTransportForTests__();
    try {
      window.localStorage.clear();
      window.sessionStorage.clear();
    } catch {
      /* ignore */
    }
    // Reset localStorage guard flag — best effort (proxy may forbid delete)
    try {
      delete (window.localStorage as Storage & { __titane_guard__?: boolean }).__titane_guard__;
    } catch {
      /* ignore — guard flag will be reset by __resetRemoteTransportForTests__ */
    }
  });

  it('fetches a JWT token from /api/auth/token on first invoke', async () => {
    const fetchImpl = makeFetch({
      '/api/auth/token': () => ({ ok: true, content: { token: 'jwt-abc' }, error: null }),
      '/api/invoke': () => ({ ok: true, content: { pong: 1 }, error: null }),
    });
    const t = new RemoteTransport({
      baseUrl: FAKE_BASE,
      sharedSecret: 's',
      fetchImpl,
    });
    const out = await t.invoke<{ pong: number }>('health_check');
    expect(out.pong).toBe(1);
    // Two calls: token + invoke
    expect((fetchImpl as unknown as { mock: { calls: unknown[] } }).mock.calls.length).toBe(2);
  });

  it('reuses the JWT for subsequent invokes within the lifetime window', async () => {
    const fetchImpl = makeFetch({
      '/api/auth/token': () => ({ ok: true, content: { token: 'jwt-1' }, error: null }),
      '/api/invoke': () => ({ ok: true, content: 'ok', error: null }),
    });
    const t = new RemoteTransport({
      baseUrl: FAKE_BASE,
      sharedSecret: 's',
      fetchImpl,
    });
    await t.invoke('a');
    await t.invoke('b');
    await t.invoke('c');
    // 1 token + 3 invokes
    expect(
      (fetchImpl as unknown as { mock: { calls: unknown[] } }).mock.calls.length
    ).toBe(4);
  });

  it('throws when /api/invoke envelope returns ok=false', async () => {
    const fetchImpl = makeFetch({
      '/api/auth/token': () => ({ ok: true, content: { token: 'jwt' }, error: null }),
      '/api/invoke': () => ({ ok: false, content: null, error: 'NOT_ALLOWED' }),
    });
    const t = new RemoteTransport({
      baseUrl: FAKE_BASE,
      sharedSecret: 's',
      fetchImpl,
    });
    await expect(t.invoke('forbidden_cmd')).rejects.toThrow(/NOT_ALLOWED/);
  });

  it('activates the memory_* localStorage guard during a memory_* invoke', async () => {
    const fetchImpl = makeFetch({
      '/api/auth/token': () => ({ ok: true, content: { token: 'jwt' }, error: null }),
      '/api/invoke': () => ({ ok: true, content: 'saved', error: null }),
    });
    const t = new RemoteTransport({
      baseUrl: FAKE_BASE,
      sharedSecret: 's',
      fetchImpl,
    });
    expect(
      (window.localStorage as Storage & { __titane_guard__?: boolean }).__titane_guard__
    ).toBeFalsy();
    await t.invoke('memory_save_entry', { key: 'k', value: 'v' });
    expect(
      (window.localStorage as Storage & { __titane_guard__?: boolean }).__titane_guard__
    ).toBeTruthy();
    // RemoteMemoryLocalPersistenceError class is exported for consumers
    expect(RemoteMemoryLocalPersistenceError).toBeDefined();
  });
});
