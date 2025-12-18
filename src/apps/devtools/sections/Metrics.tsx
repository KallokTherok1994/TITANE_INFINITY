/**
 * TITANE∞ v20.0 — Metrics Section
 * Super Prompt #3: DevTools UI Advanced Suite
 * @license MIT
 */

import React, { useState } from 'react';
import { useDevToolsStore } from '../store/devtools.store';
import { SectionHeader, MetricCard } from '../components';

/**
 * Metrics - Métriques temps réel du système
 */
export function Metrics() {
  const { metrics, timeRange, setTimeRange } = useDevToolsStore();
  const [selectedEngine, setSelectedEngine] = useState<string>('all');

  const metricsList = Object.values(metrics);

  const timeRangeOptions: Array<{ value: typeof timeRange; label: string }> = [
    { value: '30s', label: '30 secondes' },
    { value: '2m', label: '2 minutes' },
    { value: '5m', label: '5 minutes' },
    { value: '10m', label: '10 minutes' },
    { value: '1h', label: '1 heure' },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="System Metrics"
        description="Performance et métriques temps réel"
        actions={
          <div className="flex items-center gap-3">
            {/* Engine Filter */}
            <select
              value={selectedEngine}
              onChange={e => setSelectedEngine(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-md border"
              style={{
                background: 'var(--bg-panel, #101216)',
                color: 'var(--text-primary, #e0e0e0)',
                borderColor: 'var(--border, rgba(196,196,196,0.12))',
              }}
            >
              <option value="all">All Engines</option>
              <option value="helios">Helios</option>
              <option value="nexus">Nexus</option>
              <option value="sentinel">Sentinel</option>
              <option value="harmonia">Harmonia</option>
            </select>

            {/* Time Range */}
            <div className="flex gap-1">
              {timeRangeOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setTimeRange(option.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 ${
                    timeRange === option.value ? 'ring-1' : ''
                  }`}
                  style={{
                    background:
                      timeRange === option.value
                        ? 'var(--bg-primary, #727b81)'
                        : 'var(--bg-panel, #101216)',
                    color:
                      timeRange === option.value
                        ? 'var(--text-inverse, #ffffff)'
                        : 'var(--text-primary, #e0e0e0)',
                    borderColor: 'var(--border, rgba(196,196,196,0.12))',
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        }
      />

      {/* Latency Metrics */}
      <div>
        <h3
          className="text-base font-semibold mb-3"
          style={{ color: 'var(--text-primary, #e0e0e0)' }}
        >
          IPC Latency
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {metricsList
            .filter(m => m.id.startsWith('ipc-latency'))
            .map(metric => (
              <MetricCard
                key={metric.id}
                label={metric.label}
                value={metric.value}
                unit={metric.unit}
                trend={metric.trend}
                history={metric.history}
                color={
                  metric.value < 20 ? 'success' : metric.value < 50 ? 'warning' : 'danger'
                }
              />
            ))}
        </div>
      </div>

      {/* System Resources */}
      <div>
        <h3
          className="text-base font-semibold mb-3"
          style={{ color: 'var(--text-primary, #e0e0e0)' }}
        >
          System Resources
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metricsList
            .filter(m => m.id === 'cpu-usage' || m.id === 'memory-usage')
            .map(metric => (
              <MetricCard
                key={metric.id}
                label={metric.label}
                value={metric.value}
                unit={metric.unit}
                trend={metric.trend}
                history={metric.history}
                color={
                  metric.id === 'cpu-usage'
                    ? metric.value > 80
                      ? 'danger'
                      : metric.value > 50
                        ? 'warning'
                        : 'success'
                    : 'primary'
                }
              />
            ))}
        </div>
      </div>

      {/* Omega Pipeline */}
      <div>
        <h3
          className="text-base font-semibold mb-3"
          style={{ color: 'var(--text-primary, #e0e0e0)' }}
        >
          Omega Pipeline
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {metricsList
            .filter(m => m.id === 'omega-duration')
            .map(metric => (
              <MetricCard
                key={metric.id}
                label={metric.label}
                value={metric.value}
                unit={metric.unit}
                trend={metric.trend}
                history={metric.history}
                color={
                  metric.value < 100
                    ? 'success'
                    : metric.value < 200
                      ? 'warning'
                      : 'danger'
                }
              />
            ))}
        </div>
      </div>

      {/* Detailed Stats Table */}
      <div>
        <h3
          className="text-base font-semibold mb-3"
          style={{ color: 'var(--text-primary, #e0e0e0)' }}
        >
          Detailed Statistics
        </h3>
        <div
          className="rounded-lg border overflow-hidden"
          style={{
            background: 'var(--bg-panel, #101216)',
            borderColor: 'var(--border, rgba(196,196,196,0.12))',
          }}
        >
          <table className="w-full">
            <thead>
              <tr
                className="border-b"
                style={{
                  background: 'var(--bg-surface, #181c21)',
                  borderColor: 'var(--border, rgba(196,196,196,0.12))',
                }}
              >
                <th
                  className="text-left px-4 py-3 text-xs font-semibold"
                  style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
                >
                  Metric
                </th>
                <th
                  className="text-right px-4 py-3 text-xs font-semibold"
                  style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
                >
                  Current
                </th>
                <th
                  className="text-right px-4 py-3 text-xs font-semibold"
                  style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
                >
                  Trend
                </th>
                <th
                  className="text-right px-4 py-3 text-xs font-semibold"
                  style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
                >
                  Last Update
                </th>
              </tr>
            </thead>
            <tbody>
              {metricsList.map((metric, index) => (
                <tr
                  key={metric.id}
                  className={index !== metricsList.length - 1 ? 'border-b' : ''}
                  style={{
                    borderColor: 'var(--border, rgba(196,196,196,0.08))',
                  }}
                >
                  <td
                    className="px-4 py-3 text-sm font-medium"
                    style={{ color: 'var(--text-primary, #e0e0e0)' }}
                  >
                    {metric.label}
                  </td>
                  <td
                    className="px-4 py-3 text-sm font-mono text-right"
                    style={{ color: 'var(--text-primary, #e0e0e0)' }}
                  >
                    {metric.value} {metric.unit}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <span
                      style={{
                        color:
                          metric.trend === 'up'
                            ? 'var(--text-warning, #e3d5d5)'
                            : metric.trend === 'down'
                              ? 'var(--text-success, #93b399)'
                              : 'var(--text-muted, rgba(255,255,255,0.60))',
                      }}
                    >
                      {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}
                    </span>
                  </td>
                  <td
                    className="px-4 py-3 text-xs font-mono text-right"
                    style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
                  >
                    {new Date(metric.timestamp).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
