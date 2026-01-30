/**
 * TITANE∞ Evolution Engine - Dashboard Principal
 * Copyright (c) 2025 MUSIC∞AI
 *
 * Tableau de bord central de l'Evolution Engine affichant
 * les scores, tendances, suggestions et actions en cours.
 */

import React, { useState, useEffect, useCallback } from 'react';
import type {
  EvolutionReport,
  EvolutionSuggestion,
  EvolutionAction,
  TrendDirection,
} from '../../services/evolutionEngine/evolutionEngine.config';
import { DEFAULT_EVOLUTION_ENGINE_CONFIG } from '../../services/evolutionEngine/evolutionEngine.config';
import './EvolutionDashboard.css';

// ════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════

interface EvolutionDashboardProps {
  report?: EvolutionReport;
  pendingActions?: EvolutionAction[];
  onApproveSuggestion?: (suggestionId: string) => void;
  onRejectSuggestion?: (suggestionId: string) => void;
  onCancelAction?: (actionId: string) => void;
  onRefresh?: () => void;
  compact?: boolean;
  className?: string;
}

// ════════════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════════════

const SCORE_COLORS: Record<string, string> = {
  stability: '#22c55e',
  cognitiveEfficiency: '#3b82f6',
  contextRelevance: '#a855f7',
  engineReliability: '#f59e0b',
  overall: '#00fff7',
};

const TREND_ICONS: Record<TrendDirection, string> = {
  IMPROVING: '↑',
  DEGRADING: '↓',
  STABLE: '→',
  VOLATILE: '↕',
};

const scoreToGrade = (score: number): string => {
  if (score >= 95) return 'S';
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'F';
};

const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

// ════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ════════════════════════════════════════════════════════════════════════════

const TrendIndicator: React.FC<{ direction: TrendDirection }> = React.memo(
  ({ direction }) => {
    const icon = TREND_ICONS[direction];
    const colorClass =
      direction === 'IMPROVING'
        ? 'trend-up'
        : direction === 'DEGRADING'
          ? 'trend-down'
          : 'trend-stable';

    return (
      <span className={`trend-indicator ${colorClass}`}>
        <span className="trend-icon">{icon}</span>
      </span>
    );
  }
);

TrendIndicator.displayName = 'TrendIndicator';

interface ScoreCardProps {
  label: string;
  value: number;
  trend: TrendDirection;
  color: string;
  icon: string;
}

const ScoreCard: React.FC<ScoreCardProps> = React.memo(
  ({ label, value, trend, color, icon }) => {
    const grade = scoreToGrade(value);

    return (
      <div
        className="score-card"
        style={{ '--score-color': color } as React.CSSProperties}
      >
        <div className="score-header">
          <span className="score-icon">{icon}</span>
          <span className="score-label">{label}</span>
          <TrendIndicator direction={trend} />
        </div>
        <div className="score-body">
          <div className="score-value-container">
            <span className="score-value">{value.toFixed(0)}</span>
            <span className="score-grade" data-grade={grade}>
              {grade}
            </span>
          </div>
          <div className="score-bar">
            <div
              className="score-bar-fill"
              style={{ width: `${value}%`, backgroundColor: color }}
            />
          </div>
        </div>
      </div>
    );
  }
);

ScoreCard.displayName = 'ScoreCard';

interface SuggestionCardProps {
  suggestion: EvolutionSuggestion;
  onApprove?: () => void;
  onReject?: () => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = React.memo(
  ({ suggestion, onApprove, onReject }) => {
    const { category, title, description, risk, estimatedGain, prerequisites, status } =
      suggestion;
    const isPending = status === 'PENDING';

    return (
      <div className={`suggestion-card risk-${risk}`}>
        <div className="suggestion-header">
          <span className="suggestion-type">{category}</span>
          <span className={`risk-badge badge-${risk}`}>{risk}</span>
        </div>
        <h4 className="suggestion-title">{title}</h4>
        <p className="suggestion-description">{description}</p>
        {estimatedGain > 0 && (
          <div className="suggestion-impact">
            <span className="impact-label">Gain estimé:</span>
            <span className="impact-value">+{estimatedGain}%</span>
          </div>
        )}
        {prerequisites?.length > 0 && (
          <div className="suggestion-preconditions">
            {prerequisites.map((prereq, idx) => (
              <span key={idx} className="precondition met">
                ✓ {prereq}
              </span>
            ))}
          </div>
        )}
        {isPending && (
          <div className="suggestion-actions">
            <button className="btn-approve" onClick={onApprove}>
              ✓ Approuver
            </button>
            <button className="btn-reject" onClick={onReject}>
              ✗ Rejeter
            </button>
          </div>
        )}
      </div>
    );
  }
);

SuggestionCard.displayName = 'SuggestionCard';

interface ActionCardProps {
  action: EvolutionAction;
  onCancel?: () => void;
}

const ActionCard: React.FC<ActionCardProps> = React.memo(({ action, onCancel }) => {
  const { id, type, description, risk, reversible } = action;

  return (
    <div className="action-card">
      <div className="action-header">
        <span className="action-type">{type}</span>
        <span className={`risk-badge badge-${risk}`}>{risk}</span>
      </div>
      <div className="action-id">{id.slice(0, 16)}...</div>
      <p className="suggestion-description">{description}</p>
      {reversible && <span className="action-reversible">↩ Réversible</span>}
      <button className="btn-cancel" onClick={onCancel}>
        Annuler
      </button>
    </div>
  );
});

ActionCard.displayName = 'ActionCard';

interface GaugeProps {
  score: number;
  trend: TrendDirection;
}

const OverallScoreGauge: React.FC<GaugeProps> = React.memo(({ score, trend }) => {
  const grade = scoreToGrade(score);
  const rotation = (score / 100) * 180 - 90;

  return (
    <div className="overall-gauge">
      <div className="gauge-container">
        <svg viewBox="0 0 200 120" className="gauge-svg">
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="16"
            strokeLinecap="round"
          />
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 251.2} 251.2`}
          />
          <g transform={`rotate(${rotation}, 100, 100)`}>
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="35"
              stroke="#fff"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="100" cy="100" r="8" fill="#fff" />
          </g>
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="33%" stopColor="#f59e0b" />
              <stop offset="66%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="gauge-value">
        <span className="gauge-number">{score.toFixed(0)}</span>
        <span className="gauge-grade" data-grade={grade}>
          {grade}
        </span>
        <TrendIndicator direction={trend} />
      </div>
      <div className="gauge-label">Score Global d&apos;Évolution</div>
    </div>
  );
});

OverallScoreGauge.displayName = 'OverallScoreGauge';

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════

export const EvolutionDashboard: React.FC<EvolutionDashboardProps> = ({
  report,
  pendingActions = [],
  onApproveSuggestion,
  onRejectSuggestion,
  onCancelAction,
  onRefresh,
  compact = false,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'suggestions' | 'actions'>(
    'overview'
  );
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  useEffect(() => {
    if (report) setLastUpdate(report.generatedAt);
  }, [report]);

  useEffect(() => {
    if (!onRefresh) return;
    const interval = setInterval(
      onRefresh,
      DEFAULT_EVOLUTION_ENGINE_CONFIG.analyzer.analyzeInterval
    );
    return () => clearInterval(interval);
  }, [onRefresh]);

  const handleApprove = useCallback(
    (id: string) => onApproveSuggestion?.(id),
    [onApproveSuggestion]
  );
  const handleReject = useCallback(
    (id: string) => onRejectSuggestion?.(id),
    [onRejectSuggestion]
  );
  const handleCancel = useCallback(
    (id: string) => onCancelAction?.(id),
    [onCancelAction]
  );

  const scores = report?.scores;
  const suggestions = report?.suggestions ?? [];
  const activeSuggestions = suggestions.filter(s => s.status === 'PENDING');
  const overallTrend: TrendDirection = scores?.trend ?? 'STABLE';

  if (!report) {
    return (
      <div className={`evolution-dashboard no-data ${className}`}>
        <div className="no-data-icon">📊</div>
        <h3>Aucune donnée d&apos;évolution</h3>
        <p>Le moteur d&apos;évolution collecte des données...</p>
        {onRefresh && (
          <button className="btn-refresh" onClick={onRefresh}>
            Rafraîchir
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`evolution-dashboard ${compact ? 'compact' : ''} ${className}`}>
      <header className="dashboard-header">
        <div className="header-title">
          <span className="header-icon">🧬</span>
          <h2>Evolution Engine</h2>
          <span className="version-badge">vΩ∞</span>
        </div>
        <div className="header-actions">
          <span className="last-update">Mis à jour: {formatTimestamp(lastUpdate)}</span>
          {onRefresh && (
            <button className="btn-refresh-small" onClick={onRefresh} title="Rafraîchir">
              🔄
            </button>
          )}
        </div>
      </header>

      <nav className="dashboard-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Vue d&apos;ensemble
        </button>
        <button
          className={`tab ${activeTab === 'suggestions' ? 'active' : ''}`}
          onClick={() => setActiveTab('suggestions')}
        >
          Suggestions
          {activeSuggestions.length > 0 && (
            <span className="tab-badge">{activeSuggestions.length}</span>
          )}
        </button>
        <button
          className={`tab ${activeTab === 'actions' ? 'active' : ''}`}
          onClick={() => setActiveTab('actions')}
        >
          Actions
          {pendingActions.length > 0 && (
            <span className="tab-badge running">{pendingActions.length}</span>
          )}
        </button>
      </nav>

      <main className="dashboard-content">
        {activeTab === 'overview' && scores && (
          <div className="overview-content">
            <section className="overall-score-section">
              <OverallScoreGauge score={scores.overallScore} trend={overallTrend} />
            </section>
            <section className="scores-grid">
              <ScoreCard
                label="Stabilité"
                value={scores.stabilityIndex}
                trend={overallTrend}
                color={SCORE_COLORS.stability ?? '#22c55e'}
                icon="🛡️"
              />
              <ScoreCard
                label="Efficacité Cognitive"
                value={scores.cognitiveEfficiency}
                trend={overallTrend}
                color={SCORE_COLORS.cognitiveEfficiency ?? '#3b82f6'}
                icon="🧠"
              />
              <ScoreCard
                label="Pertinence Contextuelle"
                value={scores.contextRelevance}
                trend={overallTrend}
                color={SCORE_COLORS.contextRelevance ?? '#a855f7'}
                icon="🎯"
              />
              <ScoreCard
                label="Fiabilité Moteurs"
                value={scores.engineReliability}
                trend={overallTrend}
                color={SCORE_COLORS.engineReliability ?? '#f59e0b'}
                icon="⚙️"
              />
            </section>
            <section className="quick-stats">
              <div className="stat-item">
                <span className="stat-value">{report.insights.length}</span>
                <span className="stat-label">Insights</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{report.patterns.length}</span>
                <span className="stat-label">Patterns</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{suggestions.length}</span>
                <span className="stat-label">Suggestions</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{scores.grade}</span>
                <span className="stat-label">Grade</span>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div className="suggestions-content">
            {activeSuggestions.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">✅</span>
                <p>Aucune suggestion en attente</p>
                <small>Le système est optimisé</small>
              </div>
            ) : (
              <div className="suggestions-list">
                {activeSuggestions.map(s => (
                  <SuggestionCard
                    key={s.id}
                    suggestion={s}
                    onApprove={() => handleApprove(s.id)}
                    onReject={() => handleReject(s.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="actions-content">
            {pendingActions.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">⏸️</span>
                <p>Aucune action en cours</p>
                <small>Approuvez des suggestions pour démarrer</small>
              </div>
            ) : (
              <div className="actions-list">
                {pendingActions.map(a => (
                  <ActionCard key={a.id} action={a} onCancel={() => handleCancel(a.id)} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="dashboard-footer">
        <div className="safety-status">
          <span className="safety-icon">🔒</span>
          <span className="safety-text">
            Hiérarchie: Sécurité &gt; Stabilité &gt; Cohérence &gt; Optimisation
          </span>
        </div>
        <div className="engine-status">
          <span className={`status-dot ${report ? 'active' : 'inactive'}`} />
          <span className="status-text">{report ? 'Moteur actif' : 'En attente'}</span>
        </div>
      </footer>
    </div>
  );
};

EvolutionDashboard.displayName = 'EvolutionDashboard';

export default EvolutionDashboard;
