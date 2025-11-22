/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v17.1 - useTheme Hook
 * Hook personnalisé pour accès facile au système de thèmes
 * ═══════════════════════════════════════════════════════════════
 */

import { useThemeContext } from './ThemeContext';
import type { ThemeName } from '@themes/tokens';
import { colors } from '@themes/tokens';

export interface UseThemeReturn {
  /** Thème actuellement actif */
  theme: ThemeName;
  
  /** Changer de thème */
  setTheme: (theme: ThemeName) => void;
  
  /** Liste des thèmes disponibles */
  availableThemes: ThemeName[];
  
  /** Couleurs du thème actif */
  colors: typeof colors[ThemeName];
  
  /** Vérifier si un thème est actif */
  isTheme: (theme: ThemeName) => boolean;
  
  /** Passer au thème suivant (rotation) */
  nextTheme: () => void;
}

/**
 * Hook pour accéder et manipuler le système de thèmes TITANE∞
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { theme, setTheme, colors, nextTheme } = useTheme();
 *   
 *   return (
 *     <div style={{ background: colors.primary[500] }}>
 *       <button onClick={nextTheme}>
 *         Thème actuel: {theme}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useTheme = (): UseThemeReturn => {
  const { currentTheme, setTheme, themes } = useThemeContext();
  
  const themeColors = colors[currentTheme];

  const isTheme = (theme: ThemeName): boolean => {
    return currentTheme === theme;
  };

  const nextTheme = (): void => {
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextThemeValue = themes[nextIndex];
    if (nextThemeValue) {
      setTheme(nextThemeValue);
    }
  };

  return {
    theme: currentTheme,
    setTheme,
    availableThemes: themes,
    colors: themeColors,
    isTheme,
    nextTheme,
  };
};
