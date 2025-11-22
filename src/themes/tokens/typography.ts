/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ Design Tokens - Typography
 * Hiérarchie typographique et styles de texte
 * ═══════════════════════════════════════════════════════════════
 */

export const fontFamilies = {
  sans: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Oxygen',
    'Ubuntu',
    'Cantarell',
    'sans-serif'
  ].join(', '),
  
  mono: [
    'JetBrains Mono',
    'Fira Code',
    'Consolas',
    'Monaco',
    'Courier New',
    'monospace'
  ].join(', '),
  
  display: [
    'Orbitron',
    'Inter',
    'sans-serif'
  ].join(', '),
} as const;

export const fontSizes = {
  // Hiérarchie optimisée - Blueprint Design System
  tiny: '0.75rem',   // 12px
  xs: '0.75rem',     // 12px (alias)
  small: '0.875rem', // 14px
  sm: '0.875rem',    // 14px (alias)
  body: '1rem',      // 16px
  base: '1rem',      // 16px (alias)
  lg: '1.125rem',    // 18px
  h5: '1.1rem',      // 17.6px
  h4: '1.3rem',      // 20.8px
  h3: '1.5rem',      // 24px
  h2: '1.85rem',     // 29.6px
  h1: '2.25rem',     // 36px
  xl: '2.5rem',      // 40px
  '2xl': '3rem',     // 48px
  '3xl': '3.75rem',  // 60px
  '4xl': '4.5rem',   // 72px
} as const;

export const fontWeights = {
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

export const lineHeights = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
} as const;

export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const;

export type FontFamily = keyof typeof fontFamilies;
export type FontSize = keyof typeof fontSizes;
export type FontWeight = keyof typeof fontWeights;
export type LineHeight = keyof typeof lineHeights;
export type LetterSpacing = keyof typeof letterSpacing;
