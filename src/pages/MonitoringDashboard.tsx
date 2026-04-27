/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v30.0.0 - Monitoring Dashboard Page
 * Page complète de monitoring avec refresh automatique
 * ═══════════════════════════════════════════════════════════════
 */

import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { GlobalMetricsSummary } from '../components/monitoring/GlobalMetricsSummary';
import { ServiceMetricsPanel } from '../components/monitoring/ServiceMetricsPanel';
import { CommandStatsTable } from '../components/monitoring/CommandStatsTable';
import { Download, RefreshCw, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { ServiceMetrics } from '../lib/serviceMetrics';
import {
  getProjectHealthMetrics,
  type ProjectHealthMetrics,
} from '../services/monitoring';
import { dispatchToAgents, type AgentConsensus } from '../services/orchestrator';

// ── Project Health Metrics Card (Phase B2 + B1 — 2026-04-27) ─
const PROJECT_HEALTH_TTL_MS = 15 * 60 * 1000; // 15 min — matches service TTL

const ProjectHealthCard: React.FC = () => {
  const [metrics, setMetrics] = useState<ProjectHealthMetrics | null>(null);
  const [consensus, setConsensus] = useState<AgentConsensus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [m, c] = await Promise.allSettled([
        getProjectHealthMetrics(),
        dispatchToAgents({
          type: 'health_check',
          source: 'monitoring_dashboard',
          payload: null,
          timestamp: Date.now(),
        }),
      ]);
      if (m.status === 'fulfilled') setMetrics(m.value);
      else setError(String(m.reason));
      if (c.status === 'fulfilled') setConsensus(c.value);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    intervalRef.current = setInterval(() => void refresh(), PROJECT_HEALTH_TTL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refresh]);

  const verdictColor = (v: string) => {
    if (v === 'PASS') return 'text-green-400';
    if (v === 'FAIL') return 'text-red-400';
    if (v === 'BLOCKED') return 'text-yellow-400';
    return 'text-gray-400';
  };
  const VerdictIcon =
    consensus?.aggregated === 'PASS'
      ? CheckCircle
      : consensus?.aggregated === 'FAIL'
        ? AlertTriangle
        : Activity;

  return (
    <div
      data-testid="project-health-metrics"
      className="bg-gray-800 rounded-xl p-5 border border-gray-700"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          Santé Cross-Session
        </h2>
        <button
          onClick={() => void refresh()}
          disabled={loading}
          className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors disabled:opacity-40"
          title="Rafraîchir les métriques"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

      {metrics && (
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-900 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Récurrence incidents</p>
            <p className="text-xl font-bold text-white">
              {(metrics.incidentRecurrenceRate * 100).toFixed(1)}
              <span className="text-sm font-normal text-gray-400">%</span>
            </p>
          </div>
          <div className="bg-gray-900 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Ring le plus impacté</p>
            <p className="text-xl font-bold text-blue-300">{metrics.mostImpactedRing}</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Lead time moyen</p>
            <p className="text-xl font-bold text-white">
              {metrics.avgLeadTimeMinutes.toFixed(0)}
              <span className="text-sm font-normal text-gray-400"> min</span>
            </p>
          </div>
        </div>
      )}

      {consensus && (
        <div className="flex items-center gap-3 bg-gray-900 rounded-lg p-3">
          <VerdictIcon
            className={`w-5 h-5 flex-shrink-0 ${verdictColor(consensus.aggregated)}`}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-300">
              Consensus agents :{' '}
              <span className={`font-bold ${verdictColor(consensus.aggregated)}`}>
                {consensus.aggregated}
              </span>
            </p>
            {consensus.blockers.length > 0 && (
              <p className="text-xs text-yellow-400 mt-0.5 truncate">
                {consensus.blockers.join(' · ')}
              </p>
            )}
          </div>
        </div>
      )}

      {loading && !metrics && (
        <div className="flex items-center justify-center py-6">
          <Activity className="w-6 h-6 text-blue-400 animate-pulse" />
        </div>
      )}

      {metrics && (
        <p className="text-xs text-gray-600 mt-3">
          {metrics.evidenceNote} · Calculé à{' '}
          {new Date(metrics.computedAt).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
};

export const MonitoringDashboard: React.FC = memo(() => {
  const [isExporting, setIsExporting] = React.useState(false);

  // Export métriques JSON
  const handleExportJSON = useCallback(() => {
    setIsExporting(true);
    try {
      const metrics = ServiceMetrics.export();
      const json = JSON.stringify(metrics, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `titane-metrics-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur export JSON:', error);
    } finally {
      setIsExporting(false);
    }
  }, []);

  // Export métriques CSV
  const handleExportCSV = useCallback(() => {
    setIsExporting(true);
    try {
      const metrics = ServiceMetrics.export();

      // Construire CSV
      const headers = [
        'Command',
        'Service',
        'Success',
        'Duration',
        'Retries',
        'Timestamp',
      ];
      const rows = metrics.map(m => [
        m.command,
        m.service,
        m.success ? 'true' : 'false',
        m.duration?.toString() || '',
        (m.retries ?? 0).toString(),
        new Date(m.startTime ?? m.timestamp).toISOString(),
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `titane-metrics-${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur export CSV:', error);
    } finally {
      setIsExporting(false);
    }
  }, []);

  // Clear métriques
  const handleClearMetrics = useCallback(() => {
    if (window.confirm('Effacer toutes les métriques ? Cette action est irréversible.')) {
      ServiceMetrics.clear();
      window.location.reload();
    }
  }, []);

  return (
    <div data-testid="monitoring-dashboard-page" className="bg-gray-900 p-6">
      <div className="max-w-450 mx-auto space-y-6">
        {/* Project Health Metrics — Phase B2/B1 surface */}
        <ProjectHealthCard />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Monitoring Dashboard</h1>
            <p className="text-gray-400">
              Métriques de performance en temps réel - Refresh auto toutes les 5s
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportJSON}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Export JSON
            </button>

            <button
              onClick={handleExportCSV}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>

            <button
              onClick={handleClearMetrics}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Clear
            </button>
          </div>
        </div>

        {/* Global Summary */}
        <GlobalMetricsSummary autoRefresh refreshInterval={5000} />

        {/* Services Grid */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Services Monitoring</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <ServiceMetricsPanel service="memory" autoRefresh refreshInterval={5000} />
            <ServiceMetricsPanel service="chat" autoRefresh refreshInterval={5000} />
            <ServiceMetricsPanel service="voice" autoRefresh refreshInterval={5000} />
            <ServiceMetricsPanel service="persona" autoRefresh refreshInterval={5000} />
            <ServiceMetricsPanel service="system" autoRefresh refreshInterval={5000} />
            <ServiceMetricsPanel service="evolution" autoRefresh refreshInterval={5000} />
          </div>
        </div>

        {/* Command Stats Tables */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <CommandStatsTable
            mode="volume"
            limit={10}
            autoRefresh
            refreshInterval={5000}
          />
          <CommandStatsTable
            mode="latency"
            limit={10}
            autoRefresh
            refreshInterval={5000}
          />
          <CommandStatsTable
            mode="errors"
            limit={10}
            autoRefresh
            refreshInterval={5000}
          />
        </div>
      </div>
    </div>
  );
});
MonitoringDashboard.displayName = 'MonitoringDashboard';

export default MonitoringDashboard;
