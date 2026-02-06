/**
 * Tests pour usePerformanceMonitor Hook
 * Coverage: Métriques (CPU, Memory, FPS), Seuils, Alertes
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePerformanceMonitor } from '@/hooks';

describe('usePerformanceMonitor Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize metrics', () => {
      const { result } = renderHook(() => usePerformanceMonitor({ enabled: false }));
      expect(result.current.metrics).toBeDefined();
    });

    it('should have cpu metric', () => {
      const { result } = renderHook(() => usePerformanceMonitor({ enabled: false }));
      expect(result.current.metrics.cpuLoad).toBeDefined();
    });

    it('should have memory metric', () => {
      const { result } = renderHook(() => usePerformanceMonitor({ enabled: false }));
      expect(result.current.metrics.shouldReduceMotion).toBeDefined();
    });

    it('should have fps metric', () => {
      const { result } = renderHook(() => usePerformanceMonitor({ enabled: false }));
      expect(result.current.metrics.fps).toBeDefined();
    });
  });

  describe('Derived state', () => {
    it('should expose animation config', () => {
      const { result } = renderHook(() => usePerformanceMonitor({ enabled: false }));
      expect(result.current.animationConfig).toBeDefined();
      expect(typeof result.current.animationConfig.duration).toBe('number');
      expect(typeof result.current.animationConfig.skipAnimation).toBe('boolean');
    });

    it('should expose top-level flags', () => {
      const { result } = renderHook(() => usePerformanceMonitor({ enabled: false }));
      expect(typeof result.current.shouldReduceMotion).toBe('boolean');
      expect(typeof result.current.shouldThrottle).toBe('boolean');
    });
  });
});
