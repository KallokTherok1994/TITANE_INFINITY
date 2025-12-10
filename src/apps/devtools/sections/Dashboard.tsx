/**
 * TITANE∞ v20.0 — Dashboard Section
 * Super Prompt #3: DevTools UI Advanced Suite
 * @license MIT
 */

import React from 'react';
import { useDevToolsStore } from '../store/devtools.store';
import { SectionHeader, MetricCard, StatusPill, EngineCard } from '../components';

/**
 * Dashboard - Vue synthèse du système TITANE∞
 */
export function Dashboard() {
  const { systemHealth, engines, metrics, logs, errors } = useDevToolsStore();

  const activeEngines = engines.filter(e => e.status === 'running').length;
  const criticalLogs = logs.filter(l => l.level === 'error').slice(0, 5);
  const unresolvedErrors = errors.filter(e => !e.resolved).length;

  // Top metrics to display
  const topMetrics = [
    metrics['ipc-latency-p50'],
    metrics['omega-duration'],
    metrics['cpu-usage'],
    metrics['memory-usage'],
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="System Dashboard"
        description="Vue d'ensemble du système TITANE∞"
      />

      {/* System Health */}
      <div
        className="p-6 rounded-lg border"
        style={{
          background: 'var(--bg-panel, #101216)',
          borderColor: 'var(--border, rgba(196,196,196,0.12))',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-lg font-semibold"
            style={{ color: 'var(--text-primary, #e0e0e0)' }}
          >
            System Health
          </h3>
          <StatusPill
            status={
              systemHealth === 'healthy'
                ? 'success'
                : systemHealth === 'warning'
                  ? 'warning'
                  : 'error'
            }
            label={systemHealth.toUpperCase()}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <div
              className="text-sm mb-1"
              style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
            >
              Active Engines
            </div>
            <div
              className="text-2xl font-bold"
              style={{ color: 'var(--text-primary, #e0e0e0)' }}
            >
              {activeEngines} / {engines.length}
            </div>
          </div>

          <div>
            <div
              className="text-sm mb-1"
              style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
            >
              Critical Errors
            </div>
            <div
              className="text-2xl font-bold"
              style={{
                color:
                  unresolvedErrors > 0
                    ? 'var(--text-danger, #8b5f5f)'
                    : 'var(--text-success, #93b399)',
              }}
            >
              {unresolvedErrors}
            </div>
          </div>

          <div>
            <div
              className="text-sm mb-1"
              style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
            >
              System Uptime
            </div>
            <div
              className="text-2xl font-bold"
              style={{ color: 'var(--text-primary, #e0e0e0)' }}
            >
              24h 35m
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div>
        <h3
          className="text-base font-semibold mb-3"
          style={{ color: 'var(--text-primary, #e0e0e0)' }}
        >
          Key Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {topMetrics.map(metric => (
            <MetricCard
              key={metric.id}
              label={metric.label}
              value={metric.value}
              unit={metric.unit}
              trend={metric.trend}
              history={metric.history}
              color={
                metric.id === 'cpu-usage' && metric.value > 80
                  ? 'danger'
                  : metric.trend === 'down'
                    ? 'success'
                    : metric.trend === 'up'
                      ? 'warning'
                      : 'primary'
              }
            />
          ))}
        </div>
      </div>

      {/* Active Engines (Mini Cards) */}
      <div>
        <h3
          className="text-base font-semibold mb-3"
          style={{ color: 'var(--text-primary, #e0e0e0)' }}
        >
          Active Engines
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {engines
            .filter(e => e.status === 'running')
            .slice(0, 6)
            .map(engine => (
              <EngineCard key={engine.id} engine={engine} compact />
            ))}
        </div>
      </div>

      {/* Recent Critical Logs */}
      {criticalLogs.length > 0 && (
        <div>
          <h3
            className="text-base font-semibold mb-3"
            style={{ color: 'var(--text-danger, #8b5f5f)' }}
          >
            Recent Critical Logs
          </h3>
          <div
            className="rounded-lg border overflow-hidden"
            style={{
              background: 'var(--bg-panel, #101216)',
              borderColor: 'var(--border-danger, #8b5f5f)',
            }}
          >
            {criticalLogs.map(log => (
              <div
                key={log.id}
                className="flex items-start gap-3 px-4 py-3 border-b last:border-b-0"
                style={{
                  borderColor: 'var(--border, rgba(196,196,196,0.08))',
                }}
              >
                <span
                  className="text-xs font-mono"
                  style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
                >
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span
                  className="text-xs font-medium"
                  style={{ color: 'var(--text-danger, #8b5f5f)' }}
                >
                  [{log.source}]
                </span>
                <span
                  className="flex-1 text-xs"
                  style={{ color: 'var(--text-primary, #e0e0e0)' }}
                >
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
