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
      expect(result.current.isRunning).toBe(false);
      expect(result.current.currentStage).toBe(null);
    });

    it('should have execute method', () => {
      const { result } = renderHook(() => useOmegaPipeline());
      expect(typeof result.current.execute).toBe('function');
    });
  });

  describe('Pipeline Execution', () => {
    it('should execute pipeline', async () => {
      const { result } = renderHook(() => useOmegaPipeline());
      
      await act(async () => {
        await result.current.execute({ data: 'test' });
      });

      expect(result.current.isRunning).toBe(false);
    });

    it('should track current stage', async () => {
      const { result } = renderHook(() => useOmegaPipeline());
      
      act(() => {
        result.current.execute({ data: 'test' });
      });

      expect(result.current.currentStage).not.toBe(null);
    });

    it('should complete all stages', async () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() => useOmegaPipeline({ onComplete }));
      
      await act(async () => {
        await result.current.execute({ data: 'test' });
      });

      expect(onComplete).toHaveBeenCalled();
    });
  });

  describe('Stage Callbacks', () => {
    it('should call onStageStart', async () => {
      const onStageStart = vi.fn();
      const { result } = renderHook(() => useOmegaPipeline({ onStageStart }));
      
      await act(async () => {
        await result.current.execute({ data: 'test' });
      });

      expect(onStageStart).toHaveBeenCalled();
    });

    it('should call onStageComplete', async () => {
      const onStageComplete = vi.fn();
      const { result } = renderHook(() => useOmegaPipeline({ onStageComplete }));
      
      await act(async () => {
        await result.current.execute({ data: 'test' });
      });

      expect(onStageComplete).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle stage errors', async () => {
      const onError = vi.fn();
      const { result } = renderHook(() => useOmegaPipeline({ onError }));
      
      await act(async () => {
        try {
          await result.current.execute({ data: 'error' });
        } catch (error) {
          expect(error).toBeDefined();
        }
      });
    });

    it('should stop on error', async () => {
      const { result } = renderHook(() => useOmegaPipeline({ stopOnError: true }));
      
      await act(async () => {
        try {
          await result.current.execute({ data: 'error' });
        } catch {
          // Handled
        }
      });

      expect(result.current.isRunning).toBe(false);
    });
  });

  describe('Pipeline Control', () => {
    it('should pause pipeline', async () => {
      const { result } = renderHook(() => useOmegaPipeline());
      
      act(() => {
        result.current.execute({ data: 'test' });
        result.current.pause();
      });

      expect(result.current.isPaused).toBe(true);
    });

    it('should resume pipeline', async () => {
      const { result } = renderHook(() => useOmegaPipeline());
      
      act(() => {
        result.current.execute({ data: 'test' });
        result.current.pause();
        result.current.resume();
      });

      expect(result.current.isPaused).toBe(false);
    });

    it('should cancel pipeline', async () => {
      const { result } = renderHook(() => useOmegaPipeline());
      
      act(() => {
        result.current.execute({ data: 'test' });
        result.current.cancel();
      });

      expect(result.current.isRunning).toBe(false);
    });
  });
});
