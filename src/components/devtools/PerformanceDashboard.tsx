/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v26.2.0 — PERFORMANCE DASHBOARD
 * Real-time performance metrics visualization
 * P1 Implementation - 2026-01-07
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import { performanceMonitor, MetricCategory, type MetricStats } from '@/services/ai/performanceMonitor';

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

  // Refresh dashboard data
  const refreshData = () => {
    const summary = performanceMonitor.getDashboardSummary();
    const detailed = performanceMonitor.getDetailedReport();

    setDashboardData(summary);
    setDetailedMetrics(detailed);
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
        <h2 className="text-2xl font-bold">⚡ Performance Dashboard</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
            className={`px-4 py-2 rounded ${
              isAutoRefresh ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {isAutoRefresh ? '⏸ Pause' : '▶ Resume'}
          </button>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            🔄 Refresh
          </button>
          <button
            onClick={() => performanceMonitor.clearAll()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
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
                  <tr key={name} className="border-b border-gray-700/50 hover:bg-gray-750">
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
                    <td className="text-right py-2 px-3 text-green-400">{formatLatency(stats.min)}</td>
                    <td className="text-right py-2 px-3 text-red-400">{formatLatency(stats.max)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* No Data Message */}
      {Object.keys(dashboardData).length === 0 && Object.keys(detailedMetrics).length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">No performance data yet.</p>
          <p className="text-sm mt-2">Metrics will appear as you use the application.</p>
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
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
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
