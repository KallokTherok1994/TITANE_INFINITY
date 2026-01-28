/**
 * useZoomControl - Gère le zoom avec Ctrl+Plus/Minus/0
 * Sprint 6 Phase 3 - UI Controls Enhancement
 */

import { useEffect } from 'react';

export const useZoomControl = () => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + Plus/Equals = Zoom in
      if ((event.ctrlKey || event.metaKey) && (event.key === '+' || event.key === '=')) {
        event.preventDefault();
        adjustZoom(1.1); // +10%
        return;
      }

      // Ctrl/Cmd + Minus = Zoom out
      if ((event.ctrlKey || event.metaKey) && event.key === '-') {
        event.preventDefault();
        adjustZoom(0.9); // -10%
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
function adjustZoom(factor: number) {
  const html = document.documentElement;
  const currentZoom = parseFloat(html.style.zoom || '75');
  const newZoom = Math.max(50, Math.min(200, currentZoom * factor)); // Clamp between 50% and 200%
  html.style.zoom = `${newZoom}%`;
  
  // Save preference
  localStorage.setItem('titane_zoom_level', newZoom.toString());
  
  console.log(`🔍 Zoom ajusté: ${newZoom.toFixed(1)}%`);
}

/**
 * Réinitialise le zoom à 75%
 */
function resetZoom() {
  const html = document.documentElement;
  html.style.zoom = '75%';
  localStorage.setItem('titane_zoom_level', '75');
  
  console.log('🔍 Zoom réinitialisé: 75%');
}

/**
 * Charge le zoom sauvegardé au démarrage
 */
export const loadSavedZoom = () => {
  const savedZoom = localStorage.getItem('titane_zoom_level');
  if (savedZoom) {
    const zoomValue = Math.max(50, Math.min(200, parseFloat(savedZoom)));
    document.documentElement.style.zoom = `${zoomValue}%`;
  }
};
