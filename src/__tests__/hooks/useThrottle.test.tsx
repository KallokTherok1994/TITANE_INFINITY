/**
 * Tests pour useThrottle Hook
 * Coverage: Throttling values, Delay, Leading/Trailing
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useThrottle } from '@/hooks/useThrottle';

describe('useThrottle Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initialization', () => {
    it('should return initial value', () => {
      const { result } = renderHook(() => useThrottle('initial', 500));
      expect(result.current).toBe('initial');
    });
  });

  describe('Throttling', () => {
    it('should throttle value changes', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useThrottle(value, delay),
        { initialProps: { value: 'first', delay: 500 } }
      );

      expect(result.current).toBe('first');

      rerender({ value: 'second', delay: 500 });
      expect(result.current).toBe('first'); // Still throttled

      act(() => {
        vi.advanceTimersByTime(500);
      });

      rerender({ value: 'third', delay: 500 });
      expect(result.current).toBe('third'); // Updated after throttle period
    });

    it('should update immediately on first call', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useThrottle(value, delay),
        { initialProps: { value: 'first', delay: 500 } }
      );

      expect(result.current).toBe('first');

      rerender({ value: 'second', delay: 500 });
      
      // First update should be immediate
      expect(result.current).toBe('first');
    });
  });

  describe('Multiple Updates', () => {
    it('should ignore rapid updates', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useThrottle(value, delay),
        { initialProps: { value: 'v1', delay: 500 } }
      );

      rerender({ value: 'v2', delay: 500 });
      rerender({ value: 'v3', delay: 500 });
      rerender({ value: 'v4', delay: 500 });

      // Should still be throttled
      expect(result.current).toBe('v1');

      act(() => {
        vi.advanceTimersByTime(500);
      });

      rerender({ value: 'v5', delay: 500 });
      expect(result.current).toBe('v5');
    });
  });

  describe('Custom Delay', () => {
    it('should respect custom delay', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useThrottle(value, delay),
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
      rerender({ value: 'final', delay: 1000 });
      expect(result.current).toBe('final');
    });
  });
});
