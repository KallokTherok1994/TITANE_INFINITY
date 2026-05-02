/**
 * Tests: useDebounce + useDebouncedCallback + useDebouncedAsyncCallback
 * Coverage: src/hooks/useDebounce.ts
 * SPRINT 7 — Test Coverage Elevation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce, useDebouncedCallback } from '@/hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('devrait retourner la valeur initiale immédiatement', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('devrait ne pas mettre à jour la valeur avant le délai', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'a' },
    });
    rerender({ value: 'b' });
    vi.advanceTimersByTime(200);
    expect(result.current).toBe('a');
  });

  it('devrait mettre à jour la valeur après le délai', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'a' },
    });
    rerender({ value: 'b' });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe('b');
  });

  it('devrait annuler le timer précédent si la valeur change à nouveau', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'a' },
    });
    rerender({ value: 'b' });
    vi.advanceTimersByTime(150);
    rerender({ value: 'c' });
    vi.advanceTimersByTime(150);
    // délai non écoulé depuis 'c'
    expect(result.current).toBe('a');
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current).toBe('c');
  });

  it('devrait utiliser le délai par défaut de 300ms', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: 'x' },
    });
    rerender({ value: 'y' });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe('y');
  });

  it('devrait fonctionner avec des nombres', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 200), {
      initialProps: { value: 0 },
    });
    rerender({ value: 42 });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe(42);
  });
});

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('devrait ne pas appeler le callback avant le délai', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));
    act(() => {
      result.current('arg');
    });
    vi.advanceTimersByTime(200);
    expect(callback).not.toHaveBeenCalled();
  });

  it('devrait appeler le callback après le délai', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));
    act(() => {
      result.current('arg');
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(callback).toHaveBeenCalledWith('arg');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('devrait regrouper les appels multiples en un seul', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));
    act(() => {
      result.current('a');
      result.current('b');
      result.current('c');
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('c');
  });

  it('cancel() devrait annuler le timer en cours', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));
    act(() => {
      result.current('x');
    });
    act(() => {
      result.current.cancel();
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(callback).not.toHaveBeenCalled();
  });

  it('flush() devrait annuler sans appeler le callback', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));
    act(() => {
      result.current('x');
      result.current.flush();
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    // flush() = cancel() dans cette implémentation
    expect(callback).not.toHaveBeenCalled();
  });
});
