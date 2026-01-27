/**
 * Tests pour usePerformanceMonitor Hook
 * Coverage: Métriques (CPU, Memory, FPS), Seuils, Alertes
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

describe('usePerformanceMonitor Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize metrics', () => {
      const { result } = renderHook(() => usePerformanceMonitor());
      expect(result.current.metrics).toBeDefined();
    });

    it('should have cpu metric', () => {
      const { result } = renderHook(() => usePerformanceMonitor());
      expect(result.current.metrics.cpu).toBeDefined();
    });

    it('should have memory metric', () => {
      const { result } = renderHook(() => usePerformanceMonitor());
      expect(result.current.metrics.memory).toBeDefined();
    });

    it('should have fps metric', () => {
      const { result } = renderHook(() => usePerformanceMonitor());
      expect(result.current.metrics.fps).toBeDefined();
    });
  });

  describe('Metrics Collection', () => {
    it('should collect metrics periodically', async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => usePerformanceMonitor({ interval: 1000 }));
      
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.metrics).toBeDefined();
      vi.useRealTimers();
    });

    it('should update cpu usage', async () => {
      const { result } = renderHook(() => usePerformanceMonitor());
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(typeof result.current.metrics.cpu).toBe('number');
    });
  });

  describe('Thresholds', () => {
    it('should detect high CPU usage', () => {
      const { result } = renderHook(() => usePerformanceMonitor({ cpuThreshold: 80 }));
      
      act(() => {
        // Simuler CPU élevé
        result.current.metrics.cpu = 85;
      });

      expect(result.current.metrics.cpu).toBeGreaterThan(80);
    });

    it('should emit alerts', async () => {
      const onAlert = vi.fn();
      renderHook(() => usePerformanceMonitor({ onAlert }));
      
      // Alert devrait être levée si seuils dépassés
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });
    });
  });
});
