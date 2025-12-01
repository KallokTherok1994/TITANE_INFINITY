/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v21 — ADAPTIVE PANEL
 *   Dashboard pour l'AdaptiveOptimizationEngine
 *   Visualisation performance, règles, apprentissage
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import {
  AdaptiveBridgeV21,
  type PreferenceProfile,
  type AdaptiveSummary,
  type SystemPerformanceSample,
  type SystemBehaviorMode,
} from '@/services/adaptiveBridgeV21';
import './AdaptivePanel.css';

export const AdaptivePanel: React.FC = () => {
  // ═══════════════════════════════════════════════════════════════
  //   STATE
  // ═══════════════════════════════════════════════════════════════

  const [profile, setProfile] = useState<PreferenceProfile | null>(null);
  const [summary, setSummary] = useState<AdaptiveSummary | null>(null);
  const [history, setHistory] = useState<SystemPerformanceSample[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'rules' | 'settings'>(
    'overview'
  );

  // ═══════════════════════════════════════════════════════════════
  //   LIFECYCLE
  // ═══════════════════════════════════════════════════════════════

  useEffect(() => {
    loadAdaptiveData();
  }, []);

  // ═══════════════════════════════════════════════════════════════
  //   HANDLERS
  // ═══════════════════════════════════════════════════════════════

  const loadAdaptiveData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileData, summaryData, historyData] = await Promise.all([
        AdaptiveBridgeV21.getProfile(),
        AdaptiveBridgeV21.getSummary(),
        AdaptiveBridgeV21.getHistory(50),
      ]);
      setProfile(profileData);
      setSummary(summaryData);
      setHistory(historyData);
    } catch (err) {
      console.error('[AdaptivePanel] Load error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load adaptive data');
    } finally {
      setLoading(false);
    }
  };

  const handleLearn = async () => {
    setLoading(true);
    try {
      const result = await AdaptiveBridgeV21.learn();
      console.log('[AdaptivePanel] Learn result:', result);
      await loadAdaptiveData();
    } catch (err) {
      console.error('[AdaptivePanel] Learn error:', err);
      setError(err instanceof Error ? err.message : 'Failed to learn');
    } finally {
      setLoading(false);
    }
  };

  const handleOptimize = async () => {
    setLoading(true);
    try {
      const actions = await AdaptiveBridgeV21.runOptimization();
      console.log('[AdaptivePanel] Optimization actions:', actions);
      await loadAdaptiveData();
    } catch (err) {
      console.error('[AdaptivePanel] Optimize error:', err);
      setError(err instanceof Error ? err.message : 'Failed to optimize');
    } finally {
      setLoading(false);
    }
  };

  const handleSetMode = async (mode: SystemBehaviorMode) => {
    setLoading(true);
    try {
      await AdaptiveBridgeV21.setMode(mode);
      await loadAdaptiveData();
    } catch (err) {
      console.error('[AdaptivePanel] Set mode error:', err);
      setError(err instanceof Error ? err.message : 'Échec du changement de mode');
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  //   RENDER HELPERS
  // ═══════════════════════════════════════════════════════════════

  const renderOverview = () => {
    if (!summary) return <div className="adaptive-empty">Aucune donnée</div>;

    const health = summary.avg_cpu_load < 0.8 && summary.avg_ai_latency < 5000 ? 0.85 : 0.6;
    const healthColor = AdaptiveBridgeV21.getHealthColor(health);

    return (
      <div className="adaptive-overview">
        <div className="adaptive-stat-cards">
          <div className="adaptive-stat-card">
            <div className="adaptive-stat-label">Échantillons</div>
            <div className="adaptive-stat-value">{summary.total_samples}</div>
          </div>

          <div className="adaptive-stat-card">
            <div className="adaptive-stat-label">Cycles d&apos;Optimisation</div>
            <div className="adaptive-stat-value">{summary.optimization_cycles}</div>
          </div>

          <div className="adaptive-stat-card">
            <div className="adaptive-stat-label">Patterns Détectés</div>
            <div className="adaptive-stat-value">{summary.patterns_detected}</div>
          </div>

          <div className="adaptive-stat-card">
            <div className="adaptive-stat-label">Règles Actives</div>
            <div className="adaptive-stat-value">{summary.active_rules}</div>
          </div>
        </div>

        <div className="adaptive-health-section">
          <div className="adaptive-health-title">Santé Globale</div>
          <div className="adaptive-health-bar">
            <div
              className="adaptive-health-fill"
              style={{ width: `${health * 100}%`, backgroundColor: healthColor }}
            />
          </div>
          <div className="adaptive-health-value">{(health * 100).toFixed(1)}%</div>
        </div>

        <div className="adaptive-metrics">
          <div className="adaptive-metric">
            <span className="adaptive-metric-label">CPU Moyen:</span>
            <span className="adaptive-metric-value">
              {(summary.avg_cpu_load * 100).toFixed(1)}%
            </span>
          </div>

          <div className="adaptive-metric">
            <span className="adaptive-metric-label">Latence IA Moyenne:</span>
            <span className="adaptive-metric-value">{summary.avg_ai_latency.toFixed(0)}ms</span>
          </div>

          <div className="adaptive-metric">
            <span className="adaptive-metric-label">Mode Actuel:</span>
            <span className="adaptive-metric-value">{summary.current_mode}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderHistory = () => {
    if (history.length === 0) {
      return <div className="adaptive-empty">Aucun historique</div>;
    }

    return (
      <div className="adaptive-history">
        <div className="adaptive-history-chart">
          {history.slice(0, 20).map((sample, idx) => (
            <div key={idx} className="adaptive-history-item">
              <div className="adaptive-history-timestamp">
                {new Date(sample.timestamp).toLocaleTimeString()}
              </div>
              <div className="adaptive-history-metrics">
                <div className="adaptive-history-metric">
                  CPU: {(sample.cpu_load * 100).toFixed(1)}%
                </div>
                <div className="adaptive-history-metric">
                  Mem: {(sample.memory_usage * 100).toFixed(1)}%
                </div>
                <div className="adaptive-history-metric">FPS: {sample.ui_fps}</div>
                <div className="adaptive-history-metric">
                  Sync: {(sample.sync_quality * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRules = () => {
    if (!summary) return <div className="adaptive-empty">Aucune donnée</div>;

    const defaultRules = [
      {
        name: 'Réduction Complexité IA',
        condition: 'Latence AI > 5000ms',
        enabled: true,
      },
      {
        name: 'Deep Sync Auto',
        condition: 'Stabilité Cognitive < 0.5',
        enabled: true,
      },
      {
        name: 'Simplification UI',
        condition: 'FPS < 40',
        enabled: true,
      },
      {
        name: 'Ré-ancrage Timeline',
        condition: 'Qualité Sync < 0.7',
        enabled: true,
      },
      {
        name: 'Mode Stable',
        condition: 'Échec Intégrité Hash',
        enabled: true,
      },
    ];

    return (
      <div className="adaptive-rules">
        <div className="adaptive-rules-title">Règles Adaptatives Actives</div>
        <div className="adaptive-rules-list">
          {defaultRules.map((rule, idx) => (
            <div key={idx} className="adaptive-rule-card">
              <div className="adaptive-rule-header">
                <div className="adaptive-rule-name">{rule.name}</div>
                <div className={`adaptive-rule-status ${rule.enabled ? 'enabled' : 'disabled'}`}>
                  {rule.enabled ? '✓' : '✗'}
                </div>
              </div>
              <div className="adaptive-rule-condition">{rule.condition}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSettings = () => {
    if (!profile) return <div className="adaptive-empty">Aucun profil</div>;

    const modes: SystemBehaviorMode[] = ['Speed', 'Stability', 'Reliability', 'Adaptive'];

    return (
      <div className="adaptive-settings">
        <div className="adaptive-settings-section">
          <div className="adaptive-settings-title">Mode Système</div>
          <div className="adaptive-mode-buttons">
            {modes.map((mode) => (
              <button
                key={mode}
                className={`adaptive-mode-btn ${profile.system_mode === mode ? 'active' : ''}`}
                onClick={() => handleSetMode(mode)}
                disabled={loading}
              >
                {AdaptiveBridgeV21.formatMode(mode)}
              </button>
            ))}
          </div>
        </div>

        <div className="adaptive-settings-section">
          <div className="adaptive-settings-title">Configuration Actuelle</div>
          <div className="adaptive-config-list">
            <div className="adaptive-config-item">
              <span className="adaptive-config-label">Style IA:</span>
              <span className="adaptive-config-value">{profile.ai_style}</span>
            </div>
            <div className="adaptive-config-item">
              <span className="adaptive-config-label">Biais Optimisation:</span>
              <span className="adaptive-config-value">
                {AdaptiveBridgeV21.formatBias(profile.optimization_bias)}
              </span>
            </div>
            <div className="adaptive-config-item">
              <span className="adaptive-config-label">Apprentissage Auto:</span>
              <span className="adaptive-config-value">{profile.auto_learn ? 'Oui' : 'Non'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  //   RENDER PRINCIPAL
  // ═══════════════════════════════════════════════════════════════

  if (loading && !summary) {
    return (
      <div className="adaptive-panel">
        <div className="adaptive-loading">
          <div className="adaptive-spinner" />
          <div>Chargement...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="adaptive-panel">
        <div className="adaptive-error">
          <div className="adaptive-error-icon">⚠</div>
          <div className="adaptive-error-message">{error}</div>
          <button className="adaptive-error-retry" onClick={loadAdaptiveData}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="adaptive-panel">
      <div className="adaptive-header">
        <h2 className="adaptive-title">AdaptiveEngine v21</h2>
        <div className="adaptive-subtitle">Auto-Optimisation & Apprentissage</div>
      </div>

      <div className="adaptive-actions">
        <button className="adaptive-action-btn" onClick={loadAdaptiveData} disabled={loading}>
          🔄 Rafraîchir
        </button>
        <button className="adaptive-action-btn" onClick={handleLearn} disabled={loading}>
          🧠 Apprendre
        </button>
        <button className="adaptive-action-btn" onClick={handleOptimize} disabled={loading}>
          ⚡ Optimiser
        </button>
      </div>

      <div className="adaptive-tabs">
        <button
          className={`adaptive-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Vue d&apos;Ensemble
        </button>
        <button
          className={`adaptive-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Historique
        </button>
        <button
          className={`adaptive-tab ${activeTab === 'rules' ? 'active' : ''}`}
          onClick={() => setActiveTab('rules')}
        >
          Règles
        </button>
        <button
          className={`adaptive-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Paramètres
        </button>
      </div>

      <div className="adaptive-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'history' && renderHistory()}
        {activeTab === 'rules' && renderRules()}
        {activeTab === 'settings' && renderSettings()}
      </div>
    </div>
  );
};
