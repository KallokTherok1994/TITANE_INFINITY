// ⚡ TITANE∞ v21 — Design System Colors
// Palette centralisée avec valeurs RGB pour manipulation dynamique

export const DS_COLORS = {
  // 🔴 RUBIS (Danger, Alerte, Helios chaud)
  rubis: {
    hex: '#ef4444',
    rgb: '239, 68, 68',
    hsl: '0, 84%, 60%',
    variants: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
  },

  // 🟢 ÉMERAUDE (Success, Stable, Harmonia)
  emeraude: {
    hex: '#10b981',
    rgb: '16, 185, 129',
    hsl: '160, 84%, 39%',
    variants: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
    },
  },

  // 🔵 SAPHIR (Info, Nexus, Attention)
  saphir: {
    hex: '#3b82f6',
    rgb: '59, 130, 246',
    hsl: '221, 91%, 60%',
    variants: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
  },

  // ⚪ DIAMANT (Neutral, Aether, Base)
  diamant: {
    hex: '#171717',
    rgb: '23, 23, 23',
    hsl: '0, 0%, 9%',
    variants: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
      950: '#0a0a0a',
    },
  },

  // 🟠 HELIOS (Énergie, CPU, Chaleur)
  helios: {
    hex: '#ff6b35',
    rgb: '255, 107, 53',
    hsl: '16, 100%, 60%',
    variants: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#ff6b35',
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
    },
  },

  // 🔗 NEXUS (Connexions, Réseau, Flux)
  nexus: {
    hex: '#667eea',
    rgb: '102, 126, 234',
    hsl: '229, 75%, 66%',
    variants: {
      50: '#f5f7ff',
      100: '#ebf0ff',
      200: '#d6e0ff',
      300: '#b8c5ff',
      400: '#93a5ff',
      500: '#667eea',
      600: '#5563e0',
      700: '#4349c5',
      800: '#3538a0',
      900: '#2c2d80',
    },
  },

  // ⚖️ HARMONIA (Équilibre, Balance, Stabilité)
  harmonia: {
    hex: '#10b981',
    rgb: '16, 185, 129',
    hsl: '160, 84%, 39%',
    variants: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
    },
  },

  // 🟣 MEMORY (Profondeur, Couches, Archives)
  memory: {
    hex: '#a855f7',
    rgb: '168, 85, 247',
    hsl: '271, 91%, 65%',
    variants: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#581c87',
    },
  },

  // 🟡 WARNING (Avertissement, Attention)
  warning: {
    hex: '#ff8c42',
    rgb: '255, 140, 66',
    hsl: '24, 100%, 63%',
  },

  // ⚫ BACKGROUND
  background: {
    primary: '#0a0a0a',
    secondary: '#171717',
    tertiary: '#262626',
  },

  // ⚪ FOREGROUND
  foreground: {
    primary: 'rgba(255, 255, 255, 0.95)',
    secondary: 'rgba(255, 255, 255, 0.70)',
    tertiary: 'rgba(255, 255, 255, 0.50)',
    quaternary: 'rgba(255, 255, 255, 0.30)',
  },

  // 🌈 BORDERS
  border: {
    subtle: 'rgba(255, 255, 255, 0.08)',
    base: 'rgba(255, 255, 255, 0.12)',
    strong: 'rgba(255, 255, 255, 0.20)',
  },
} as const;

// 🎨 Helper function pour créer rgba depuis rgb string
export const rgba = (rgbString: string, alpha: number): string => {
  return `rgba(${rgbString}, ${alpha})`;
};

// 🎨 Helper function pour extraire RGB depuis hex
export const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0, 0, 0';
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
};

// 🎭 Types TypeScript
export type ColorModule = 'rubis' | 'emeraude' | 'saphir' | 'diamant' | 'helios' | 'nexus' | 'harmonia' | 'memory';
export type ColorVariant = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;
