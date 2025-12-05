/**
 * TITANE_INFINITY v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞.E - Themes Index
 * ═══════════════════════════════════════════════════════════════════
 */

import type { ReactNode } from 'react';

export { colors, spacing, radius, shadows, fontSizes, fontWeights, metalPalette } from './tokens';
// Remove empty export type to fix syntax error
// export type { } from './tokens';

// Re-export pour compatibilité
export { default } from './tokens';

// Theme Provider vide pour compatibilité (v∞ = un seul thème)
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  return children;
};
