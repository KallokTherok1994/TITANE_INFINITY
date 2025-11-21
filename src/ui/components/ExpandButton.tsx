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
  label
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
