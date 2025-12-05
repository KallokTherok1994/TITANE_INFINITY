/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v15 - Phase 5: Metrics Chart Component
 * Graphiques temporels pour visualiser tendances métriques
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { MetricsHistory, type MetricsSnapshot } from '../../lib/metricsHistory';
import { TrendingUp, Activity } from 'lucide-react';

export interface MetricsChartProps {
  service?: string; // Si undefined, affiche global
  metric: 'latency' | 'errorRate' | 'successRate' | 'retryRate';
  autoRefresh?: boolean;
  refreshInterval?: number;
  className?: string;
  height?: number;
}

export const MetricsChart: React.FC<MetricsChartProps> = ({
  service,
  metric = 'latency',
  autoRefresh = true,
  refreshInterval = 5000,
  className = '',
  height = 300,
}) => {
  const [data, setData] = useState<Array<{ time: string; value: number }>>([]);

  const loadData = React.useCallback(() => {
    try {
      if (service) {
        // Historique service
        const history = MetricsHistory.getServiceHistory(service);
        const chartData = history.map((snapshot) => ({
          time: new Date(snapshot.timestamp).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          value: getMetricValue(snapshot, metric),
        }));
        setData(chartData);
      } else {
        // Historique global
        const history = MetricsHistory.getGlobalHistory();
        const chartData = history.map((snapshot) => ({
          time: new Date(snapshot.timestamp).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          value: metric === 'latency' ? snapshot.globalAvgLatency : snapshot.globalErrorRate * 100,
        }));
        setData(chartData);
      }
    } catch (error) {
      console.error('Erreur chargement chart data:', error);
    }
  }, [service, metric]);

  useEffect(() => {
    loadData();

    if (autoRefresh) {
      const interval = setInterval(loadData, refreshInterval);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [loadData, autoRefresh, refreshInterval]);

  const getMetricValue = (snapshot: MetricsSnapshot, metricType: string): number => {
    switch (metricType) {
      case 'latency':
        return snapshot.avgLatency;
      case 'errorRate':
        return snapshot.errorRate * 100;
      case 'successRate':
        return snapshot.successRate * 100;
      case 'retryRate':
        return snapshot.retryRate * 100;
      default:
        return 0;
    }
  };

  const metricConfig = {
    latency: {
      title: 'Latence Moyenne',
      unit: 'ms',
      color: '#3b82f6',
      icon: Activity,
    },
    errorRate: {
      title: "Taux d'Erreurs",
      unit: '%',
      color: '#ef4444',
      icon: TrendingUp,
    },
    successRate: {
      title: 'Taux de Succès',
      unit: '%',
      color: '#10b981',
      icon: TrendingUp,
    },
    retryRate: {
      title: 'Taux de Retries',
      unit: '%',
      color: '#f59e0b',
      icon: TrendingUp,
    },
  };

  const config = metricConfig[metric];
  const Icon = config.icon;

  const formatYAxis = (value: number) => {
    if (metric === 'latency') {
      return value < 1000 ? `${value}ms` : `${(value / 1000).toFixed(1)}s`;
    }
    return `${value.toFixed(0)}%`;
  };

  return (
    <div className={`bg-gray-900 border border-gray-700 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5" style={{ color: config.color }} />
          <h3 className="text-lg font-semibold text-white">
            {config.title}
            {service && ` - ${service.charAt(0).toUpperCase() + service.slice(1)}`}
          </h3>
          <span className="text-sm text-gray-400">({data.length} points)</span>
        </div>
      </div>

      {/* Chart */}
      <div className="p-4">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="time"
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                tickFormatter={formatYAxis}
                tickMargin={10}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                  color: '#fff',
                }}
                labelStyle={{ color: '#9ca3af' }}
                formatter={(value: number) => [
                  metric === 'latency'
                    ? value < 1000
                      ? `${value.toFixed(0)}ms`
                      : `${(value / 1000).toFixed(2)}s`
                    : `${value.toFixed(1)}%`,
                  config.title,
                ]}
              />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
                formatter={() => config.title}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={config.color}
                strokeWidth={2}
                dot={{ r: 3, fill: config.color }}
                activeDot={{ r: 5 }}
                name={config.title}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div
            className="flex items-center justify-center text-gray-400"
            style={{ height: `${height}px` }}
          >
            Aucune donnée historique disponible
          </div>
        )}
      </div>
    </div>
  );
};
