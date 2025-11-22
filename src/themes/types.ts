/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ Design System — Theme Types
 * Définitions TypeScript pour les thèmes
 * ═══════════════════════════════════════════════════════════════
 */

export interface Theme {
  name: string;
  displayName: string;
  colors: ThemeColors;
  effects: ThemeEffects;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  
  background: {
    base: string;
    elevated: string;
    overlay: string;
  };
  
  surface: {
    base: string;
    elevated: string;
    hover: string;
  };
  
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    muted: string;
  };
  
  border: {
    base: string;
    focus: string;
    error: string;
  };
  
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

export interface ThemeEffects {
  glow: string;
  shadow: string;
  glass: string;
}
