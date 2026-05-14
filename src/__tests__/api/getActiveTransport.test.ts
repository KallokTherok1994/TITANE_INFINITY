/**
 * TITANE_INFINITY v34.1.0 — getActiveTransport tests
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  getActiveTransport,
  __resetActiveTransportCacheForTests__,
  isTauriAvailable,
} from '../../api/tauriClient';
import { useTransportState } from '../../state/useTransportState';

describe('getActiveTransport', () => {
  beforeEach(() => {
    __resetActiveTransportCacheForTests__();
    useTransportState.setState({ transport: 'degraded', lastProbeAt: 0 });
    // Clear Tauri globals
    delete (window as Record<string, unknown>).__TAURI__;
    delete (window as Record<string, unknown>).__TAURI_INTERNALS__;
    delete (window as Record<string, unknown>).isTauri;
    try {
      window.localStorage.removeItem('titane_remote_url');
    } catch {
      /* ignore */
    }
  });

  afterEach(() => {
    __resetActiveTransportCacheForTests__();
  });

  it("returns 'tauri' when Tauri internals are available", async () => {
    (window as Record<string, unknown>).__TAURI_INTERNALS__ = {};
    expect(isTauriAvailable()).toBe(true);
    const t = await getActiveTransport({ force: true });
    expect(t).toBe('tauri');
  });

  it("returns 'remote' when /api/health responds OK", async () => {
    const fetchImpl = vi.fn(async () => ({ ok: true })) as unknown as typeof fetch;
    const t = await getActiveTransport({
      force: true,
      remoteUrl: 'https://gw.example.com',
      fetchImpl,
    });
    expect(t).toBe('remote');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("returns 'degraded' when /api/health fails", async () => {
    const fetchImpl = vi.fn(async () => ({ ok: false })) as unknown as typeof fetch;
    const t = await getActiveTransport({
      force: true,
      remoteUrl: 'https://gw.example.com',
      fetchImpl,
    });
    expect(t).toBe('degraded');
  });

  it("returns 'degraded' when no remote URL is configured", async () => {
    const fetchImpl = vi.fn(async () => ({ ok: true })) as unknown as typeof fetch;
    const t = await getActiveTransport({ force: true, fetchImpl });
    expect(t).toBe('degraded');
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('publishes the result into useTransportState', async () => {
    (window as Record<string, unknown>).__TAURI_INTERNALS__ = {};
    await getActiveTransport({ force: true });
    expect(useTransportState.getState().transport).toBe('tauri');
    expect(useTransportState.getState().lastProbeAt).toBeGreaterThan(0);
  });

  it('caches the result for 30s when force is false', async () => {
    const fetchImpl = vi.fn(async () => ({ ok: true })) as unknown as typeof fetch;
    await getActiveTransport({
      force: true,
      remoteUrl: 'https://gw.example.com',
      fetchImpl,
    });
    // Second call without force should be cached
    await getActiveTransport({
      remoteUrl: 'https://gw.example.com',
      fetchImpl,
    });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});
