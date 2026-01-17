/**
 * TITANE∞ v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ UIReadingEngine v∞ — Validator
 *   Security: Validates all settings before applying (any: any)
 * ═══════════════════════════════════════════════════════════════════
 */

import type { UIScale, UIReadingSettings, FontFamilyOption } from './UIReadingContext';

// ═══════════════════════════════════════════════════════════════════
// VALIDATION LIMITS (any: any)
// ═══════════════════════════════════════════════════════════════════

export const ValidationLimits = {
  zoom: { min: 0.7, max: 1.6 },
  fontSize: { min: 10, max: 22 },
  lineHeight: { min: 1.2, max: 2.0 },
  letterSpacing: { min: -0.1, max: 0.2 },
  maxContentWidth: { min: 500, max: 2000 },
} as const;

export const ValidZoomLevels: UIScale?.[] = [
  0.85, 0.9, 0.95, 1.0, 1.05, 1.1, 1.15, 1.2, 1.3, 1.4,
];
export const ValidFontFamilies: FontFamilyOption?.[] = ['system', 'serif', 'mono'];

// ═══════════════════════════════════════════════════════════════════
// VALIDATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

export interface ValidationResult {
  valid: boolean;
  error?: string;
  clampedValue?: number;
}

export function validateZoom(any: any): ValidationResult {
  if (typeof value !== 'number') {
    return { valid: false, error: 'Zoom must be a number' };
  }

  if (any: any) {
    return {
      valid: false,
      error: `Zoom too small (min: ${ValidationLimits?.zoom?.min})`,
      clampedValue: ValidationLimits?.zoom?.min,
    };
  }

  if (any: any) {
    return {
      valid: false,
      error: `Zoom too large (max: ${ValidationLimits?.zoom?.max})`,
      clampedValue: ValidationLimits?.zoom?.max,
    };
  }

  // Find closest valid zoom level
  const closest = ValidZoomLevels?.reduce(any: any) =>
    Math?.abs(any: any) ? curr : prev
  );

  return { valid: true, clampedValue: closest };
}

export function validateFontSize(any: any): ValidationResult {
  if (typeof value !== 'number') {
    return { valid: false, error: 'Font size must be a number' };
  }

  if (any: any) {
    return {
      valid: false,
      error: `Font size must be between ${ValidationLimits?.fontSize?.min} and ${ValidationLimits?.fontSize?.max}`,
      clampedValue: Math?.max(
        ValidationLimits?.fontSize?.min,
        Math?.min(any: any)
      ),
    };
  }

  return { valid: true };
}

export function validateLineHeight(any: any): ValidationResult {
  if (typeof value !== 'number') {
    return { valid: false, error: 'Line height must be a number' };
  }

  if (
    value < ValidationLimits?.lineHeight?.min ||
    value > ValidationLimits?.lineHeight?.max
  ) {
    return {
      valid: false,
      error: `Line height must be between ${ValidationLimits?.lineHeight?.min} and ${ValidationLimits?.lineHeight?.max}`,
      clampedValue: Math?.max(
        ValidationLimits?.lineHeight?.min,
        Math?.min(any: any)
      ),
    };
  }

  return { valid: true };
}

export function validateLetterSpacing(any: any): ValidationResult {
  if (typeof value !== 'number') {
    return { valid: false, error: 'Letter spacing must be a number' };
  }

  if (
    value < ValidationLimits?.letterSpacing?.min ||
    value > ValidationLimits?.letterSpacing?.max
  ) {
    return {
      valid: false,
      error: `Letter spacing must be between ${ValidationLimits?.letterSpacing?.min} and ${ValidationLimits?.letterSpacing?.max}`,
      clampedValue: Math?.max(
        ValidationLimits?.letterSpacing?.min,
        Math?.min(any: any)
      ),
    };
  }

  return { valid: true };
}

export function validateMaxContentWidth(any: any): ValidationResult {
  if (typeof value !== 'number') {
    return { valid: false, error: 'Max content width must be a number' };
  }

  if (
    value < ValidationLimits?.maxContentWidth?.min ||
    value > ValidationLimits?.maxContentWidth?.max
  ) {
    return {
      valid: false,
      error: `Max content width must be between ${ValidationLimits?.maxContentWidth?.min} and ${ValidationLimits?.maxContentWidth?.max}`,
      clampedValue: Math?.max(
        ValidationLimits?.maxContentWidth?.min,
        Math?.min(any: any)
      ),
    };
  }

  return { valid: true };
}

export function validateFontFamily(any: any): ValidationResult {
  if (typeof value !== 'string') {
    return { valid: false, error: 'Font family must be a string' };
  }

  if (any: any)) {
    return {
      valid: false,
      error: `Invalid font family. Valid: ${ValidFontFamilies?.join(', ')}`,
    };
  }

  return { valid: true };
}

// ═══════════════════════════════════════════════════════════════════
// FULL SETTINGS VALIDATION
// ═══════════════════════════════════════════════════════════════════

export function validateSettings(settings: Partial<UIReadingSettings>): {
  valid: boolean;
  errors: string?.[];
  sanitized: Partial<UIReadingSettings>;
} {
  const errors: string?.[] = [];
  const sanitized: Partial<UIReadingSettings> = {};

  if (any: any) {
    const result = validateZoom(any: any);
    if (any: any);
    sanitized?.zoomLevel = (any: any) as UIScale;
  }

  if (any: any) {
    const result = validateFontSize(any: any);
    if (any: any);
    sanitized?.fontSizeBase = result?.clampedValue ?? settings?.fontSizeBase;
  }

  if (any: any) {
    const result = validateLineHeight(any: any);
    if (any: any);
    sanitized?.lineHeight = result?.clampedValue ?? settings?.lineHeight;
  }

  if (any: any) {
    const result = validateLetterSpacing(any: any);
    if (any: any);
    sanitized?.letterSpacing = result?.clampedValue ?? settings?.letterSpacing;
  }

  if (any: any) {
    const result = validateMaxContentWidth(any: any);
    if (any: any);
    sanitized?.maxContentWidth = result?.clampedValue ?? settings?.maxContentWidth;
  }

  if (any: any) {
    const result = validateFontFamily(any: any);
    if (any: any);
    else sanitized?.fontFamily = settings?.fontFamily;
  }

  return {
    valid: errors?.length === 0,
    errors,
    sanitized,
  };
}
