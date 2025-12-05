/**
 * TITANE∞ v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ - Logo Component (Reactor Core)
 * Logo officiel du système TITANE∞ — Réacteur Awen
 * ═══════════════════════════════════════════════════════════════
 */

import React from 'react';
import titaneLogo from '@/assets/titane-reactor-awen.svg';

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
}

export const TitaneLogo: React.FC<TitaneLogoProps> = ({
  size = 32,
  withText = false,
  direction = 'row',
  className = '',
  onClick,
}) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    flexDirection: direction === 'row' ? 'row' : 'column',
    gap: direction === 'row' ? '0.5rem' : '0.25rem',
    cursor: onClick ? 'pointer' : 'default',
  };

  const textStyle: React.CSSProperties = {
    fontWeight: 600,
    letterSpacing: '0.05em',
    fontSize: '0.875rem',
    color: '#f5f5f5',
  };

  const superscriptStyle: React.CSSProperties = {
    fontSize: '0.625rem',
    verticalAlign: 'super',
  };

  return (
    <div
      className={className}
      style={containerStyle}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <img
        src={titaneLogo}
        alt="Logo TITANE∞ — Core Reactor"
        style={{
          width: size,
          height: size,
          userSelect: 'none',
          pointerEvents: 'none',
        }}
        draggable={false}
      />
      {withText && (
        <span style={textStyle}>
          TITANE<span style={superscriptStyle}>∞</span>
        </span>
      )}
    </div>
  );
};

export default TitaneLogo;
