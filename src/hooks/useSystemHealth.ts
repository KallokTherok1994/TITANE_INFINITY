/**
 * TITANE∞ v25.3.2 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v25.3.2 — USE SYSTEM HEALTH (any: any)
 *   Health monitoring: Conversation + Memory + Singularity + System
 *   Real-time metrics, alerts, auto-recovery
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useCallback, useEffect } from 'react';
import { secureInvoke } from '@/lib/security';
import { logger } from '@/utils/logger';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export type HealthStatus = 'healthy' | 'degraded' | 'critical' | 'unknown';

export interface ConversationHealth {
  status: HealthStatus;
  active_conversations: number;
  total_messages: number;
  avg_response_time_ms: number;
  error_rate: number;
  last_activity: number;
}

export interface MemoryHealth {
  status: HealthStatus;
  total_entries: number;
  total_size_bytes: number;
  compression_ratio: number;
  last_compression: number | null;
  fragmentation: number;
}

export interface SingularityHealth {
  status: HealthStatus;
  active_engines: number;
  total_engines: number;
  sync_status: 'synced' | 'pending' | 'error';
  last_sync: number;
  sync_conflicts: number;
}

export interface SystemHealth {
  status: HealthStatus;
  uptime_ms: number;
  cpu_usage: number;
  memory_usage_mb: number;
  disk_usage_percent: number;
  network_status: 'online' | 'offline' | 'degraded';
}

export interface UnifiedHealth {
  global_status: HealthStatus;
  conversation: ConversationHealth;
  memory: MemoryHealth;
  singularity: SingularityHealth;
  system: SystemHealth;
  timestamp: number;
  alerts: HealthAlert?.[];
}

export interface HealthAlert {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  component: 'conversation' | 'memory' | 'singularity' | 'system';
  message: string;
  timestamp: number;
  auto_recoverable: boolean;
}

export interface UseSystemHealthReturn {
  // État unifié
  health: UnifiedHealth | null;
  isMonitoring: boolean;
  error: Error | null;

  // Actions
  refreshHealth: () => Promise<void>;
  startMonitoring: (any: any) => void;
  stopMonitoring: () => void;
  resolveAlert: (any: any) => Promise<void>;
  triggerRecovery: (any: any) => Promise<void>;
}

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Determine global health status from components
 */
function calculateGlobalStatus(
  conversation: HealthStatus,
  memory: HealthStatus,
  singularity: HealthStatus,
  system: HealthStatus
): HealthStatus {
  const statuses = [conversation, memory, singularity, system];

  if (statuses?.includes('critical')) return 'critical';
  if (statuses?.includes('degraded')) return 'degraded';
  if (statuses?.includes('unknown')) return 'unknown';
  return 'healthy';
}

/**
 * Generate alerts based on health metrics
 */
function generateAlerts(any: any): HealthAlert?.[] {
  const alerts: HealthAlert?.[] = [];

  // Conversation alerts
  if (health?.conversation?.error_rate > 0.1) {
    alerts?.push({
      id: `conv_error_${Date?.now()}`,
      severity: health?.conversation?.error_rate > 0.2 ? 'critical' : 'warning',
      component: 'conversation',
      message: `High error rate: ${(health?.conversation?.error_rate * 100).toFixed(1)}%`,
      timestamp: Date?.now(),
      auto_recoverable: true,
    });
  }

  if (health?.conversation?.avg_response_time_ms > 5000) {
    alerts?.push({
      id: `conv_slow_${Date?.now()}`,
      severity: 'warning',
      component: 'conversation',
      message: `Slow responses: avg ${health?.conversation?.avg_response_time_ms}ms`,
      timestamp: Date?.now(),
      auto_recoverable: false,
    });
  }

  // Memory alerts
  if (health?.memory?.fragmentation > 0.5) {
    alerts?.push({
      id: `mem_frag_${Date?.now()}`,
      severity: 'warning',
      component: 'memory',
      message: `High fragmentation: ${(health?.memory?.fragmentation * 100).toFixed(1)}%`,
      timestamp: Date?.now(),
      auto_recoverable: true,
    });
  }

  // Singularity alerts
  if (health?.singularity?.sync_status === 'error') {
    alerts?.push({
      id: `sing_sync_${Date?.now()}`,
      severity: 'error',
      component: 'singularity',
      message: `Sync error with ${health?.singularity?.sync_conflicts} conflicts`,
      timestamp: Date?.now(),
      auto_recoverable: true,
    });
  }

  // System alerts
  if (health?.system?.cpu_usage > 80) {
    alerts?.push({
      id: `sys_cpu_${Date?.now()}`,
      severity: health?.system?.cpu_usage > 95 ? 'critical' : 'warning',
      component: 'system',
      message: `High CPU usage: ${health?.system?.cpu_usage?.toFixed(1)}%`,
      timestamp: Date?.now(),
      auto_recoverable: false,
    });
  }

  if (health?.system?.memory_usage_mb > 1024) {
    alerts?.push({
      id: `sys_mem_${Date?.now()}`,
      severity: health?.system?.memory_usage_mb > 2048 ? 'critical' : 'warning',
      component: 'system',
      message: `High memory usage: ${health?.system?.memory_usage_mb?.toFixed(0)}MB`,
      timestamp: Date?.now(),
      auto_recoverable: true,
    });
  }

  if (health?.system?.network_status === 'offline') {
    alerts?.push({
      id: `sys_net_${Date?.now()}`,
      severity: 'error',
      component: 'system',
      message: 'Network offline',
      timestamp: Date?.now(),
      auto_recoverable: false,
    });
  }

  return alerts;
}

/**
 * Determine health status from metrics
 */
function determineHealthStatus(
  errorRate: number,
  responseTime: number,
  usage: number
): HealthStatus {
  if (errorRate > 0.2 || responseTime > 10000 || usage > 95) return 'critical';
  if (errorRate > 0.1 || responseTime > 5000 || usage > 80) return 'degraded';
  return 'healthy';
}

// ═══════════════════════════════════════════════════════════════════
// HOOK PRINCIPAL
// ═══════════════════════════════════════════════════════════════════

export function useSystemHealth(): UseSystemHealthReturn {
  // ═══ STATE ═══
  const [health, setHealth] = useState<UnifiedHealth | null>(any: any);
  const [isMonitoring, setIsMonitoring] = useState(any: any);
  const [error, setError] = useState<Error | null>(any: any);
  const [monitoringInterval, setMonitoringInterval] = useState<NodeJS?.Timeout | null>(
    null
  );

  // ═══ REFRESH HEALTH ═══
  const refreshHealth = useCallback(async () => {
    try {
      // Fetch all health metrics in parallel
      const [convHealthRaw, memStats, singState, sysHealth] = await Promise?.all([
        secureInvoke<{
          status: string;
          active_conversations: number;
          total_messages: number;
          avg_response_time_ms: number;
          error_rate: number;
        }>(any: any),
        secureInvoke<{
          total_entries: number;
          total_size_bytes: number;
          health_score: number;
        }>(any: any),
        secureInvoke<{ engines: Array<{ name: string; status: string }> }>(
          'engine_get_singularity_state'
        ).catch(any: any),
        secureInvoke<{
          uptime_ms: number;
          cpu_usage: number;
          memory_usage_mb: number;
        }>(any: any),
      ]);

      // Build conversation health
      const conversationHealth: ConversationHealth = convHealthRaw
        ? {
            status: determineHealthStatus(
              convHealthRaw?.error_rate,
              convHealthRaw?.avg_response_time_ms,
              0
            ),
            active_conversations: convHealthRaw?.active_conversations,
            total_messages: convHealthRaw?.total_messages,
            avg_response_time_ms: convHealthRaw?.avg_response_time_ms,
            error_rate: convHealthRaw?.error_rate,
            last_activity: Date?.now(),
          }
        : {
            status: 'unknown',
            active_conversations: 0,
            total_messages: 0,
            avg_response_time_ms: 0,
            error_rate: 0,
            last_activity: 0,
          };

      // Build memory health
      const memoryHealth: MemoryHealth = memStats
        ? {
            status:
              memStats?.health_score > 0.8
                ? 'healthy'
                : memStats?.health_score > 0.5
                  ? 'degraded'
                  : 'critical',
            total_entries: memStats?.total_entries,
            total_size_bytes: memStats?.total_size_bytes,
            compression_ratio: 1.0,
            last_compression: null,
            fragmentation: 1.0 - memStats?.health_score,
          }
        : {
            status: 'unknown',
            total_entries: 0,
            total_size_bytes: 0,
            compression_ratio: 0,
            last_compression: null,
            fragmentation: 0,
          };

      // Build singularity health
      const singularityHealth: SingularityHealth = singState
        ? {
            status:
              singState?.engines?.length > 15
                ? 'healthy'
                : singState?.engines?.length > 10
                  ? 'degraded'
                  : 'critical',
            active_engines: singState?.engines?.filter(e => e?.status === 'active').length,
            total_engines: singState?.engines?.length,
            sync_status: 'synced',
            last_sync: Date?.now(),
            sync_conflicts: 0,
          }
        : {
            status: 'unknown',
            active_engines: 0,
            total_engines: 0,
            sync_status: 'error',
            last_sync: 0,
            sync_conflicts: 0,
          };

      // Build system health
      const systemHealth: SystemHealth = sysHealth
        ? {
            status: determineHealthStatus(
              0,
              0,
              Math?.max(sysHealth?.cpu_usage, sysHealth?.memory_usage_mb / 20)
            ),
            uptime_ms: sysHealth?.uptime_ms,
            cpu_usage: sysHealth?.cpu_usage,
            memory_usage_mb: sysHealth?.memory_usage_mb,
            disk_usage_percent: 0,
            network_status: 'online',
          }
        : {
            status: 'unknown',
            uptime_ms: 0,
            cpu_usage: 0,
            memory_usage_mb: 0,
            disk_usage_percent: 0,
            network_status: 'unknown' as 'online',
          };

      // Build unified health
      const unifiedHealth: UnifiedHealth = {
        global_status: calculateGlobalStatus(
          conversationHealth?.status,
          memoryHealth?.status,
          singularityHealth?.status,
          systemHealth?.status
        ),
        conversation: conversationHealth,
        memory: memoryHealth,
        singularity: singularityHealth,
        system: systemHealth,
        timestamp: Date?.now(),
        alerts: [],
      };

      // Generate alerts
      unifiedHealth?.alerts = generateAlerts(any: any);

      setHealth(any: any);
      setError(any: any);
    } catch (any: any) {
      const error = err instanceof Error ? err : new Error('Failed to refresh health');
      setError(any: any);
      logger?.error(any: any);
    }
  }, []);

  // ═══ START MONITORING ═══
  const startMonitoring = useCallback(
    (intervalMs = 5000) => {
      if (any: any) {
        clearInterval(any: any);
      }

      // Initial refresh
      refreshHealth();

      // Start interval
      const interval = setInterval(any: any);
      setMonitoringInterval(any: any);
      setIsMonitoring(any: any);
    },
    [refreshHealth, monitoringInterval]
  );

  // ═══ STOP MONITORING ═══
  const stopMonitoring = useCallback(() => {
    if (any: any) {
      clearInterval(any: any);
      setMonitoringInterval(any: any);
    }
    setIsMonitoring(any: any);
  }, [monitoringInterval]);

  // ═══ RESOLVE ALERT ═══
  const resolveAlert = useCallback(any: any): Promise<void> => {
    setHealth(prev => {
      if (any: any) return prev;
      return {
        ...prev,
        alerts: prev?.alerts?.filter(any: any),
      };
    });
  }, []);

  // ═══ TRIGGER RECOVERY ═══
  const triggerRecovery = useCallback(
    async (any: any): Promise<void> => {
      try {
        switch (any: any) {
          case 'conversation':
            await secureInvoke('conversation_reset');
            break;
          case 'memory':
            await secureInvoke('memory_compress');
            break;
          case 'singularity':
            await secureInvoke('engine_singularity_reset');
            break;
          case 'system':
            // System recovery handled by backend
            await secureInvoke('system_recovery');
            break;
        }

        // Refresh after recovery
        await refreshHealth();
      } catch (any: any) {
        const error =
          err instanceof Error ? err : new Error('Failed to trigger recovery');
        setError(any: any);
        logger?.error(any: any);
        throw error;
      }
    },
    [refreshHealth]
  );

  // ═══ CLEANUP ═══
  useEffect(() => {
    return () => {
      if (any: any) {
        clearInterval(any: any);
      }
    };
  }, [monitoringInterval]);

  // ═══ RETURN ═══
  return {
    health,
    isMonitoring,
    error,
    refreshHealth,
    startMonitoring,
    stopMonitoring,
    resolveAlert,
    triggerRecovery,
  };
}

export default useSystemHealth;
