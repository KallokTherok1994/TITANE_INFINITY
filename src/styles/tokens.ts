/**
 * TITANE∞ v8.0 — DESIGN TOKENS (TypeScript)
 *
 * Type-safe access to design tokens for use in components
 * Synchronisé avec css-vars.css
 */

/* ═══════════════════════════════════════════════════════════════ */
/* COLORS                                                             */
/* ═══════════════════════════════════════════════════════════════ */

export const colors = {
  // Titane Métallique
  titane: {
    50: '#f8f9fa',
    100: '#e9ecef',
    200: '#dee2e6',
    300: '#ced4da',
    400: '#adb5bd',
    500: '#727b81', // BASE
    600: '#5a6267',
    700: '#495057',
    800: '#343a40',
    900: '#212529',
  },

  // Violet Énergie
  violet: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#7c3aed', // BASE
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
  },

  // Sage Subtil
  sage: {
    50: '#f7fee7',
    100: '#ecfccb',
    200: '#d9f99d',
    300: '#bef264',
    400: '#a3e635',
    500: '#84cc16', // BASE
    600: '#65a30d',
    700: '#4d7c0f',
    800: '#3f6212',
    900: '#365314',
  },

  // Sémantiques
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#10b981',
    700: '#047857',
    900: '#064e3b',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    700: '#b91c1c',
    900: '#7f1d1d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    700: '#b45309',
    900: '#78350f',
  },
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    700: '#1d4ed8',
    900: '#1e3a8a',
  },

  // Backgrounds
  bg: {
    primary: '#0f172a',
    secondary: '#1e293b',
    tertiary: '#334155',
    elevated: '#475569',
    overlay: '#64748b',
  },

  // Text
  text: {
    primary: '#f1f5f9',
    secondary: '#cbd5e1',
    muted: '#94a3b8',
    disabled: '#64748b',
    inverse: '#0f172a',
  },

  // Borders
  border: {
    default: '#334155',
    subtle: '#1e293b',
    strong: '#475569',
    accent: '#7c3aed', // violet-600
  },
} as const;

/* ═══════════════════════════════════════════════════════════════ */
/* SPACING                                                            */
/* ═══════════════════════════════════════════════════════════════ */

export const spacing = {
  0: '0',
  1: '0.25rem', // 4px
  2: '0.5rem', // 8px
  3: '0.75rem', // 12px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  7: '1.75rem', // 28px
  8: '2rem', // 32px
  10: '2.5rem', // 40px
  12: '3rem', // 48px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
} as const;

/* ═══════════════════════════════════════════════════════════════ */
/* TYPOGRAPHY                                                         */
/* ═══════════════════════════════════════════════════════════════ */

export const fonts = {
  sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
} as const;

export const fontSizes = {
  xs: '0.75rem', // 12px
  sm: '0.875rem', // 14px
  base: '1rem', // 16px
  lg: '1.125rem', // 18px
  xl: '1.25rem', // 20px
  '2xl': '1.5rem', // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem', // 36px
  '5xl': '3rem', // 48px
} as const;

export const lineHeights = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
} as const;

export const fontWeights = {
  thin: 100,
  extralight: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
} as const;

/* ═══════════════════════════════════════════════════════════════ */
/* RADIUS                                                             */
/* ═══════════════════════════════════════════════════════════════ */

export const radii = {
  none: '0',
  sm: '0.25rem', // 4px
  md: '0.5rem', // 8px
  lg: '0.75rem', // 12px
  xl: '1rem', // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
} as const;

/* ═══════════════════════════════════════════════════════════════ */
/* SHADOWS                                                            */
/* ═══════════════════════════════════════════════════════════════ */

export const shadows = {
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  // Glow effects
  glowViolet: '0 0 20px rgba(124, 58, 237, 0.4)',
  glowSage: '0 0 20px rgba(132, 204, 22, 0.4)',
  glowTitane: '0 0 20px rgba(114, 123, 129, 0.4)',
} as const;

/* ═══════════════════════════════════════════════════════════════ */
/* Z-INDEX                                                            */
/* ═══════════════════════════════════════════════════════════════ */

export const zIndices = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  toast: 1700,
} as const;

/* ═══════════════════════════════════════════════════════════════ */
/* TRANSITIONS & ANIMATIONS                                           */
/* ═══════════════════════════════════════════════════════════════ */

export const durations = {
  75: '75ms',
  100: '100ms',
  150: '150ms',
  200: '200ms',
  300: '300ms',
  500: '500ms',
  700: '700ms',
  1000: '1000ms',
} as const;

export const easings = {
  linear: 'linear',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

export const transitions = {
  fast: `${durations[150]} ${easings.out}`,
  base: `${durations[300]} ${easings.inOut}`,
  slow: `${durations[500]} ${easings.inOut}`,
} as const;

/* ═══════════════════════════════════════════════════════════════ */
/* BREAKPOINTS                                                        */
/* ═══════════════════════════════════════════════════════════════ */

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/* ═══════════════════════════════════════════════════════════════ */
/* LAYOUT DIMENSIONS                                                  */
/* ═══════════════════════════════════════════════════════════════ */

export const layout = {
  sidebarWidth: '260px',
  sidebarWidthCollapsed: '64px',
  headerHeight: '64px',
  footerHeight: '48px',
  maxContentWidth: '1280px',
} as const;

/* ═══════════════════════════════════════════════════════════════ */
/* COMPLETE TOKEN OBJECT (for exhaustive access)                     */
/* ═══════════════════════════════════════════════════════════════ */

export const tokens = {
  colors,
  spacing,
  fonts,
  fontSizes,
  lineHeights,
  fontWeights,
  radii,
  shadows,
  zIndices,
  durations,
  easings,
  transitions,
  breakpoints,
  layout,
} as const;

/* ═══════════════════════════════════════════════════════════════ */
/* TYPES (TypeScript)                                                 */
/* ═══════════════════════════════════════════════════════════════ */

export type ColorScale = keyof typeof colors;
export type Color = (typeof colors)[ColorScale];
export type Spacing = keyof typeof spacing;
export type FontSize = keyof typeof fontSizes;
export type LineHeight = keyof typeof lineHeights;
export type FontWeight = keyof typeof fontWeights;
export type Radius = keyof typeof radii;
export type Shadow = keyof typeof shadows;
export type ZIndex = keyof typeof zIndices;
export type Duration = keyof typeof durations;
export type Easing = keyof typeof easings;
export type Transition = keyof typeof transitions;
export type Breakpoint = keyof typeof breakpoints;

/* ═══════════════════════════════════════════════════════════════ */
/* HELPER FUNCTIONS                                                   */
/* ═══════════════════════════════════════════════════════════════ */

/**
 * Get CSS variable value
 * @param varName - CSS variable name (without --)
 * @returns CSS variable value or fallback
 */
export function getCSSVar(varName: string, fallback?: string): string {
  if (typeof window === 'undefined') return fallback || '';
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(`--${varName}`)
    .trim();
  return value || fallback || '';
}

/**
 * Set CSS variable value
 * @param varName - CSS variable name (without --)
 * @param value - New value
 */
export function setCSSVar(varName: string, value: string): void {
  if (typeof window === 'undefined') return;
  document.documentElement.style.setProperty(`--${varName}`, value);
}

/**
 * Media query helper
 * @param breakpoint - Breakpoint key
 * @returns Media query string
 */
export function mediaQuery(breakpoint: Breakpoint): string {
  return `@media (min-width: ${breakpoints[breakpoint]})`;
}

/**
 * Responsive value helper
 * Usage: const padding = responsive({ base: '1rem', md: '2rem', lg: '3rem' })
 */
export function responsive<T>(
  values: Partial<Record<'base' | Breakpoint, T>>
): Record<string, T> {
  const result: Record<string, T> = {};

  if (values.base !== undefined) {
    result.base = values.base;
  }

  Object.keys(breakpoints).forEach(bp => {
    const key = bp as Breakpoint;
    if (values[key] !== undefined) {
      result[key] = values[key] as T;
    }
  });

  return result;
}

export default tokens;
