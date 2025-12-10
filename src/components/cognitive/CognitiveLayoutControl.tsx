/**
 * TITANE∞ v∞ ULTRA — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * Panneau de contrôle du Cognitive Layout Engine
 */

import React from 'react';
import { useCognitiveLayout, type UIMode } from '@/hooks/useCognitiveLayout';
import './CognitiveLayoutControl.css';

const MODE_LABELS: Record<UIMode, string> = {
  focus_deep: '🎯 Focus Profond',
  exploration: '🔍 Exploration',
  monitoring: '📊 Monitoring',
  maintenance: '🔧 Maintenance',
  coaching: '🎓 Coaching',
  neutral: '⚖️ Neutre',
};

const MODE_DESCRIPTIONS: Record<UIMode, string> = {
  focus_deep: 'Concentration maximale, distractions minimales',
  exploration: 'Navigation et découverte, suggestions activées',
  monitoring: 'Surveillance et métriques, haute densité',
  maintenance: 'Debug et configuration technique',
  coaching: 'Interface narrative pour accompagnement',
  neutral: 'Mode équilibré par défaut',
};

export function CognitiveLayoutControl() {
  const {
    currentMode,
    suggestion,
    signals,
    setMode,
    acceptSuggestion,
    refuseSuggestion,
    revertMode,
    resetMode,
    toggleAdaptation,
    isAdaptationEnabled,
    hasSuggestion,
  } = useCognitiveLayout();

  if (!currentMode) return null;

  return (
    <div className="cognitive-layout-control">
      {/* Header */}
      <div className="clc-header">
        <h3>🧠 Cognitive Layout</h3>
        <label className="clc-toggle">
          <input
            type="checkbox"
            checked={isAdaptationEnabled}
            onChange={e => toggleAdaptation(e.target.checked)}
          />
          <span>Adaptation auto</span>
        </label>
      </div>

      {/* Mode actuel */}
      <div className="clc-current-mode">
        <div className="clc-mode-badge">{MODE_LABELS[currentMode]}</div>
        <p className="clc-mode-desc">{MODE_DESCRIPTIONS[currentMode]}</p>
      </div>

      {/* Suggestion d'adaptation */}
      {hasSuggestion && suggestion && (
        <div className="clc-suggestion">
          <div className="clc-suggestion-header">
            <span className="clc-suggestion-icon">💡</span>
            <span className="clc-suggestion-title">Suggestion</span>
            <span className="clc-suggestion-confidence">
              {(suggestion.confidence * 100).toFixed(0)}%
            </span>
          </div>

          <div className="clc-suggestion-body">
            <p className="clc-suggestion-mode">
              Passer en mode <strong>{MODE_LABELS[suggestion.suggestedMode]}</strong>
            </p>
            <p className="clc-suggestion-reason">{suggestion.reasoning}</p>
          </div>

          <div className="clc-suggestion-actions">
            <button className="clc-btn clc-btn-primary" onClick={acceptSuggestion}>
              Appliquer
            </button>
            <button className="clc-btn clc-btn-secondary" onClick={refuseSuggestion}>
              Refuser
            </button>
          </div>
        </div>
      )}

      {/* Sélecteur de mode manuel */}
      <div className="clc-mode-selector">
        <h4>Changer de mode</h4>
        <div className="clc-mode-grid">
          {(Object.keys(MODE_LABELS) as UIMode[]).map(mode => (
            <button
              key={mode}
              className={`clc-mode-btn ${currentMode === mode ? 'active' : ''}`}
              onClick={() => setMode(mode)}
              title={MODE_DESCRIPTIONS[mode]}
            >
              {MODE_LABELS[mode]}
            </button>
          ))}
        </div>
      </div>

      {/* Signaux cognitifs */}
      {signals && (
        <div className="clc-signals">
          <h4>Signaux cognitifs</h4>
          <div className="clc-signal-grid">
            <div className="clc-signal">
              <span className="clc-signal-label">⚡ Énergie</span>
              <div className="clc-signal-bar">
                <div
                  className="clc-signal-fill"
                  style={{ width: `${signals.energyLevel * 100}%` }}
                />
              </div>
            </div>

            <div className="clc-signal">
              <span className="clc-signal-label">🎯 Focus</span>
              <div className="clc-signal-bar">
                <div
                  className="clc-signal-fill"
                  style={{ width: `${signals.focusScore * 100}%` }}
                />
              </div>
            </div>

            <div className="clc-signal">
              <span className="clc-signal-label">🧠 Charge</span>
              <div className="clc-signal-bar">
                <div
                  className="clc-signal-fill clc-signal-negative"
                  style={{ width: `${signals.cognitiveLoad * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="clc-signal-info">
            <span>⏱️ Session: {signals.sessionDuration.toFixed(0)} min</span>
            {signals.fatigueEstimated && (
              <span className="clc-warning">⚠️ Fatigue détectée</span>
            )}
            {signals.blockageDetected && (
              <span className="clc-warning">🔄 Blocage détecté</span>
            )}
          </div>
        </div>
      )}

      {/* Actions rapides */}
      <div className="clc-actions">
        <button className="clc-btn clc-btn-small" onClick={revertMode}>
          ⏮️ Mode précédent
        </button>
        <button className="clc-btn clc-btn-small" onClick={resetMode}>
          ⚖️ Reset neutre
        </button>
      </div>
    </div>
  );
}

/**
 * Version compacte pour la toolbar
 */
export function CognitiveLayoutBadge() {
  const { currentMode, hasSuggestion } = useCognitiveLayout();

  if (!currentMode) return null;

  return (
    <div className="cognitive-layout-badge">
      {MODE_LABELS[currentMode]}
      {hasSuggestion && <span className="clc-badge-dot">●</span>}
    </div>
  );
}
