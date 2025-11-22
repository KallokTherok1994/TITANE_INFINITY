/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v17.1 - Theme Provider
 * Provider React pour système de thèmes avec persistance
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useEffect, type ReactNode } from 'react';
import { ThemeContext } from './ThemeContext';
import type { ThemeName } from '@themes/tokens';
import { colors } from '@themes/tokens';

const STORAGE_KEY = 'titane-theme';
const AVAILABLE_THEMES: ThemeName[] = ['rubis', 'saphir', 'emeraude', 'diamant'];
const DEFAULT_THEME: ThemeName = 'rubis';

export interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeName;
}

/**
 * Provider pour le système de thèmes TITANE∞
 * 
 * Gère:
 * - Sélection du thème actif
 * - Persistance localStorage
 * - Application des CSS variables
 */
export const ThemeProvider = ({ 
  children, 
  defaultTheme = DEFAULT_THEME 
}: ThemeProviderProps): JSX.Element => {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>(() => {
    // Charger depuis localStorage au montage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && AVAILABLE_THEMES.includes(stored as ThemeName)) {
        return stored as ThemeName;
      }
    }
    return defaultTheme;
  });

  // Appliquer le thème au DOM
  useEffect(() => {
    applyTheme(currentTheme);
    
    // Persister le choix
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, currentTheme);
    }
  }, [currentTheme]);

  const handleSetTheme = (theme: ThemeName): void => {
    if (AVAILABLE_THEMES.includes(theme)) {
      setCurrentTheme(theme);
    } else {
      console.warn(`Theme "${theme}" not available. Using ${DEFAULT_THEME}.`);
      setCurrentTheme(DEFAULT_THEME);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        setTheme: handleSetTheme,
        themes: AVAILABLE_THEMES,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Appliquer les CSS variables du thème au document
 */
function applyTheme(theme: ThemeName): void {
  const root = document.documentElement;
  const themeColors = colors[theme];

  if (!themeColors) {
    console.error(`Theme "${theme}" not found in colors tokens`);
    return;
  }

  // Appliquer les couleurs primaires
  Object.entries(themeColors.primary).forEach(([shade, value]) => {
    root.style.setProperty(`--color-primary-${shade}`, value);
  });

  // Appliquer les couleurs accent
  Object.entries(themeColors.accent).forEach(([shade, value]) => {
    root.style.setProperty(`--color-accent-${shade}`, value);
  });

  // Appliquer les surfaces
  root.style.setProperty('--surface-glass', themeColors.surface.glass);
  root.style.setProperty('--surface-translucent', themeColors.surface.translucent);
  root.style.setProperty('--surface-solid', themeColors.surface.solid);

  // Appliquer les couleurs sémantiques (neutral)
  Object.entries(colors.neutral).forEach(([shade, value]) => {
    root.style.setProperty(`--color-neutral-${shade}`, value);
  });

  // Appliquer les couleurs sémantiques (success, warning, error, info)
  ['success', 'warning', 'error', 'info'].forEach(semantic => {
    const semanticColors = colors.semantic[semantic as keyof typeof colors.semantic];
    Object.entries(semanticColors).forEach(([shade, value]) => {
      root.style.setProperty(`--color-${semantic}-${shade}`, value);
    });
  });

  // Marquer le thème actif sur le body
  document.body.setAttribute('data-theme', theme);
}
