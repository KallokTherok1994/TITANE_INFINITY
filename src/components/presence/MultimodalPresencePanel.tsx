/**
 * TITANE_INFINITY v∞.28 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

import React from 'react';
import {
  useMultimodalPresence,
  useBreathingCycle,
  useHaloExpression,
  useAvatarMimics,
  useInnerState,
  usePresenceEnergy,
  useExpressiveActions,
} from '@/hooks/useMultimodalPresence';

// REMOVED: engines/presence supprimé en PHASE 1 (OPTION B)
type PresenceMode = string;
/*
import type { PresenceMode } from '@/engines/presence/multimodalPresenceEngine';
*/

import './MultimodalPresencePanel.css';

/**
 * Panneau de contrôle et visualisation de la présence multimodale
 */
export function MultimodalPresencePanel() {
  const { state, mode, setMode, activateHealingMode, activateStoryMode, activateListeningMode } =
    useMultimodalPresence();
  const { breathing, breathingValue } = useBreathingCycle();
  const { cssColor, haloColor, intensity, pulsation } = useHaloExpression();
  const { shouldBlink, expression, glow } = useAvatarMimics();
  const { thinkingState, coherence } = useInnerState();
  const { energy } = usePresenceEnergy();
  const { applyGuidance, applyComfort, applyAnalysis, applyInspiration, applySurprise } =
    useExpressiveActions();

  const [isExpanded, setIsExpanded] = React.useState(false);

  // Modes disponibles
  const modes: PresenceMode[] = [
    'idle',
    'listening',
    'thinking',
    'speaking',
    'storytelling',
    'deep_reflection',
    'empathic_sync',
  ];

  return (
    <div className={`multimodal-presence-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {/* Toggle button */}
      <button className="presence-toggle" onClick={() => setIsExpanded(!isExpanded)}>
        <span className="toggle-icon">◉</span>
        <span className="toggle-label">Présence</span>
      </button>

      {/* Panel content */}
      {isExpanded && (
        <div className="presence-content">
          {/* Header */}
          <div className="presence-header">
            <h3>Présence Multimodale TITANE∞</h3>
            <div className="presence-mode-badge" data-mode={mode}>
              {mode}
            </div>
          </div>

          {/* Halo Visualization */}
          <div className="presence-section">
            <h4>Halo Expression</h4>
            <div className="halo-preview" style={{ backgroundColor: cssColor }}>
              <div
                className="halo-pulse"
                style={{
                  transform: `scale(${1 + pulsation})`,
                  opacity: intensity,
                }}
              />
            </div>
            <div className="halo-info">
              <span>
                HSL({haloColor.hue.toFixed(0)}, {haloColor.saturation.toFixed(0)}%,{' '}
                {haloColor.lightness.toFixed(0)}%)
              </span>
              <span className="halo-intention">{haloColor.intention}</span>
            </div>
          </div>

          {/* Breathing Visualization */}
          <div className="presence-section">
            <h4>Respiration</h4>
            <div className="breathing-visualizer">
              <div className="breathing-phase">{breathing.phase}</div>
              <div className="breathing-bar">
                <div
                  className="breathing-fill"
                  style={{
                    height: `${(breathingValue + breathing.amplitude) * 50}%`,
                  }}
                />
              </div>
              <div className="breathing-stats">
                <span>Cycle: {(breathing.cycleDuration / 1000).toFixed(1)}s</span>
                <span>Amplitude: {(breathing.amplitude * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* Avatar Mimics */}
          <div className="presence-section">
            <h4>Avatar Micro-Mimics</h4>
            <div className="avatar-mimics">
              <div className="mimic-item">
                <span>Expression:</span>
                <span className="mimic-value">{expression}</span>
              </div>
              <div className="mimic-item">
                <span>Blink:</span>
                <span className={`mimic-indicator ${shouldBlink ? 'active' : ''}`}>
                  {shouldBlink ? '—' : '○'}
                </span>
              </div>
              <div className="mimic-item">
                <span>Glow:</span>
                <span className="mimic-value">{(glow * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* Inner State */}
          <div className="presence-section">
            <h4>État Interne</h4>
            <div className="inner-state">
              <div className="inner-thinking">{thinkingState || 'silent'}</div>
              <div className="inner-coherence">
                <span>Cohérence:</span>
                <div className="coherence-bar">
                  <div
                    className="coherence-fill"
                    style={{ width: `${coherence * 100}%` }}
                  />
                </div>
                <span>{(coherence * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* Presence Energy */}
          <div className="presence-section">
            <h4>Énergie de Présence</h4>
            <div className="energy-meter">
              <div className="energy-fill" style={{ width: `${energy * 100}%` }} />
              <span className="energy-value">{(energy * 100).toFixed(0)}%</span>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="presence-section">
            <h4>Mode</h4>
            <div className="mode-selector">
              {modes.map((m) => (
                <button
                  key={m}
                  className={`mode-btn ${mode === m ? 'active' : ''}`}
                  onClick={() => setMode(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Special Actions */}
          <div className="presence-section">
            <h4>Actions Spéciales</h4>
            <div className="action-buttons">
              <button className="action-btn healing" onClick={activateHealingMode}>
                🔴 Healing
              </button>
              <button className="action-btn story" onClick={activateStoryMode}>
                📖 Story
              </button>
              <button className="action-btn listening" onClick={activateListeningMode}>
                👂 Listening
              </button>
            </div>
          </div>

          {/* Expressive Intentions */}
          <div className="presence-section">
            <h4>Intentions Expressives</h4>
            <div className="intention-buttons">
              <button className="intention-btn" onClick={() => applyGuidance()}>
                🧭 Guidance
              </button>
              <button className="intention-btn" onClick={() => applyComfort()}>
                💙 Confort
              </button>
              <button className="intention-btn" onClick={() => applyAnalysis()}>
                🔍 Analyse
              </button>
              <button className="intention-btn" onClick={() => applyInspiration()}>
                ✨ Inspiration
              </button>
              <button className="intention-btn" onClick={() => applySurprise()}>
                😮 Surprise
              </button>
            </div>
          </div>

          {/* Current Intention */}
          {state.currentIntention && (
            <div className="presence-section">
              <h4>Intention Active</h4>
              <div className="current-intention">
                <span className="intention-type">{state.currentIntention.type}</span>
                <span className="intention-intensity">
                  Intensité: {(state.currentIntention.intensity * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Indicateur compact de présence (badge flottant)
 */
export function MultimodalPresenceBadge() {
  const { mode } = useMultimodalPresence();
  const { cssColor } = useHaloExpression();
  const { breathingValue } = useBreathingCycle();

  return (
    <div
      className="presence-badge"
      style={{
        backgroundColor: cssColor,
        transform: `scale(${1 + breathingValue * 0.1})`,
      }}
      data-mode={mode}
    >
      <span className="badge-icon">◉</span>
    </div>
  );
}
