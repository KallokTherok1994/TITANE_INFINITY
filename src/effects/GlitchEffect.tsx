/**
 * TITANE_INFINITY v19.3.0 — Glitch Effect
 * RGB split and displacement glitch effect
 *
 * Features:
 * - CSS-based glitch animation
 * - Customizable intensity
 * - Optional continuous or triggered mode
 * - Performance optimized
 */

import React from 'react';

export interface GlitchEffectProps {
  className?: string;
  children: React.ReactNode;
  intensity?: 'low' | 'medium' | 'high';
  continuous?: boolean;
  trigger?: boolean;
}

export const GlitchEffect: React.FC<GlitchEffectProps> = ({
  className = '',
  children,
  intensity = 'medium',
  continuous = false,
  trigger = false,
}) => {
  const getGlitchClass = () => {
    if (continuous || trigger) {
      return 'glitch';
    }
    return '';
  };

  const getIntensityValue = () => {
    switch (intensity) {
      case 'low':
        return 1;
      case 'high':
        return 3;
      default:
        return 2;
    }
  };

  const intensityValue = getIntensityValue();

  return (
    <div
      className={`glitch-effect ${getGlitchClass()} ${className}`}
      style={{
        position: 'relative',
        display: 'inline-block',
      }}
    >
      {/* Main content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
        }}
      >
        {children}
      </div>

      {/* Glitch layers (RGB split) */}
      {(continuous || trigger) && (
        <>
          {/* Red channel */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: 0.8,
              mixBlendMode: 'screen',
              filter: `hue-rotate(0deg)`,
              transform: `translate(-${intensityValue}px, 0)`,
              pointerEvents: 'none',
              zIndex: 0,
            }}
            aria-hidden="true"
          >
            {children}
          </div>

          {/* Blue channel */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: 0.8,
              mixBlendMode: 'screen',
              filter: `hue-rotate(180deg)`,
              transform: `translate(${intensityValue}px, 0)`,
              pointerEvents: 'none',
              zIndex: 0,
            }}
            aria-hidden="true"
          >
            {children}
          </div>
        </>
      )}
    </div>
  );
};

export default GlitchEffect;
