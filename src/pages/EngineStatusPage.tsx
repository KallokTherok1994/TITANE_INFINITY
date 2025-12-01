/**
 * TITANE_INFINITY v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v15 — ENGINE STATUS PAGE
 *   Page: Status complet tous les moteurs cognitifs
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useCallback } from 'react';
import { useSystemMonitor } from '../hooks/useSystemMonitor';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';
import { EngineVitalsCard } from '../components/EngineVitalsCard';
import './EngineStatusPage.css';

export const EngineStatusPage: React.FC = React.memo(() => {
  // Performance monitoring pour throttling adaptatif
  const { shouldThrottle } = usePerformanceMonitor({
    fpsThreshold: 40,
    cpuThreshold: 80,
  });

  const {
    systemVitals,
    engineVitals,
    globalHealth,
    isSystemOverloaded,
    criticalIssues,
    refreshAll,
  } = useSystemMonitor({
    vitalsInterval: shouldThrottle ? 5000 : 3000,
    enginesInterval: shouldThrottle ? 8000 : 5000,
    enabled: true,
  });

  // Memoize getHealthColor (utilisé multiple fois)
  const getHealthColor = useCallback((health: number) => {
    if (health >= 80) return 'var(--color-success-500)';
    if (health >= 60) return 'var(--color-warning-500)';
    return 'var(--color-danger-500)';
  }, []);

  return (
    <div className="engine-status-page">
      {/* Header */}
      <div className="engine-status-header">
        <div className="engine-status-title">
          <h1>⚙️ Tableau de Bord Moteurs</h1>
          <p className="engine-status-subtitle">
            Monitoring temps réel des moteurs cognitifs TITANE∞
          </p>
        </div>
        <div className="engine-status-actions">
          <button className="titane-btn titane-btn-ghost" onClick={refreshAll}>
            🔄 Actualiser
          </button>
          <div
            className="engine-status-global-health"
            style={{ color: getHealthColor(globalHealth) }}
          >
            <span className="engine-status-global-label">Santé Globale</span>
            <span className="engine-status-global-value">
              {globalHealth.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Critical Issues */}
      {criticalIssues.length > 0 && (
        <div className="engine-status-alerts">
          <div className="engine-status-alerts-title">🚨 Problèmes Critiques</div>
          <div className="engine-status-alerts-list">
            {criticalIssues.map((issue, idx) => (
              <div key={idx} className="engine-status-alert">
                {issue}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Overview */}
      <div className="engine-status-system">
        <h2 className="engine-status-section-title">System Resources</h2>
        <div className="engine-status-system-grid">
          <div className="engine-status-system-card">
            <div className="engine-status-system-label">CPU</div>
            <div
              className="engine-status-system-value"
              style={{
                color: systemVitals
                  ? systemVitals.cpu > 80
                    ? 'var(--color-danger-500)'
                    : 'var(--color-success-500)'
                  : 'var(--text-tertiary)',
              }}
            >
              {systemVitals ? `${systemVitals.cpu.toFixed(1)}%` : '-'}
            </div>
          </div>

          <div className="engine-status-system-card">
            <div className="engine-status-system-label">Memory</div>
            <div
              className="engine-status-system-value"
              style={{
                color: systemVitals
                  ? systemVitals.memory > 90
                    ? 'var(--color-danger-500)'
                    : 'var(--color-success-500)'
                  : 'var(--text-tertiary)',
              }}
            >
              {systemVitals ? `${systemVitals.memory.toFixed(1)}%` : '-'}
            </div>
          </div>

          <div className="engine-status-system-card">
            <div className="engine-status-system-label">Disk</div>
            <div className="engine-status-system-value">
              {systemVitals ? `${systemVitals.disk.toFixed(1)}%` : '-'}
            </div>
          </div>

          <div className="engine-status-system-card">
            <div className="engine-status-system-label">Overload</div>
            <div
              className="engine-status-system-value"
              style={{
                color: isSystemOverloaded
                  ? 'var(--color-danger-500)'
                  : 'var(--color-success-500)',
              }}
            >
              {isSystemOverloaded ? 'YES' : 'NO'}
            </div>
          </div>
        </div>
      </div>

      {/* Engines Grid */}
      <div className="engine-status-engines">
        <h2 className="engine-status-section-title">Cognitive Engines</h2>
        <div className="engine-status-engines-grid">
          {/* Harmonia */}
          {engineVitals && (
            <EngineVitalsCard
              name="Harmonia"
              icon="🎛️"
              health={100 - engineVitals.harmonia.load}
              metrics={[
                {
                  label: 'CPU Load',
                  value: `${engineVitals.harmonia.load.toFixed(0)}%`,
                  color:
                    engineVitals.harmonia.load > 80
                      ? 'var(--color-danger-500)'
                      : 'var(--color-success-500)',
                },
                {
                  label: 'Tasks Active',
                  value: engineVitals.harmonia.tasksActive,
                },
                {
                  label: 'Throttled',
                  value: engineVitals.harmonia.throttled ? 'YES' : 'NO',
                  color: engineVitals.harmonia.throttled
                    ? 'var(--color-warning-500)'
                    : 'var(--color-success-500)',
                },
              ]}
              issues={
                engineVitals.harmonia.load > 80
                  ? ['CPU load exceeds 80%']
                  : []
              }
            />
          )}

          {/* Helios */}
          {engineVitals && (
            <EngineVitalsCard
              name="Helios"
              icon="☀️"
              health={engineVitals.helios.health}
              metrics={[
                {
                  label: 'Health Score',
                  value: `${engineVitals.helios.health.toFixed(0)}%`,
                  color: getHealthColor(engineVitals.helios.health),
                },
                {
                  label: 'Issues',
                  value: engineVitals.helios.issues,
                  color:
                    engineVitals.helios.issues > 0
                      ? 'var(--color-warning-500)'
                      : 'var(--color-success-500)',
                },
                {
                  label: 'Last Check',
                  value: new Date(
                    engineVitals.helios.lastCheck
                  ).toLocaleTimeString(),
                },
              ]}
              issues={
                engineVitals.helios.health < 50
                  ? ['Health below 50%']
                  : engineVitals.helios.issues > 0
                  ? [`${engineVitals.helios.issues} active issues`]
                  : []
              }
            />
          )}

          {/* Nexus */}
          {engineVitals && (
            <EngineVitalsCard
              name="Nexus"
              icon="🔗"
              health={engineVitals.nexus.coherence}
              metrics={[
                {
                  label: 'Coherence',
                  value: `${engineVitals.nexus.coherence.toFixed(0)}%`,
                  color: getHealthColor(engineVitals.nexus.coherence),
                },
                {
                  label: 'Validations',
                  value: engineVitals.nexus.validations,
                },
                {
                  label: 'Score',
                  value: engineVitals.nexus.score.toFixed(0),
                },
              ]}
              issues={
                engineVitals.nexus.coherence < 60
                  ? ['Coherence below 60%']
                  : []
              }
            />
          )}

          {/* Sentinel */}
          {engineVitals && (
            <EngineVitalsCard
              name="Sentinel"
              icon="🛡️"
              health={
                100 - Math.min(engineVitals.sentinel.errors * 10, 100)
              }
              metrics={[
                {
                  label: 'Errors',
                  value: engineVitals.sentinel.errors,
                  color:
                    engineVitals.sentinel.errors > 0
                      ? 'var(--color-danger-500)'
                      : 'var(--color-success-500)',
                },
                {
                  label: 'Anomalies',
                  value: engineVitals.sentinel.anomalies,
                  color:
                    engineVitals.sentinel.anomalies > 0
                      ? 'var(--color-warning-500)'
                      : 'var(--color-success-500)',
                },
                {
                  label: 'Last Error',
                  value: engineVitals.sentinel.lastError
                    ? new Date(
                        engineVitals.sentinel.lastError
                      ).toLocaleTimeString()
                    : 'None',
                },
              ]}
              issues={
                engineVitals.sentinel.errors > 5
                  ? ['Error count exceeds 5']
                  : []
              }
            />
          )}

          {/* SelfHeal++ */}
          {engineVitals && (
            <EngineVitalsCard
              name="SelfHeal++"
              icon="⚕️"
              health={
                100 - Math.min(engineVitals.selfheal.interventions * 5, 100)
              }
              metrics={[
                {
                  label: 'Interventions',
                  value: engineVitals.selfheal.interventions,
                  color:
                    engineVitals.selfheal.interventions > 10
                      ? 'var(--color-warning-500)'
                      : 'var(--color-success-500)',
                },
                {
                  label: 'Auto-Resets',
                  value: engineVitals.selfheal.autoResets,
                },
                {
                  label: 'Last Heal',
                  value: engineVitals.selfheal.lastHeal
                    ? new Date(
                        engineVitals.selfheal.lastHeal
                      ).toLocaleTimeString()
                    : 'None',
                },
              ]}
              issues={
                engineVitals.selfheal.interventions > 10
                  ? ['Interventions exceed 10']
                  : []
              }
            />
          )}
        </div>
      </div>
    </div>
  );
});

EngineStatusPage.displayName = 'EngineStatusPage';

export default EngineStatusPage;
