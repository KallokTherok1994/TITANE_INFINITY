/**
 * TITANE∞ v24.2.1 — PersonaMoodIndicator Component
 *
 * Indicateur visuel du mood du Persona Engine
 * Première intégration visible du PersonaEngine dans l'UI
 */

import React from 'react';
import { useLivingEngines } from '../hooks';
import type { MoodType } from '../core';

interface MoodConfig {
  color: string;
  icon: string;
  label: string;
  glow: string;
}

const MOOD_CONFIGS: Record<MoodType, MoodConfig> = {
  clair: {
    color: '#60A5FA',
    icon: '☀️',
    label: 'Clair',
    glow: '0 0 12px rgba(96, 165, 250, 0.5)',
  },
  vibrant: {
    color: '#A78BFA',
    icon: '⚡',
    label: 'Vibrant',
    glow: '0 0 16px rgba(167, 139, 250, 0.6)',
  },
  attentif: {
    color: '#34D399',
    icon: '👁️',
    label: 'Attentif',
    glow: '0 0 10px rgba(52, 211, 153, 0.5)',
  },
  alerte: {
    color: '#FBBF24',
    icon: '⚠️',
    label: 'Alerte',
    glow: '0 0 14px rgba(251, 191, 36, 0.6)',
  },
  neutre: {
    color: '#9CA3AF',
    icon: '●',
    label: 'Neutre',
    glow: '0 0 8px rgba(156, 163, 175, 0.4)',
  },
  dormant: {
    color: '#4B5563',
    icon: '○',
    label: 'Dormant',
    glow: 'none',
  },
};

export const PersonaMoodIndicator: React.FC = () => {
  const { state } = useLivingEngines(100);
  const mood = state.persona?.mood.current || 'neutre';
  const config = MOOD_CONFIGS[mood];
  const intensity = state.persona?.mood.intensity || 0;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        borderRadius: '20px',
        background: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(8px)',
        border: `1px solid ${config.color}40`,
        boxShadow: config.glow,
        transition: 'all 0.3s ease',
        opacity: 0.7 + (intensity * 0.3),
      }}
      title={`Mood: ${config.label} (${Math.round(intensity * 100)}%)`}
    >
      <span style={{ fontSize: '14px' }}>{config.icon}</span>
      <span
        style={{
          fontSize: '12px',
          fontWeight: 500,
          color: config.color,
          textShadow: `0 0 4px ${config.color}80`,
        }}
      >
        {config.label}
      </span>
      <div
        style={{
          width: '32px',
          height: '4px',
          borderRadius: '2px',
          background: `linear-gradient(to right, ${config.color}40, ${config.color})`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${intensity * 100}%`,
            background: config.color,
            borderRadius: '2px',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
};
