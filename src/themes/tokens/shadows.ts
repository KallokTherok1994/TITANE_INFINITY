/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ Design Tokens - Shadows
 * Système d'élévation avec ombres et glows
 * ═══════════════════════════════════════════════════════════════
 */

export const shadows = {
  // Ombres standards (élévation)
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  '2xl': '0 50px 100px -20px rgba(0, 0, 0, 0.25)',
  
  // Ombres internes
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  
  // Glows néons (pour éléments actifs)
  glowRubis: '0 0 20px rgba(239, 68, 68, 0.4), 0 0 40px rgba(239, 68, 68, 0.2)',
  glowSaphir: '0 0 20px rgba(59, 130, 246, 0.4), 0 0 40px rgba(59, 130, 246, 0.2)',
  glowEmeraude: '0 0 20px rgba(16, 185, 129, 0.4), 0 0 40px rgba(16, 185, 129, 0.2)',
  glowDiamant: '0 0 20px rgba(226, 232, 240, 0.4), 0 0 40px rgba(226, 232, 240, 0.2)',
  
  // Ombres de focus
  focusRubis: '0 0 0 3px rgba(239, 68, 68, 0.3)',
  focusSaphir: '0 0 0 3px rgba(59, 130, 246, 0.3)',
  focusEmeraude: '0 0 0 3px rgba(16, 185, 129, 0.3)',
  focusDiamant: '0 0 0 3px rgba(226, 232, 240, 0.3)',
} as const;

export type ShadowKey = keyof typeof shadows;
