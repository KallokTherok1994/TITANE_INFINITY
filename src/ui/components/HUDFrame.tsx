/**
 * ═══════════════════════════════════════════════════════════
 *   TITANE∞ v15.5 — HUD FRAME COMPONENT
 *   Cadre glassmorphism réutilisable pour tous les panneaux
 * ═══════════════════════════════════════════════════════════
 */

import React from 'react';
import './styles/HUDFrame.css';

interface HUDFrameProps {
  children: React.ReactNode;
  title?: string;
  icon?: string;
  className?: string;
  expandable?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const HUDFrame: React.FC<HUDFrameProps> = ({
  children,
  title,
  icon,
  className = '',
  expandable = false,
  isExpanded = true,
  onToggleExpand
}) => {
  return (
    <div className={`hud-frame ${className} ${!isExpanded ? 'collapsed' : ''}`}>
      {title && (
        <div className="hud-frame-header">
          <div className="hud-frame-title">
            {icon && <span className="hud-frame-icon">{icon}</span>}
            <span>{title}</span>
          </div>
          {expandable && (
            <button
              className="hud-frame-toggle"
              onClick={onToggleExpand}
              aria-label={isExpanded ? 'Réduire' : 'Agrandir'}
            >
              {isExpanded ? '˅' : '˄'}
            </button>
          )}
        </div>
      )}
      <div className="hud-frame-content">
        {children}
      </div>
    </div>
  );
};
