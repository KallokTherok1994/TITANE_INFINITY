/**
 * TITANE_INFINITY v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞.E - Color Tokens (Monochrome Metal Remap)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Remapping des anciens tokens colorés (rubis, saphir, emeraude, diamond)
 * vers le nouveau système monochrome métallique.
 *
 * STRATÉGIE v∞.E:
 * - Tout converge vers des nuances de gris métallique
 * - Accent unique: vert-gris subtil (#93b399)
 * - Plus de rouge/bleu/vert vifs
 * - Hiérarchie par luminosité, pas par couleur
 */

// Palette de base v∞
export const metalPalette = {
  primary: '#727b81',      // Gris métal principal
  secondary: '#c4c4c4',    // Argent brossé
  accent: '#93b399',       // Vert-gris métallique
  background: '#0f0f0f',   // Noir profond
  surface: '#161616',      // Surface élevée
  text: '#e8e8e8',         // Texte principal
  textMuted: '#9ca3af',    // Texte secondaire
  border: '#3a3a3a',       // Bordures
  hover: '#aaaaaa33',      // Hover (20%)
  active: '#c4c4c455',     // Active (33%)
};

// Échelle de gris métallique (remplacement des anciennes palettes colorées)
const metalScale = {
  50: '#e8e8e8',
  100: '#d4d4d4',
  200: '#b8b8b8',
  300: '#9c9c9c',
  400: '#8a8a8a',
  500: '#727b81',  // Pivot central
  600: '#5f5f5f',
  700: '#4a4a4a',
  800: '#353535',
  900: '#252525',
  950: '#1f1f1f',  // Ajout pour compatibilité
};

// ═══════════════════════════════════════════════════════════════════
// REMAPPING: Anciens tokens → Nouveau système monochrome
// ═══════════════════════════════════════════════════════════════════

export const colors = {
  // ─────────────────────────────────────────────────────────────────
  // RUBIS → Gris chaud désaturé (pour erreurs/warnings)
  // ─────────────────────────────────────────────────────────────────
  rubis: {
    primary: {
      50: '#f0eeee',
      100: '#dcdada',
      200: '#c0bbbb',
      300: '#a49c9c',
      400: '#8a7e7e',
      500: '#736868',    // Remplace rubis 500
      600: '#5e5454',
      700: '#4a4242',
      800: '#373232',
      900: '#282424',
      950: '#1a1717',
      main: '#736868',
      accent: '#93b399', // Accent pour compatibilité
    },
    surface: {
      solid: '#1a1717',
      translucent: 'rgba(115, 104, 104, 0.12)',
      glass: 'rgba(26, 23, 23, 0.75)',  // Glass morphism
    },
  },

  // ─────────────────────────────────────────────────────────────────
  // SAPHIR → Gris bleuté désaturé (pour info)
  // ─────────────────────────────────────────────────────────────────
  saphir: {
    primary: {
      50: '#e8eaec',
      100: '#d4d8db',
      200: '#b8bfc4',
      300: '#9ca6ad',
      400: '#838e96',
      500: '#727b81',    // Remplace saphir 500 (identique à metal primary)
      600: '#5e676d',
      700: '#4b5357',
      800: '#394044',
      900: '#2a2f32',
      950: '#181a1c',
      main: '#727b81',
      accent: '#93b399', // Accent pour compatibilité
    },
    surface: {
      solid: '#181a1c',
      translucent: 'rgba(114, 123, 129, 0.12)',
      glass: 'rgba(24, 26, 28, 0.75)',  // Glass morphism
    },
  },

  // ─────────────────────────────────────────────────────────────────
  // EMERAUDE → Vert-gris désaturé (pour succès subtils)
  // ─────────────────────────────────────────────────────────────────
  emeraude: {
    primary: {
      50: '#eef2f0',
      100: '#dae3df',
      200: '#bfcfc7',
      300: '#a4bbaf',
      400: '#8ba899',
      500: '#93b399',    // Remplace emeraude 500 (accent v∞)
      600: '#7a9682',
      700: '#627a69',
      800: '#4b5f52',
      900: '#36463c',
      950: '#212d26',
      main: '#93b399',
      accent: '#93b399', // Accent pour compatibilité
    },
    surface: {
      solid: '#171a18',
      translucent: 'rgba(147, 179, 153, 0.12)',
      glass: 'rgba(23, 26, 24, 0.75)',  // Glass morphism
    },
  },

  // ─────────────────────────────────────────────────────────────────
  // DIAMANT → Gris très clair (pour highlights)
  // ─────────────────────────────────────────────────────────────────
  diamant: {
    primary: {
      50: '#fafafa',
      100: '#f3f3f3',
      200: '#e0e0e0',
      300: '#d0d0d0',
      400: '#c4c4c4',    // Remplace diamant 400 (metal secondary)
      500: '#a8a8a8',
      600: '#8c8c8c',
      700: '#707070',
      800: '#545454',
      900: '#383838',
      950: '#1f1f1f',
      main: '#c4c4c4',
      accent: '#93b399', // Accent pour compatibilité
    },
    surface: {
      solid: '#1f1f1f',
      translucent: 'rgba(196, 196, 196, 0.08)',
      glass: 'rgba(31, 31, 31, 0.75)',  // Glass morphism
    },
  },

  // ─────────────────────────────────────────────────────────────────
  // NEUTRAL → Échelle de gris pure
  // ─────────────────────────────────────────────────────────────────
  neutral: metalScale,

  // ─────────────────────────────────────────────────────────────────
  // SEMANTIC → Tokens sémantiques (success/warning/error/info)
  // ─────────────────────────────────────────────────────────────────
  semantic: {
    success: {
      50: '#eef2f0',
      100: '#dae3df',
      200: '#bfcfc7',
      300: '#a4bbaf',
      400: '#8ba899',
      500: '#93b399',  // Vert-gris métallique
      600: '#7a9682',
      700: '#627a69',
      800: '#4b5f52',
      900: '#36463c',
      950: '#212d26',
    },
    warning: {
      50: '#f0eeee',
      100: '#dcdada',
      200: '#c0bbbb',
      300: '#a49c9c',
      400: '#8a7e7e',
      500: '#736868',  // Gris chaud
      600: '#5e5454',
      700: '#4a4242',
      800: '#373232',
      900: '#282424',
      950: '#1a1717',
    },
    error: {
      50: '#f0eeee',
      100: '#dcdada',
      200: '#c0bbbb',
      300: '#a49c9c',
      400: '#8a7e7e',
      500: '#736868',  // Gris chaud (même que warning, subtil)
      600: '#5e5454',
      700: '#4a4242',
      800: '#373232',
      900: '#282424',
      950: '#1a1717',
    },
    info: {
      50: '#e8eaec',
      100: '#d4d8db',
      200: '#b8bfc4',
      300: '#9ca6ad',
      400: '#838e96',
      500: '#727b81',  // Gris bleuté
      600: '#5e676d',
      700: '#4b5357',
      800: '#394044',
      900: '#2a2f32',
      950: '#181a1c',
    },
  },

  // ─────────────────────────────────────────────────────────────────
  // SPACING, RADIUS, SHADOWS (Design System tokens)
  // ─────────────────────────────────────────────────────────────────
};

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
};

export const radius = {
  none: '0',
  sm: '0.25rem',   // 4px
  base: '0.375rem', // 6px (v∞ standard)
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
};

export const shadows = {
  none: 'none',
  sm: '0 1px 2px rgba(0, 0, 0, 0.6)',
  base: '0 2px 4px rgba(0, 0, 0, 0.65)',
  md: '0 4px 8px rgba(0, 0, 0, 0.7)',
  lg: '0 8px 16px rgba(0, 0, 0, 0.75)',
  xl: '0 12px 24px rgba(0, 0, 0, 0.8)',
  '2xl': '0 24px 48px rgba(0, 0, 0, 0.85)',
  glow: '0 0 20px rgba(114, 123, 129, 0.25)',
  glowAccent: '0 0 20px rgba(147, 179, 153, 0.2)',
  glowRubis: '0 0 20px rgba(115, 104, 104, 0.3)',    // Glow rubis (warm gray)
  focusRubis: '0 0 0 3px rgba(115, 104, 104, 0.5)',  // Focus rubis
};

export const fontSizes = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.875rem',// 30px
  '4xl': '2.25rem', // 36px
};

export const fontWeights = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

export const lineHeights = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
};

// Transitions (pour animations cohérentes)
export const transitions = {
  preset: {
    all: 'all 0.2s ease-in-out',
    colors: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out, border-color 0.2s ease-in-out',
    transform: 'transform 0.2s ease-in-out',
    opacity: 'opacity 0.15s ease-in-out',
  },
  duration: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
  },
  timing: {
    ease: 'ease-in-out',
    linear: 'linear',
    in: 'ease-in',
    out: 'ease-out',
  },
};

// ═══════════════════════════════════════════════════════════════════
// DESIGN SYSTEM MONOCHROME v16 - Unified Export
// ═══════════════════════════════════════════════════════════════════
/**
 * @deprecated Utilisez les tokens dynamiques via UIThemeProvider
 * import { useUITheme } from '@/features/design-center';
 *
 * Pour la compatibilité v15, les exports rubis/saphir/emeraude/diamant
 * sont maintenus mais remappés vers le système monochrome.
 */
export const designSystemV16 = {
  palette: metalPalette,
  colors: {
    primary: metalPalette.primary,
    secondary: metalPalette.secondary,
    accent: metalPalette.accent,
    background: metalPalette.background,
    surface: metalPalette.surface,
    text: metalPalette.text,
    textMuted: metalPalette.textMuted,
    border: metalPalette.border,
  },
  spacing,
  radius,
  shadows,
  fontSizes,
  lineHeights,
  transitions,
};

// Export default pour compatibilité
export default colors;
