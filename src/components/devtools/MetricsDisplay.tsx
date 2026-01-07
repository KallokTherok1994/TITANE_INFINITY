/**
 * TITANE∞ v22.0.0 - Enhanced MetricsDisplay Component
 * Real-time metrics visualization with charts and trends
 */

import React, { useState, useEffect } from 'react';
import { secureInvoke } from '@/lib/security';

interface Metric {
  name: string;
  value: number;
  unit: string;
  threshold?: { warning: number; critical: number };
  trend?: 'up' | 'down' | 'stable';
}

interface MetricCategory {
  name: string;
  metrics: Metric[];
}

interface MetricsDisplayProps {
  refreshInterval?: number;
  compact?: boolean;
}

export const MetricsDisplay: React.FC<MetricsDisplayProps> = ({
  refreshInterval = 2000,
  compact = false,
}) => {
  const [categories, setCategories] = useState<MetricCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Fetch dashboard metrics
        const dashboard = await secureInvoke<{
          error_count: number;
          warning_count: number;
          total_logs: number;
          active_cores: number;
          system_health: number;
        }>('get_dashboard_metrics');

        // Organize into categories
        const metricsData: MetricCategory[] = [
          {
            name: 'System Health',
            metrics: [
              {
                name: 'Overall Health',
                value: dashboard.system_health * 100,
                unit: '%',
                threshold: { warning: 70, critical: 50 },
                trend: dashboard.system_health > 0.8 ? 'stable' : 'down',
              },
              {
                name: 'Active Cores',
                value: dashboard.active_cores,
                unit: 'cores',
              },
            ],
          },
          {
            name: 'Logs & Errors',
            metrics: [
              {
                name: 'Total Logs',
                value: dashboard.total_logs,
                unit: 'entries',
              },
              {
                name: 'Warnings',
                value: dashboard.warning_count,
                unit: 'warnings',
                threshold: { warning: 10, critical: 50 },
              },
              {
                name: 'Errors',
                value: dashboard.error_count,
                unit: 'errors',
                threshold: { warning: 5, critical: 20 },
              },
            ],
          },
        ];

        setCategories(metricsData);
        setIsLoading(false);
      } catch (error) {
        logger.error('Failed to fetch metrics:', error);
        setIsLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Get status color based on value and threshold
  const getStatusColor = (metric: Metric): string => {
    if (!metric.threshold) return 'text-blue-400';

    if (metric.value >= metric.threshold.critical) {
      return 'text-red-400';
    } else if (metric.value >= metric.threshold.warning) {
      return 'text-yellow-400';
    }
    return 'text-green-400';
  };

  // Get trend indicator
  const getTrendIcon = (trend?: Metric['trend']): string => {
    switch (trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      case 'stable':
        return '➡️';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-900 rounded-lg">
        <div className="text-gray-400">Loading metrics...</div>
      </div>
    );
  }

  return (
    <div className="metrics-display bg-gray-900 rounded-lg border border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-200">📊 System Metrics</h3>
        <span className="text-xs text-gray-500">
          Updated: {new Date().toLocaleTimeString()}
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="space-y-6">
        {categories.map(category => (
          <div key={category.name}>
            <h4 className="text-sm font-medium text-gray-400 mb-3">{category.name}</h4>
            <div
              className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-4`}
            >
              {category.metrics.map(metric => (
                <div
                  key={metric.name}
                  className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition"
                >
                  {/* Metric Name */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">{metric.name}</span>
                    {metric.trend && (
                      <span className="text-xs">{getTrendIcon(metric.trend)}</span>
                    )}
                  </div>

                  {/* Metric Value */}
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-bold ${getStatusColor(metric)}`}>
                      {typeof metric.value === 'number'
                        ? metric.value.toFixed(1)
                        : metric.value}
                    </span>
                    <span className="text-sm text-gray-500">{metric.unit}</span>
                  </div>

                  {/* Threshold Bar */}
                  {metric.threshold && (
                    <div className="mt-3">
                      <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            metric.value >= metric.threshold.critical
                              ? 'bg-red-500'
                              : metric.value >= metric.threshold.warning
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                          } transition-all duration-300`}
                          style={{
                            width: `${Math.min(100, (metric.value / metric.threshold.critical) * 100)}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-600 mt-1">
                        <span>0</span>
                        <span className="text-yellow-600">
                          {metric.threshold.warning}
                        </span>
                        <span className="text-red-600">{metric.threshold.critical}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-700 flex gap-3">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded text-white transition"
        >
          🔄 Refresh
        </button>
        <button
          onClick={() => logger.debug('Export metrics', categories)}
          className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded text-white transition"
        >
          💾 Export
        </button>
      </div>
    </div>
  );
};
