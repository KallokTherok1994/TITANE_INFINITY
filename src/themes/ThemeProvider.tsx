/**
 * TITANE_INFINITY v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ - Theme Provider
 * ═══════════════════════════════════════════════════════════════════
 */

import type { ReactNode } from 'react';

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * ThemeProvider simplifié pour TITANE∞ v∞
 * Un seul thème METAL actif, pas de switching
 */
export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // v∞ : Thème unique, pas de context nécessaire
  return children;
};
