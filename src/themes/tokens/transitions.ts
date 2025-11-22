/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ Design Tokens - Transitions
 * Durées et fonctions d'interpolation pour animations
 * ═══════════════════════════════════════════════════════════════
 */

export const transitions = {
  duration: {
    instant: '50ms',
    fast: '150ms',
    base: '250ms',
    slow: '350ms',
    slower: '500ms',
  },
  
  timing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    
    // Cubic bezier personnalisées
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
  
  // Transitions pré-configurées courantes
  preset: {
    fade: 'opacity 250ms ease-in-out',
    slide: 'transform 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    scale: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    color: 'color 250ms ease-in-out, background-color 250ms ease-in-out',
    shadow: 'box-shadow 250ms ease-in-out',
    all: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

export type TransitionDuration = keyof typeof transitions.duration;
export type TransitionTiming = keyof typeof transitions.timing;
export type TransitionPreset = keyof typeof transitions.preset;
