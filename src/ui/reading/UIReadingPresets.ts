/**
 * TITANE∞ v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ UIReadingEngine v∞ — Presets
 *   Intelligent presets: Default • Focus • Reading • Immersion • Dev
 * ═══════════════════════════════════════════════════════════════════
 */

import type { UIReadingSettings, PresetName } from './UIReadingContext';

// ═══════════════════════════════════════════════════════════════════
// READING PRESETS
// ═══════════════════════════════════════════════════════════════════

export const ReadingPresets: Record<Exclude<PresetName, null>, Partial<UIReadingSettings>> = {
  default: {
    zoomLevel: 1.0,
    fontSizeBase: 15,
    lineHeight: 1.45,
    letterSpacing: 0.01,
    maxContentWidth: 960,
    fontFamily: 'system',
  },

  focus: {
    zoomLevel: 1.05,
    fontSizeBase: 16,
    lineHeight: 1.55,
    letterSpacing: 0.01,
    maxContentWidth: 840,
    fontFamily: 'system',
  },

  reading: {
    zoomLevel: 1.1,
    fontSizeBase: 17,
    lineHeight: 1.65,
    letterSpacing: 0.02,
    fontFamily: 'serif',
    maxContentWidth: 720,
  },

  immersion: {
    zoomLevel: 1.15,
    fontSizeBase: 18,
    lineHeight: 1.7,
    letterSpacing: 0.02,
    fontFamily: 'serif',
    maxContentWidth: 680,
  },

  dev: {
    zoomLevel: 1.0,
    fontSizeBase: 14,
    lineHeight: 1.4,
    letterSpacing: 0,
    fontFamily: 'mono',
    maxContentWidth: 1280,
  },
};

// ═══════════════════════════════════════════════════════════════════
// PRESET METADATA
// ═══════════════════════════════════════════════════════════════════

export const PresetMetadata: Record<Exclude<PresetName, null>, { label: string; icon: string; description: string }> = {
  default: {
    label: 'Par défaut',
    icon: '⚪',
    description: 'Configuration standard TITANE∞',
  },
  focus: {
    label: 'Focus',
    icon: '🎯',
    description: 'Concentration accrue, moins de distractions',
  },
  reading: {
    label: 'Lecture',
    icon: '📖',
    description: 'Optimisé pour la lecture longue',
  },
  immersion: {
    label: 'Immersion',
    icon: '🌙',
    description: 'Immersion maximale, contenu centré',
  },
  dev: {
    label: 'Développeur',
    icon: '💻',
    description: 'Code et logs, police mono, large viewport',
  },
};

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

export function getPresetSettings(preset: Exclude<PresetName, null>): Partial<UIReadingSettings> {
  return ReadingPresets[preset] || ReadingPresets.default;
}

export function isValidPreset(preset: unknown): preset is Exclude<PresetName, null> {
  return typeof preset === 'string' && preset in ReadingPresets;
}
