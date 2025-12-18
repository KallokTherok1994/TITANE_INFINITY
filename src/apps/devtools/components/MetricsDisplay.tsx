/**
 * TITANE∞ v22.0 — MetricsDisplay Component
 * Real-time dashboard metrics with Chart.js visualization
 */

import React, { useState, useEffect, lazy, Suspense } from 'react';
import './MetricsDisplay.css';

// YOLO OPT-2: Lazy-load Chart.js (-175 KB gzip)
// Chart.js chargé uniquement quand MetricsDisplay est rendu
const LazyLineChart = lazy(() =>
  import('react-chartjs-2').then(module => ({
    default: module.Line,
  }))
);

// Lazy register Chart.js components
const registerChartJS = async () => {
  const ChartJS = await import('chart.js');
  ChartJS.Chart.register(
    ChartJS.CategoryScale,
    ChartJS.LinearScale,
    ChartJS.PointElement,
    ChartJS.LineElement,
    ChartJS.Title,
    ChartJS.Tooltip,
    ChartJS.Legend
  );
};

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
  const [chartReady, setChartReady] = useState(false);

  // YOLO OPT: Register Chart.js au montage
  useEffect(() => {
    registerChartJS().then(() => setChartReady(true));
  }, []);

  // Fetch metrics
  const fetchMetrics = async () => {
    try {
      const response = await invoke<MetricsResponse>('get_dashboard_metrics');
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

  // Chart data for CPU
  const cpuChartData = {
    labels: timeSeries.labels,
    datasets: [
      {
        label: 'CPU Usage (%)',
        data: timeSeries.cpu,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  // Chart data for RAM
  const ramChartData = {
    labels: timeSeries.labels,
    datasets: [
      {
        label: 'RAM Usage (MB)',
        data: timeSeries.ram,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  // Chart data for Latency
  const latencyChartData = {
    labels: timeSeries.labels,
    datasets: [
      {
        label: 'Latency (ms)',
        data: timeSeries.latency,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
      },
    },
  };

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
          {timeSeries.labels.length > 0 && chartReady && (
            <div className="metrics-charts">
              <Suspense
                fallback={<div className="chart-loading">Chargement graphiques...</div>}
              >
                <div className="chart-container">
                  <h4>CPU Usage Over Time</h4>
                  <div className="chart-wrapper">
                    <LazyLineChart data={cpuChartData} options={chartOptions} />
                  </div>
                </div>

                <div className="chart-container">
                  <h4>RAM Usage Over Time</h4>
                  <div className="chart-wrapper">
                    <LazyLineChart data={ramChartData} options={chartOptions} />
                  </div>
                </div>

                <div className="chart-container">
                  <h4>Latency Over Time</h4>
                  <div className="chart-wrapper">
                    <LazyLineChart data={latencyChartData} options={chartOptions} />
                  </div>
                </div>
              </Suspense>
            </div>
          )}
        </>
      )}
    </div>
  );
};
