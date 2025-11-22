/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ Design Tokens - Spacing
 * Système d'espacement basé sur 8px
 * ═══════════════════════════════════════════════════════════════
 */

export const spacing = {
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.5rem',   // 24px
  6: '2rem',     // 32px
  7: '2.5rem',   // 40px
  8: '3.5rem',   // 56px - Pour sections majeures
  9: '4.5rem',   // 72px - Pour séparations majeures
  10: '5rem',    // 80px
  12: '6rem',    // 96px
  16: '8rem',    // 128px
  20: '10rem',   // 160px
  24: '6rem',    // 96px
  32: '8rem',    // 128px
  40: '10rem',   // 160px
  48: '12rem',   // 192px
  56: '14rem',   // 224px
  64: '16rem',   // 256px
} as const;

export type SpacingKey = keyof typeof spacing;
