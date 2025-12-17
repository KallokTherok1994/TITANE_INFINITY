/**
 * TITANE∞ v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v25.4.1 - Logo Component (Arc Reactor Emerald Core)
 * Logo officiel du système TITANE∞ — Réacteur Arc Émeraude
 * Style Iron Man avec coeur émeraude ultra-lumineux
 * ═══════════════════════════════════════════════════════════════
 */

import React from 'react';
// v25.4.1: Nouveau logo Arc Reactor Émeraude
import titaneLogoEmerald from '@/assets/titane-arc-emerald.svg';
// Legacy: Ancien logo cyan (conservé pour fallback)
import titaneLegacy from '@/assets/titane-reactor-awen.svg';
// CSS effets premium
import './TitaneLogo.css';

export type LogoVariant = 'emerald' | 'cyan' | 'legacy';

export interface TitaneLogoProps {
  /** Taille du logo en pixels (default: 32) */
  size?: number;
  /** Afficher le texte "TITANE∞" à côté du logo */
  withText?: boolean;
  /** Direction du layout (default: 'row') */
  direction?: 'row' | 'column';
  /** Classe CSS additionnelle */
  className?: string;
  /** Handler de clic */
  onClick?: () => void;
  /** Variante du logo: 'emerald' (default), 'cyan', 'legacy' */
  variant?: LogoVariant;
  /** Activer l'effet de glow CSS (default: true) */
  glow?: boolean;
  /** Intensité du glow (1-3, default: 2) */
  glowIntensity?: 1 | 2 | 3;
  /** Animation de pulsation (default: false) */
  pulse?: boolean;
}

// Mapping des variantes vers les assets
const LOGO_VARIANTS: Record<LogoVariant, string> = {
  emerald: titaneLogoEmerald,
  cyan: titaneLegacy,
  legacy: titaneLegacy,
};

// Couleurs de glow par variante
const GLOW_COLORS: Record<LogoVariant, string> = {
  emerald: '16, 185, 129', // #10B981
  cyan: '155, 229, 255', // #9BE5FF
  legacy: '155, 229, 255',
};

export const TitaneLogo: React.FC<TitaneLogoProps> = ({
  size = 32,
  withText = false,
  direction = 'row',
  className = '',
  onClick,
  variant = 'emerald',
  glow = true,
  glowIntensity = 2,
  pulse = false,
}) => {
  const logoSrc = LOGO_VARIANTS[variant];
  const glowColor = GLOW_COLORS[variant];

  // Calcul de l'intensité du glow
  const glowStrength = glow ? glowIntensity * 8 : 0;
  const glowOpacity = glow ? 0.3 + glowIntensity * 0.15 : 0;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    flexDirection: direction === 'row' ? 'row' : 'column',
    gap: direction === 'row' ? '0.5rem' : '0.25rem',
    cursor: onClick ? 'pointer' : 'default',
  };

  const imageStyle: React.CSSProperties = {
    width: size,
    height: size,
    userSelect: 'none',
    pointerEvents: 'none',
    filter: glow
      ? `drop-shadow(0 0 ${glowStrength}px rgba(${glowColor}, ${glowOpacity}))`
      : 'none',
    animation: pulse ? 'titane-logo-pulse 2s ease-in-out infinite' : 'none',
  };

  const textStyle: React.CSSProperties = {
    fontWeight: 600,
    letterSpacing: '0.05em',
    fontSize: '0.875rem',
    color: variant === 'emerald' ? '#6EE7B7' : '#9BE5FF',
    textShadow: glow
      ? `0 0 ${glowStrength / 2}px rgba(${glowColor}, ${glowOpacity})`
      : 'none',
  };

  const superscriptStyle: React.CSSProperties = {
    fontSize: '0.625rem',
    verticalAlign: 'super',
  };

  return (
    <div
      className={`titane-logo ${className}`}
      style={containerStyle}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? e => {
              if (e.key === 'Enter' || e.key === ' ') onClick();
            }
          : undefined
      }
    >
      <img
        src={logoSrc}
        alt={`Logo TITANE∞ — Arc Reactor ${variant === 'emerald' ? 'Émeraude' : 'Cyan'}`}
        style={imageStyle}
        draggable={false}
      />
      {withText && (
        <span style={textStyle}>
          TITANE<span style={superscriptStyle}>∞</span>
        </span>
      )}

      {/* CSS Animation keyframes (injection inline) */}
      {pulse && (
        <style>
          {`
            @keyframes titane-logo-pulse {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.05); opacity: 0.9; }
            }
          `}
        </style>
      )}
    </div>
  );
};

export default TitaneLogo;
