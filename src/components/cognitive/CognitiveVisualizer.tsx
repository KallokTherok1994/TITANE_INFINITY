/**
 * TITANE∞ v∞ ULTRA — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * Visualisation en temps réel de l'état cognitif
 */

import React, { useEffect, useState } from 'react';
import { useCognitiveLayout } from '@/hooks/useCognitiveLayout';
import './CognitiveVisualizer.css';

/**
 * Visualiseur de l'état cognitif avec graphiques temps réel
 */
export function CognitiveVisualizer() {
  const { state, signals, currentMode } = useCognitiveLayout();
  const [history, setHistory] = useState<
    Array<{
      timestamp: number;
      energy: number;
      focus: number;
      load: number;
    }>
  >([]);

  // Enregistrer historique toutes les 10 secondes
  useEffect(() => {
    if (!signals) return;

    const interval = setInterval(() => {
      setHistory(prev => {
        const newHistory = [
          ...prev,
          {
            timestamp: Date.now(),
            energy: signals.energyLevel,
            focus: signals.focusScore,
            load: signals.cognitiveLoad,
          },
        ];

        // Garder seulement les 50 dernières mesures (500 secondes = ~8 minutes)
        return newHistory.slice(-50);
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [signals]);

  if (!state || !signals) return null;

  return (
    <div className="cognitive-visualizer">
      <h3>🧠 État Cognitif Temps Réel</h3>

      {/* Mode actuel */}
      <div className="cv-current-mode">
        <div className="cv-mode-indicator" data-mode={currentMode || 'neutral'}>
          {getModeIcon(currentMode || 'neutral')}
          <span>{getModeLabel(currentMode || 'neutral')}</span>
        </div>
      </div>

      {/* Signaux principaux */}
      <div className="cv-signals-grid">
        <SignalGauge
          label="⚡ Énergie"
          value={signals.energyLevel}
          color="#10b981"
          icon="⚡"
        />
        <SignalGauge
          label="🎯 Focus"
          value={signals.focusScore}
          color="#0ea5e9"
          icon="🎯"
        />
        <SignalGauge
          label="🧠 Charge"
          value={signals.cognitiveLoad}
          color="#f59e0b"
          icon="🧠"
          inverted
        />
      </div>

      {/* Alertes */}
      {(signals.fatigueEstimated || signals.blockageDetected) && (
        <div className="cv-alerts">
          {signals.fatigueEstimated && (
            <div className="cv-alert cv-alert-warning">
              😴 Fatigue détectée — {signals.sessionDuration.toFixed(0)} min sans pause
            </div>
          )}
          {signals.blockageDetected && (
            <div className="cv-alert cv-alert-info">
              🔄 Pattern de blocage détecté — Suggestion: Explorer d'autres modules
            </div>
          )}
        </div>
      )}

      {/* Graphique historique */}
      {history.length > 0 && (
        <div className="cv-chart">
          <h4>Historique (10 dernières minutes)</h4>
          <MiniChart data={history} />
        </div>
      )}

      {/* Contexte actuel */}
      <div className="cv-context">
        <div className="cv-context-item">
          <span className="cv-context-label">Module:</span>
          <span className="cv-context-value">{state.context.currentModule}</span>
        </div>
        <div className="cv-context-item">
          <span className="cv-context-label">Rôle:</span>
          <span className="cv-context-value">{getRoleLabel(state.context.role)}</span>
        </div>
        <div className="cv-context-item">
          <span className="cv-context-label">Tâche:</span>
          <span className="cv-context-value">{getTaskLabel(state.context.taskType)}</span>
        </div>
        <div className="cv-context-item">
          <span className="cv-context-label">Switches:</span>
          <span className="cv-context-value">{state.context.contextSwitches}</span>
        </div>
      </div>

      {/* Analytics */}
      <div className="cv-stats">
        <div className="cv-stat">
          <div className="cv-stat-value">{state.modeHistory.length}</div>
          <div className="cv-stat-label">Changements mode</div>
        </div>
        <div className="cv-stat">
          <div className="cv-stat-value">
            {(
              (state.preferences.acceptedSuggestions /
                Math.max(
                  state.preferences.acceptedSuggestions +
                    state.preferences.manualOverrides,
                  1
                )) *
              100
            ).toFixed(0)}
            %
          </div>
          <div className="cv-stat-label">Acceptation suggestions</div>
        </div>
        <div className="cv-stat">
          <div className="cv-stat-value">
            {(signals.sessionDuration / 60).toFixed(1)}h
          </div>
          <div className="cv-stat-label">Durée session</div>
        </div>
      </div>
    </div>
  );
}

/**
 * Jauge individuelle de signal
 */
function SignalGauge({
  label,
  value,
  color,
  icon,
  inverted = false,
}: {
  label: string;
  value: number;
  color: string;
  icon: string;
  inverted?: boolean;
}) {
  void color;
  const percentage = value * 100;
  const displayValue = inverted ? 1 - value : value;
  const displayPercentage = displayValue * 100;

  // Couleur selon valeur (inversée si charge)
  const getColor = () => {
    if (inverted) {
      if (value > 0.7) return '#ef4444'; // Rouge si charge élevée
      if (value > 0.4) return '#f59e0b'; // Orange si charge moyenne
      return '#10b981'; // Vert si charge faible
    }
    if (value < 0.3) return '#ef4444'; // Rouge si énergie/focus bas
    if (value < 0.6) return '#f59e0b'; // Orange si énergie/focus moyen
    return '#10b981'; // Vert si énergie/focus haut
  };

  return (
    <div className="signal-gauge">
      <div className="gauge-header">
        <span className="gauge-icon">{icon}</span>
        <span className="gauge-label">{label}</span>
        <span className="gauge-value">{percentage.toFixed(0)}%</span>
      </div>
      <div className="gauge-bar">
        <div
          className="gauge-fill"
          style={{
            width: `${displayPercentage}%`,
            backgroundColor: getColor(),
          }}
        />
      </div>
    </div>
  );
}

/**
 * Mini graphique historique
 */
function MiniChart({
  data,
}: {
  data: Array<{ timestamp: number; energy: number; focus: number; load: number }>;
}) {
  const _maxValue = 1;
  const height = 100;
  const width = 400;
  const points = data.length;

  if (points < 2) return <div className="mini-chart-empty">Collecte de données...</div>;

  const xStep = width / (points - 1);

  // Générer points SVG
  const energyPoints = data
    .map((d, i) => `${i * xStep},${height - d.energy * height}`)
    .join(' ');
  const focusPoints = data
    .map((d, i) => `${i * xStep},${height - d.focus * height}`)
    .join(' ');
  const loadPoints = data
    .map((d, i) => `${i * xStep},${height - (1 - d.load) * height}`)
    .join(' ');

  return (
    <div className="mini-chart">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Grille */}
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="rgba(255,255,255,0.1)"
          strokeDasharray="2,2"
        />

        {/* Lignes de données */}
        <polyline
          points={energyPoints}
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          opacity="0.8"
        />
        <polyline
          points={focusPoints}
          fill="none"
          stroke="#0ea5e9"
          strokeWidth="2"
          opacity="0.8"
        />
        <polyline
          points={loadPoints}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
          opacity="0.8"
        />
      </svg>

      <div className="mini-chart-legend">
        <span style={{ color: '#10b981' }}>⚡ Énergie</span>
        <span style={{ color: '#0ea5e9' }}>🎯 Focus</span>
        <span style={{ color: '#f59e0b' }}>🧠 Charge</span>
      </div>
    </div>
  );
}

// Helpers
function getModeIcon(mode: string): string {
  const icons: Record<string, string> = {
    focus_deep: '🎯',
    exploration: '🔍',
    monitoring: '📊',
    maintenance: '🔧',
    coaching: '🎓',
    neutral: '⚖️',
  };
  return icons[mode] || '⚖️';
}

function getModeLabel(mode: string): string {
  const labels: Record<string, string> = {
    focus_deep: 'Focus Profond',
    exploration: 'Exploration',
    monitoring: 'Monitoring',
    maintenance: 'Maintenance',
    coaching: 'Coaching',
    neutral: 'Neutre',
  };
  return labels[mode] || 'Neutre';
}

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    author: 'Auteur',
    strategist: 'Stratège',
    developer: 'Développeur',
    coach: 'Coach',
    explorer: 'Explorateur',
  };
  return labels[role] || role;
}

function getTaskLabel(task: string): string {
  const labels: Record<string, string> = {
    writing: 'Écriture',
    reflection: 'Réflexion',
    execution: 'Exécution',
    debugging: 'Debug',
    conception: 'Conception',
    navigation: 'Navigation',
    monitoring: 'Surveillance',
  };
  return labels[task] || task;
}
