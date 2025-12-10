/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════
 *   TITANE∞ v15.5 — EXPAND BUTTON COMPONENT
 *   Bouton réutilisable pour agrandir/réduire les sections
 * ═══════════════════════════════════════════════════════════
 */

import React from 'react';
import './styles/ExpandButton.css';

interface ExpandButtonProps {
  isExpanded: boolean;
  onClick: () => void;
  direction?: 'vertical' | 'horizontal';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export const ExpandButton: React.FC<ExpandButtonProps> = ({
  isExpanded,
  onClick,
  direction = 'vertical',
  size = 'md',
  label,
}) => {
  const getIcon = () => {
    if (direction === 'vertical') {
      return isExpanded ? '˅' : '˄';
    } else {
      return isExpanded ? '<' : '>';
    }
  };

  return (
    <button
      className={`expand-button expand-button-${size}`}
      onClick={onClick}
      aria-label={label || (isExpanded ? 'Réduire' : 'Agrandir')}
      title={label || (isExpanded ? 'Réduire' : 'Agrandir')}
    >
      <span className="expand-button-icon">{getIcon()}</span>
    </button>
  );
};
