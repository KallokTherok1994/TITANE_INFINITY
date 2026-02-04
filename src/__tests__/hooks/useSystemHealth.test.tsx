/**
 * Tests pour useSystemHealth Hook
 * Coverage: Monitoring santé système, Alertes, Seuils
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSystemHealth } from '@/hooks';
import { secureInvoke } from '@/lib/security';

vi.mock('@/lib/security', () => ({
  secureInvoke: vi.fn(),
}));

describe('useSystemHealth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mockHealthPayloads = {
    conversation_health_check: {
      status: 'healthy',
      active_conversations: 1,
      total_messages: 10,
      avg_response_time_ms: 120,
      error_rate: 0,
    },
    memory_get_stats: {
      total_entries: 42,
      total_size_bytes: 1024,
      health_score: 95,
    },
    engine_get_singularity_state: {
      engines: [{ name: 'core', status: 'ok' }],
    },
    system_health_check: {
      uptime_ms: 1000,
      cpu_usage: 10,
      memory_usage_mb: 256,
      disk_usage_percent: 10,
      network_status: 'online',
    },
  } as const;

  beforeEach(() => {
    vi.mocked(secureInvoke).mockImplementation(async command => {
      if (command in mockHealthPayloads) {
        return mockHealthPayloads[command as keyof typeof mockHealthPayloads];
      }
      return null;
    });
  });

  describe('Initialization', () => {
    it('should initialize with null health before refresh', () => {
      const { result } = renderHook(() => useSystemHealth());
      expect(result.current.health).toBeNull();
    });
  });

  describe('Health Monitoring', () => {
    it('should refresh health on demand', async () => {
      const { result } = renderHook(() => useSystemHealth());

      await act(async () => {
        await result.current.refreshHealth();
      });

      expect(result.current.health).not.toBeNull();
      expect(result.current.health?.global_status).toBe('healthy');
    });

    it('should start monitoring and update periodically', async () => {
      const { result } = renderHook(() => useSystemHealth());

      act(() => {
        result.current.startMonitoring(1000);
      });

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(secureInvoke).toHaveBeenCalled();
    });
  });

  describe('Alerts', () => {
    it('should generate warnings when thresholds exceeded', async () => {
      vi.mocked(secureInvoke).mockImplementation(async command => {
        if (command === 'system_health_check') {
          return {
            ...mockHealthPayloads.system_health_check,
            cpu_usage: 90,
          };
        }
        return mockHealthPayloads[command as keyof typeof mockHealthPayloads] ?? null;
      });

      const { result } = renderHook(() => useSystemHealth());

      await act(async () => {
        await result.current.refreshHealth();
      });

      expect(result.current.health?.alerts.length).toBeGreaterThan(0);
    });
  });

  describe('Network Status', () => {
    it('should monitor network', async () => {
      const { result } = renderHook(() => useSystemHealth());

      await act(async () => {
        await result.current.refreshHealth();
      });

      expect(result.current.health?.system.network_status).toBe('online');
    });
  });
});
