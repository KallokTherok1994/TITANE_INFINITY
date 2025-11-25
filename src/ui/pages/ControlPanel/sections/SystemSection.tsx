/**
 * TITANE∞ OS - Section Système
 * Informations système, diagnostics et métriques
 */

import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { SystemInfo } from '../../../../types/tauri';

interface SystemSectionProps {
  systemInfo: SystemInfo;
  onRefresh: () => void;
}

export const SystemSection: React.FC<SystemSectionProps> = ({ systemInfo, onRefresh }) => {
  const [diagnosticRunning, setDiagnosticRunning] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<string | null>(null);

  const runDiagnostic = async () => {
    setDiagnosticRunning(true);
    try {
      const result = await invoke<string>('run_system_diagnostic');
      setDiagnosticResult(result);
    } catch (error) {
      console.error('Erreur diagnostic:', error);
      setDiagnosticResult('Erreur lors du diagnostic');
    } finally {
      setDiagnosticRunning(false);
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}min`;
  };

  const getUsageClass = (usage: number) => {
    if (usage > 90) return 'danger';
    if (usage > 75) return 'warning';
    return '';
  };

  return (
    <div className="cp-section">
      <div className="cp-section-header">
        <h2 className="cp-section-title">Système</h2>
        <div className="cp-section-actions">
          <button className="cp-button secondary" onClick={onRefresh}>
            🔄 Actualiser
          </button>
          <button
            className="cp-button"
            onClick={runDiagnostic}
            disabled={diagnosticRunning}
          >
            {diagnosticRunning ? '⏳ Diagnostic...' : '🔍 Diagnostic Complet'}
          </button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="cp-grid cp-grid-3">
        <div className="cp-card cp-stat-card">
          <span className="cp-stat-label">Utilisation CPU</span>
          <span className="cp-stat-value">
            {systemInfo?.cpu_usage?.toFixed(1) || '0.0'}%
          </span>
          <div className="cp-stat-progress">
            <div
              className={`cp-stat-progress-bar ${getUsageClass(systemInfo?.cpu_usage || 0)}`}
              style={{ width: `${systemInfo?.cpu_usage || 0}%` }}
            />
          </div>
        </div>

        <div className="cp-card cp-stat-card">
          <span className="cp-stat-label">Utilisation Mémoire</span>
          <span className="cp-stat-value">
            {systemInfo?.memory_usage?.toFixed(1) || '0.0'}%
          </span>
          <div className="cp-stat-progress">
            <div
              className={`cp-stat-progress-bar ${getUsageClass(systemInfo?.memory_usage || 0)}`}
              style={{ width: `${systemInfo?.memory_usage || 0}%` }}
            />
          </div>
        </div>

        <div className="cp-card cp-stat-card">
          <span className="cp-stat-label">Utilisation Disque</span>
          <span className="cp-stat-value">
            {systemInfo?.disk_usage?.toFixed(1) || '0.0'}%
          </span>
          <div className="cp-stat-progress">
            <div
              className={`cp-stat-progress-bar ${getUsageClass(systemInfo?.disk_usage || 0)}`}
              style={{ width: `${systemInfo?.disk_usage || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Informations système */}
      <div className="cp-grid cp-grid-2">
        <div className="cp-card">
          <h3 className="cp-card-title">Informations Système</h3>
          <div className="cp-card-content">
            <div className="cp-info-row">
              <span className="cp-info-label">Version TITANE∞ OS</span>
              <span className="cp-info-value">{systemInfo?.version || 'v19.1.0'}</span>
            </div>
            <div className="cp-info-row">
              <span className="cp-info-label">Uptime</span>
              <span className="cp-info-value">
                {formatUptime(systemInfo?.uptime || 0)}
              </span>
            </div>
            <div className="cp-info-row">
              <span className="cp-info-label">État Singularité</span>
              <span className={`cp-badge ${systemInfo?.singularity_active ? 'success' : ''}`}>
                <span className="cp-badge-dot" />
                {systemInfo?.singularity_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        <div className="cp-card">
          <h3 className="cp-card-title">Moteurs Actifs</h3>
          <div className="cp-card-content">
            <div className="cp-info-row">
              <span className="cp-info-label">Singularity Engine</span>
              <span className="cp-badge success">
                <span className="cp-badge-dot" />
                Running
              </span>
            </div>
            <div className="cp-info-row">
              <span className="cp-info-label">AI Core</span>
              <span className="cp-badge success">
                <span className="cp-badge-dot" />
                Running
              </span>
            </div>
            <div className="cp-info-row">
              <span className="cp-info-label">Memory System</span>
              <span className="cp-badge success">
                <span className="cp-badge-dot" />
                Running
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Résultat diagnostic */}
      {diagnosticResult && (
        <div className="cp-card">
          <h3 className="cp-card-title">Résultat Diagnostic</h3>
          <div className="cp-card-content">
            <pre className="cp-diagnostic-output">{diagnosticResult}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
