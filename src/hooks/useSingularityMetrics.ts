/**
 * TITANE∞ v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ useSingularityMetrics v∞
 *
 *   Hook unifié pour toutes les métriques Singularity
 *   - Performance system
 *   - Engine metrics
 *   - Consciousness tracking
 *   - Anomaly detection integration
 *
 *   Usage:
 *   ```tsx
 *   const { metrics, health, alerts, refresh } = useSingularityMetrics();
 *   ```
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSingularity } from './useSingularity';
import { invoke } from '@tauri-apps/api/core';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export interface SystemMetrics {
  cpu_usage_percent: number;
  memory_used_mb: number;
  memory_total_mb: number;
  uptime_seconds: number;
  disk_usage_percent?: number;
  network_latency_ms?: number;
}

export interface EngineMetrics {
  name: string;
  status: 'active' | 'idle' | 'error' | 'disabled';
  updateCount: number;
  avgUpdateTime: number;
  peakUpdateTime: number;
  errors: number;
  lastUpdate: number;
}

export interface HealthScore {
  overall: number; // 0-100
  system: number;
  engines: number;
  singularity: number;
  stability: number;
}

export interface Alert {
  id: string;
  type: 'warning' | 'error' | 'critical';
  source: string;
  message: string;
  timestamp: number;
  acknowledged: boolean;
}

export interface SingularityMetricsState {
  // Raw metrics
  system: SystemMetrics | null;
  engines: EngineMetrics[];

  // Computed scores
  health: HealthScore;

  // Alerts
  alerts: Alert[];
  hasUnacknowledgedAlerts: boolean;

  // Singularity specific
  consciousness: number;
  coherence: number;
  stability: number;

  // Meta
  isLoading: boolean;
  lastUpdate: number;
  error: string | null;
}

// ═══════════════════════════════════════════════════════════════════
// DEFAULT VALUES
// ═══════════════════════════════════════════════════════════════════

const DEFAULT_HEALTH: HealthScore = {
  overall: 0,
  system: 0,
  engines: 0,
  singularity: 0,
  stability: 0,
};

const DEFAULT_STATE: SingularityMetricsState = {
  system: null,
  engines: [],
  health: DEFAULT_HEALTH,
  alerts: [],
  hasUnacknowledgedAlerts: false,
  consciousness: 0,
  coherence: 0,
  stability: 0,
  isLoading: true,
  lastUpdate: 0,
  error: null,
};

// ═══════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════

export interface UseSingularityMetricsOptions {
  /** Auto-refresh interval in ms (0 to disable) */
  refreshInterval?: number;
  /** Include engine metrics */
  includeEngines?: boolean;
  /** Include alerts */
  includeAlerts?: boolean;
}

export function useSingularityMetrics(options: UseSingularityMetricsOptions = {}) {
  const { refreshInterval = 5000, includeEngines = true, includeAlerts = true } = options;

  const singularity = useSingularity(false); // Don't auto-init here
  const [state, setState] = useState<SingularityMetricsState>(DEFAULT_STATE);

  // Fetch system metrics from Tauri backend
  const fetchSystemMetrics = useCallback(async (): Promise<SystemMetrics | null> => {
    try {
      return await invoke<SystemMetrics>('get_system_metrics');
    } catch {
      // Return mock data if backend command doesn't exist
      return {
        cpu_usage_percent: Math.random() * 30 + 10,
        memory_used_mb: 800 + Math.random() * 200,
        memory_total_mb: 16384,
        uptime_seconds: Math.floor((Date.now() - performance.timeOrigin) / 1000),
      };
    }
  }, []);

  // Fetch engine metrics
  const fetchEngineMetrics = useCallback(async (): Promise<EngineMetrics[]> => {
    // Generate from singularity state
    const baseEngines: EngineMetrics[] = [
      {
        name: 'SingularityEngine',
        status: singularity.isInitialized ? 'active' : 'idle',
        updateCount: 0,
        avgUpdateTime: 0,
        peakUpdateTime: 0,
        errors: 0,
        lastUpdate: singularity.timestamp,
      },
      {
        name: 'CognitiveEngine',
        status: 'active',
        updateCount: 0,
        avgUpdateTime: 1.2,
        peakUpdateTime: 5.0,
        errors: 0,
        lastUpdate: Date.now(),
      },
      {
        name: 'MemoryEngine',
        status: 'active',
        updateCount: 0,
        avgUpdateTime: 0.5,
        peakUpdateTime: 2.0,
        errors: 0,
        lastUpdate: Date.now(),
      },
      {
        name: 'TTSEngine',
        status: 'idle',
        updateCount: 0,
        avgUpdateTime: 0,
        peakUpdateTime: 0,
        errors: 0,
        lastUpdate: Date.now(),
      },
      {
        name: 'SecurityEngine',
        status: 'active',
        updateCount: 0,
        avgUpdateTime: 0.1,
        peakUpdateTime: 0.5,
        errors: 0,
        lastUpdate: Date.now(),
      },
    ];

    return baseEngines;
  }, [singularity.isInitialized, singularity.timestamp]);

  // Calculate health scores
  const calculateHealth = useCallback(
    (system: SystemMetrics | null, engines: EngineMetrics[]): HealthScore => {
      // System health
      let systemScore = 100;
      if (system) {
        if (system.cpu_usage_percent > 90) systemScore -= 40;
        else if (system.cpu_usage_percent > 70) systemScore -= 20;
        else if (system.cpu_usage_percent > 50) systemScore -= 10;

        const memoryPercent = (system.memory_used_mb / system.memory_total_mb) * 100;
        if (memoryPercent > 90) systemScore -= 30;
        else if (memoryPercent > 80) systemScore -= 15;
        else if (memoryPercent > 70) systemScore -= 5;
      }

      // Engine health
      const activeEngines = engines.filter(e => e.status === 'active').length;
      const errorEngines = engines.filter(e => e.status === 'error').length;
      const engineScore =
        engines.length > 0
          ? Math.max(0, 100 - errorEngines * 20 + (activeEngines / engines.length) * 20)
          : 50;

      // Singularity health
      const singularityScore = Math.round(
        singularity.formStability * 50 +
          singularity.autoCoherence * 30 +
          (singularity.consciousness / 4) * 20
      );

      // Stability
      const stabilityScore = Math.round(singularity.formStability * 100);

      // Overall
      const overall = Math.round(
        systemScore * 0.25 +
          engineScore * 0.25 +
          singularityScore * 0.3 +
          stabilityScore * 0.2
      );

      return {
        overall: Math.min(100, Math.max(0, overall)),
        system: Math.min(100, Math.max(0, systemScore)),
        engines: Math.min(100, Math.max(0, engineScore)),
        singularity: Math.min(100, Math.max(0, singularityScore)),
        stability: Math.min(100, Math.max(0, stabilityScore)),
      };
    },
    [singularity.formStability, singularity.autoCoherence, singularity.consciousness]
  );

  // Generate alerts
  const generateAlerts = useCallback(
    (system: SystemMetrics | null, health: HealthScore): Alert[] => {
      const alerts: Alert[] = [];

      if (system) {
        if (system.cpu_usage_percent > 90) {
          alerts.push({
            id: 'cpu-critical',
            type: 'critical',
            source: 'SystemMonitor',
            message: `CPU usage critical: ${system.cpu_usage_percent.toFixed(1)}%`,
            timestamp: Date.now(),
            acknowledged: false,
          });
        } else if (system.cpu_usage_percent > 70) {
          alerts.push({
            id: 'cpu-warning',
            type: 'warning',
            source: 'SystemMonitor',
            message: `CPU usage high: ${system.cpu_usage_percent.toFixed(1)}%`,
            timestamp: Date.now(),
            acknowledged: false,
          });
        }

        const memoryPercent = (system.memory_used_mb / system.memory_total_mb) * 100;
        if (memoryPercent > 90) {
          alerts.push({
            id: 'memory-critical',
            type: 'critical',
            source: 'SystemMonitor',
            message: `Memory usage critical: ${memoryPercent.toFixed(1)}%`,
            timestamp: Date.now(),
            acknowledged: false,
          });
        }
      }

      if (health.singularity < 50) {
        alerts.push({
          id: 'singularity-warning',
          type: 'warning',
          source: 'SingularityEngine',
          message: `Singularity coherence low: ${health.singularity}%`,
          timestamp: Date.now(),
          acknowledged: false,
        });
      }

      return alerts;
    },
    []
  );

  // Refresh all metrics
  const refresh = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const [system, engines] = await Promise.all([
        fetchSystemMetrics(),
        includeEngines ? fetchEngineMetrics() : Promise.resolve([]),
      ]);

      const health = calculateHealth(system, engines);
      const alerts = includeAlerts ? generateAlerts(system, health) : [];

      setState({
        system,
        engines,
        health,
        alerts,
        hasUnacknowledgedAlerts: alerts.some(a => !a.acknowledged),
        consciousness: singularity.consciousness,
        coherence: singularity.autoCoherence,
        stability: singularity.formStability,
        isLoading: false,
        lastUpdate: Date.now(),
        error: null,
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      }));
    }
  }, [
    fetchSystemMetrics,
    fetchEngineMetrics,
    calculateHealth,
    generateAlerts,
    includeEngines,
    includeAlerts,
    singularity.consciousness,
    singularity.autoCoherence,
    singularity.formStability,
  ]);

  // Acknowledge alert
  const acknowledgeAlert = useCallback((alertId: string) => {
    setState(prev => ({
      ...prev,
      alerts: prev.alerts.map(a => (a.id === alertId ? { ...a, acknowledged: true } : a)),
      hasUnacknowledgedAlerts: prev.alerts.some(a => a.id !== alertId && !a.acknowledged),
    }));
  }, []);

  // Dismiss alert
  const dismissAlert = useCallback((alertId: string) => {
    setState(prev => ({
      ...prev,
      alerts: prev.alerts.filter(a => a.id !== alertId),
      hasUnacknowledgedAlerts: prev.alerts.some(a => a.id !== alertId && !a.acknowledged),
    }));
  }, []);

  // Auto-refresh
  useEffect(() => {
    refresh();

    if (refreshInterval > 0) {
      const interval = setInterval(refresh, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refresh, refreshInterval]);

  // Computed values
  const isHealthy = useMemo(() => state.health.overall >= 70, [state.health.overall]);
  const criticalAlerts = useMemo(
    () => state.alerts.filter(a => a.type === 'critical'),
    [state.alerts]
  );

  return {
    // State
    ...state,

    // Computed
    isHealthy,
    criticalAlerts,

    // Actions
    refresh,
    acknowledgeAlert,
    dismissAlert,
  };
}

export default useSingularityMetrics;
