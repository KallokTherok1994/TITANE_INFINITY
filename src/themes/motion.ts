/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ Design Tokens - Motion System
 * Animations subtiles, organiques et intelligentes
 * Blueprint Design System v17.1
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * DURÉES - Entre 120ms et 250ms pour fluidité optimale
 */
export const durations = {
  instant: '50ms',
  fast: '120ms',
  normal: '180ms',
  slow: '250ms',
  slower: '400ms',
} as const;

/**
 * EASINGS - Courbes naturelles et organiques
 */
export const easings = {
  // Easing principal - cubic-bezier doux et organique
  default: 'cubic-bezier(0.22, 1, 0.36, 1)',
  
  // Variantes spécialisées
  smooth: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  linear: 'linear',
  
  // Easings d'entrée/sortie
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

/**
 * MICRO-SHIFTS - Décalages subtils (max 2-4px)
 */
export const shifts = {
  subtle: '2px',
  normal: '4px',
  pronounced: '6px',
} as const;

/**
 * ANIMATIONS STANDARDISÉES
 */
export const animations = {
  // Fade - Apparition/disparition douce
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: durations.normal,
    easing: easings.default,
  },
  
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
    duration: durations.normal,
    easing: easings.default,
  },
  
  // Spring doux - Rebond subtil
  springIn: {
    from: { scale: 0.95, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    duration: durations.slow,
    easing: easings.spring,
  },
  
  // Slide subtile - Glissement doux
  slideUp: {
    from: { transform: `translateY(${shifts.normal})`, opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
    duration: durations.normal,
    easing: easings.default,
  },
  
  slideDown: {
    from: { transform: `translateY(-${shifts.normal})`, opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
    duration: durations.normal,
    easing: easings.default,
  },
  
  slideLeft: {
    from: { transform: `translateX(${shifts.normal})`, opacity: 0 },
    to: { transform: 'translateX(0)', opacity: 1 },
    duration: durations.normal,
    easing: easings.default,
  },
  
  slideRight: {
    from: { transform: `translateX(-${shifts.normal})`, opacity: 0 },
    to: { transform: 'translateX(0)', opacity: 1 },
    duration: durations.normal,
    easing: easings.default,
  },
  
  // Overlay fade - Pour modales et overlays
  overlayFade: {
    from: { opacity: 0, backdropFilter: 'blur(0px)' },
    to: { opacity: 1, backdropFilter: 'blur(8px)' },
    duration: durations.normal,
    easing: easings.default,
  },
  
  // Glow pulse - Ultra léger, pour états actifs
  glowPulse: {
    from: { boxShadow: '0 0 0px rgba(var(--primary-rgb), 0)' },
    to: { boxShadow: '0 0 20px rgba(var(--primary-rgb), 0.3)' },
    duration: '1500ms',
    easing: easings.easeInOut,
    iterationCount: 'infinite',
    direction: 'alternate',
  },
  
  // Hover - États de survol
  hoverLift: {
    from: { transform: 'translateY(0)' },
    to: { transform: `translateY(-${shifts.subtle})` },
    duration: durations.fast,
    easing: easings.default,
  },
  
  hoverGlow: {
    from: { boxShadow: 'var(--shadow-sm)' },
    to: { boxShadow: 'var(--shadow-md)' },
    duration: durations.fast,
    easing: easings.default,
  },
} as const;

/**
 * TRANSITIONS COMPOSÉES - Pour utilisation dans CSS
 */
export const transitions = {
  // Transitions standard
  all: `all ${durations.normal} ${easings.default}`,
  colors: `background-color ${durations.normal} ${easings.default}, color ${durations.normal} ${easings.default}, border-color ${durations.normal} ${easings.default}`,
  transform: `transform ${durations.normal} ${easings.default}`,
  opacity: `opacity ${durations.normal} ${easings.default}`,
  
  // Transitions spécialisées
  hover: `transform ${durations.fast} ${easings.default}, box-shadow ${durations.fast} ${easings.default}`,
  focus: `box-shadow ${durations.fast} ${easings.default}, border-color ${durations.fast} ${easings.default}`,
  smooth: `all ${durations.slow} ${easings.smooth}`,
} as const;

/**
 * FRAMER MOTION VARIANTS - Réutilisables
 */
export const framerVariants = {
  // Container animations - Pour listes et grilles
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.02,
      },
    },
  },
  
  // Item animations
  item: {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: parseFloat(durations.normal) / 1000,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  },
  
  // Modal animations
  modal: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: parseFloat(durations.slow) / 1000,
        ease: [0.22, 1, 0.36, 1],
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: parseFloat(durations.normal) / 1000,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  },
  
  // Overlay backdrop
  overlay: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: parseFloat(durations.normal) / 1000,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: parseFloat(durations.normal) / 1000,
      },
    },
  },
  
  // Slide animations
  slideIn: {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: parseFloat(durations.normal) / 1000,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  },
} as const;

/**
 * ACCESSIBILITY - Support réduction animations
 */
export const prefersReducedMotion = '@media (prefers-reduced-motion: reduce)';

export const reducedMotionStyles = {
  transition: 'none',
  animation: 'none',
} as const;

/**
 * TYPES
 */
export type Duration = keyof typeof durations;
export type Easing = keyof typeof easings;
export type AnimationName = keyof typeof animations;
export type TransitionName = keyof typeof transitions;
