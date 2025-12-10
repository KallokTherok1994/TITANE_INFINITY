/**
 * TITANE∞ v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ UIReadingEngine v∞ — Hook
 *   Simple access to UIReading engine from components
 * ═══════════════════════════════════════════════════════════════════
 */

import { useUIReadingContext } from './UIReadingContext';

export function useUIReading() {
  return useUIReadingContext();
}

// Convenience hooks for specific features
export function useZoom() {
  const { settings, zoomIn, zoomOut, resetZoom, setZoom } = useUIReadingContext();
  return {
    zoomLevel: settings.zoomLevel,
    zoomIn,
    zoomOut,
    resetZoom,
    setZoom,
    zoomPercent: Math.round(settings.zoomLevel * 100),
  };
}

export function useTypography() {
  const {
    settings,
    setFontSize,
    setFontFamily,
    setLineHeight,
    setLetterSpacing,
    setMaxContentWidth,
  } = useUIReadingContext();

  return {
    fontSizeBase: settings.fontSizeBase,
    fontFamily: settings.fontFamily,
    lineHeight: settings.lineHeight,
    letterSpacing: settings.letterSpacing,
    maxContentWidth: settings.maxContentWidth,
    setFontSize,
    setFontFamily,
    setLineHeight,
    setLetterSpacing,
    setMaxContentWidth,
  };
}

export function useFullscreen() {
  const { settings, toggleFullscreen } = useUIReadingContext();
  return {
    isFullscreen: settings.isFullscreen,
    toggleFullscreen,
  };
}

export function usePresets() {
  const { settings, applyPreset, resetAll } = useUIReadingContext();
  return {
    currentPreset: settings.preset,
    applyPreset,
    resetAll,
  };
}
