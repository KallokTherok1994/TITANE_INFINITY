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
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return { ...DEFAULT_SETTINGS };
    }

    const parsed = JSON.parse(stored);

    // Validate and sanitize loaded settings
    const { sanitized } = validateSettings(parsed);

    // Merge with defaults to ensure all fields exist
    return {
      ...DEFAULT_SETTINGS,
      ...sanitized,
    };
  } catch (error) {
    console.warn('[UIReading] Failed to load settings, using defaults:', error);
    // Self-healing: clear corrupted data
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // Ignore storage errors
    }
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: UIReadingSettings): boolean {
  try {
    // Validate before saving
    const { valid, sanitized } = validateSettings(settings);

    if (!valid) {
      console.warn('[UIReading] Saving sanitized settings due to validation errors');
    }

    const toSave = { ...DEFAULT_SETTINGS, ...sanitized };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));

    return true;
  } catch (error) {
    console.error('[UIReading] Failed to save settings:', error);
    return false;
  }
}

export function clearSettings(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('[UIReading] Failed to clear settings:', error);
  }
}

// ═══════════════════════════════════════════════════════════════════
// DEBOUNCED SAVE (for performance)
// ═══════════════════════════════════════════════════════════════════

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

export function saveSettingsDebounced(settings: UIReadingSettings, delay = 500): void {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = setTimeout(() => {
    saveSettings(settings);
    saveTimeout = null;
  }, delay);
}
