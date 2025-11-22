/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ Design Tokens - Radius
 * Valeurs de border-radius pour cohérence visuelle
 * ═══════════════════════════════════════════════════════════════
 */

export const radius = {
  none: '0',
  sm: '0.375rem',   // 6px  - Plus doux
  base: '0.5rem',   // 8px  - Alias pour compatibilité
  md: '0.625rem',   // 10px - Optimisé
  lg: '1rem',       // 16px - Plus premium
  xl: '1.375rem',   // 22px - Plus élégant
  full: '999px',    // Complètement arrondi
} as const;

export type RadiusKey = keyof typeof radius;
