/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.2Ω — MODE BADGE
 *   Badge indicateur du mode actif avec tooltip
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useCallback } from 'react';
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
// COMPOSANT
// ─────────────────────────────────────────────────────────────────────────────

export const ModeBadge: React.FC<ModeBadgeProps> = ({
  mode,
  size = 'medium',
  showLabel = true,
  showTooltip = true,
  onClick,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const modeConfig = CHAT_MODES_CONFIG[mode] ?? CHAT_MODES_CONFIG.default;

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  const badgeClasses = [
    'mode-badge',
    `mode-badge--${size}`,
    onClick ? 'mode-badge--clickable' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      className={badgeClasses}
      style={{ '--badge-color': modeConfig.themeColor } as React.CSSProperties}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <span className="mode-badge__icon">{modeConfig.icon}</span>
      {showLabel && (
        <span className="mode-badge__label">{modeConfig.label}</span>
      )}

      {/* Tooltip */}
      {showTooltip && isHovered && (
        <div className="mode-badge__tooltip">
          <div className="mode-badge__tooltip-header">
            <span className="mode-badge__tooltip-icon">{modeConfig.icon}</span>
            <span className="mode-badge__tooltip-title">{modeConfig.label}</span>
          </div>
          <p className="mode-badge__tooltip-desc">{modeConfig.description}</p>
          <div className="mode-badge__tooltip-meta">
            <span className="mode-badge__tooltip-temp">
              🌡️ Temp: {modeConfig.temperature}
            </span>
            <span className="mode-badge__tooltip-perm">
              🔒 Niveau: {modeConfig.permissionLevel}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModeBadge;
