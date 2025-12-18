/**
 * TITANE∞ v20Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════
 *   SELF-HEALING DASHBOARD
 *   Super Prompt #4: Monitoring & Control du Self-Healing Engine
 * ═══════════════════════════════════════════════════════════
 */

import React, { useState, useEffect, useCallback } from 'react';
import { secureInvoke } from '@/lib/security';
import { HUDFrame } from '../components/HUDFrame';
import { REFRESH_INTERVALS } from '@/constants/timeouts';
import './styles/SelfHealingDashboard.css';

// ═══════════════════════════════════════════════════════════════
//   TYPES
// ═══════════════════════════════════════════════════════════════

interface SystemHealth {
  cpu_load: number;
  memory_usage: number;
  omega_latency: number;
  error_rate: number;
  cache_hit_rate: number;
  anomaly_score: number;
  last_update: number;
}

interface HealingState {
  safe_mode_active: boolean;
  circuit_breaker_active: boolean;
  degraded_mode_active: boolean;
  detailed_logging: boolean;
}

interface AnomalyPrediction {
  probability: number;
  time_to_critical_secs: number | null;
  confidence: number;
  timestamp: number;
  trend: 'Improving' | 'Stable' | 'Degrading' | 'CriticalDegradation';
}

// RepairAction type kept for future use when backend provides full action details
// interface RepairAction {
//   type: string;
//   description: string;
//   priority: number;
//   risk_level: number;
// }

interface HealingReport {
  timestamp: number;
  anomaly_score: number;
  level: 'Normal' | 'Warning' | 'Critical';
  actions_taken: Array<{
    action: string;
    success: boolean;
    duration_ms: number;
  }>;
  actions_pending: string[];
  health_summary: string;
}

// ═══════════════════════════════════════════════════════════════
//   MOCK DATA (for demo when backend not available)
// ═══════════════════════════════════════════════════════════════

const MOCK_HEALTH: SystemHealth = {
  cpu_load: 0.35,
  memory_usage: 0.52,
  omega_latency: 87,
  error_rate: 0.02,
  cache_hit_rate: 0.78,
  anomaly_score: 0.18,
  last_update: Date.now(),
};

const MOCK_STATE: HealingState = {
  safe_mode_active: false,
  circuit_breaker_active: false,
  degraded_mode_active: false,
  detailed_logging: false,
};

const MOCK_PREDICTION: AnomalyPrediction = {
  probability: 0.12,
  time_to_critical_secs: null,
  confidence: 0.75,
  timestamp: Date.now(),
  trend: 'Stable',
};

// ═══════════════════════════════════════════════════════════════
//   COMPONENTS
// ═══════════════════════════════════════════════════════════════

const StatusIndicator: React.FC<{ status: 'healthy' | 'warning' | 'critical' }> = ({
  status,
}) => (
  <div className={`self-heal-status-indicator status-${status}`}>
    <div className="status-dot" />
    <span className="status-label">
      {status === 'healthy' && 'Système Sain'}
      {status === 'warning' && 'Attention Requise'}
      {status === 'critical' && 'Action Urgente'}
    </span>
  </div>
);

const MetricBar: React.FC<{
  label: string;
  value: number;
  max?: number;
  unit?: string;
  thresholds?: { warning: number; critical: number };
}> = ({
  label,
  value,
  max = 1,
  unit = '%',
  thresholds = { warning: 0.7, critical: 0.9 },
}) => {
  const percentage = (value / max) * 100;
  const displayValue = unit === '%' ? Math.round(value * 100) : value;

  let statusClass = 'normal';
  if (value >= thresholds.critical) statusClass = 'critical';
  else if (value >= thresholds.warning) statusClass = 'warning';

  return (
    <div className="self-heal-metric">
      <div className="metric-header">
        <span className="metric-label">{label}</span>
        <span className={`metric-value ${statusClass}`}>
          {displayValue}
          {unit}
        </span>
      </div>
      <div className="metric-bar">
        <div
          className={`metric-fill ${statusClass}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};

const TrendIndicator: React.FC<{ trend: string }> = ({ trend }) => {
  const getIcon = () => {
    switch (trend) {
      case 'Improving':
        return '↗';
      case 'Degrading':
        return '↘';
      case 'CriticalDegradation':
        return '⚠';
      default:
        return '→';
    }
  };

  return (
    <span className={`trend-indicator trend-${trend.toLowerCase()}`}>
      {getIcon()} {trend}
    </span>
  );
};

const ActionCard: React.FC<{
  action: string;
  description: string;
  riskLevel: number;
  isPending?: boolean;
  onConfirm?: () => void;
  onReject?: () => void;
}> = ({ action, description, riskLevel, isPending, onConfirm, onReject }) => (
  <div className={`self-heal-action-card ${isPending ? 'pending' : ''}`}>
    <div className="action-info">
      <span className="action-name">{action}</span>
      <span className="action-description">{description}</span>
      <span
        className={`action-risk risk-${riskLevel > 6 ? 'high' : riskLevel > 3 ? 'medium' : 'low'}`}
      >
        Risque: {riskLevel}/10
      </span>
    </div>
    {isPending && (
      <div className="action-buttons">
        <button className="action-btn confirm" onClick={onConfirm}>
          Confirmer
        </button>
        <button className="action-btn reject" onClick={onReject}>
          Rejeter
        </button>
      </div>
    )}
  </div>
);

// ═══════════════════════════════════════════════════════════════
//   MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export const SelfHealingDashboard: React.FC = () => {
  // State
  const [health, setHealth] = useState<SystemHealth>(MOCK_HEALTH);
  const [healingState, setHealingState] = useState<HealingState>(MOCK_STATE);
  const [prediction, setPrediction] = useState<AnomalyPrediction>(MOCK_PREDICTION);
  const [pendingActions, setPendingActions] = useState<string[]>([]);
  const [history, setHistory] = useState<HealingReport[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Determine overall status
  const getOverallStatus = useCallback((): 'healthy' | 'warning' | 'critical' => {
    if (health.anomaly_score > 0.7 || healingState.safe_mode_active) return 'critical';
    if (health.anomaly_score > 0.4 || healingState.circuit_breaker_active)
      return 'warning';
    return 'healthy';
  }, [health, healingState]);

  // Fetch data from backend
  const fetchData = useCallback(async () => {
    try {
      // Try to invoke Tauri commands
      const [healthData, stateData, predictionData] = await Promise.all([
        invoke<SystemHealth>('get_self_healing_health').catch(() => null),
        invoke<HealingState>('get_self_healing_state').catch(() => null),
        invoke<AnomalyPrediction>('get_self_healing_prediction').catch(() => null),
      ]);

      if (healthData) setHealth(healthData);
      if (stateData) setHealingState(stateData);
      if (predictionData) setPrediction(predictionData);
      setIsConnected(true);
    } catch {
      // Use mock data if backend not available
      setIsConnected(false);
      // Simulate some variations in mock data
      setHealth(prev => ({
        ...prev,
        anomaly_score: Math.max(
          0,
          Math.min(1, prev.anomaly_score + (Math.random() - 0.5) * 0.05)
        ),
        omega_latency: Math.round(50 + Math.random() * 100),
        last_update: Date.now(),
      }));
    }
  }, []);

  // Force evaluation
  const handleForceEvaluation = async () => {
    try {
      const report = await invoke<HealingReport>('force_self_healing_evaluation');
      setHistory(prev => [report, ...prev].slice(0, 10));
      await fetchData();
    } catch {
      console.warn('Force evaluation not available');
    }
  };

  // Confirm pending action
  const handleConfirmAction = async (action: string) => {
    try {
      await secureInvoke('confirm_self_healing_action', { action });
      setPendingActions(prev => prev.filter(a => a !== action));
      await fetchData();
    } catch {
      console.warn('Action confirmation not available');
    }
  };

  // Reject pending action
  const handleRejectAction = async (action: string) => {
    try {
      await secureInvoke('reject_self_healing_action', { action });
      setPendingActions(prev => prev.filter(a => a !== action));
    } catch {
      console.warn('Action rejection not available');
    }
  };

  // Toggle Safe Mode
  const handleToggleSafeMode = async () => {
    try {
      await secureInvoke('toggle_safe_mode', { enable: !healingState.safe_mode_active });
      await fetchData();
    } catch {
      // Toggle locally for demo
      setHealingState(prev => ({ ...prev, safe_mode_active: !prev.safe_mode_active }));
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    fetchData();

    if (autoRefresh) {
      const interval = setInterval(fetchData, REFRESH_INTERVALS.NORMAL);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchData]);

  return (
    <div className="self-healing-dashboard">
      {/* Header */}
      <div className="self-heal-header">
        <div className="header-title">
          <h1>Self-Healing Engine</h1>
          <StatusIndicator status={getOverallStatus()} />
        </div>
        <div className="header-controls">
          <label className="auto-refresh-toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={e => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh
          </label>
          <span
            className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}
          >
            {isConnected ? 'Backend Connecté' : 'Mode Demo'}
          </span>
        </div>
      </div>

      <div className="self-heal-grid">
        {/* System Health Panel */}
        <HUDFrame title="Santé Système" icon="💓" className="health-panel">
          <div className="health-score">
            <div className="score-circle">
              <svg viewBox="0 0 100 100">
                <circle
                  className="score-bg"
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  strokeWidth="10"
                />
                <circle
                  className={`score-fill ${getOverallStatus()}`}
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  strokeWidth="10"
                  strokeDasharray={`${(1 - health.anomaly_score) * 283} 283`}
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="score-value">
                {Math.round((1 - health.anomaly_score) * 100)}%
              </div>
            </div>
            <span className="score-label">Score de Santé</span>
          </div>

          <div className="health-metrics">
            <MetricBar label="CPU" value={health.cpu_load} />
            <MetricBar label="Mémoire" value={health.memory_usage} />
            <MetricBar
              label="Latence OMEGA"
              value={health.omega_latency}
              max={500}
              unit="ms"
              thresholds={{ warning: 200, critical: 400 }}
            />
            <MetricBar
              label="Taux d'erreur"
              value={health.error_rate}
              thresholds={{ warning: 0.05, critical: 0.1 }}
            />
            <MetricBar
              label="Cache Hit"
              value={health.cache_hit_rate}
              thresholds={{ warning: 0.5, critical: 0.3 }}
            />
          </div>
        </HUDFrame>

        {/* Prediction Panel */}
        <HUDFrame title="Prédiction" icon="🔮" className="prediction-panel">
          <div className="prediction-main">
            <div className="prediction-probability">
              <span className="prob-value">
                {Math.round(prediction.probability * 100)}%
              </span>
              <span className="prob-label">Probabilité d'anomalie</span>
            </div>
            <TrendIndicator trend={prediction.trend} />
          </div>

          {prediction.time_to_critical_secs && (
            <div className="prediction-warning">
              <span className="warning-icon">⚠</span>
              <span>
                Temps estimé avant critique: {prediction.time_to_critical_secs}s
              </span>
            </div>
          )}

          <div className="prediction-confidence">
            <span>Confiance: {Math.round(prediction.confidence * 100)}%</span>
          </div>
        </HUDFrame>

        {/* Healing State Panel */}
        <HUDFrame title="État du Healing" icon="🛡" className="state-panel">
          <div className="state-toggles">
            <div
              className={`state-item ${healingState.safe_mode_active ? 'active' : ''}`}
            >
              <div className="state-indicator" />
              <span className="state-name">Safe Mode</span>
              <button className="state-toggle-btn" onClick={handleToggleSafeMode}>
                {healingState.safe_mode_active ? 'Désactiver' : 'Activer'}
              </button>
            </div>

            <div
              className={`state-item ${healingState.circuit_breaker_active ? 'active' : ''}`}
            >
              <div className="state-indicator" />
              <span className="state-name">Circuit Breaker</span>
            </div>

            <div
              className={`state-item ${healingState.degraded_mode_active ? 'active' : ''}`}
            >
              <div className="state-indicator" />
              <span className="state-name">Mode Dégradé</span>
            </div>

            <div
              className={`state-item ${healingState.detailed_logging ? 'active' : ''}`}
            >
              <div className="state-indicator" />
              <span className="state-name">Logs Détaillés</span>
            </div>
          </div>

          <button className="force-eval-btn" onClick={handleForceEvaluation}>
            Forcer Évaluation
          </button>
        </HUDFrame>

        {/* Pending Actions Panel */}
        <HUDFrame title="Actions en Attente" icon="⏳" className="actions-panel">
          {pendingActions.length === 0 ? (
            <div className="no-actions">
              <span>Aucune action en attente de confirmation</span>
            </div>
          ) : (
            <div className="actions-list">
              {pendingActions.map((action, idx) => (
                <ActionCard
                  key={idx}
                  action={action}
                  description="Action suggérée par le système"
                  riskLevel={7}
                  isPending
                  onConfirm={() => handleConfirmAction(action)}
                  onReject={() => handleRejectAction(action)}
                />
              ))}
            </div>
          )}
        </HUDFrame>

        {/* History Panel */}
        <HUDFrame title="Historique" icon="📜" className="history-panel">
          {history.length === 0 ? (
            <div className="no-history">
              <span>Aucune action récente</span>
            </div>
          ) : (
            <div className="history-list">
              {history.map((report, idx) => (
                <div
                  key={idx}
                  className={`history-item level-${report.level.toLowerCase()}`}
                >
                  <div className="history-header">
                    <span className="history-time">
                      {new Date(report.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={`history-level level-${report.level.toLowerCase()}`}>
                      {report.level}
                    </span>
                  </div>
                  <div className="history-score">
                    Score: {Math.round(report.anomaly_score * 100)}%
                  </div>
                  {report.actions_taken.length > 0 && (
                    <div className="history-actions">
                      {report.actions_taken.map((a, i) => (
                        <span
                          key={i}
                          className={`action-tag ${a.success ? 'success' : 'failed'}`}
                        >
                          {a.action}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </HUDFrame>
      </div>
    </div>
  );
};

export default SelfHealingDashboard;
