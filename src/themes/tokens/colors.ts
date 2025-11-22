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

  // Couleurs sémantiques communes
  semantic: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },

  // Thème Rubis - Intensité, Volonté, Activation
  rubis: {
    primary: {
      main: '#D63A32',
      light: '#E65C53',
      dark: '#A32620',
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#D63A32',
      600: '#dc2626',
      700: '#A32620',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    accent: {
      main: '#FF8B7F',
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#FF8B7F',
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
    },
    surface: {
      glass: 'rgba(214, 58, 50, 0.08)',
      translucent: 'rgba(214, 58, 50, 0.15)',
      solid: '#1A0E0E',
    },
  },

  // Thème Saphir - Lucidité, Profondeur, Fluidité
  saphir: {
    primary: {
      main: '#2A77C8',
      light: '#4AA0F0',
      dark: '#1C538A',
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#2A77C8',
      600: '#2563eb',
      700: '#1C538A',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    accent: {
      main: '#7BC7FF',
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#7BC7FF',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    surface: {
      glass: 'rgba(42, 119, 200, 0.08)',
      translucent: 'rgba(42, 119, 200, 0.15)',
      solid: '#0D1A27',
    },
  },

  // Thème Émeraude - Stabilité, Équilibre, Croissance
  emeraude: {
    primary: {
      main: '#2EAF62',
      light: '#52CD84',
      dark: '#1E8046',
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#2EAF62',
      600: '#059669',
      700: '#1E8046',
      800: '#065f46',
      900: '#064e3b',
    },
    accent: {
      main: '#7DE0A8',
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#7DE0A8',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    surface: {
      glass: 'rgba(46, 175, 98, 0.08)',
      translucent: 'rgba(46, 175, 98, 0.15)',
      solid: '#0E1E15',
    },
  },

  // Thème Diamant - Clarté, Structure, Précision
  diamant: {
    primary: {
      main: '#A678E8',
      light: '#C5A8F9',
      dark: '#7D4CB9',
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#A678E8',
      600: '#9333ea',
      700: '#7D4CB9',
      800: '#6b21a8',
      900: '#581c87',
    },
    accent: {
      main: '#EEE6FF',
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#EEE6FF',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#581c87',
    },
    surface: {
      glass: 'rgba(166, 120, 232, 0.08)',
      translucent: 'rgba(166, 120, 232, 0.15)',
      solid: '#0F0F15',
    },
  },
} as const;

export type ThemeName = 'rubis' | 'saphir' | 'emeraude' | 'diamant';
export type ColorShade = 0 | 5 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;
