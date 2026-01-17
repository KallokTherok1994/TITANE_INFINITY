/**
 * TITANE∞ v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ UIReadingEngine v∞ — Validator
 *   Security: Validates all settings before applying (IA safety)
 * ═══════════════════════════════════════════════════════════════════
 */

import type { UIScale, UIReadingSettings, FontFamilyOption } from './UIReadingContext';

// ═══════════════════════════════════════════════════════════════════
// VALIDATION LIMITS (Security for IA Control)
// ═══════════════════════════════════════════════════════════════════

export const ValidationLimits = {
  zoom: { min: 0.7, max: 1.6 },
  fontSize: { min: 10, max: 22 },
  lineHeight: { min: 1.2, max: 2.0 },
  letterSpacing: { min: -0.1, max: 0.2 },
  maxContentWidth: { min: 500, max: 2000 },
} as const;

export const ValidZoomLevels: UIScale[] = [
  0.85, 0.9, 0.95, 1.0, 1.05, 1.1, 1.15, 1.2, 1.3, 1.4,
];
export const ValidFontFamilies: FontFamilyOption[] = ['system', 'serif', 'mono'];

// ═══════════════════════════════════════════════════════════════════
// VALIDATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

export interface ValidationResult {
  valid: boolean;
  error?: string;
  clampedValue?: number;
}

export function validateZoom(value: unknown): ValidationResult {
  if (typeof value !== 'number') {
    return { valid: false, error: 'Zoom must be a number' };
  }

  if (value < ValidationLimits.zoom.min) {
    return {
      valid: false,
      error: `Zoom too small (min: ${ValidationLimits.zoom.min})`,
      clampedValue: ValidationLimits.zoom.min,
    };
  }

  if (value > ValidationLimits.zoom.max) {
    return {
      valid: false,
      error: `Zoom too large (max: ${ValidationLimits.zoom.max})`,
      clampedValue: ValidationLimits.zoom.max,
    };
  }

  // Find closest valid zoom level
  const closest = ValidZoomLevels.reduce((prev, curr) =>
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  );

  return { valid: true, clampedValue: closest };
}

export function validateFontSize(value: unknown): ValidationResult {
  if (typeof value !== 'number') {
    return { valid: false, error: 'Font size must be a number' };
  }

  if (value < ValidationLimits.fontSize.min || value > ValidationLimits.fontSize.max) {
    return {
      valid: false,
      error: `Font size must be between ${ValidationLimits.fontSize.min} and ${ValidationLimits.fontSize.max}`,
      clampedValue: Math.max(
        ValidationLimits.fontSize.min,
        Math.min(ValidationLimits.fontSize.max, value)
      ),
    };
  }

  return { valid: true };
}

export function validateLineHeight(value: unknown): ValidationResult {
  if (typeof value !== 'number') {
    return { valid: false, error: 'Line height must be a number' };
  }

  if (
    value < ValidationLimits.lineHeight.min ||
    value > ValidationLimits.lineHeight.max
  ) {
    return {
      valid: false,
      error: `Line height must be between ${ValidationLimits.lineHeight.min} and ${ValidationLimits.lineHeight.max}`,
      clampedValue: Math.max(
        ValidationLimits.lineHeight.min,
        Math.min(ValidationLimits.lineHeight.max, value)
      ),
    };
  }

  return { valid: true };
}

export function validateLetterSpacing(value: unknown): ValidationResult {
  if (typeof value !== 'number') {
    return { valid: false, error: 'Letter spacing must be a number' };
  }

  if (
    value < ValidationLimits.letterSpacing.min ||
    value > ValidationLimits.letterSpacing.max
  ) {
    return {
      valid: false,
      error: `Letter spacing must be between ${ValidationLimits.letterSpacing.min} and ${ValidationLimits.letterSpacing.max}`,
      clampedValue: Math.max(
        ValidationLimits.letterSpacing.min,
        Math.min(ValidationLimits.letterSpacing.max, value)
      ),
    };
  }

  return { valid: true };
}

export function validateMaxContentWidth(value: unknown): ValidationResult {
  if (typeof value !== 'number') {
    return { valid: false, error: 'Max content width must be a number' };
  }

  if (
    value < ValidationLimits.maxContentWidth.min ||
    value > ValidationLimits.maxContentWidth.max
  ) {
    return {
      valid: false,
      error: `Max content width must be between ${ValidationLimits.maxContentWidth.min} and ${ValidationLimits.maxContentWidth.max}`,
      clampedValue: Math.max(
        ValidationLimits.maxContentWidth.min,
        Math.min(ValidationLimits.maxContentWidth.max, value)
      ),
    };
  }

  return { valid: true };
}

export function validateFontFamily(value: unknown): ValidationResult {
  if (typeof value !== 'string') {
    return { valid: false, error: 'Font family must be a string' };
  }

  if (!ValidFontFamilies.includes(value as FontFamilyOption)) {
    return {
      valid: false,
      error: `Invalid font family. Valid: ${ValidFontFamilies.join(', ')}`,
    };
  }

  return { valid: true };
}

// ═══════════════════════════════════════════════════════════════════
// FULL SETTINGS VALIDATION
// ═══════════════════════════════════════════════════════════════════

export function validateSettings(settings: Partial<UIReadingSettings>): {
  valid: boolean;
  errors: string[];
  sanitized: Partial<UIReadingSettings>;
} {
  const errors: string[] = [];
  const sanitized: Partial<UIReadingSettings> = {};

  if (settings.zoomLevel !== undefined) {
    const result = validateZoom(settings.zoomLevel);
    if (!result.valid && result.error) errors.push(result.error);
    sanitized.zoomLevel = (result.clampedValue ?? settings.zoomLevel) as UIScale;
  }

  if (settings.fontSizeBase !== undefined) {
    const result = validateFontSize(settings.fontSizeBase);
    if (!result.valid && result.error) errors.push(result.error);
    sanitized.fontSizeBase = result.clampedValue ?? settings.fontSizeBase;
  }

  if (settings.lineHeight !== undefined) {
    const result = validateLineHeight(settings.lineHeight);
    if (!result.valid && result.error) errors.push(result.error);
    sanitized.lineHeight = result.clampedValue ?? settings.lineHeight;
  }

  if (settings.letterSpacing !== undefined) {
    const result = validateLetterSpacing(settings.letterSpacing);
    if (!result.valid && result.error) errors.push(result.error);
    sanitized.letterSpacing = result.clampedValue ?? settings.letterSpacing;
  }

  if (settings.maxContentWidth !== undefined) {
    const result = validateMaxContentWidth(settings.maxContentWidth);
    if (!result.valid && result.error) errors.push(result.error);
    sanitized.maxContentWidth = result.clampedValue ?? settings.maxContentWidth;
  }

  if (settings.fontFamily !== undefined) {
    const result = validateFontFamily(settings.fontFamily);
    if (!result.valid && result.error) errors.push(result.error);
    else sanitized.fontFamily = settings.fontFamily;
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized,
  };
}
