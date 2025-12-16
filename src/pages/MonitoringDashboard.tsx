/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v15 - Monitoring Dashboard Page
 * Page complète de monitoring avec refresh automatique
 * ═══════════════════════════════════════════════════════════════
 */

import React from 'react';
import { GlobalMetricsSummary } from '../components/monitoring/GlobalMetricsSummary';
import { ServiceMetricsPanel } from '../components/monitoring/ServiceMetricsPanel';
import { CommandStatsTable } from '../components/monitoring/CommandStatsTable';
import { Download, RefreshCw } from 'lucide-react';
import { ServiceMetrics } from '../lib/serviceMetrics';

export const MonitoringDashboard: React.FC = () => {
  const [isExporting, setIsExporting] = React.useState(false);

  // Export métriques JSON
  const handleExportJSON = () => {
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
  };

  // Export métriques CSV
  const handleExportCSV = () => {
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
  };

  // Clear métriques
  const handleClearMetrics = () => {
    if (window.confirm('Effacer toutes les métriques ? Cette action est irréversible.')) {
      ServiceMetrics.clear();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
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
};

export default MonitoringDashboard;
