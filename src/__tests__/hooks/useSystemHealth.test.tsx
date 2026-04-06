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
    vi.clearAllTimers();
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
    persistent_memory_get_stats: {
      count_by_level: {
        session: 12,
        intermediate: 20,
        long_term: 10,
      },
      total_size: 1024,
      health: {
        status: 'healthy',
        corrupted_files: 0,
        last_integrity_check: 0,
        disk_space_percent: 10,
        encryption_active: true,
        last_backup: 0,
      },
    },
    engine_get_singularity_state: {
      engines: Array.from({ length: 20 }, (_, index) => ({
        name: `engine-${index + 1}`,
        status: 'active',
      })),
    },
    get_system_health: {
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
        if (command === 'get_system_health') {
          return {
            ...mockHealthPayloads.get_system_health,
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

    it('should not mark persistent memory alerts as auto-recoverable', async () => {
      vi.mocked(secureInvoke).mockImplementation(async command => {
        if (command === 'persistent_memory_get_stats') {
          return {
            count_by_level: {
              session: 2,
              intermediate: 3,
              long_term: 4,
            },
            total_size: 1024,
            health: {
              status: 'critical',
              corrupted_files: 0,
              last_integrity_check: 0,
              disk_space_percent: 50,
              encryption_active: true,
              last_backup: 0,
            },
          };
        }

        return mockHealthPayloads[command as keyof typeof mockHealthPayloads] ?? null;
      });

      const { result } = renderHook(() => useSystemHealth());

      await act(async () => {
        await result.current.refreshHealth();
      });

      const memoryAlert = result.current.health?.alerts.find(
        alert => alert.component === 'memory'
      );

      expect(memoryAlert).toBeDefined();
      expect(memoryAlert?.auto_recoverable).toBe(false);
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

  describe('Recovery', () => {
    it('should reject legacy auto-recovery for persistent memory', async () => {
      const { result } = renderHook(() => useSystemHealth());

      await expect(result.current.triggerRecovery('memory')).rejects.toThrow(
        /persistent memory auto-recovery is not available/i
      );
    });
  });
});
