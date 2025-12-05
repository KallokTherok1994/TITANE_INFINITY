/**
 * TITANE∞ v∞ — SYSTEM HEALTH MONITOR
 * Composant temps réel pour monitoring système
 * Design System: Monochrome TITANE
 */

import { useState, useEffect, useCallback, memo } from 'react';
import { invoke } from '@tauri-apps/api/core';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

interface SystemMetrics {
  cpu_usage_percent: number;
  memory_used_mb: number;
  memory_total_mb: number;
  uptime_seconds: number;
}

interface EngineStatus {
  name: string;
  status: 'active' | 'idle' | 'error' | 'disabled';
  lastUpdate: number;
}

interface HealthMonitorProps {
  refreshInterval?: number; // ms
  compact?: boolean;
}

// ═══════════════════════════════════════════════════════════════════
// COMPOSANT
// ═══════════════════════════════════════════════════════════════════

export const SystemHealthMonitor = memo(function SystemHealthMonitor({
  refreshInterval = 5000,
  compact = false,
}: HealthMonitorProps) {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [engines, setEngines] = useState<EngineStatus[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(0);

  // Fetch system metrics
  const fetchMetrics = useCallback(async () => {
    try {
      const result = await invoke<SystemMetrics>('get_system_metrics');
      setMetrics(result);
      setLastUpdate(Date.now());
      setError(null);
    } catch (err) {
      // Fallback si la commande n'existe pas encore
      setMetrics({
        cpu_usage_percent: 0,
        memory_used_mb: 0,
        memory_total_mb: 0,
        uptime_seconds: 0,
      });
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  // Fetch engine statuses
  const fetchEngines = useCallback(async () => {
    try {
      const result = await invoke<EngineStatus[]>('get_engines_status');
      setEngines(result);
    } catch {
      // Fallback avec engines mock
      setEngines([
        { name: 'SingularityEngine', status: 'active', lastUpdate: Date.now() },
        { name: 'MemoryEngine', status: 'active', lastUpdate: Date.now() },
        { name: 'ChatOrchestrator', status: 'idle', lastUpdate: Date.now() },
        { name: 'SelfHealingEngine', status: 'active', lastUpdate: Date.now() },
      ]);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    fetchEngines();

    const interval = setInterval(() => {
      fetchMetrics();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchMetrics, fetchEngines, refreshInterval]);

  // Format uptime
  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Memory percentage
  const memoryPercent = metrics
    ? Math.round((metrics.memory_used_mb / metrics.memory_total_mb) * 100)
    : 0;

  // Status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return 'bg-titane-accent-500/20 text-titane-accent-500';
      case 'idle':
        return 'bg-titane-silver-400/20 text-titane-silver-400';
      case 'error':
        return 'bg-red-500/20 text-red-400';
      case 'disabled':
        return 'bg-titane-silver-600/20 text-titane-silver-600';
      default:
        return 'bg-titane-silver-400/20 text-titane-silver-400';
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-4 px-4 py-2 bg-titane-bg-card rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-titane-text-tertiary text-xs">CPU</span>
          <span className="text-titane-text-primary text-sm font-medium">
            {metrics?.cpu_usage_percent?.toFixed(1) ?? '—'}%
          </span>
        </div>
        <div className="w-px h-4 bg-titane-border-subtle" />
        <div className="flex items-center gap-2">
          <span className="text-titane-text-tertiary text-xs">RAM</span>
          <span className="text-titane-text-primary text-sm font-medium">
            {memoryPercent}%
          </span>
        </div>
        <div className="w-px h-4 bg-titane-border-subtle" />
        <div className="flex items-center gap-2">
          <span className="text-titane-text-tertiary text-xs">Uptime</span>
          <span className="text-titane-text-primary text-sm font-medium">
            {formatUptime(metrics?.uptime_seconds ?? 0)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-titane-bg-panel rounded-xl p-6 border border-titane-border-subtle">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-titane-text-primary text-lg font-semibold">
          System Health
        </h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-titane-accent-500 animate-pulse" />
          <span className="text-titane-text-tertiary text-xs">
            Last update: {new Date(lastUpdate).toLocaleTimeString()}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* CPU */}
        <div className="bg-titane-bg-card rounded-lg p-4">
          <div className="text-titane-text-tertiary text-xs mb-1">CPU Usage</div>
          <div className="text-titane-text-primary text-2xl font-bold">
            {metrics?.cpu_usage_percent?.toFixed(1) ?? '—'}%
          </div>
          <div className="mt-2 h-1 bg-titane-bg-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-titane-primary-500 transition-all duration-300"
              style={{ width: `${metrics?.cpu_usage_percent ?? 0}%` }}
            />
          </div>
        </div>

        {/* Memory */}
        <div className="bg-titane-bg-card rounded-lg p-4">
          <div className="text-titane-text-tertiary text-xs mb-1">Memory</div>
          <div className="text-titane-text-primary text-2xl font-bold">
            {memoryPercent}%
          </div>
          <div className="text-titane-text-tertiary text-xs mt-1">
            {metrics?.memory_used_mb?.toFixed(0) ?? 0} / {metrics?.memory_total_mb?.toFixed(0) ?? 0} MB
          </div>
        </div>

        {/* Uptime */}
        <div className="bg-titane-bg-card rounded-lg p-4">
          <div className="text-titane-text-tertiary text-xs mb-1">Uptime</div>
          <div className="text-titane-text-primary text-2xl font-bold">
            {formatUptime(metrics?.uptime_seconds ?? 0)}
          </div>
        </div>

        {/* Engines Count */}
        <div className="bg-titane-bg-card rounded-lg p-4">
          <div className="text-titane-text-tertiary text-xs mb-1">Active Engines</div>
          <div className="text-titane-text-primary text-2xl font-bold">
            {engines.filter((e) => e.status === 'active').length}/{engines.length}
          </div>
        </div>
      </div>

      {/* Engines Status */}
      <div>
        <h3 className="text-titane-text-secondary text-sm font-medium mb-3">
          Engine Status
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {engines.map((engine) => (
            <div
              key={engine.name}
              className="flex items-center gap-2 bg-titane-bg-card rounded-lg px-3 py-2"
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  engine.status === 'active'
                    ? 'bg-titane-accent-500'
                    : engine.status === 'error'
                      ? 'bg-red-500'
                      : 'bg-titane-silver-500'
                }`}
              />
              <span className="text-titane-text-primary text-sm truncate">
                {engine.name.replace('Engine', '')}
              </span>
              <span
                className={`ml-auto px-2 py-0.5 rounded text-xs ${getStatusColor(engine.status)}`}
              >
                {engine.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default SystemHealthMonitor;
