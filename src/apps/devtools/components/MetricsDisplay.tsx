/**
 * TITANE∞ v22.0 — MetricsDisplay Component
 * Real-time dashboard metrics (CSS-only version, Chart.js removed)
 */

import { secureInvoke } from '@/lib/security';
import React, { useState, useEffect, useMemo } from 'react';
import './MetricsDisplay.css';

interface DashboardMetrics {
  health_score: number;
  active_cores: number;
  total_cores: number;
  cpu_usage: number;
  ram_usage_mb: number;
  total_logs: number;
  error_count: number;
  avg_latency_ms: number;
  uptime_seconds: number;
  timestamp: string;
}

interface MetricsResponse {
  success: boolean;
  data?: DashboardMetrics;
  error?: string;
}

interface TimeSeriesData {
  labels: string[];
  cpu: number[];
  ram: number[];
  latency: number[];
}

export const MetricsDisplay: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesData>({
    labels: [],
    cpu: [],
    ram: [],
    latency: [],
  });
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch metrics
  const fetchMetrics = async () => {
    try {
      const response = await secureInvoke<MetricsResponse>('get_dashboard_metrics');
      if (response.success && response.data) {
        const newMetrics = response.data;
        setMetrics(newMetrics);

        // Update time series data (keep last 60 points)
        setTimeSeries(prev => {
          const newLabels = [...prev.labels, new Date().toLocaleTimeString()].slice(-60);
          const newCpu = [...prev.cpu, newMetrics.cpu_usage].slice(-60);
          const newRam = [...prev.ram, newMetrics.ram_usage_mb].slice(-60);
          const newLatency = [...prev.latency, newMetrics.avg_latency_ms].slice(-60);

          return {
            labels: newLabels,
            cpu: newCpu,
            ram: newRam,
            latency: newLatency,
          };
        });
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  // Auto-refresh
  useEffect(() => {
    fetchMetrics();
    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 2000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Get threshold color
  const getThresholdColor = (
    value: number,
    warningThreshold: number,
    criticalThreshold: number
  ): string => {
    if (value >= criticalThreshold) return '#ef4444';
    if (value >= warningThreshold) return '#f59e0b';
    return '#10b981';
  };

  // Compute averages
  const avgCpu = useMemo(
    () =>
      timeSeries.cpu.length
        ? Math.round(timeSeries.cpu.reduce((a, b) => a + b, 0) / timeSeries.cpu.length)
        : 0,
    [timeSeries.cpu]
  );
  const avgRam = useMemo(
    () =>
      timeSeries.ram.length
        ? Math.round(timeSeries.ram.reduce((a, b) => a + b, 0) / timeSeries.ram.length)
        : 0,
    [timeSeries.ram]
  );
  const avgLatency = useMemo(
    () =>
      timeSeries.latency.length
        ? Math.round(
            timeSeries.latency.reduce((a, b) => a + b, 0) / timeSeries.latency.length
          )
        : 0,
    [timeSeries.latency]
  );

  // Format uptime
  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  return (
    <div className="metrics-display">
      {/* Controls */}
      <div className="metrics-controls">
        <label className="metrics-toggle">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={e => setAutoRefresh(e.target.checked)}
          />
          <span>Auto-refresh (2s)</span>
        </label>
        <button className="metrics-btn" onClick={fetchMetrics}>
          🔄 Refresh
        </button>
      </div>

      {metrics && (
        <>
          {/* KPI Cards */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon">❤️</div>
              <div
                className="metric-value"
                style={{ color: getThresholdColor(metrics.health_score * 100, 70, 50) }}
              >
                {(metrics.health_score * 100).toFixed(0)}%
              </div>
              <div className="metric-label">Health Score</div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">⚙️</div>
              <div className="metric-value">
                {metrics.active_cores}/{metrics.total_cores}
              </div>
              <div className="metric-label">Active Cores</div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">💻</div>
              <div
                className="metric-value"
                style={{ color: getThresholdColor(metrics.cpu_usage, 70, 90) }}
              >
                {metrics.cpu_usage.toFixed(1)}%
              </div>
              <div className="metric-label">CPU Usage</div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">🧠</div>
              <div
                className="metric-value"
                style={{ color: getThresholdColor(metrics.ram_usage_mb, 1024, 2048) }}
              >
                {metrics.ram_usage_mb.toFixed(0)}MB
              </div>
              <div className="metric-label">RAM Usage</div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">⏱️</div>
              <div
                className="metric-value"
                style={{ color: getThresholdColor(metrics.avg_latency_ms, 100, 200) }}
              >
                {metrics.avg_latency_ms.toFixed(0)}ms
              </div>
              <div className="metric-label">Avg Latency</div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">📋</div>
              <div className="metric-value">{metrics.total_logs}</div>
              <div className="metric-label">Total Logs</div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">❌</div>
              <div
                className="metric-value"
                style={{ color: getThresholdColor(metrics.error_count, 5, 10) }}
              >
                {metrics.error_count}
              </div>
              <div className="metric-label">Error Count</div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">⏰</div>
              <div className="metric-value">{formatUptime(metrics.uptime_seconds)}</div>
              <div className="metric-label">Uptime</div>
            </div>
          </div>

          {/* Time-Series Charts */}
          {timeSeries.labels.length > 0 && (
            <div className="metrics-charts">
              {/* CPU Usage Chart */}
              <div className="chart-container">
                <h4>CPU Usage Over Time (avg: {avgCpu}%)</h4>
                <div className="chart-wrapper css-chart">
                  {timeSeries.cpu.slice(-10).map((value, i) => (
                    <div
                      key={i}
                      className="chart-bar cpu"
                      style={{ height: `${Math.max(10, value)}%` }}
                      title={`${timeSeries.labels[timeSeries.labels.length - 10 + i]}: ${value}%`}
                    />
                  ))}
                </div>
              </div>

              {/* RAM Usage Chart */}
              <div className="chart-container">
                <h4>RAM Usage Over Time (avg: {avgRam}MB)</h4>
                <div className="chart-wrapper css-chart">
                  {timeSeries.ram.slice(-10).map((value, i) => (
                    <div
                      key={i}
                      className="chart-bar ram"
                      style={{ height: `${Math.max(10, (value / 4096) * 100)}%` }}
                      title={`${timeSeries.labels[timeSeries.labels.length - 10 + i]}: ${value}MB`}
                    />
                  ))}
                </div>
              </div>

              {/* Latency Chart */}
              <div className="chart-container">
                <h4>Latency Over Time (avg: {avgLatency}ms)</h4>
                <div className="chart-wrapper css-chart">
                  {timeSeries.latency.slice(-10).map((value, i) => (
                    <div
                      key={i}
                      className="chart-bar latency"
                      style={{ height: `${Math.max(10, (value / 200) * 100)}%` }}
                      title={`${timeSeries.labels[timeSeries.labels.length - 10 + i]}: ${value}ms`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
