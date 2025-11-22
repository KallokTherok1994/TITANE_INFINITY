/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v24 — LIVING ENGINES CARD
 *   Affichage temps réel des 13 moteurs vivants
 * ═══════════════════════════════════════════════════════════════
 */

import React from 'react';
import type { LivingEnginesState } from '../../hooks/useLivingEngines';
import './LivingEnginesCard.css';

export interface LivingEnginesCardProps {
  state: LivingEnginesState;
}

export const LivingEnginesCard: React.FC<LivingEnginesCardProps> = ({ state }) => {
  if (!state.initialized) {
    return (
      <div className="living-engines-card living-engines-card--loading">
        <div className="living-engines-card__header">
          <h3 className="living-engines-card__title">🌟 Living Engines v21-v24</h3>
        </div>
        <div className="living-engines-card__loading">
          <div className="living-engines-card__spinner" />
          <p>Initializing 13 engines...</p>
        </div>
      </div>
    );
  }

  const { persona, glow, motion, depth, sound, presenceLevel, cognitiveLoad, rhythmScore, holoActive, particleCount } = state;

  return (
    <div 
      className="living-engines-card"
      style={{
        '--glow-mult': glow,
        '--motion-mult': motion,
        '--depth-mult': depth,
        opacity: presenceLevel > 0 ? 0.9 + presenceLevel * 0.1 : 0.9,
      } as React.CSSProperties}
    >
      {/* Header */}
      <div className="living-engines-card__header">
        <h3 className="living-engines-card__title">
          🌟 Living Engines v21-v24
        </h3>
        <span className="living-engines-card__badge">
          {state.systemState}
        </span>
      </div>

      {/* Persona Section */}
      {persona && (
        <div className="living-engines-section">
          <h4 className="living-engines-section__title">🎭 Persona Engine</h4>
          <div className="living-engines-metrics">
            <div className="living-metric">
              <span className="living-metric__label">Mood</span>
              <span className="living-metric__value living-metric__value--highlight">
                {persona.mood.current}
              </span>
            </div>
            <div className="living-metric">
              <span className="living-metric__label">Temperament</span>
              <span className="living-metric__value">
                {persona.personality.temperament}
              </span>
            </div>
            <div className="living-metric">
              <span className="living-metric__label">Présence</span>
              <span className="living-metric__value">
                {(presenceLevel * 100).toFixed(0)}%
              </span>
            </div>
            <div className="living-metric">
              <span className="living-metric__label">Posture</span>
              <span className="living-metric__value">
                {persona.behavior.posture}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Visual Engines Section */}
      <div className="living-engines-section">
        <h4 className="living-engines-section__title">✨ Visual Engines</h4>
        <div className="living-engines-metrics">
          <div className="living-metric">
            <span className="living-metric__label">Glow</span>
            <span className="living-metric__value">{glow.toFixed(2)}x</span>
            <div className="living-metric__bar">
              <div 
                className="living-metric__bar-fill living-metric__bar-fill--glow"
                style={{ width: `${Math.min(glow * 50, 100)}%` }}
              />
            </div>
          </div>
          <div className="living-metric">
            <span className="living-metric__label">Motion</span>
            <span className="living-metric__value">{motion.toFixed(2)}x</span>
            <div className="living-metric__bar">
              <div 
                className="living-metric__bar-fill living-metric__bar-fill--motion"
                style={{ width: `${Math.min(motion * 50, 100)}%` }}
              />
            </div>
          </div>
          <div className="living-metric">
            <span className="living-metric__label">Depth</span>
            <span className="living-metric__value">{depth.toFixed(2)}</span>
            <div className="living-metric__bar">
              <div 
                className="living-metric__bar-fill living-metric__bar-fill--depth"
                style={{ width: `${depth * 100}%` }}
              />
            </div>
          </div>
          <div className="living-metric">
            <span className="living-metric__label">Sound</span>
            <span className="living-metric__value">{sound.toFixed(2)}</span>
            <div className="living-metric__bar">
              <div 
                className="living-metric__bar-fill living-metric__bar-fill--sound"
                style={{ width: `${sound * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cognitive Section */}
      <div className="living-engines-section">
        <h4 className="living-engines-section__title">🧠 Cognitive Engines</h4>
        <div className="living-engines-metrics">
          <div className="living-metric">
            <span className="living-metric__label">Cognitive Load</span>
            <span className="living-metric__value">
              {(cognitiveLoad * 100).toFixed(0)}%
            </span>
            <div className="living-metric__bar">
              <div 
                className="living-metric__bar-fill living-metric__bar-fill--cognitive"
                style={{ width: `${cognitiveLoad * 100}%` }}
              />
            </div>
          </div>
          <div className="living-metric">
            <span className="living-metric__label">Rhythm Score</span>
            <span className="living-metric__value">
              {(rhythmScore * 100).toFixed(0)}%
            </span>
            <div className="living-metric__bar">
              <div 
                className="living-metric__bar-fill living-metric__bar-fill--rhythm"
                style={{ width: `${rhythmScore * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Holography Section */}
      <div className="living-engines-section">
        <h4 className="living-engines-section__title">🌐 Holography Engines</h4>
        <div className="living-engines-metrics">
          <div className="living-metric">
            <span className="living-metric__label">Status</span>
            <span className={`living-metric__value ${holoActive ? 'living-metric__value--active' : ''}`}>
              {holoActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="living-metric">
            <span className="living-metric__label">Particles</span>
            <span className="living-metric__value">{particleCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
