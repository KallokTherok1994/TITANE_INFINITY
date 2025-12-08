/**
 * TITANE∞ v20Ω — Theme Adapter
 * Adaptation du thème visuel
 */

import type { ThemeAdaptation, UIContext, UserMode } from '../types';

/**
 * Présets de thème par mode
 */
const THEME_PRESETS: Record<UserMode, Partial<ThemeAdaptation>> = {
  novice: {
    surfaceOpacity: 1.0,
    borderRadius: 'soft',
    shadowIntensity: 'medium',
    contrastMode: 'normal',
  },
  standard: {
    surfaceOpacity: 0.95,
    borderRadius: 'soft',
    shadowIntensity: 'subtle',
    contrastMode: 'normal',
  },
  power: {
    surfaceOpacity: 0.9,
    borderRadius: 'sharp',
    shadowIntensity: 'none',
    contrastMode: 'normal',
  },
  focus: {
    surfaceOpacity: 1.0,
    borderRadius: 'soft',
    shadowIntensity: 'none',
    contrastMode: 'normal',
  },
  accessibility: {
    surfaceOpacity: 1.0,
    borderRadius: 'round',
    shadowIntensity: 'strong',
    contrastMode: 'high',
  },
};

/**
 * Thème par défaut
 */
const DEFAULT_THEME: ThemeAdaptation = {
  colorScheme: 'auto',
  accentColor: '#6366f1', // Indigo
  surfaceOpacity: 0.95,
  borderRadius: 'soft',
  shadowIntensity: 'subtle',
  contrastMode: 'normal',
};

/**
 * Couleurs d'accent disponibles
 */
const ACCENT_COLORS = {
  indigo: '#6366f1',
  blue: '#3b82f6',
  cyan: '#06b6d4',
  emerald: '#10b981',
  amber: '#f59e0b',
  rose: '#f43f5e',
  purple: '#a855f7',
  neutral: '#737373',
};

/**
 * Adaptateur de thème
 */
export class ThemeAdapter {
  private currentTheme: ThemeAdaptation = { ...DEFAULT_THEME };
  private listeners: Set<(theme: ThemeAdaptation) => void> = new Set();

  /**
   * Adapte le thème au contexte
   */
  adapt(context: UIContext, mode: UserMode): ThemeAdaptation {
    const theme = { ...DEFAULT_THEME };

    // Appliquer le préset du mode
    const preset = THEME_PRESETS[mode];
    Object.assign(theme, preset);

    // Adapter le schéma de couleurs
    this.adaptColorScheme(theme, context);

    // Adapter au contraste élevé
    this.adaptToHighContrast(theme, context);

    this.currentTheme = theme;
    this.notifyListeners();
    return theme;
  }

  /**
   * Adapte le schéma de couleurs
   */
  private adaptColorScheme(theme: ThemeAdaptation, context: UIContext): void {
    if (theme.colorScheme === 'auto') {
      // Utiliser la préférence système
      theme.colorScheme = context.colorScheme === 'dark' ? 'dark' : 'light';
    }
  }

  /**
   * Adapte au mode contraste élevé
   */
  private adaptToHighContrast(theme: ThemeAdaptation, context: UIContext): void {
    if (context.highContrast) {
      theme.contrastMode = 'high';
      theme.surfaceOpacity = 1.0;
      theme.shadowIntensity = 'strong';
    }
  }

  /**
   * Change le schéma de couleurs
   */
  setColorScheme(scheme: 'light' | 'dark' | 'auto'): void {
    this.currentTheme.colorScheme = scheme;
    this.notifyListeners();
  }

  /**
   * Change la couleur d'accent
   */
  setAccentColor(color: keyof typeof ACCENT_COLORS | string): void {
    if (color in ACCENT_COLORS) {
      this.currentTheme.accentColor = ACCENT_COLORS[color as keyof typeof ACCENT_COLORS];
    } else if (color.startsWith('#')) {
      this.currentTheme.accentColor = color;
    }
    this.notifyListeners();
  }

  /**
   * Retourne les couleurs d'accent disponibles
   */
  getAvailableAccentColors(): typeof ACCENT_COLORS {
    return { ...ACCENT_COLORS };
  }

  /**
   * Génère les CSS custom properties
   */
  toCSSVariables(): Record<string, string> {
    const theme = this.currentTheme;

    // Border radius values
    const borderRadiusValues = {
      sharp: '2px',
      soft: '8px',
      round: '16px',
    };

    // Shadow values
    const shadowValues = {
      none: 'none',
      subtle: '0 1px 3px rgba(0,0,0,0.1)',
      medium: '0 4px 6px rgba(0,0,0,0.15)',
      strong: '0 10px 25px rgba(0,0,0,0.25)',
    };

    return {
      '--theme-scheme': theme.colorScheme,
      '--theme-accent': theme.accentColor,
      '--theme-accent-rgb': this.hexToRgb(theme.accentColor),
      '--theme-surface-opacity': String(theme.surfaceOpacity),
      '--theme-border-radius': borderRadiusValues[theme.borderRadius],
      '--theme-shadow': shadowValues[theme.shadowIntensity],
      '--theme-contrast': theme.contrastMode,
    };
  }

  /**
   * Convertit hex en RGB
   */
  private hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
    }
    return '99, 102, 241'; // Default indigo
  }

  /**
   * Applique le thème au document
   */
  applyToDocument(): void {
    if (typeof document === 'undefined') return;

    const vars = this.toCSSVariables();
    const root = document.documentElement;

    // Appliquer les variables CSS
    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value);
    }

    // Appliquer la classe de thème
    root.classList.remove('light', 'dark');
    root.classList.add(this.currentTheme.colorScheme === 'dark' ? 'dark' : 'light');

    // Appliquer les data attributes
    root.dataset.theme = this.currentTheme.colorScheme;
    root.dataset.contrast = this.currentTheme.contrastMode;
  }

  /**
   * Écoute les changements de thème
   */
  onChange(callback: (theme: ThemeAdaptation) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notifie les listeners
   */
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.currentTheme);
    }
  }

  /**
   * Génère les meta tags pour le thème
   */
  getMetaTags(): Array<{ name: string; content: string }> {
    const scheme = this.currentTheme.colorScheme;
    const accentColor = this.currentTheme.accentColor;

    return [
      { name: 'color-scheme', content: scheme },
      { name: 'theme-color', content: accentColor },
      { name: 'msapplication-navbutton-color', content: accentColor },
      { name: 'apple-mobile-web-app-status-bar-style', content: scheme === 'dark' ? 'black-translucent' : 'default' },
    ];
  }

  /**
   * Retourne le thème actuel
   */
  getCurrentTheme(): ThemeAdaptation {
    return { ...this.currentTheme };
  }

  /**
   * Réinitialise au thème par défaut
   */
  reset(): void {
    this.currentTheme = { ...DEFAULT_THEME };
    this.notifyListeners();
  }
}

export default ThemeAdapter;
