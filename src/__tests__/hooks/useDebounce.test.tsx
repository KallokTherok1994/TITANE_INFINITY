/**
 * Tests pour useDebounce Hook
 * Coverage: Debouncing values, Delay, Cleanup
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/hooks';

describe('useDebounce Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initialization', () => {
    it('should return initial value', () => {
      const { result } = renderHook(() => useDebounce('initial', 500));
      expect(result.current).toBe('initial');
    });
  });

  describe('Debouncing', () => {
    it('should debounce value changes', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'first', delay: 500 } }
      );

      expect(result.current).toBe('first');

      rerender({ value: 'second', delay: 500 });
      expect(result.current).toBe('first'); // Still old value

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current).toBe('second'); // Updated after delay
    });

    it('should cancel previous debounce on new value', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'first', delay: 500 } }
      );

      rerender({ value: 'second', delay: 500 });
      
      act(() => {
        vi.advanceTimersByTime(250);
      });

      rerender({ value: 'third', delay: 500 });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current).toBe('third'); // Should skip 'second'
    });
  });

  describe('Custom Delay', () => {
    it('should respect custom delay', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'test', delay: 1000 } }
      );

      rerender({ value: 'updated', delay: 1000 });

      act(() => {
        vi.advanceTimersByTime(999);
      });
      expect(result.current).toBe('test');

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(result.current).toBe('updated');
    });
  });
});
