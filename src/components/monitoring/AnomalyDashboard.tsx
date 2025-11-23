/**
 * TITANE_INFINITY v13 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v17.3.0 - Phase 6: Anomaly Dashboard Component
 * Affichage détections anomalies ML avec Z-score
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useEffect, useState } from 'react';
import { AnomalyDetector, type AnomalyDetection } from '../../lib/anomalyDetector';
import { AlertTriangle, TrendingUp, Clock, Activity } from '../icons';

export interface AnomalyDashboardProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
  limit?: number;
  minSeverity?: 'low' | 'medium' | 'high' | 'critical';
  className?: string;
}

export const AnomalyDashboard: React.FC<AnomalyDashboardProps> = ({
  autoRefresh = true,
  refreshInterval = 10000,
  limit = 30,
  minSeverity,
  className = '',
}) => {
  const [anomalies, setAnomalies] = useState<AnomalyDetection[]>([]);
  const [stats, setStats] = useState(AnomalyDetector.getAnomalyStats());

  const loadData = React.useCallback(() => {
    try {
      setAnomalies(AnomalyDetector.getAnomalies(limit, minSeverity));
      setStats(AnomalyDetector.getAnomalyStats());
    } catch (error) {
      console.error('Erreur chargement anomalies:', error);
    }
  }, [limit, minSeverity]);

  useEffect(() => {
    loadData();

    if (autoRefresh) {
      const interval = setInterval(loadData, refreshInterval);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [loadData, autoRefresh, refreshInterval]);

  // Couleurs sévérité
  const getSeverityColor = (severity: AnomalyDetection['severity']) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500',
          text: 'text-red-400',
          badge: 'bg-red-500',
        };
      case 'high':
        return {
          bg: 'bg-orange-500/10',
          border: 'border-orange-500',
          text: 'text-orange-400',
          badge: 'bg-orange-500',
        };
      case 'medium':
        return {
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500',
          text: 'text-yellow-400',
          badge: 'bg-yellow-500',
        };
      case 'low':
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500',
          text: 'text-blue-400',
          badge: 'bg-blue-500',
        };
    }
  };

  // Format métrique
  const formatMetric = (metric: string) => {
    switch (metric) {
      case 'latency':
        return 'Latence';
      case 'errorRate':
        return "Taux d'Erreurs";
      case 'retryRate':
        return 'Taux de Retries';
      default:
        return metric;
    }
  };

  // Format valeur
  const formatValue = (value: number, metric: string) => {
    if (metric === 'latency') {
      return value < 1000 ? `${value.toFixed(0)}ms` : `${(value / 1000).toFixed(2)}s`;
    }
    return `${(value * 100).toFixed(1)}%`;
  };

  // Format temps relatif
  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return `${Math.floor(diff / 1000)}s`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return `${Math.floor(diff / 86400000)}j`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4">
        {/* Total Anomalies */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-gray-400">Total Anomalies</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.last24h} dernières 24h
          </div>
        </div>

        {/* Critical */}
        <div className="bg-gray-900 border border-red-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-sm text-gray-400">Critiques</span>
          </div>
          <div className="text-2xl font-bold text-red-400">
            {stats.bySeverity.critical || 0}
          </div>
          <div className="text-xs text-red-500/60 mt-1">Z-score &gt; 3.5</div>
        </div>

        {/* High */}
        <div className="bg-gray-900 border border-orange-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-sm text-gray-400">Élevées</span>
          </div>
          <div className="text-2xl font-bold text-orange-400">
            {stats.bySeverity.high || 0}
          </div>
          <div className="text-xs text-orange-500/60 mt-1">Z-score &gt; 3.0</div>
        </div>

        {/* Medium */}
        <div className="bg-gray-900 border border-yellow-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-sm text-gray-400">Moyennes</span>
          </div>
          <div className="text-2xl font-bold text-yellow-400">
            {stats.bySeverity.medium || 0}
          </div>
          <div className="text-xs text-yellow-500/60 mt-1">Z-score &gt; 2.5</div>
        </div>
      </div>

      {/* Anomalies List */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-white">
              Anomalies Détectées
            </h3>
            <span className="text-sm text-gray-400">({anomalies.length})</span>
          </div>
        </div>

        {anomalies.length > 0 ? (
          <div className="divide-y divide-gray-800">
            {anomalies.map((anomaly, index) => {
              const colors = getSeverityColor(anomaly.severity);
              return (
                <div
                  key={index}
                  className={`p-4 hover:bg-gray-800/50 transition-colors ${colors.bg} border-l-4 ${colors.border}`}
                >
                  <div className="flex items-start justify-between">
                    {/* Left: Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {/* Severity Badge */}
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold text-white ${colors.badge}`}
                        >
                          {anomaly.severity.toUpperCase()}
                        </span>

                        {/* Service */}
                        <span className="text-sm font-mono text-gray-300">
                          {anomaly.service}
                        </span>

                        {/* Metric */}
                        <span className="text-sm text-gray-400">
                          {formatMetric(anomaly.metric)}
                        </span>

                        {/* Time */}
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(anomaly.timestamp)}
                        </span>
                      </div>

                      {/* Values */}
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Valeur:</span>
                          <span className={`ml-2 font-semibold ${colors.text}`}>
                            {formatValue(anomaly.value, anomaly.metric)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Baseline:</span>
                          <span className="ml-2 text-gray-300">
                            {formatValue(anomaly.baseline, anomaly.metric)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Z-score:</span>
                          <span className={`ml-2 font-semibold ${colors.text}`}>
                            {anomaly.zScore.toFixed(2)}σ
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Confiance:</span>
                          <span className="ml-2 text-gray-300">
                            {(anomaly.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      {/* Deviation */}
                      <div className="mt-2 text-xs text-gray-400">
                        Déviation:{' '}
                        <span className={colors.text}>
                          {anomaly.value > anomaly.baseline ? '+' : ''}
                          {(
                            ((anomaly.value - anomaly.baseline) / anomaly.baseline) *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                        {' '}de la moyenne
                      </div>
                    </div>

                    {/* Right: Icon */}
                    <div className="ml-4">
                      <TrendingUp className={`w-6 h-6 ${colors.text}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-400">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Aucune anomalie détectée</p>
            <p className="text-sm text-gray-500 mt-2">
              Le système surveille les déviations Z-score &gt; 2.0
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
