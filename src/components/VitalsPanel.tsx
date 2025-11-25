/**
 * TITANE_INFINITY v14 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v14 — VITALS PANEL COMPONENT
 *   Component: Panneau vitals temps réel (System + Engines)
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useMemo, useCallback } from 'react';
import { useSystemMonitor } from '../hooks/useSystemMonitor';
import { useProviderStatus } from '../hooks/useProviderStatus';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';
import './VitalsPanel.css';

export interface VitalsPanelProps {
  currentMode?: string;
  messagesCount?: number;
  className?: string;
}

export const VitalsPanel: React.FC<VitalsPanelProps> = React.memo(({
  currentMode = 'default',
  messagesCount = 0,
  className = '',
}) => {
  // Performance monitoring pour throttling adaptatif
  const { shouldThrottle } = usePerformanceMonitor({
    fpsThreshold: 40,
    cpuThreshold: 80,
  });

  // Monitoring complet (system + engines) avec throttling adaptatif
  const {
    systemVitals,
    engineVitals,
    globalHealth,
    isSystemOverloaded,
    criticalIssues,
  } = useSystemMonitor({
    vitalsInterval: shouldThrottle ? 8000 : 5000,
    enginesInterval: shouldThrottle ? 15000 : 10000,
    enabled: true,
  });

  // Status providers IA
  const { activeProvider } = useProviderStatus({
    autoRefresh: true,
    refreshInterval: 30000,
  });

  // Calcul mémoire chat (localStorage)
  const memoryUsage = useMemo(() => {
    try {
      let total = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('titane_chat_')) {
          const value = localStorage.getItem(key);
          total += (value?.length || 0);
        }
      }
      return Math.round(total / 1024); // KB
    } catch {
      return 0;
    }
  }, []);

  // Helpers couleurs memoized avec useCallback
  const getHealthColor = useCallback((health: number) => {
    if (health >= 80) return 'var(--color-success-500)';
    if (health >= 60) return 'var(--color-warning-500)';
    return 'var(--color-danger-500)';
  }, []);

  const getCpuColor = useCallback((cpu: number) => {
    if (cpu < 50) return 'var(--color-success-500)';
    if (cpu < 80) return 'var(--color-warning-500)';
    return 'var(--color-danger-500)';
  }, []);

  const getMemoryColor = useCallback((memory: number) => {
    if (memory < 70) return 'var(--color-success-500)';
    if (memory < 90) return 'var(--color-warning-500)';
    return 'var(--color-danger-500)';
  }, []);

  return (
    <div className={`vitals-panel ${className}`}>
      {/* Header */}
      <div className="vitals-header">
        <div className="vitals-title">
          <span className="vitals-icon">⚡</span>
          <span>System Vitals</span>
        </div>
        <div
          className="vitals-health"
          style={{ color: getHealthColor(globalHealth) }}
        >
          {globalHealth}%
        </div>
      </div>

      {/* Critical Issues */}
      {criticalIssues.length > 0 && (
        <div className="vitals-alerts">
          {criticalIssues.map((issue, idx) => (
            <div key={idx} className="vital-alert">
              🚨 {issue}
            </div>
          ))}
        </div>
      )}

      {/* System Vitals */}
      <div className="vitals-section">
        <div className="vitals-section-title">System</div>
        <div className="vitals-grid">
          <div className="vital-item">
            <span className="vital-label">CPU</span>
            <span
              className="vital-value"
              style={{
                color: systemVitals
                  ? getCpuColor(systemVitals.cpu)
                  : 'var(--text-tertiary)',
              }}
            >
              {systemVitals ? `${systemVitals.cpu.toFixed(1)}%` : '-'}
            </span>
          </div>

          <div className="vital-item">
            <span className="vital-label">Memory</span>
            <span
              className="vital-value"
              style={{
                color: systemVitals
                  ? getMemoryColor(systemVitals.memory)
                  : 'var(--text-tertiary)',
              }}
            >
              {systemVitals ? `${systemVitals.memory.toFixed(1)}%` : '-'}
            </span>
          </div>

          <div className="vital-item">
            <span className="vital-label">Disk</span>
            <span className="vital-value">
              {systemVitals ? `${systemVitals.disk.toFixed(1)}%` : '-'}
            </span>
          </div>

          <div className="vital-item">
            <span className="vital-label">Overload</span>
            <span
              className="vital-value"
              style={{
                color: isSystemOverloaded
                  ? 'var(--color-danger-500)'
                  : 'var(--color-success-500)',
              }}
            >
              {isSystemOverloaded ? 'YES' : 'NO'}
            </span>
          </div>
        </div>
      </div>

      {/* Engine Vitals */}
      <div className="vitals-section">
        <div className="vitals-section-title">Engines</div>
        <div className="vitals-grid">
          <div className="vital-item">
            <span className="vital-label">Harmonia</span>
            <span
              className="vital-value"
              style={{
                color: engineVitals
                  ? getCpuColor(engineVitals.harmonia.load)
                  : 'var(--text-tertiary)',
              }}
            >
              {engineVitals
                ? `${engineVitals.harmonia.load.toFixed(0)}%`
                : '-'}
            </span>
          </div>

          <div className="vital-item">
            <span className="vital-label">Helios</span>
            <span
              className="vital-value"
              style={{
                color: engineVitals
                  ? getHealthColor(engineVitals.helios.health)
                  : 'var(--text-tertiary)',
              }}
            >
              {engineVitals
                ? `${engineVitals.helios.health.toFixed(0)}%`
                : '-'}
            </span>
          </div>

          <div className="vital-item">
            <span className="vital-label">Nexus</span>
            <span
              className="vital-value"
              style={{
                color: engineVitals
                  ? getHealthColor(engineVitals.nexus.coherence)
                  : 'var(--text-tertiary)',
              }}
            >
              {engineVitals
                ? `${engineVitals.nexus.coherence.toFixed(0)}%`
                : '-'}
            </span>
          </div>

          <div className="vital-item">
            <span className="vital-label">Sentinel</span>
            <span
              className="vital-value"
              style={{
                color:
                  engineVitals && engineVitals.sentinel.errors > 0
                    ? 'var(--color-warning-500)'
                    : 'var(--color-success-500)',
              }}
            >
              {engineVitals ? `${engineVitals.sentinel.errors}` : '-'}
            </span>
          </div>

          <div className="vital-item">
            <span className="vital-label">SelfHeal++</span>
            <span className="vital-value">
              {engineVitals
                ? `${engineVitals.selfheal.interventions}`
                : '-'}
            </span>
          </div>

          <div className="vital-item">
            <span className="vital-label">Tasks</span>
            <span className="vital-value">
              {engineVitals
                ? `${engineVitals.harmonia.tasksActive}`
                : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Chat Vitals */}
      <div className="vitals-section">
        <div className="vitals-section-title">Chat IA</div>
        <div className="vitals-grid">
          <div className="vital-item">
            <span className="vital-label">Provider</span>
            <span className="vital-value vital-value-accent">
              {activeProvider || 'auto'}
            </span>
          </div>

          <div className="vital-item">
            <span className="vital-label">Mode</span>
            <span className="vital-value vital-value-accent">
              {currentMode}
            </span>
          </div>

          <div className="vital-item">
            <span className="vital-label">Messages</span>
            <span className="vital-value">{messagesCount}</span>
          </div>

          <div className="vital-item">
            <span className="vital-label">Memory</span>
            <span className="vital-value">{memoryUsage} KB</span>
          </div>
        </div>
      </div>
    </div>
  );
});

VitalsPanel.displayName = 'VitalsPanel';
