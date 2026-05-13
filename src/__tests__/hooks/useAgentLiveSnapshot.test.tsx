/**
 * Tests unitaires — useAgentLiveSnapshot
 * Scope: hook generique factorise pour les dashboards agents avances.
 * Rule 16: nouveau hook -> test unitaire obligatoire.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useAgentLiveSnapshot } from '@/hooks/useAgentLiveSnapshot';

describe('useAgentLiveSnapshot', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('expose le snapshot initial et un timestamp lastUpdate', () => {
    const fn = vi.fn(() => ({ counter: 1 }));
    const { result } = renderHook(() => useAgentLiveSnapshot(fn, 5000));
    expect(result.current.data).toEqual({ counter: 1 });
    expect(typeof result.current.lastUpdate).toBe('number');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('rafraichit automatiquement le snapshot a chaque intervalle', () => {
    let counter = 0;
    const fn = vi.fn(() => ({ counter: ++counter }));
    const { result } = renderHook(() => useAgentLiveSnapshot(fn, 5000));
    expect(result.current.data).toEqual({ counter: 1 });

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.data).toEqual({ counter: 2 });

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.data).toEqual({ counter: 3 });
  });

  it('permet un refresh manuel via la fonction retournee', () => {
    let counter = 10;
    const fn = vi.fn(() => ({ counter: ++counter }));
    const { result } = renderHook(() => useAgentLiveSnapshot(fn, 60000));
    const before = result.current.lastUpdate;

    act(() => {
      vi.advanceTimersByTime(1);
      result.current.refresh();
    });

    expect(result.current.data).toEqual({ counter: 12 });
    expect(result.current.lastUpdate).toBeGreaterThanOrEqual(before);
  });

  it('met a jour lastUpdate apres un tick automatique', () => {
    const fn = vi.fn(() => ({ value: Math.random() }));
    const { result } = renderHook(() => useAgentLiveSnapshot(fn, 2000));
    const initial = result.current.lastUpdate;

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.lastUpdate).toBeGreaterThanOrEqual(initial);
  });

  it('nettoie l intervalle au demontage', () => {
    const fn = vi.fn(() => ({ counter: 1 }));
    const { unmount } = renderHook(() => useAgentLiveSnapshot(fn, 1000));
    const callsBefore = fn.mock.calls.length;
    unmount();
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(fn.mock.calls.length).toBe(callsBefore);
  });

  it('borne intervalMs a 1000ms minimum (anti-flood)', () => {
    const fn = vi.fn(() => 1);
    renderHook(() => useAgentLiveSnapshot(fn, 100));
    const callsBefore = fn.mock.calls.length;
    act(() => {
      vi.advanceTimersByTime(500);
    });
    // 500ms < 1000ms => aucun nouveau tick
    expect(fn.mock.calls.length).toBe(callsBefore);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    // 500 + 1000 = 1500ms > 1000ms => au moins un tick
    expect(fn.mock.calls.length).toBeGreaterThan(callsBefore);
  });
});
