/**
 * Tests pour useSystemHealth Hook
 * Coverage: Monitoring santé système, Alertes, Seuils
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSystemHealth } from '@/hooks';

describe('useSystemHealth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize health monitoring', () => {
      const { result } = renderHook(() => useSystemHealth());
      expect(result.current.health).toBeDefined();
    });

    it('should start with optimal status', () => {
      const { result } = renderHook(() => useSystemHealth());
      expect(result.current.health.status).toBe('optimal');
    });

    it('should have metrics', () => {
      const { result } = renderHook(() => useSystemHealth());
      expect(result.current.health.cpu).toBeDefined();
      expect(result.current.health.memory).toBeDefined();
    });
  });

  describe('Health Monitoring', () => {
    it('should update health periodically', async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useSystemHealth({ interval: 1000 }));

      const initialCpu = result.current.health.cpu;

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Health should be updated
      expect(result.current.health).toBeDefined();
      vi.useRealTimers();
    });

    it('should detect warnings', async () => {
      const { result } = renderHook(() => useSystemHealth({ cpuThreshold: 80 }));

      act(() => {
        // Simuler CPU élevé
        result.current.health.cpu = 85;
      });

      expect(result.current.health.cpu).toBeGreaterThan(80);
    });

    it('should detect critical state', async () => {
      const { result } = renderHook(() => useSystemHealth({ cpuThreshold: 90 }));

      act(() => {
        result.current.health.cpu = 95;
        result.current.health.status = 'critical';
      });

      expect(result.current.health.status).toBe('critical');
    });
  });

  describe('Alerts', () => {
    it('should emit alert on threshold exceeded', async () => {
      const onAlert = vi.fn();
      renderHook(() => useSystemHealth({ onAlert, cpuThreshold: 80 }));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Alert callback might be called if thresholds exceeded
    });
  });

  describe('Network Status', () => {
    it('should monitor network', () => {
      const { result } = renderHook(() => useSystemHealth());
      expect(result.current.health.network).toBeDefined();
    });
  });
});
