/**
 * useZoomControl - Gère le zoom avec Ctrl+Plus/Minus/0
 * Sprint 6 Phase 3 - UI Controls Enhancement
 */

import { useEffect } from 'react';

import {
  applyZoomScale,
  BASE_ZOOM_SCALE,
  formatZoomScale,
  getStoredZoomScale,
  readCurrentZoomScale,
  stepZoomScale,
} from './zoomScale';

export const useZoomControl = () => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + Plus/Equals = Zoom in
      if ((event.ctrlKey || event.metaKey) && (event.key === '+' || event.key === '=')) {
        event.preventDefault();
        adjustZoom(1); // +10%
        return;
      }

      // Ctrl/Cmd + Minus = Zoom out
      if ((event.ctrlKey || event.metaKey) && event.key === '-') {
        event.preventDefault();
        adjustZoom(-1); // -10%
        return;
      }

      // Ctrl/Cmd + 0 = Reset zoom
      if ((event.ctrlKey || event.metaKey) && event.key === '0') {
        event.preventDefault();
        resetZoom();
        return;
      }

      // F11 is handled by browser (fullscreen toggle)
      // No need to handle here
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
};

/**
 * Ajuste le zoom actuellement appliqué
 */
function adjustZoom(direction: 1 | -1) {
  const newZoom = applyZoomScale(stepZoomScale(readCurrentZoomScale(), direction));
  console.log(`🔍 Zoom ajusté: ${(newZoom * 100).toFixed(1)}%`);
}

/**
 * Réinitialise le zoom à 100%
 */
function resetZoom() {
  const defaultZoom = applyZoomScale(BASE_ZOOM_SCALE);
  console.log(`🔍 Zoom réinitialisé: ${(defaultZoom * 100).toFixed(1)}%`);
}

/**
 * Charge le zoom sauvegardé au démarrage
 */
export const loadSavedZoom = () => {
  const savedZoom = getStoredZoomScale();
  if (savedZoom !== null) {
    applyZoomScale(savedZoom);
    return;
  }

  applyZoomScale(BASE_ZOOM_SCALE);
};
