/**
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║   TITANE∞ v20.0 — Metrics Panel                                   ║
 * ║   Display system and engine performance metrics                    ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 */

import React from 'react';
import { useMetrics } from '../hooks/useMetrics';
import { BarChart } from '../components/Chart';
import './MetricsPanel.css';

export const MetricsPanel: React.FC = () => {
  const { metrics, loading, error } = useMetrics();

  if (loading) return <div className="panel-loading">Loading metrics...</div>;
  if (error) return <div className="panel-error">Error: {error}</div>;
  if (!metrics) return null;

  const { system, engines, omega_latency_ms, asr_latency_ms, tts_latency_ms } = metrics;

  return (
    <div className="metrics-panel">
      <div className="panel-header">
        <h2 className="panel-title">📊 Performance Metrics</h2>
        <div className="panel-actions">
          <span className="last-updated">
            Updated: {new Date(system.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* System Metrics */}
      <div className="card">
        <h3>💻 System Health</h3>
        <div className="metrics-grid">
          <div className="metric-item">
            <span className="metric-label">CPU Usage</span>
            <div className="metric-value-container">
              <span className="metric-value">{system.cpu_usage.toFixed(1)}%</span>
              <div className="metric-bar">
                <div
                  className="metric-bar-fill"
                  style={{
                    width: `${system.cpu_usage}%`,
                    backgroundColor: system.cpu_usage > 80 ? '#c73838' : '#0e639c',
                  }}
                />
              </div>
            </div>
          </div>

          <div className="metric-item">
            <span className="metric-label">Memory Usage</span>
            <div className="metric-value-container">
              <span className="metric-value">
                {(system.memory_usage / 1024).toFixed(1)} MB / {(system.memory_total / 1024).toFixed(0)} MB
              </span>
              <div className="metric-bar">
                <div
                  className="metric-bar-fill"
                  style={{
                    width: `${(system.memory_usage / system.memory_total) * 100}%`,
                    backgroundColor:
                      system.memory_usage / system.memory_total > 0.8 ? '#c73838' : '#0e639c',
                  }}
                />
              </div>
            </div>
          </div>

          <div className="metric-item">
            <span className="metric-label">Uptime</span>
            <span className="metric-value">{formatUptime(system.uptime_seconds)}</span>
          </div>

          <div className="metric-item">
            <span className="metric-label">Process Count</span>
            <span className="metric-value">{system.process_count}</span>
          </div>
        </div>
      </div>

      {/* OMEGA Latency */}
      <div className="card">
        <h3>🔀 OMEGA Pipeline Latency</h3>
        <div className="latency-highlight">
          <span className="latency-value">{omega_latency_ms}ms</span>
          <span className="latency-label">Total Pipeline Time</span>
        </div>
      </div>

      {/* Voice Latency */}
      {(asr_latency_ms || tts_latency_ms) && (
        <div className="card">
          <h3>🎤 Voice Latency</h3>
          <div className="metrics-grid">
            {asr_latency_ms && (
              <div className="metric-item">
                <span className="metric-label">ASR (Speech-to-Text)</span>
                <span className="metric-value">{asr_latency_ms}ms</span>
              </div>
            )}
            {tts_latency_ms && (
              <div className="metric-item">
                <span className="metric-label">TTS (Text-to-Speech)</span>
                <span className="metric-value">{tts_latency_ms}ms</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Engine Metrics */}
      <div className="card">
        <h3>⚙️ Engine Latency</h3>
        <BarChart
          data={engines.map((e) => ({ label: e.engine_name, value: e.latency_ms }))}
          color="#0e639c"
        />
      </div>

      {/* Engine Details */}
      <div className="card">
        <h3>📈 Engine Statistics</h3>
        <div className="engine-stats">
          {engines.map((engine) => (
            <div key={engine.engine_id} className="engine-stat-item">
              <div className="engine-stat-header">
                <strong>{engine.engine_name}</strong>
              </div>
              <div className="engine-stat-metrics">
                <span>P50: {engine.p50.toFixed(1)}ms</span>
                <span>P95: {engine.p95.toFixed(1)}ms</span>
                <span>P99: {engine.p99.toFixed(1)}ms</span>
                <span>Calls: {engine.call_count}</span>
                <span>Error Rate: {(engine.error_rate * 100).toFixed(2)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function formatUptime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hours}h ${minutes}m ${secs}s`;
}
