/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v15 - Service Metrics Panel Component
 * Panel affichant métriques d'un service spécifique
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useEffect, useState } from 'react';
import { ServiceMetrics } from '../../lib/serviceMetrics';
import { MetricsCard } from './MetricsCard';
import { Activity, CheckCircle, XCircle, RefreshCw, Database } from 'lucide-react';

export interface ServiceMetricsPanelProps {
  service: 'memory' | 'chat' | 'voice' | 'persona' | 'system' | 'evolution';
  autoRefresh?: boolean;
  refreshInterval?: number; // ms
  className?: string;
}

export const ServiceMetricsPanel: React.FC<ServiceMetricsPanelProps> = ({
  service,
  autoRefresh = true,
  refreshInterval = 5000,
  className = '',
}) => {
  const [stats, setStats] = useState<ReturnType<
    typeof ServiceMetrics.getServiceStats
  > | null>(null);

  // Charger stats
  const loadStats = React.useCallback(() => {
    try {
      const serviceStats = ServiceMetrics.getServiceStats(service);
      setStats(serviceStats);
    } catch (error) {
      console.error(`Erreur chargement stats ${service}:`, error);
    }
  }, [service]);

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

  // Calculer success rate
  const successRate = stats.totalCalls > 0 ? stats.successfulCalls / stats.totalCalls : 0;

  // Nom service capitalisé
  const serviceName = service.charAt(0).toUpperCase() + service.slice(1);

  // Icône service
  const ServiceIcon = {
    memory: Database,
    chat: Activity,
    voice: Activity,
    persona: Activity,
    system: Activity,
    evolution: Activity,
  }[service];

  return (
    <div className={`rounded-lg border border-gray-700 bg-gray-800/50 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ServiceIcon className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-bold text-white">{serviceName}</h3>
        </div>

        {/* Badge status */}
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            stats.errorRate < 0.1
              ? 'bg-green-500/20 text-green-400'
              : stats.errorRate < 0.3
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-red-500/20 text-red-400'
          }`}
        >
          {stats.errorRate < 0.1
            ? 'Healthy'
            : stats.errorRate < 0.3
              ? 'Warning'
              : 'Critical'}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Total Calls */}
        <MetricsCard
          title="Total Appels"
          value={stats.totalCalls}
          format="number"
          className="col-span-1"
        />

        {/* Success Rate */}
        <MetricsCard
          title="Taux Succès"
          value={successRate}
          format="percentage"
          thresholds={{ warning: 0.9, critical: 0.8 }}
          className="col-span-1"
        />

        {/* Average Latency */}
        <MetricsCard
          title="Latence Moy."
          value={stats.averageLatency}
          format="duration"
          thresholds={{ warning: 1000, critical: 5000 }}
          className="col-span-1"
        />

        {/* Error Rate */}
        <MetricsCard
          title="Taux Erreurs"
          value={stats.errorRate}
          format="percentage"
          thresholds={{ warning: 0.1, critical: 0.3 }}
          className="col-span-1"
        />

        {/* Retry Rate */}
        <MetricsCard
          title="Taux Retry"
          value={stats.totalRetries / stats.totalCalls || 0}
          format="percentage"
          thresholds={{ warning: 0.3, critical: 0.5 }}
          className="col-span-1"
        />

        {/* P95 Latency */}
        <MetricsCard
          title="P95 Latency"
          value={stats.p95Latency}
          format="duration"
          thresholds={{ warning: 2000, critical: 10000 }}
          className="col-span-1"
        />
      </div>

      {/* Stats détaillées */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-sm">
          {/* Successful Calls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-400">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Succès</span>
            </div>
            <span className="font-medium text-green-400">{stats.successfulCalls}</span>
          </div>

          {/* Failed Calls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-400">
              <XCircle className="w-4 h-4 text-red-500" />
              <span>Échecs</span>
            </div>
            <span className="font-medium text-red-400">{stats.failedCalls}</span>
          </div>

          {/* Total Retries */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-400">
              <RefreshCw className="w-4 h-4 text-yellow-500" />
              <span>Retries</span>
            </div>
            <span className="font-medium text-yellow-400">{stats.totalRetries}</span>
          </div>

          {/* P99 Latency */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-400">
              <Activity className="w-4 h-4 text-purple-500" />
              <span>P99 Latency</span>
            </div>
            <span className="font-medium text-purple-400">
              {stats.p99Latency.toFixed(0)}ms
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceMetricsPanel;
