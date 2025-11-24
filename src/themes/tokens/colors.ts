/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ Design Tokens - Colors
 * Palettes optimisées pour les 4 thèmes principaux
 * Blueprint Design System v17.1
 * ═══════════════════════════════════════════════════════════════
 */

export const colors = {
  // Palette Neutre - Optimisée pour contraste & élégance
  neutral: {
    0: '#FFFFFF',
    5: '#F9F9F9',
    10: '#F0F0F0',
    20: '#DCDCDC',
    30: '#C2C2C2',
    40: '#A5A5A5',
    50: '#7F7F7F',
    60: '#5A5A5A',
    70: '#3A3A3A',
    80: '#232323',
    90: '#141414',
    100: '#000000',
    // Aliases pour compatibilité
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },

  // Glass / Blur tokens
  glass: {
    alpha: 'rgba(255, 255, 255, 0.12)',
    blur: {
      sm: '8px',
      md: '14px',
      lg: '20px',
    },
  },

  // Couleurs sémantiques communes (Métal)
  semantic: {
    success: '#93b399',   // Accent organique
    warning: '#c4c4c4',   // Silver Bullet
    error: '#8b5f5f',     // Métal rouillé
    info: '#727b81',      // Métal primaire
  },

  // Thème Rubis - Erreurs (Métal Rouillé)
  rubis: {
    primary: {
      main: '#8b5f5f',
      light: '#a07d7d',
      dark: '#5d3f3f',
      50: '#f3ecec',
      100: '#e3d5d5',
      200: '#cfb8b8',
      300: '#b89b9b',
      400: '#a07d7d',
      500: '#8b5f5f',
      600: '#744e4e',
      700: '#5d3f3f',
      800: '#4a3232',
      900: '#362525',
    },
    accent: {
      main: '#a07d7d',
      50: '#f3ecec',
      100: '#e3d5d5',
      200: '#cfb8b8',
      300: '#b89b9b',
      400: '#a07d7d',
      500: '#8b5f5f',
      600: '#744e4e',
      700: '#5d3f3f',
      800: '#4a3232',
      900: '#362525',
    },
    surface: {
      glass: 'rgba(139, 95, 95, 0.08)',
      translucent: 'rgba(139, 95, 95, 0.15)',
      solid: '#1A0E0E',
    },
  },

  // Thème Saphir - Info (Métal Bleuté)
  saphir: {
    primary: {
      main: '#727b81',
      light: '#838d95',
      dark: '#4a5157',
      50: '#e3e5e7',
      100: '#d0d3d6',
      200: '#b6bcc1',
      300: '#9ca4ab',
      400: '#838d95',
      500: '#727b81',
      600: '#5f676e',
      700: '#4a5157',
      800: '#3f4447',
      900: '#2f3335',
    },
    accent: {
      main: '#9ca4ab',
      50: '#e3e5e7',
      100: '#d0d3d6',
      200: '#b6bcc1',
      300: '#9ca4ab',
      400: '#838d95',
      500: '#727b81',
      600: '#5f676e',
      700: '#4a5157',
      800: '#3f4447',
      900: '#2f3335',
    },
    surface: {
      glass: 'rgba(114, 123, 129, 0.08)',
      translucent: 'rgba(114, 123, 129, 0.15)',
      solid: '#0D1A27',
    },
  },

  // Thème Émeraude - Succès (Accent Organique)
  emeraude: {
    primary: {
      main: '#93b399',
      light: '#a3bea7',
      dark: '#6b8871',
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
    accent: {
      main: '#a3bea7',
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
    surface: {
      glass: 'rgba(147, 179, 153, 0.08)',
      translucent: 'rgba(147, 179, 153, 0.15)',
      solid: '#0E1E15',
    },
  },

  // Thème Diamant - Structure (Silver Bullet)
  diamant: {
    primary: {
      main: '#c4c4c4',
      light: '#d4d4d4',
      dark: '#8c8c8c',
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
      main: '#d4d4d4',
      50: '#fafafa',
      100: '#f3f3f3',
      200: '#e0e0e0',
      300: '#d4d4d4',
      400: '#c4c4c4',
      500: '#a8a8a8',
      600: '#8c8c8c',
      700: '#707070',
      800: '#505050',
      900: '#2f2f2f',
    },
    surface: {
      glass: 'rgba(196, 196, 196, 0.08)',
      translucent: 'rgba(196, 196, 196, 0.15)',
      solid: '#0F0F15',
    },
  },
} as const;

export type ThemeName = 'rubis' | 'saphir' | 'emeraude' | 'diamant';
export type ColorShade = 0 | 5 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;
