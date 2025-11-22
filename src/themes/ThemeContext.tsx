/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v17.1 - Theme Context
 * Context React pour gestion du thème actif
 * ═══════════════════════════════════════════════════════════════
 */

import { createContext, useContext } from 'react';
import type { ThemeName } from '@themes/tokens';

export interface ThemeContextValue {
  currentTheme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  themes: ThemeName[];
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useThemeContext = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return context;
};
