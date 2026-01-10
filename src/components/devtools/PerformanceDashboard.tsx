/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v26.2.0 — PERFORMANCE DASHBOARD
 * Real-time performance metrics visualization
 * P1 Implementation - 2026-01-07
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import {
  performanceMonitor,
  MetricCategory,
  type MetricStats,
} from '@/services/ai/performanceMonitor';
import {
  performanceAlerts,
  AlertSeverity,
  type PerformanceAlert,
} from '@/services/ai/performanceAlerts';

interface DashboardData {
  aiGeneration?: {
    avgLatency: number;
    p95Latency: number;
    totalRequests: number;
    minLatency: number;
    maxLatency: number;
  };
  contextManagement?: {
    truncationEvents: number;
    avgTokensRemoved: number;
    totalTokensSaved: number;
  };
  memoryOperations?: {
    avgLatency: number;
    p95Latency: number;
    totalOps: number;
  };
  ipcCalls?: {
    avgLatency: number;
    p95Latency: number;
    totalCalls: number;
  };
}

export function PerformanceDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({});
  const [detailedMetrics, setDetailedMetrics] = useState<Record<string, MetricStats>>({});
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 seconds
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [healthStatus, setHealthStatus] = useState<{
    status: 'healthy' | 'warning' | 'critical';
    reasons: string[];
    score: number;
  } | null>(null);
  const [showSlowOps, setShowSlowOps] = useState(false);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(false);

  // Refresh dashboard data
  const refreshData = () => {
    const summary = performanceMonitor.getDashboardSummary();
    const detailed = performanceMonitor.getDetailedReport();
    const health = performanceMonitor.getHealthStatus();
    const recentAlerts = performanceAlerts.getAlerts(20);

    setDashboardData(summary);
    setDetailedMetrics(detailed);
    setHealthStatus(health);
    setAlerts(recentAlerts);
  };

  // Export functions
  const handleExportJSON = () => {
    performanceMonitor.downloadMetrics('json');
  };

  const handleExportCSV = () => {
    performanceMonitor.downloadMetrics('csv');
  };

  // Alert management
  const toggleAlerts = () => {
    if (alertsEnabled) {
      performanceAlerts.stop();
      setAlertsEnabled(false);
    } else {
      performanceAlerts.start(60000); // Check every 60s
      setAlertsEnabled(true);
    }
  };

  const clearAllAlerts = () => {
    performanceAlerts.clearAlerts();
    setAlerts([]);
  };

  // Auto-refresh effect
  useEffect(() => {
    if (!isAutoRefresh) return;

    refreshData();
    const interval = setInterval(refreshData, refreshInterval);

    return () => clearInterval(interval);
  }, [isAutoRefresh, refreshInterval]);

  // Format number with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
  };

  // Format latency in ms
  const formatLatency = (ms: number): string => {
    if (ms < 1) return `${(ms * 1000).toFixed(0)}μs`;
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // Get latency color based on value
  const getLatencyColor = (ms: number): string => {
    if (ms < 100) return 'text-green-400';
    if (ms < 500) return 'text-yellow-400';
    if (ms < 1000) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="performance-dashboard p-6 bg-gray-900 text-white rounded-lg space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-700 pb-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">⚡ Performance Dashboard</h2>
          {healthStatus && (
            <div
              className={`px-3 py-1 rounded text-sm font-semibold ${
                healthStatus.status === 'healthy'
                  ? 'bg-green-600'
                  : healthStatus.status === 'warning'
                    ? 'bg-yellow-600'
                    : 'bg-red-600'
              }`}
            >
              {healthStatus.status === 'healthy'
                ? '✓ Healthy'
                : healthStatus.status === 'warning'
                  ? '⚠ Warning'
                  : '✗ Critical'}{' '}
              ({healthStatus.score.toFixed(0)}%)
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
            className={`px-3 py-2 rounded text-sm ${
              isAutoRefresh
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {isAutoRefresh ? '⏸ Pause' : '▶ Resume'}
          </button>
          <button
            onClick={refreshData}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
          >
            🔄 Refresh
          </button>
          <button
            onClick={handleExportJSON}
            className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm"
            title="Export metrics as JSON"
          >
            📥 JSON
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm"
            title="Export metrics as CSV"
          >
            📥 CSV
          </button>
          <button
            onClick={() => performanceMonitor.clearAll()}
            className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm"
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      {/* AI Generation Metrics */}
      {dashboardData.aiGeneration && (
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">🤖 AI Generation</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <MetricCard
              label="Avg Latency"
              value={formatLatency(dashboardData.aiGeneration.avgLatency)}
              color={getLatencyColor(dashboardData.aiGeneration.avgLatency)}
            />
            <MetricCard
              label="P95 Latency"
              value={formatLatency(dashboardData.aiGeneration.p95Latency)}
              color={getLatencyColor(dashboardData.aiGeneration.p95Latency)}
            />
            <MetricCard
              label="Total Requests"
              value={formatNumber(dashboardData.aiGeneration.totalRequests)}
              color="text-blue-400"
            />
            <MetricCard
              label="Min Latency"
              value={formatLatency(dashboardData.aiGeneration.minLatency)}
              color="text-green-400"
            />
            <MetricCard
              label="Max Latency"
              value={formatLatency(dashboardData.aiGeneration.maxLatency)}
              color="text-red-400"
            />
          </div>
        </div>
      )}

      {/* Context Management Metrics */}
      {dashboardData.contextManagement && (
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">📊 Context Management</h3>
          <div className="grid grid-cols-3 gap-4">
            <MetricCard
              label="Truncation Events"
              value={formatNumber(dashboardData.contextManagement.truncationEvents)}
              color="text-yellow-400"
            />
            <MetricCard
              label="Avg Tokens Removed"
              value={formatNumber(dashboardData.contextManagement.avgTokensRemoved)}
              color="text-orange-400"
            />
            <MetricCard
              label="Total Tokens Saved"
              value={formatNumber(dashboardData.contextManagement.totalTokensSaved)}
              color="text-green-400"
            />
          </div>
        </div>
      )}

      {/* Memory Operations Metrics */}
      {dashboardData.memoryOperations && (
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">🧠 Memory Operations</h3>
          <div className="grid grid-cols-3 gap-4">
            <MetricCard
              label="Avg Latency"
              value={formatLatency(dashboardData.memoryOperations.avgLatency)}
              color={getLatencyColor(dashboardData.memoryOperations.avgLatency)}
            />
            <MetricCard
              label="P95 Latency"
              value={formatLatency(dashboardData.memoryOperations.p95Latency)}
              color={getLatencyColor(dashboardData.memoryOperations.p95Latency)}
            />
            <MetricCard
              label="Total Operations"
              value={formatNumber(dashboardData.memoryOperations.totalOps)}
              color="text-blue-400"
            />
          </div>
        </div>
      )}

      {/* IPC Calls Metrics */}
      {dashboardData.ipcCalls && (
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">🔗 IPC Calls</h3>
          <div className="grid grid-cols-3 gap-4">
            <MetricCard
              label="Avg Latency"
              value={formatLatency(dashboardData.ipcCalls.avgLatency)}
              color={getLatencyColor(dashboardData.ipcCalls.avgLatency)}
            />
            <MetricCard
              label="P95 Latency"
              value={formatLatency(dashboardData.ipcCalls.p95Latency)}
              color={getLatencyColor(dashboardData.ipcCalls.p95Latency)}
            />
            <MetricCard
              label="Total Calls"
              value={formatNumber(dashboardData.ipcCalls.totalCalls)}
              color="text-blue-400"
            />
          </div>
        </div>
      )}

      {/* Health Status Panel */}
      {healthStatus &&
        healthStatus.status !== 'healthy' &&
        healthStatus.reasons.length > 0 && (
          <div
            className={`p-4 rounded-lg ${
              healthStatus.status === 'critical'
                ? 'bg-red-900/30 border-2 border-red-600'
                : 'bg-yellow-900/30 border-2 border-yellow-600'
            }`}
          >
            <h3 className="text-lg font-semibold mb-3">
              {healthStatus.status === 'critical'
                ? '🚨 Critical Issues'
                : '⚠️ Performance Warnings'}
            </h3>
            <ul className="space-y-2">
              {healthStatus.reasons.map((reason, idx) => (
                <li key={idx} className="text-sm">
                  • {reason}
                </li>
              ))}
            </ul>
          </div>
        )}

      {/* Real-time Alerts Panel */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold">🔔 Performance Alerts</h3>
            {alerts.length > 0 && (
              <span className="px-2 py-1 bg-red-600 rounded-full text-xs font-bold">
                {alerts.length}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleAlerts}
              className={`px-3 py-1 rounded text-sm ${
                alertsEnabled
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {alertsEnabled ? '🔔 Enabled' : '🔕 Disabled'}
            </button>
            {alerts.length > 0 && (
              <button
                onClick={clearAllAlerts}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
            >
              {showAlerts ? '▼ Hide' : '▶ Show'}
            </button>
          </div>
        </div>
        {showAlerts && (
          <>
            {alerts.length === 0 ? (
              <p className="text-gray-400 text-sm">
                No alerts. System running smoothly! ✓
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {alerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded border-l-4 ${
                      alert.severity === AlertSeverity.CRITICAL
                        ? 'bg-red-900/20 border-red-600'
                        : alert.severity === AlertSeverity.WARNING
                          ? 'bg-yellow-900/20 border-yellow-600'
                          : 'bg-blue-900/20 border-blue-600'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-sm">
                        {alert.severity === AlertSeverity.CRITICAL
                          ? '🚨'
                          : alert.severity === AlertSeverity.WARNING
                            ? '⚠️'
                            : 'ℹ️'}{' '}
                        {alert.metricName}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">{alert.message}</p>
                    <div className="mt-2 text-xs text-gray-400">
                      Value: {alert.value.toFixed(2)} | Threshold:{' '}
                      {alert.threshold.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Top Slow Operations */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">🐌 Top 10 Slowest Operations</h3>
          <button
            onClick={() => setShowSlowOps(!showSlowOps)}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
          >
            {showSlowOps ? '▼ Hide' : '▶ Show'}
          </button>
        </div>
        {showSlowOps && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 px-3">Operation</th>
                  <th className="text-right py-2 px-3">Avg Latency</th>
                  <th className="text-right py-2 px-3">P95 Latency</th>
                </tr>
              </thead>
              <tbody>
                {performanceMonitor.getTopSlowest(10).map((op, idx) => (
                  <tr key={idx} className="border-b border-gray-700/50">
                    <td className="py-2 px-3 font-mono text-xs">{op.name}</td>
                    <td
                      className={`text-right py-2 px-3 ${getLatencyColor(op.avgLatency)}`}
                    >
                      {formatLatency(op.avgLatency)}
                    </td>
                    <td className={`text-right py-2 px-3 ${getLatencyColor(op.p95)}`}>
                      {formatLatency(op.p95)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detailed Metrics Table */}
      {Object.keys(detailedMetrics).length > 0 && (
        <div className="bg-gray-800 p-4 rounded-lg overflow-x-auto">
          <h3 className="text-lg font-semibold mb-3">📈 Detailed Metrics</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 px-3">Metric</th>
                <th className="text-right py-2 px-3">Count</th>
                <th className="text-right py-2 px-3">Avg</th>
                <th className="text-right py-2 px-3">P50</th>
                <th className="text-right py-2 px-3">P95</th>
                <th className="text-right py-2 px-3">P99</th>
                <th className="text-right py-2 px-3">Min</th>
                <th className="text-right py-2 px-3">Max</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(detailedMetrics)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([name, stats]) => (
                  <tr
                    key={name}
                    className="border-b border-gray-700/50 hover:bg-gray-750"
                  >
                    <td className="py-2 px-3 font-mono text-xs">{name}</td>
                    <td className="text-right py-2 px-3">{formatNumber(stats.count)}</td>
                    <td className={`text-right py-2 px-3 ${getLatencyColor(stats.avg)}`}>
                      {formatLatency(stats.avg)}
                    </td>
                    <td className="text-right py-2 px-3">{formatLatency(stats.p50)}</td>
                    <td className={`text-right py-2 px-3 ${getLatencyColor(stats.p95)}`}>
                      {formatLatency(stats.p95)}
                    </td>
                    <td className={`text-right py-2 px-3 ${getLatencyColor(stats.p99)}`}>
                      {formatLatency(stats.p99)}
                    </td>
                    <td className="text-right py-2 px-3 text-green-400">
                      {formatLatency(stats.min)}
                    </td>
                    <td className="text-right py-2 px-3 text-red-400">
                      {formatLatency(stats.max)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* No Data Message */}
      {Object.keys(dashboardData).length === 0 &&
        Object.keys(detailedMetrics).length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">No performance data yet.</p>
            <p className="text-sm mt-2">
              Metrics will appear as you use the application.
            </p>
          </div>
        )}

      {/* Settings */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">⚙️ Settings</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm">Auto-refresh interval (ms):</label>
            <select
              value={refreshInterval}
              onChange={e => setRefreshInterval(Number(e.target.value))}
              className="px-3 py-1 bg-gray-700 rounded"
            >
              <option value={1000}>1s</option>
              <option value={5000}>5s</option>
              <option value={10000}>10s</option>
              <option value={30000}>30s</option>
              <option value={60000}>1m</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
interface MetricCardProps {
  label: string;
  value: string;
  color: string;
}

function MetricCard({ label, value, color }: MetricCardProps) {
  return (
    <div className="bg-gray-700/50 p-3 rounded">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

export default PerformanceDashboard;
