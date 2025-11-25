/**
 * TITANE_INFINITY v14.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v14 — Design System Tokens (TypeScript Export)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Export programmatique des tokens pour usage en TypeScript/React.
 * Synchronisé avec tokens.css (source de vérité : CSS variables).
 */

/**
 * Palette Couleurs Principale
 */
export const colors = {
  primary: {
    50: '#e3e5e7',
    100: '#d0d3d6',
    200: '#b6bcc1',
    300: '#9ca4ab',
    400: '#838d95',
    500: '#727b81',
    600: '#60676d',
    700: '#4f5459',
    800: '#3f4447',
    900: '#2f3335',
  },
  silver: {
    50: '#fafafa',
    100: '#f3f3f3',
    200: '#e0e0e0',
    300: '#d0d0d0',
    400: '#c4c4c4',
    500: '#a8a8a8',
    600: '#8c8c8c',
    700: '#707070',
    800: '#505050',
    900: '#2f2f2f',
  },
  accent: {
    50: '#eef5f0',
    100: '#d8e9dc',
    200: '#c1ddc9',
    300: '#aad1b6',
    400: '#a3bea7',
    500: '#93b399',
    600: '#7f9f85',
    700: '#6b8871',
    800: '#57715d',
    900: '#435a49',
  },
  semantic: {
    success: {
      50: '#eef5f0',
      100: '#d8e9dc',
      500: '#93b399',
      600: '#7f9f85',
      700: '#6b8871',
    },
    warning: {
      50: '#f3f0ec',
      100: '#e3ded5',
      500: '#a89f91',
      600: '#8f8777',
      700: '#766e5f',
    },
    danger: {
      50: '#f3ecec',
      100: '#e3d5d5',
      500: '#8b5f5f',
      600: '#744e4e',
      700: '#5d3f3f',
    },
    info: {
      50: '#e3e5e7',
      100: '#d0d3d6',
      500: '#727b81',
      600: '#60676d',
      700: '#4f5459',
    },
  },
} as const;

/**
 * Backgrounds & Surfaces
 */
export const backgrounds = {
  base: '#050607',
  elevated: '#0b0d0f',
  panel: '#101216',
  card: '#14181d',
  surface: '#181c21',
  hover: 'rgba(255, 255, 255, 0.04)',
  active: 'rgba(255, 255, 255, 0.08)',
  overlay: 'rgba(5, 6, 7, 0.85)',
  backdrop: 'rgba(0, 0, 0, 0.75)',
  glass: {
    bg: 'rgba(20, 24, 29, 0.85)',
    border: 'rgba(196, 196, 196, 0.12)',
  },
} as const;

/**
 * Borders
 */
export const borders = {
  subtle: 'rgba(255, 255, 255, 0.04)',
  default: 'rgba(255, 255, 255, 0.10)',
  medium: 'rgba(255, 255, 255, 0.14)',
  strong: 'rgba(255, 255, 255, 0.18)',
} as const;

/**
 * Texte
 */
export const text = {
  primary: 'rgba(255, 255, 255, 0.96)',
  secondary: 'rgba(255, 255, 255, 0.72)',
  tertiary: 'rgba(255, 255, 255, 0.48)',
  disabled: 'rgba(255, 255, 255, 0.30)',
  inverse: '#050607',
  onAccent: '#050607',
} as const;

/**
 * Shadows & Glows
 */
export const shadows = {
  xs: '0 1px 2px rgba(0, 0, 0, 0.5)',
  sm: '0 2px 4px rgba(0, 0, 0, 0.6)',
  md: '0 4px 8px rgba(0, 0, 0, 0.7)',
  lg: '0 8px 16px rgba(0, 0, 0, 0.75)',
  xl: '0 12px 24px rgba(0, 0, 0, 0.8)',
  '2xl': '0 20px 40px rgba(0, 0, 0, 0.85)',
  glow: {
    primary: '0 0 16px rgba(114, 123, 129, 0.25)',
    accent: '0 0 16px rgba(147, 179, 153, 0.20)',
    success: '0 0 16px rgba(147, 179, 153, 0.25)',
    danger: '0 0 16px rgba(139, 95, 95, 0.30)',
  },
  focus: {
    primary: '0 0 0 3px rgba(114, 123, 129, 0.5)',
    accent: '0 0 0 3px rgba(147, 179, 153, 0.5)',
  },
} as const;

/**
 * Spacing (8px base)
 */
export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
} as const;

/**
 * Border Radius
 */
export const radius = {
  none: '0',
  sm: '0.25rem',    // 4px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.5rem',  // 24px
  '3xl': '2rem',    // 32px
  full: '9999px',
} as const;

/**
 * Typography
 */
export const typography = {
  fontFamily: {
    sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    mono: '"Fira Code", "JetBrains Mono", "Consolas", "Monaco", monospace',
  },
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
} as const;

/**
 * Transitions & Animations
 */
export const transitions = {
  duration: {
    instant: '50ms',
    fast: '120ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  timing: {
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

/**
 * Z-Index Scale
 */
export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modalBackdrop: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
  notification: 800,
  max: 999,
} as const;

/**
 * Blur Amounts
 */
export const blur = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '18px',
  '2xl': '24px',
} as const;

/**
 * Opacity Levels
 */
export const opacity = {
  disabled: 0.5,
  hover: 0.8,
  active: 0.9,
} as const;

/**
 * Export par défaut : objet complet des tokens
 */
export const tokens = {
  colors,
  backgrounds,
  borders,
  text,
  shadows,
  spacing,
  radius,
  typography,
  transitions,
  zIndex,
  blur,
  opacity,
} as const;

export default tokens;

/**
 * Types utilitaires pour autocomplétion
 */
export type ColorScale = typeof colors.primary;
export type SpacingValue = keyof typeof spacing;
export type RadiusValue = keyof typeof radius;
export type FontSizeValue = keyof typeof typography.fontSize;
export type TransitionDuration = keyof typeof transitions.duration;
export type ZIndexValue = keyof typeof zIndex;
