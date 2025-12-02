/**
 * TITANE∞ v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ UIReadingEngine v∞ — Zoom Controls Component
 *   Compact controls for topbar: [-] (100%) [+] ⛶
 *   Design System: Monochrome TITANE
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { memo } from 'react';
import { useZoom, useFullscreen } from './useUIReading';
import { useUIReadingContext } from './UIReadingContext';
import './ZoomControls.css';

interface ZoomControlsProps {
  showPanelButton?: boolean;
  compact?: boolean;
  className?: string;
}

export const ZoomControls = memo(function ZoomControls({
  showPanelButton = true,
  compact = false,
  className = ''
}: ZoomControlsProps) {
  const { zoomLevel, zoomIn, zoomOut, resetZoom, zoomPercent } = useZoom();
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const { isPanelOpen, togglePanel } = useUIReadingContext();

  return (
    <div className={`zoom-controls ${compact ? 'zoom-controls--compact' : ''} ${className}`}>
      {/* Zoom Out */}
      <button
        className="zoom-controls__btn"
        onClick={zoomOut}
        disabled={zoomLevel <= 0.85}
        title="Zoom arrière (Ctrl+-)"
        aria-label="Zoom arrière"
      >
        −
      </button>

      {/* Zoom Level Display */}
      <button
        className="zoom-controls__level"
        onClick={resetZoom}
        title="Réinitialiser le zoom (Ctrl+0)"
        aria-label={`Zoom actuel: ${zoomPercent}%`}
      >
        {zoomPercent}%
      </button>

      {/* Zoom In */}
      <button
        className="zoom-controls__btn"
        onClick={zoomIn}
        disabled={zoomLevel >= 1.4}
        title="Zoom avant (Ctrl++)"
        aria-label="Zoom avant"
      >
        +
      </button>

      {/* Fullscreen Toggle */}
      <button
        className="zoom-controls__btn zoom-controls__btn--fullscreen"
        onClick={toggleFullscreen}
        title="Plein écran (F11)"
        aria-label={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
      >
        {isFullscreen ? '⛶' : '⛶'}
      </button>

      {/* Panel Toggle */}
      {showPanelButton && (
        <button
          className={`zoom-controls__btn zoom-controls__btn--panel ${isPanelOpen ? 'zoom-controls__btn--active' : ''}`}
          onClick={togglePanel}
          title="Préférences de lecture (Ctrl+Shift+R)"
          aria-label="Ouvrir les préférences de lecture"
        >
          Aa
        </button>
      )}
    </div>
  );
});
