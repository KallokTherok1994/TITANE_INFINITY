/**
 * Tests: useAutoTimeout + useElapsedTime + formatElapsedTime
 * Coverage: src/hooks/useAutoTimeout.ts
 * SPRINT 7 — Test Coverage Elevation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useAutoTimeout,
  useElapsedTime,
  formatElapsedTime,
} from '@/hooks/useAutoTimeout';

describe('useAutoTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('devrait ne pas déclencher onTimeout quand isActive=false', () => {
    const onTimeout = vi.fn();
    renderHook(() =>
      useAutoTimeout({ id: 'test', timeoutMs: 500, isActive: false, onTimeout })
    );
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onTimeout).not.toHaveBeenCalled();
  });

  it('devrait déclencher onTimeout après le délai quand isActive=true', () => {
    const onTimeout = vi.fn();
    renderHook(() =>
      useAutoTimeout({ id: 'test', timeoutMs: 500, isActive: true, onTimeout })
    );
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(onTimeout).toHaveBeenCalledTimes(1);
  });

  it('devrait ne pas déclencher avant le délai complet', () => {
    const onTimeout = vi.fn();
    renderHook(() =>
      useAutoTimeout({ id: 'test', timeoutMs: 1000, isActive: true, onTimeout })
    );
    act(() => {
      vi.advanceTimersByTime(999);
    });
    expect(onTimeout).not.toHaveBeenCalled();
  });

  it('devrait annuler le timeout quand isActive passe à false', () => {
    const onTimeout = vi.fn();
    const { rerender } = renderHook(
      ({ isActive }) =>
        useAutoTimeout({ id: 'test', timeoutMs: 500, isActive, onTimeout }),
      { initialProps: { isActive: true } }
    );
    act(() => {
      vi.advanceTimersByTime(300);
    });
    rerender({ isActive: false });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(onTimeout).not.toHaveBeenCalled();
  });

  it('devrait redémarrer le timer quand isActive repasse à true', () => {
    const onTimeout = vi.fn();
    const { rerender } = renderHook(
      ({ isActive }) =>
        useAutoTimeout({ id: 'test', timeoutMs: 500, isActive, onTimeout }),
      { initialProps: { isActive: false } }
    );
    rerender({ isActive: true });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(onTimeout).toHaveBeenCalledTimes(1);
  });

  it('devrait logger en mode dev', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const onTimeout = vi.fn();
    renderHook(() =>
      useAutoTimeout({
        id: 'dev-test',
        timeoutMs: 100,
        isActive: true,
        onTimeout,
        isDev: true,
      })
    );
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('dev-test'));
    consoleSpy.mockRestore();
  });
});

describe('useElapsedTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('devrait retourner 0 quand isActive=false', () => {
    const { result } = renderHook(() => useElapsedTime(false));
    expect(result.current).toBe(0);
  });

  it('devrait incrémenter le temps quand isActive=true', () => {
    const { result } = renderHook(() => useElapsedTime(true, 1000));
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current).toBeGreaterThanOrEqual(1);
  });

  it('devrait réinitialiser à 0 quand isActive passe à false', () => {
    const { result, rerender } = renderHook(
      ({ isActive }) => useElapsedTime(isActive, 1000),
      { initialProps: { isActive: true } }
    );
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    rerender({ isActive: false });
    expect(result.current).toBe(0);
  });
});

describe('formatElapsedTime', () => {
  it('devrait formater les secondes seules (< 1 min)', () => {
    expect(formatElapsedTime(45)).toBe('0:45');
  });

  it('devrait formater les minutes et secondes', () => {
    expect(formatElapsedTime(90)).toBe('1:30');
    expect(formatElapsedTime(125)).toBe('2:05');
  });

  it('devrait formater les heures, minutes, secondes', () => {
    expect(formatElapsedTime(3661)).toBe('1:01:01');
    expect(formatElapsedTime(7200)).toBe('2:00:00');
  });

  it('devrait retourner 0:00 pour 0 secondes', () => {
    expect(formatElapsedTime(0)).toBe('0:00');
  });
});
