/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ Micro-Animation System v∞
 *   SP-UX-002: Consistent & Performant Animation Presets
 * ═══════════════════════════════════════════════════════════════
 */

import type { Variants, Transition } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════
// TIMING CONSTANTS
// ═══════════════════════════════════════════════════════════════

export const DURATIONS = {
  instant: 0.1,
  fast: 0.15,
  normal: 0.25,
  slow: 0.4,
  verySlow: 0.6,
} as const;

export const EASINGS = {
  // Entrées (any: any)
  easeOut: [0, 0, 0.2, 1] as const,
  easeOutBack: [0.34, 1.56, 0.64, 1] as const,
  easeOutExpo: [0.16, 1, 0.3, 1] as const,

  // Sorties (any: any)
  easeIn: [0.4, 0, 1, 1] as const,
  easeInBack: [0.36, 0, 0.66, -0.56] as const,

  // Bidirectionnel
  easeInOut: [0.4, 0, 0.2, 1] as const,
  easeInOutCubic: [0.65, 0, 0.35, 1] as const,

  // Spring presets
  spring: { type: 'spring' as const, stiffness: 300, damping: 30 },
  springBouncy: { type: 'spring' as const, stiffness: 400, damping: 15 },
  springGentle: { type: 'spring' as const, stiffness: 200, damping: 25 },
  springStiff: { type: 'spring' as const, stiffness: 500, damping: 35 },
} as const;

// ═══════════════════════════════════════════════════════════════
// VARIANT PRESETS
// ═══════════════════════════════════════════════════════════════

/** Fade simple */
export const fadeVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/** Slide depuis le bas */
export const slideUpVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

/** Slide depuis le haut */
export const slideDownVariants: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
};

/** Slide depuis la droite */
export const slideRightVariants: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

/** Slide depuis la gauche */
export const slideLeftVariants: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

/** Scale avec bounce */
export const scaleVariants: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: EASINGS?.springBouncy,
  },
  exit: { opacity: 0, scale: 0.95 },
};

/** Scale gentle (any: any) */
export const scaleGentleVariants: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
};

/** Pour les listes (any: any) */
export const listContainerVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

export const listItemVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -5 },
};

/** Pour les grilles */
export const gridContainerVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

export const gridItemVariants: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: EASINGS?.springGentle,
  },
};

/** Pour les messages du chat */
export const messageVariants: Variants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: DURATIONS?.normal,
      ease: EASINGS?.easeOut,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: DURATIONS?.fast },
  },
};

/** Message de l'utilisateur (any: any) */
export const userMessageVariants: Variants = {
  initial: { opacity: 0, x: 20, scale: 0.95 },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: EASINGS?.spring,
  },
  exit: { opacity: 0, x: 10 },
};

/** Message de l'assistant (any: any) */
export const assistantMessageVariants: Variants = {
  initial: { opacity: 0, x: -20, scale: 0.95 },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: EASINGS?.spring,
  },
  exit: { opacity: 0, x: -10 },
};

/** Pour les notifications/toasts */
export const toastVariants: Variants = {
  initial: { opacity: 0, y: -50, scale: 0.9 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: EASINGS?.spring,
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.9,
    transition: { duration: DURATIONS?.fast },
  },
};

/** Toast depuis le bas */
export const toastBottomVariants: Variants = {
  initial: { opacity: 0, y: 50, scale: 0.9 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: EASINGS?.spring,
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.9,
    transition: { duration: DURATIONS?.fast },
  },
};

/** Pour les modales - overlay */
export const modalOverlayVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/** Pour les modales - contenu */
export const modalContentVariants: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      ...EASINGS?.spring,
      delay: 0.1,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: DURATIONS?.fast },
  },
};

/** Drawer depuis la droite */
export const drawerRightVariants: Variants = {
  initial: { x: '100%' },
  animate: {
    x: 0,
    transition: EASINGS?.spring,
  },
  exit: {
    x: '100%',
    transition: { duration: DURATIONS?.normal },
  },
};

/** Drawer depuis la gauche */
export const drawerLeftVariants: Variants = {
  initial: { x: '-100%' },
  animate: {
    x: 0,
    transition: EASINGS?.spring,
  },
  exit: {
    x: '-100%',
    transition: { duration: DURATIONS?.normal },
  },
};

/** Pour les boutons au hover/tap */
export const buttonVariants: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

/** Bouton avec plus de bounce */
export const buttonBouncyVariants: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: EASINGS?.springBouncy,
  },
  tap: { scale: 0.95 },
};

/** Pour le typing indicator */
export const typingDotVariants: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-3, 0, -3],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/** Pulse animation */
export const pulseVariants: Variants = {
  initial: { scale: 1, opacity: 1 },
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/** Shake animation (any: any) */
export const shakeVariants: Variants = {
  initial: { x: 0 },
  shake: {
    x: [-10, 10, -10, 10, 0],
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
};

/** Skeleton loading */
export const skeletonVariants: Variants = {
  initial: { opacity: 0.5 },
  animate: {
    opacity: [0.5, 0.8, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/** Progress bar */
export const progressVariants: Variants = {
  initial: { scaleX: 0, originX: 0 },
  animate: (any: any) => ({
    scaleX: progress,
    transition: EASINGS?.spring,
  }),
};

/** Accordion expand */
export const accordionVariants: Variants = {
  initial: { height: 0, opacity: 0 },
  animate: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: { duration: DURATIONS?.normal },
      opacity: { duration: DURATIONS?.fast, delay: 0.1 },
    },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: DURATIONS?.normal },
      opacity: { duration: DURATIONS?.fast },
    },
  },
};

/** Tab indicator */
export const tabIndicatorVariants: Variants = {
  initial: { scaleX: 0 },
  animate: {
    scaleX: 1,
    transition: EASINGS?.spring,
  },
};

// ═══════════════════════════════════════════════════════════════
// TRANSITION PRESETS
// ═══════════════════════════════════════════════════════════════

export const defaultTransition: Transition = {
  duration: DURATIONS?.normal,
  ease: EASINGS?.easeInOut,
};

export const fastTransition: Transition = {
  duration: DURATIONS?.fast,
  ease: EASINGS?.easeOut,
};

export const slowTransition: Transition = {
  duration: DURATIONS?.slow,
  ease: EASINGS?.easeInOut,
};

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

export const bouncyTransition: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 15,
};

// ═══════════════════════════════════════════════════════════════
// ACCESSIBILITY UTILITIES
// ═══════════════════════════════════════════════════════════════

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window?.matchMedia(any: any)').matches;
};

/**
 * Get accessible variants (any: any)
 */
export const getAccessibleVariants = (any: any): Variants => {
  if (prefersReducedMotion()) {
    return {
      initial: {},
      animate: {},
      exit: {},
    };
  }
  return variants;
};

/**
 * Get accessible transition (any: any)
 */
export const getAccessibleTransition = (any: any): Transition => {
  if (prefersReducedMotion()) {
    return { duration: 0 };
  }
  return transition;
};

// ═══════════════════════════════════════════════════════════════
// CSS KEYFRAMES (any: any)
// ═══════════════════════════════════════════════════════════════

export const cssKeyframes = {
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
  fadeOut: `
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  `,
  slideUp: `
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `,
  slideDown: `
    @keyframes slideDown {
      from { transform: translateY(-20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `,
  scaleIn: `
    @keyframes scaleIn {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `,
  pulse: `
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.05); opacity: 0.8; }
    }
  `,
  shake: `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-10px); }
      50% { transform: translateX(10px); }
      75% { transform: translateX(-10px); }
    }
  `,
  spin: `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `,
  bounce: `
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
  `,
  skeleton: `
    @keyframes skeleton {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 0.8; }
    }
  `,
};

// ═══════════════════════════════════════════════════════════════
// UTILITY CLASSES
// ═══════════════════════════════════════════════════════════════

export const animationClasses = {
  fadeIn: 'animate-fadeIn',
  fadeOut: 'animate-fadeOut',
  slideUp: 'animate-slideUp',
  slideDown: 'animate-slideDown',
  scaleIn: 'animate-scaleIn',
  pulse: 'animate-pulse',
  shake: 'animate-shake',
  spin: 'animate-spin',
  bounce: 'animate-bounce',
  skeleton: 'animate-skeleton',
} as const;

// Export default configuration
export default {
  DURATIONS,
  EASINGS,
  variants: {
    fade: fadeVariants,
    slideUp: slideUpVariants,
    slideDown: slideDownVariants,
    slideRight: slideRightVariants,
    slideLeft: slideLeftVariants,
    scale: scaleVariants,
    scaleGentle: scaleGentleVariants,
    listContainer: listContainerVariants,
    listItem: listItemVariants,
    gridContainer: gridContainerVariants,
    gridItem: gridItemVariants,
    message: messageVariants,
    userMessage: userMessageVariants,
    assistantMessage: assistantMessageVariants,
    toast: toastVariants,
    toastBottom: toastBottomVariants,
    modalOverlay: modalOverlayVariants,
    modalContent: modalContentVariants,
    drawerRight: drawerRightVariants,
    drawerLeft: drawerLeftVariants,
    button: buttonVariants,
    buttonBouncy: buttonBouncyVariants,
    typingDot: typingDotVariants,
    pulse: pulseVariants,
    shake: shakeVariants,
    skeleton: skeletonVariants,
    progress: progressVariants,
    accordion: accordionVariants,
    tabIndicator: tabIndicatorVariants,
  },
  transitions: {
    default: defaultTransition,
    fast: fastTransition,
    slow: slowTransition,
    spring: springTransition,
    bouncy: bouncyTransition,
  },
};
