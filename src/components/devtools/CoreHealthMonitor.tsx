/**
 * TITANE∞ v35.1.8 - CoreHealthMonitor Component
 * Real-time monitoring of 9 core engines health status
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { tauriClient } from '@/lib/tauriClient';

interface CoreHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'failing' | 'unknown';
  uptime: number;
  lastError?: string;
  metrics: {
    cpu_percent: number;
    memory_mb: number;
    operations_total: number;
  };
}

interface CoreHealthMonitorProps {
  refreshInterval?: number;
  showDetails?: boolean;
}

const NINE_CORES = [
  'Orchestrator',
  'StyleEngine',
  'CoherenceEngine',
  'ReflectionEngine',
  'EmotionEngine',
  'UnifiedMemory',
  'BehaviorEngine',
  'AdaptationEngine',
  'SystemHealth',
];

export const CoreHealthMonitor: React.FC<CoreHealthMonitorProps> = ({
  refreshInterval = 3000,
  showDetails = true,
}) => {
  const [coresHealth, setCoresHealth] = useState<Map<string, CoreHealth>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);
  const refreshInFlightRef = useRef(false);

  const fetchCoresHealth = useCallback(async () => {
    if (refreshInFlightRef.current) {
      return;
    }

    refreshInFlightRef.current = true;

    try {
      // Fetch health for each core
      const healthPromises = NINE_CORES.map(async coreName => {
        try {
          const info = (await tauriClient.getCoreInfo({
            core_name: coreName.toLowerCase(),
          })) as {
            name: string;
            version: string;
            status: string;
            dependencies: string[];
            metrics: Array<{ name: string; value: number; unit: string }>;
          };

          // Parse metrics
          const cpuMetric = info.metrics.find(m => m.name.includes('cpu'));
          const memMetric = info.metrics.find(m => m.name.includes('memory'));
          const opsMetric = info.metrics.find(m => m.name.includes('operations'));

          const uptimeMetric = info.metrics.find(m => m.name.includes('uptime'));
          const health: CoreHealth = {
            name: coreName,
            status: info.status as CoreHealth['status'],
            uptime: uptimeMetric?.value ?? 0, // Live metric from backend
            metrics: {
              cpu_percent: cpuMetric?.value ?? 0,
              memory_mb: memMetric?.value ?? 0,
              operations_total: opsMetric?.value ?? 0,
            },
          };

          return [coreName, health] as const;
        } catch (error) {
          // Fallback if core not implemented yet
          return [
            coreName,
            {
              name: coreName,
              status: 'unknown' as const,
              uptime: 0,
              metrics: {
                cpu_percent: 0,
                memory_mb: 0,
                operations_total: 0,
              },
            },
          ] as const;
        }
      });

      const results = await Promise.all(healthPromises);
      if (mountedRef.current) {
        setCoresHealth(new Map(results));
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch cores health:', error);
      if (mountedRef.current) {
        setIsLoading(false);
      }
    } finally {
      refreshInFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      refreshInFlightRef.current = false;
    };
  }, []);

  useEffect(() => {
    void fetchCoresHealth();
    const interval = setInterval(() => {
      void fetchCoresHealth();
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchCoresHealth, refreshInterval]);

  // Get status indicator
  const getStatusIndicator = (status: CoreHealth['status']): string => {
    switch (status) {
      case 'healthy':
        return '🟢';
      case 'degraded':
        return '🟡';
      case 'failing':
        return '🔴';
      case 'unknown':
        return '⚪';
      default:
        return '⚫';
    }
  };

  // Get status color
  const getStatusColor = (status: CoreHealth['status']): string => {
    switch (status) {
      case 'healthy':
        return 'text-green-400';
      case 'degraded':
        return 'text-yellow-400';
      case 'failing':
        return 'text-red-400';
      case 'unknown':
        return 'text-titanium-text-tertiary';
      default:
        return 'text-titanium-text-disabled';
    }
  };

  // Format uptime
  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-titanium-bg-base rounded-lg">
        <div className="text-titanium-text-tertiary">Loading core health...</div>
      </div>
    );
  }

  // Calculate overall health
  const healthyCores = Array.from(coresHealth.values()).filter(
    c => c.status === 'healthy'
  ).length;
  const totalCores = coresHealth.size;
  const healthPercentage = (healthyCores / totalCores) * 100;

  return (
    <div className="core-health-monitor bg-titanium-bg-base rounded-lg border border-titanium-border-default p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-titanium-text-secondary">
            ⚙️ Core Engine Health
          </h3>
          <p className="text-sm text-titanium-text-disabled">
            {healthyCores}/{totalCores} cores healthy ({healthPercentage.toFixed(0)}%)
          </p>
        </div>
        <div
          className={`text-3xl font-bold ${
            healthPercentage >= 80
              ? 'text-green-400'
              : healthPercentage >= 60
                ? 'text-yellow-400'
                : 'text-red-400'
          }`}
        >
          {healthPercentage.toFixed(0)}%
        </div>
      </div>

      {/* Overall Health Bar */}
      <div className="mb-6">
        <div className="h-2 bg-titanium-bg-interactive rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              healthPercentage >= 80
                ? 'bg-green-500'
                : healthPercentage >= 60
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
            }`}
            style={{ width: `${healthPercentage}%` }}
          />
        </div>
      </div>

      {/* Cores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {NINE_CORES.map(coreName => {
          const health = coresHealth.get(coreName);
          if (!health) return null;

          return (
            <div
              key={coreName}
              className="bg-titanium-bg-elevated rounded-lg p-4 border border-titanium-border-default hover:border-titanium-border-strong transition"
            >
              {/* Core Name & Status */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getStatusIndicator(health.status)}</span>
                  <span className="text-sm font-medium text-titanium-text-secondary">
                    {health.name}
                  </span>
                </div>
                <span
                  className={`text-xs font-semibold ${getStatusColor(health.status)}`}
                >
                  {health.status.toUpperCase()}
                </span>
              </div>

              {/* Metrics (if showDetails) */}
              {showDetails && (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-titanium-text-tertiary">
                    <span>Uptime:</span>
                    <span className="text-titanium-text-secondary">
                      {formatUptime(health.uptime)}
                    </span>
                  </div>
                  <div className="flex justify-between text-titanium-text-tertiary">
                    <span>CPU:</span>
                    <span className="text-titanium-text-secondary">
                      {health.metrics.cpu_percent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-titanium-text-tertiary">
                    <span>Memory:</span>
                    <span className="text-titanium-text-secondary">
                      {health.metrics.memory_mb.toFixed(0)} MB
                    </span>
                  </div>
                  <div className="flex justify-between text-titanium-text-tertiary">
                    <span>Operations:</span>
                    <span className="text-titanium-text-secondary">
                      {health.metrics.operations_total}
                    </span>
                  </div>
                </div>
              )}

              {/* Last Error */}
              {health.lastError && (
                <div className="mt-3 pt-3 border-t border-titanium-border-default">
                  <p className="text-xs text-red-400 truncate" title={health.lastError}>
                    ⚠️ {health.lastError}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-titanium-border-default flex gap-3">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded text-white transition"
        >
          🔄 Refresh Status
        </button>
        <button
          onClick={() => console.warn('Restart failing cores')}
          className="px-4 py-2 text-sm bg-orange-600 hover:bg-orange-700 rounded text-white transition"
          disabled={healthPercentage === 100}
        >
          🔧 Restart Failing
        </button>
      </div>
    </div>
  );
};
