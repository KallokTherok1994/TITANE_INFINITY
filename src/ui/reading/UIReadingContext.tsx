/**
 * TITANE∞ v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ UIReadingEngine v∞ — Context & Types
 *   Super Prompt: UIReadingEngine Extended Edition
 *   Zoom • Typography • Fullscreen • Presets • IA Control
 * ═══════════════════════════════════════════════════════════════════
 */

import { createContext, useContext } from 'react';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export type UIScale = 0.85 | 0.90 | 0.95 | 1.0 | 1.05 | 1.10 | 1.15 | 1.2 | 1.3 | 1.4;
export type FontFamilyOption = 'system' | 'serif' | 'mono';
export type PresetName = 'default' | 'focus' | 'reading' | 'immersion' | 'dev' | null;

export interface UIReadingSettings {
  zoomLevel: UIScale;
  fontSizeBase: number;
  fontFamily: FontFamilyOption;
  lineHeight: number;
  letterSpacing: number;
  maxContentWidth: number;
  isFullscreen: boolean;
  preset: PresetName;
}

export interface UIReadingContextValue {
  settings: UIReadingSettings;

  // Zoom controls
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  setZoom: (level: UIScale) => void;

  // Typography controls
  setFontSize: (size: number) => void;
  setFontFamily: (family: FontFamilyOption) => void;
  setLineHeight: (height: number) => void;
  setLetterSpacing: (spacing: number) => void;
  setMaxContentWidth: (width: number) => void;

  // Fullscreen
  toggleFullscreen: () => void;

  // Presets
  applyPreset: (preset: PresetName) => void;

  // Reset
  resetAll: () => void;

  // IA Control API
  applyIACommand: (command: UIReadingCommand) => { success: boolean; error?: string };

  // Panel state
  isPanelOpen: boolean;
  togglePanel: () => void;
}

// ═══════════════════════════════════════════════════════════════════
// IA CONTROL COMMAND TYPE
// ═══════════════════════════════════════════════════════════════════

export interface UIReadingCommand {
  action: 'set' | 'preset' | 'reset';
  key?: keyof UIReadingSettings;
  value?: UIScale | number | string | PresetName;
}

// ═══════════════════════════════════════════════════════════════════
// DEFAULT VALUES
// ═══════════════════════════════════════════════════════════════════

export const DEFAULT_SETTINGS: UIReadingSettings = {
  zoomLevel: 1.0,
  fontSizeBase: 15,
  fontFamily: 'system',
  lineHeight: 1.45,
  letterSpacing: 0.01,
  maxContentWidth: 960,
  isFullscreen: false,
  preset: 'default',
};

// ═══════════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════════

export const UIReadingContext = createContext<UIReadingContextValue | null>(null);

export function useUIReadingContext(): UIReadingContextValue {
  const context = useContext(UIReadingContext);
  if (!context) {
    throw new Error('useUIReadingContext must be used within UIReadingProvider');
  }
  return context;
}
