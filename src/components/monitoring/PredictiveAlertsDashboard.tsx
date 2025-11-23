/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v17.3.0 - Phase 7: Predictive Alerts Dashboard
 * UI pour alertes prédictives
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useEffect, useState } from 'react';
import { PredictiveAlerts, PredictiveAlert } from '../../lib/predictiveAlerts';
import { Activity, AlertTriangle, TrendingUp, Clock } from '../icons';

interface PredictiveAlertsDashboardProps {
  limit?: number;
  minSeverity?: PredictiveAlert['severity'];
  refreshInterval?: number;
}

export const PredictiveAlertsDashboard: React.FC<PredictiveAlertsDashboardProps> = ({
  limit = 20,
  minSeverity,
  refreshInterval = 5000,
}) => {
  const [alerts, setAlerts] = useState<PredictiveAlert[]>([]);
  const [stats, setStats] = useState(PredictiveAlerts.getAlertStats());

  useEffect(() => {
    const updateAlerts = () => {
      const allAlerts = PredictiveAlerts.getAlerts(minSeverity);
      setAlerts(allAlerts.slice(0, limit));
      setStats(PredictiveAlerts.getAlertStats());
    };

    updateAlerts();
    const interval = setInterval(updateAlerts, refreshInterval);
    return () => clearInterval(interval);
  }, [limit, minSeverity, refreshInterval]);

  const getSeverityColor = (severity: PredictiveAlert['severity']): string => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getSeverityIcon = (severity: PredictiveAlert['severity']) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="w-5 h-5" />;
      case 'medium':
        return <TrendingUp className="w-5 h-5" />;
      case 'low':
        return <Activity className="w-5 h-5" />;
    }
  };

  const formatMetric = (metric: string): string => {
    switch (metric) {
      case 'latency':
        return 'Latence';
      case 'errorRate':
        return 'Taux d\'erreur';
      case 'retryRate':
        return 'Taux de retry';
      default:
        return metric;
    }
  };

  const formatValue = (metric: string, value: number): string => {
    switch (metric) {
      case 'latency':
        return value >= 1000 ? `${(value / 1000).toFixed(2)}s` : `${value.toFixed(0)}ms`;
      case 'errorRate':
      case 'retryRate':
        return `${value.toFixed(1)}%`;
      default:
        return value.toFixed(2);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">Total Alertes</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>

        <div className="bg-red-50 rounded-lg border-2 border-red-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-red-600">Critique</span>
          </div>
          <div className="text-2xl font-bold text-red-900">{stats.bySeverity.critical}</div>
        </div>

        <div className="bg-orange-50 rounded-lg border-2 border-orange-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-600">Haute</span>
          </div>
          <div className="text-2xl font-bold text-orange-900">{stats.bySeverity.high}</div>
        </div>

        <div className="bg-yellow-50 rounded-lg border-2 border-yellow-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-600">Moyenne</span>
          </div>
          <div className="text-2xl font-bold text-yellow-900">{stats.bySeverity.medium}</div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Alertes Prédictives ({alerts.length})
        </h3>

        {alerts.length === 0 ? (
          <div className="bg-green-50 rounded-lg border-2 border-green-200 p-8 text-center">
            <Activity className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <p className="text-green-800 font-medium">Aucune alerte prédictive</p>
            <p className="text-green-600 text-sm mt-1">
              Toutes les métriques sont dans les limites prévues
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-lg border-2 p-4 ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between">
                  {/* Left: Alert Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getSeverityIcon(alert.severity)}
                      <span className="inline-block px-2 py-1 bg-white/50 rounded text-xs font-semibold">
                        {alert.service.toUpperCase()}
                      </span>
                      <span className="text-sm font-medium">{formatMetric(alert.metric)}</span>
                    </div>

                    <p className="text-sm font-medium mb-2">{alert.message}</p>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <div>
                        <span className="opacity-75">Valeur actuelle:</span>{' '}
                        <span className="font-semibold">
                          {formatValue(alert.metric, alert.currentValue)}
                        </span>
                      </div>
                      <div>
                        <span className="opacity-75">Valeur prédite:</span>{' '}
                        <span className="font-semibold">
                          {formatValue(alert.metric, alert.predictedValue)}
                        </span>
                      </div>
                      <div>
                        <span className="opacity-75">Seuil:</span>{' '}
                        <span className="font-semibold">
                          {formatValue(alert.metric, alert.threshold)}
                        </span>
                      </div>
                      <div>
                        <span className="opacity-75">Confiance:</span>{' '}
                        <span className="font-semibold">{(alert.confidence * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Time Badge */}
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <div className="flex items-center gap-1 bg-white/60 px-3 py-1 rounded-full">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-semibold">{alert.timeToThreshold}min</span>
                    </div>
                    <span className="text-xs opacity-75 uppercase font-semibold">
                      {alert.severity}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Metrics Distribution */}
      {stats.total > 0 && (
        <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Distribution par métrique</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{stats.byMetric.latency}</div>
              <div className="text-xs text-gray-600 mt-1">Latence</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{stats.byMetric.errorRate}</div>
              <div className="text-xs text-gray-600 mt-1">Taux d'erreur</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{stats.byMetric.retryRate}</div>
              <div className="text-xs text-gray-600 mt-1">Taux de retry</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

PredictiveAlertsDashboard.displayName = 'PredictiveAlertsDashboard';
