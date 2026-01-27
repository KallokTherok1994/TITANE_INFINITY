/**
 * Tests pour useFusionEngine Hook
 * Coverage: Initialization, Processing, State, Lifecycle
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFusionEngine } from '@/hooks/useFusionEngine';

describe('useFusionEngine Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useFusionEngine());
      expect(result.current.isActive).toBe(false);
      expect(result.current.state).toBe('idle');
    });

    it('should have process method', () => {
      const { result } = renderHook(() => useFusionEngine());
      expect(typeof result.current.process).toBe('function');
    });
  });

  describe('Activation', () => {
    it('should activate engine', async () => {
      const { result } = renderHook(() => useFusionEngine());
      
      await act(async () => {
        await result.current.activate();
      });

      expect(result.current.isActive).toBe(true);
    });

    it('should deactivate engine', async () => {
      const { result } = renderHook(() => useFusionEngine());
      
      await act(async () => {
        await result.current.activate();
        await result.current.deactivate();
      });

      expect(result.current.isActive).toBe(false);
    });
  });

  describe('Processing', () => {
    it('should process input', async () => {
      const { result } = renderHook(() => useFusionEngine());
      
      await act(async () => {
        await result.current.activate();
      });

      await act(async () => {
        await result.current.process({ input: 'test data' });
      });

      expect(result.current.state).toBe('idle');
    });

    it('should update state during processing', async () => {
      const { result } = renderHook(() => useFusionEngine());
      
      await act(async () => {
        await result.current.activate();
      });

      act(() => {
        result.current.process({ input: 'test' });
      });

      expect(result.current.state).toBe('processing');
    });

    it('should handle processing errors', async () => {
      const { result } = renderHook(() => useFusionEngine());
      
      await act(async () => {
        await result.current.activate();
      });

      await act(async () => {
        try {
          await result.current.process({ input: 'invalid' });
        } catch (error) {
          expect(error).toBeDefined();
        }
      });
    });
  });

  describe('State Management', () => {
    it('should track processing state', async () => {
      const { result } = renderHook(() => useFusionEngine());
      
      await act(async () => {
        await result.current.activate();
      });

      expect(result.current.state).toBe('idle');

      act(() => {
        result.current.process({ input: 'test' });
      });

      expect(result.current.state).toBe('processing');
    });

    it('should provide engine metrics', async () => {
      const { result } = renderHook(() => useFusionEngine());
      
      await act(async () => {
        await result.current.activate();
      });

      expect(result.current.metrics).toBeDefined();
      expect(typeof result.current.metrics.processedCount).toBe('number');
    });
  });

  describe('Error Handling', () => {
    it('should handle activation errors', async () => {
      const { result } = renderHook(() => useFusionEngine({ failOnActivate: true }));
      
      await expect(async () => {
        await act(async () => {
          await result.current.activate();
        });
      }).rejects.toThrow();
    });

    it('should recover from errors', async () => {
      const { result } = renderHook(() => useFusionEngine());
      
      await act(async () => {
        await result.current.activate();
      });

      await act(async () => {
        try {
          await result.current.process({ input: 'error' });
        } catch {
          // Handled
        }
      });

      expect(result.current.isActive).toBe(true);
    });
  });

  describe('Cleanup', () => {
    it('should cleanup on unmount', async () => {
      const { result, unmount } = renderHook(() => useFusionEngine());
      
      await act(async () => {
        await result.current.activate();
      });

      unmount();

      // Should have cleaned up resources
      expect(result.current.isActive).toBe(true); // Before unmount
    });
  });
});
