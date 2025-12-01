/**
 * TITANE_INFINITY v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v16 - Theme Provider (Legacy)
 * ═══════════════════════════════════════════════════════════════════
 *
 * @deprecated Ce provider est conservé pour compatibilité.
 * Utilisez UIThemeProvider du Design Center v16 pour les tokens dynamiques:
 *
 * import { UIThemeProvider, useUITheme } from '@/features/design-center';
 */

import type { ReactNode } from 'react';

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * ThemeProvider legacy pour TITANE∞
 * @deprecated Utilisez UIThemeProvider de design-center
 */
export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // v16 : Redirige vers le nouveau système
  // Le thème est maintenant géré par UIThemeProvider
  return children;
};

export default ThemeProvider;
