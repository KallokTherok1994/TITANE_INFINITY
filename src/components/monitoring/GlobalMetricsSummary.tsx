/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v15 - Global Metrics Summary Component
 * Vue d'ensemble des métriques globales système
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useEffect, useState } from 'react';
import { logger } from '@/lib/logger';
import { ServiceMetrics } from '../../lib/serviceMetrics';
import { MetricsCard } from './MetricsCard';
import { BarChart3, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';

export interface GlobalMetricsSummaryProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
  className?: string;
}

export const GlobalMetricsSummary: React.FC<GlobalMetricsSummaryProps> = ({
  autoRefresh = true,
  refreshInterval = 5000,
  className = '',
}) => {
  const [stats, setStats] = useState<ReturnType<
    typeof ServiceMetrics.getGlobalStats
  > | null>(null);

  // Charger stats globales
  const loadStats = React.useCallback(() => {
    try {
      const globalStats = ServiceMetrics.getGlobalStats();
      setStats(globalStats);
    } catch (error) {
      logger.error(
        'Failed to load global stats',
        { component: 'GlobalMetricsSummary', action: 'loadStats' },
        error as Error
      );
    }
  }, []);

  // Auto-refresh
  useEffect(() => {
    loadStats();

    if (autoRefresh) {
      const interval = setInterval(loadStats, refreshInterval);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [loadStats, autoRefresh, refreshInterval]);

  if (!stats) {
    return (
      <div
        className={`rounded-lg border border-gray-700 bg-gray-800/50 p-6 ${className}`}
      >
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border border-gray-700 bg-gray-800/50 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Métriques Globales</h2>
        </div>

        {/* Badge System Status */}
        <div
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            stats.globalErrorRate < 0.05
              ? 'bg-green-500/20 text-green-400'
              : stats.globalErrorRate < 0.15
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-red-500/20 text-red-400'
          }`}
        >
          {stats.globalErrorRate < 0.05
            ? '✓ Système Healthy'
            : stats.globalErrorRate < 0.15
              ? '⚠ Attention Requise'
              : '🔴 Situation Critique'}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Metrics */}
        <MetricsCard
          title="Total Métriques"
          value={stats.totalMetrics}
          format="number"
          className="col-span-1"
        />

        {/* Services Actifs */}
        <MetricsCard
          title="Services Actifs"
          value={stats.services.length}
          format="number"
          className="col-span-1"
        />

        {/* Global Error Rate */}
        <MetricsCard
          title="Taux Erreurs Global"
          value={stats.globalErrorRate}
          format="percentage"
          thresholds={{ warning: 0.05, critical: 0.15 }}
          className="col-span-1"
        />

        {/* Global Avg Latency */}
        <MetricsCard
          title="Latence Moyenne Globale"
          value={stats.globalAvgLatency}
          format="duration"
          thresholds={{ warning: 1000, critical: 3000 }}
          className="col-span-1"
        />

        {/* Total Retries */}
        <MetricsCard
          title="Retries Total"
          value={stats.totalRetries}
          format="number"
          className="col-span-1"
        />
      </div>

      {/* Services List */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Services Monitorés</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {stats.services.map(service => {
            const serviceStats = ServiceMetrics.getServiceStats(service);
            const isHealthy = serviceStats.errorRate < 0.1;

            return (
              <div
                key={service}
                className={`
                  rounded-lg border p-3 transition-all
                  ${
                    isHealthy
                      ? 'border-green-500/30 bg-green-500/10'
                      : 'border-red-500/30 bg-red-500/10'
                  }
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white capitalize">
                    {service}
                  </span>
                  {isHealthy ? (
                    <span className="text-green-400 text-xs">✓</span>
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  )}
                </div>

                <div className="space-y-1 text-xs text-gray-400">
                  <div className="flex justify-between">
                    <span>Appels:</span>
                    <span className="font-medium text-white">
                      {serviceStats.totalCalls}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Erreurs:</span>
                    <span
                      className={`font-medium ${
                        serviceStats.errorRate < 0.1 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {(serviceStats.errorRate * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Health Summary */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Health Score */}
          <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-medium text-gray-400">Score Santé</span>
            </div>
            <div className="text-2xl font-bold text-blue-400">
              {Math.round((1 - stats.globalErrorRate) * 100)}%
            </div>
          </div>

          {/* Retry Rate */}
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-medium text-gray-400">Taux Retry</span>
            </div>
            <div className="text-2xl font-bold text-yellow-400">
              {stats.totalMetrics > 0
                ? ((stats.totalRetries / stats.totalMetrics) * 100).toFixed(1)
                : '0.0'}
              %
            </div>
          </div>

          {/* Critical Issues */}
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-sm font-medium text-gray-400">
                Services Critiques
              </span>
            </div>
            <div className="text-2xl font-bold text-red-400">
              {
                stats.services.filter(s => {
                  const serviceStats = ServiceMetrics.getServiceStats(s);
                  return serviceStats.errorRate > 0.3;
                }).length
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalMetricsSummary;
