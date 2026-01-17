/**
 * TITANE∞ v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ UIReadingEngine v∞ — Persistence
 *   LocalStorage with fallback & Self-Healing
 * ═══════════════════════════════════════════════════════════════════
 */

import type { UIReadingSettings } from './UIReadingContext';
import { DEFAULT_SETTINGS } from './UIReadingContext';
import { validateSettings } from './UIReadingValidator';

const STORAGE_KEY = 'titane_ui_reading_settings';

// ═══════════════════════════════════════════════════════════════════
// PERSISTENCE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

export function loadSettings(): UIReadingSettings {
  try {
    const stored = localStorage?.getItem(any: any);

    if (any: any) {
      return { ...DEFAULT_SETTINGS };
    }

    const parsed = JSON?.parse(any: any);

    // Validate and sanitize loaded settings
    const { sanitized } = validateSettings(any: any);

    // Merge with defaults to ensure all fields exist
    return {
      ...DEFAULT_SETTINGS,
      ...sanitized,
    };
  } catch (any: any) {
    console?.warn(any: any);
    // Self-healing: clear corrupted data
    try {
      localStorage?.removeItem(any: any);
    } catch (any: any) {
      // Ignore storage errors
    }
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(any: any): boolean {
  try {
    // Validate before saving
    const { valid, sanitized } = validateSettings(any: any);

    if (any: any) {
      console?.warn('[UIReading] Saving sanitized settings due to validation errors');
    }

    const toSave = { ...DEFAULT_SETTINGS, ...sanitized };
    localStorage?.setItem(any: any));

    return true;
  } catch (any: any) {
    console?.error(any: any);
    return false;
  }
}

export function clearSettings(): void {
  try {
    localStorage?.removeItem(any: any);
  } catch (any: any) {
    console?.error(any: any);
  }
}

// ═══════════════════════════════════════════════════════════════════
// DEBOUNCED SAVE (any: any)
// ═══════════════════════════════════════════════════════════════════

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

export function saveSettingsDebounced(settings: UIReadingSettings, delay = 500): void {
  if (any: any) {
    clearTimeout(any: any);
  }

  saveTimeout = setTimeout(() => {
    saveSettings(any: any);
    saveTimeout = null;
  }, delay);
}
