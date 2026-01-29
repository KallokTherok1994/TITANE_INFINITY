/**
 * Tests pour useSingularity Hook
 * Coverage: Core singularity, États, Actions, Metrics
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSingularity } from '@/hooks';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

describe('useSingularity Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize singularity', () => {
      const { result } = renderHook(() => useSingularity());
      expect(result.current.state).toBeDefined();
    });

    it('should have activate function', () => {
      const { result } = renderHook(() => useSingularity());
      expect(typeof result.current.activate).toBe('function');
    });

    it('should start in idle state', () => {
      const { result } = renderHook(() => useSingularity());
      expect(result.current.state).toBe('idle');
    });
  });

  describe('Activation', () => {
    it('should activate singularity', async () => {
      const { result } = renderHook(() => useSingularity());

      await act(async () => {
        await result.current.activate();
      });

      expect(result.current.state).toBe('active');
    });

    it('should update metrics on activation', async () => {
      const { result } = renderHook(() => useSingularity());

      await act(async () => {
        await result.current.activate();
      });

      expect(result.current.metrics).toBeDefined();
    });
  });

  describe('Metrics', () => {
    it('should collect performance metrics', async () => {
      const { result } = renderHook(() => useSingularity());

      await act(async () => {
        await result.current.activate();
      });

      expect(result.current.metrics.cpu).toBeDefined();
      expect(result.current.metrics.memory).toBeDefined();
    });

    it('should track uptime', async () => {
      const { result } = renderHook(() => useSingularity());

      await act(async () => {
        await result.current.activate();
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.metrics.uptime).toBeGreaterThan(0);
    });
  });

  describe('State Management', () => {
    it('should transition to processing state', async () => {
      const { result } = renderHook(() => useSingularity());

      await act(async () => {
        await result.current.processTask();
      });

      expect(result.current.state).toBe('processing');
    });

    it('should return to active state after processing', async () => {
      const { result } = renderHook(() => useSingularity());

      await act(async () => {
        await result.current.processTask();
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.state).toBe('active');
    });
  });

  describe('Error Handling', () => {
    it('should handle activation errors', async () => {
      const tauriCore = await import('@tauri-apps/api/core');
      vi.mocked(tauriCore.invoke).mockRejectedValueOnce(new Error('Activation failed'));

      const { result } = renderHook(() => useSingularity());

      await act(async () => {
        try {
          await result.current.activate();
        } catch (e) {
          expect(result.current.error).toBeDefined();
        }
      });
    });
  });
});
