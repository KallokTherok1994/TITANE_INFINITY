/**
 * TITANE∞ v22.0.0 - CoreHealthMonitor Component
 * Real-time monitoring of 9 core engines health status
 */

import React, { useState, useEffect } from 'react';
import { secureInvoke } from '@/lib/security';

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

  useEffect(() => {
    const fetchCoresHealth = async () => {
      try {
        // Fetch health for each core
        const healthPromises = NINE_CORES.map(async coreName => {
          try {
            const info = await secureInvoke<{
              name: string;
              version: string;
              status: string;
              dependencies: string[];
              metrics: Array<{ name: string; value: number; unit: string }>;
            }>('get_core_info', { core_name: coreName.toLowerCase() });

            // Parse metrics
            const cpuMetric = info.metrics.find(m => m.name.includes('cpu'));
            const memMetric = info.metrics.find(m => m.name.includes('memory'));
            const opsMetric = info.metrics.find(m => m.name.includes('operations'));

            const health: CoreHealth = {
              name: coreName,
              status: info.status as CoreHealth['status'],
              uptime: Math.random() * 86400, // Mock uptime for now
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
        setCoresHealth(new Map(results));
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch cores health:', error);
        setIsLoading(false);
      }
    };

    fetchCoresHealth();
    const interval = setInterval(fetchCoresHealth, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

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
        return 'text-gray-400';
      default:
        return 'text-gray-600';
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
      <div className="flex items-center justify-center h-64 bg-gray-900 rounded-lg">
        <div className="text-gray-400">Loading core health...</div>
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
    <div className="core-health-monitor bg-gray-900 rounded-lg border border-gray-700 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-200">⚙️ Core Engine Health</h3>
          <p className="text-sm text-gray-500">
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
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
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
              className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition"
            >
              {/* Core Name & Status */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getStatusIndicator(health.status)}</span>
                  <span className="text-sm font-medium text-gray-200">{health.name}</span>
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
                  <div className="flex justify-between text-gray-400">
                    <span>Uptime:</span>
                    <span className="text-gray-300">{formatUptime(health.uptime)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>CPU:</span>
                    <span className="text-gray-300">
                      {health.metrics.cpu_percent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Memory:</span>
                    <span className="text-gray-300">
                      {health.metrics.memory_mb.toFixed(0)} MB
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Operations:</span>
                    <span className="text-gray-300">
                      {health.metrics.operations_total}
                    </span>
                  </div>
                </div>
              )}

              {/* Last Error */}
              {health.lastError && (
                <div className="mt-3 pt-3 border-t border-gray-700">
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
      <div className="mt-6 pt-4 border-t border-gray-700 flex gap-3">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded text-white transition"
        >
          🔄 Refresh Status
        </button>
        <button
          onClick={() => console.log('Restart failing cores')}
          className="px-4 py-2 text-sm bg-orange-600 hover:bg-orange-700 rounded text-white transition"
          disabled={healthPercentage === 100}
        >
          🔧 Restart Failing
        </button>
      </div>
    </div>
  );
};
