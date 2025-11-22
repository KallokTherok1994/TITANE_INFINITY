/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ Design Tokens - Index
 * Exportation centralisée de tous les tokens
 * ═══════════════════════════════════════════════════════════════
 */

export { colors, type ThemeName, type ColorShade } from './colors';
export { spacing, type SpacingKey } from './spacing';
export { 
  fontFamilies, 
  fontSizes, 
  fontWeights, 
  lineHeights, 
  letterSpacing,
  type FontFamily,
  type FontSize,
  type FontWeight,
  type LineHeight,
  type LetterSpacing,
} from './typography';
export { radius, type RadiusKey } from './radius';
export { shadows, type ShadowKey } from './shadows';
export { 
  transitions, 
  type TransitionDuration, 
  type TransitionTiming, 
  type TransitionPreset 
} from './transitions';

// Re-import for tokens object
import { colors } from './colors';
import { spacing } from './spacing';
import { fontFamilies, fontSizes, fontWeights, lineHeights, letterSpacing } from './typography';
import { radius } from './radius';
import { shadows } from './shadows';
import { transitions } from './transitions';

/**
 * Tous les tokens de design en un seul objet
 */
export const tokens = {
  colors,
  spacing,
  fontFamilies,
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacing,
  radius,
  shadows,
  transitions,
} as const;
