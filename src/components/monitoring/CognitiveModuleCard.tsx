/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v20 — MODULE COGNITIFS CARDS (Helios, Nexus, Harmonia, Memory)
 * Glow Intelligent Data-Driven — HUD Vivant
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React from 'react';
import './CognitiveModuleCard.css';

export interface CognitiveModuleCardProps {
  module: 'helios' | 'nexus' | 'harmonia' | 'memory';
  value: number; // 0-100
  label: string;
  status?: 'stable' | 'active' | 'warning' | 'critical';
  subtitle?: string;
}

const moduleConfig = {
  helios: {
    icon: '🔥',
    title: 'Helios',
    description: 'Énergie & Charge CPU',
    gradient: 'var(--helios-gradient)',
    glowColor: 'var(--helios-glow)',
    animation: 'pulse-helios'
  },
  nexus: {
    icon: '🔗',
    title: 'Nexus',
    description: 'Connexions & Liens',
    gradient: 'var(--nexus-gradient)',
    glowColor: 'var(--nexus-glow)',
    animation: 'flow-nexus'
  },
  harmonia: {
    icon: '⚖️',
    title: 'Harmonia',
    description: 'Équilibre & Stabilité',
    gradient: 'var(--harmonia-gradient)',
    glowColor: 'var(--harmonia-glow)',
    animation: 'sway-harmonia'
  },
  memory: {
    icon: '🧠',
    title: 'Memory',
    description: 'Profondeur & Couches',
    gradient: 'var(--memory-gradient)',
    glowColor: 'var(--memory-glow)',
    animation: 'scan-memory'
  }
};

export const CognitiveModuleCard: React.FC<CognitiveModuleCardProps> = ({
  module,
  value,
  label,
  status = 'stable',
  subtitle
}) => {
  const config = moduleConfig[module];
  const intensity = value / 100;

  return (
    <div 
      className={`cognitive-module-card cognitive-module-card--${module} cognitive-module-card--${status}`}
      style={{
        '--module-intensity': intensity,
        '--module-glow': config.glowColor
      } as React.CSSProperties}
    >
      {/* Animated Glow Background */}
      <div className="cognitive-module-card__glow" />

      {/* Icon */}
      <div className="cognitive-module-card__icon">
        {config.icon}
      </div>

      {/* Content */}
      <div className="cognitive-module-card__content">
        <h4 className="cognitive-module-card__title">{config.title}</h4>
        <p className="cognitive-module-card__description">{config.description}</p>
      </div>

      {/* Value Display */}
      <div className="cognitive-module-card__value">
        {value}
        <span className="cognitive-module-card__unit">%</span>
      </div>

      {/* Label */}
      <div className="cognitive-module-card__label">{label}</div>

      {/* Subtitle */}
      {subtitle && (
        <div className="cognitive-module-card__subtitle">{subtitle}</div>
      )}

      {/* Progress Bar */}
      <div className="cognitive-module-card__progress">
        <div 
          className="cognitive-module-card__progress-fill"
          style={{ width: `${value}%` }}
        />
      </div>

      {/* Animated Elements */}
      <div className={`cognitive-module-card__animation cognitive-module-card__animation--${module}`} />
    </div>
  );
};
