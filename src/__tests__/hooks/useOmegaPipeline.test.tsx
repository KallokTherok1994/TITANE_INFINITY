/**
 * Tests pour useOmegaPipeline Hook
 * Coverage: Pipeline stages, Processing, Callbacks
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOmegaPipeline } from '@/hooks';

describe('useOmegaPipeline Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useOmegaPipeline());
      expect(result.current.state.stage).toBe('idle');
      expect(result.current.state.progress).toBe(0);
    });

    it('should have execute method', () => {
      const { result } = renderHook(() => useOmegaPipeline());
      expect(typeof result.current.execute).toBe('function');
    });
  });

  describe('Pipeline Execution', () => {
    it('should execute pipeline', async () => {
      const { result } = renderHook(() => useOmegaPipeline());

      vi.useFakeTimers();
      await act(async () => {
        const promise = result.current.execute({ data: 'test' });
        await vi.runAllTimersAsync();
        await promise;
      });

      expect(result.current.state.stage).toBe('complete');
      expect(result.current.state.progress).toBe(100);
      expect(result.current.state.result).toMatchObject({
        processed: true,
        input: { data: 'test' },
      });

      vi.useRealTimers();
    });
  });

  describe('Reset', () => {
    it('should reset pipeline state', async () => {
      const { result } = renderHook(() => useOmegaPipeline());

      vi.useFakeTimers();
      await act(async () => {
        const promise = result.current.execute({ data: 'test' });
        await vi.runAllTimersAsync();
        await promise;
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.state.stage).toBe('idle');
      expect(result.current.state.progress).toBe(0);
      vi.useRealTimers();
    });
  });
});
