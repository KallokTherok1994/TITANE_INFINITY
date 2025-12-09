/**
 * TITANE_INFINITY v19.3.0 — Healing Waves Effect
 * Expanding ripple waves for healing visualization
 *
 * Features:
 * - Multiple concentric ripples
 * - Fade out animation
 * - Customizable colors and speed
 * - Auto-cleanup of finished waves
 */

import React from 'react';

export interface HealingWavesProps {
  className?: string;
  color?: string;
  waveCount?: number;
  duration?: number;
  centerX?: string;
  centerY?: string;
  maxRadius?: string;
}

export const HealingWaves: React.FC<HealingWavesProps> = ({
  className = '',
  color = '#06b6d4',
  waveCount = 3,
  duration = 1.5,
  centerX = '50%',
  centerY = '50%',
  maxRadius = '80%',
}) => {
  return (
    <div
      className={`healing-waves ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {Array.from({ length: waveCount }).map((_, index) => {
        const delay = (index / waveCount) * duration;

        return (
          <div
            key={`wave-${index}`}
            className="healing-ripple"
            style={{
              position: 'absolute',
              left: centerX,
              top: centerY,
              transform: 'translate(-50%, -50%)',
              width: maxRadius,
              height: maxRadius,
              borderRadius: '50%',
              border: `2px solid ${color}`,
              boxShadow: `0 0 16px ${color}`,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}
    </div>
  );
};

export default HealingWaves;
