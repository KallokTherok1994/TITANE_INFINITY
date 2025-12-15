/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v24.7 — MODE BADGE
 *   Badge indicateur du mode actif avec tooltip
 *   Optimisé avec React.memo et useMemo pour performance
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useCallback, useMemo, memo } from 'react';
import type { ChatModeId } from '../../services/ai/chatModes.config';
import { CHAT_MODES_CONFIG } from '../../services/ai/chatModes.config';
import './ModeBadge.css';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface ModeBadgeProps {
  /** Mode à afficher */
  mode: ChatModeId;
  /** Taille du badge */
  size?: 'small' | 'medium' | 'large';
  /** Afficher le label texte */
  showLabel?: boolean;
  /** Afficher le tooltip au hover */
  showTooltip?: boolean;
  /** Callback au clic (optionnel) */
  onClick?: () => void;
  /** Classe CSS additionnelle */
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// SOUS-COMPOSANT TOOLTIP MEMOIZÉ
// ─────────────────────────────────────────────────────────────────────────────

interface TooltipContentProps {
  icon: string;
  label: string;
  description: string;
  temperature: number | string;
  permissionLevel: number | string;
}

const TooltipContent = memo(function TooltipContent({
  icon,
  label,
  description,
  temperature,
  permissionLevel,
}: TooltipContentProps) {
  return (
    <div className="mode-badge__tooltip">
      <div className="mode-badge__tooltip-header">
        <span className="mode-badge__tooltip-icon">{icon}</span>
        <span className="mode-badge__tooltip-title">{label}</span>
      </div>
      <p className="mode-badge__tooltip-desc">{description}</p>
      <div className="mode-badge__tooltip-meta">
        <span className="mode-badge__tooltip-temp">🌡️ Temp: {temperature}</span>
        <span className="mode-badge__tooltip-perm">🔒 Niveau: {permissionLevel}</span>
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Badge indicateur du mode chat actif
 * Optimisé avec React.memo pour éviter les re-renders inutiles
 */
export const ModeBadge = memo(function ModeBadge({
  mode,
  size = 'medium',
  showLabel = true,
  showTooltip = true,
  onClick,
  className = '',
}: ModeBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Memoize la configuration du mode
  const modeConfig = useMemo(
    () => CHAT_MODES_CONFIG[mode] ?? CHAT_MODES_CONFIG.default,
    [mode]
  );

  // Callbacks memoizés
  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  // Memoize les classes CSS
  const badgeClasses = useMemo(
    () =>
      [
        'mode-badge',
        `mode-badge--${size}`,
        onClick ? 'mode-badge--clickable' : '',
        className,
      ]
        .filter(Boolean)
        .join(' '),
    [size, onClick, className]
  );

  // Memoize le style avec la couleur du thème
  const badgeStyle = useMemo(
    () => ({ '--badge-color': modeConfig.themeColor }) as React.CSSProperties,
    [modeConfig.themeColor]
  );

  return (
    <div
      className={badgeClasses}
      style={badgeStyle}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <span className="mode-badge__icon">{modeConfig.icon}</span>
      {showLabel && <span className="mode-badge__label">{modeConfig.label}</span>}

      {/* Tooltip */}
      {showTooltip && isHovered && (
        <TooltipContent
          icon={modeConfig.icon}
          label={modeConfig.label}
          description={modeConfig.description}
          temperature={modeConfig.temperature}
          permissionLevel={modeConfig.permissionLevel}
        />
      )}
    </div>
  );
});

export default ModeBadge;
