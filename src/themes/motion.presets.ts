/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ — Motion Presets (Framer Motion)
 * Animations fluides et micro-interactions
 * ═══════════════════════════════════════════════════════════════
 */

import type { Variants, Transition } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────
// TRANSITIONS
// ─────────────────────────────────────────────────────────────────

export const transitions = {
  // Ultra-rapide (micro-interactions)
  fast: {
    duration: 0.15,
    ease: [0.4, 0, 0.2, 1], // easeInOut
  } as Transition,

  // Rapide (boutons, hovers)
  quick: {
    duration: 0.2,
    ease: [0.4, 0, 0.2, 1],
  } as Transition,

  // Normal (modals, panels)
  normal: {
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1],
  } as Transition,

  // Fluide (pages, grands éléments)
  smooth: {
    duration: 0.5,
    ease: [0.25, 0.1, 0.25, 1], // easeInOutCubic
  } as Transition,

  // Élastique (feedback visuel)
  spring: {
    type: 'spring',
    stiffness: 400,
    damping: 30,
  } as Transition,

  // Spring doux (éléments lourds)
  gentleSpring: {
    type: 'spring',
    stiffness: 120,
    damping: 14,
  } as Transition,
};

// ─────────────────────────────────────────────────────────────────
// FADE VARIANTS
// ─────────────────────────────────────────────────────────────────

export const fadeVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: transitions.normal,
  },
  exit: {
    opacity: 0,
    transition: transitions.fast,
  },
};

export const fadeUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.smooth,
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: transitions.fast,
  },
};

export const fadeDownVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.smooth,
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: transitions.fast,
  },
};

// ─────────────────────────────────────────────────────────────────
// SCALE VARIANTS
// ─────────────────────────────────────────────────────────────────

export const scaleVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: transitions.fast,
  },
};

export const popVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: transitions.quick,
  },
};

// ─────────────────────────────────────────────────────────────────
// SLIDE VARIANTS
// ─────────────────────────────────────────────────────────────────

export const slideLeftVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -100,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.smooth,
  },
  exit: {
    opacity: 0,
    x: 100,
    transition: transitions.quick,
  },
};

export const slideRightVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 100,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.smooth,
  },
  exit: {
    opacity: 0,
    x: -100,
    transition: transitions.quick,
  },
};

// ─────────────────────────────────────────────────────────────────
// STAGGER CONTAINER
// ─────────────────────────────────────────────────────────────────

export const staggerContainerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.quick,
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: transitions.fast,
  },
};

// ─────────────────────────────────────────────────────────────────
// MODAL / OVERLAY VARIANTS
// ─────────────────────────────────────────────────────────────────

export const modalBackdropVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: transitions.normal,
  },
  exit: {
    opacity: 0,
    transition: transitions.fast,
  },
};

export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 50,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: transitions.quick,
  },
};

// ─────────────────────────────────────────────────────────────────
// HOVER / TAP ANIMATIONS
// ─────────────────────────────────────────────────────────────────

export const hoverScale = {
  whileHover: {
    scale: 1.05,
    transition: transitions.fast,
  },
  whileTap: {
    scale: 0.98,
    transition: transitions.fast,
  },
};

export const hoverLift = {
  whileHover: {
    y: -4,
    transition: transitions.fast,
  },
  whileTap: {
    y: 0,
    transition: transitions.fast,
  },
};

export const hoverGlow = {
  whileHover: {
    boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
    transition: transitions.fast,
  },
};

// ─────────────────────────────────────────────────────────────────
// LOADING / SPINNER VARIANTS
// ─────────────────────────────────────────────────────────────────

export const spinnerVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

export const pulseVariants: Variants = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// ─────────────────────────────────────────────────────────────────
// PAGE TRANSITIONS
// ─────────────────────────────────────────────────────────────────

export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: transitions.smooth,
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: transitions.quick,
  },
};

// ─────────────────────────────────────────────────────────────────
// NOTIFICATION / TOAST VARIANTS
// ─────────────────────────────────────────────────────────────────

export const toastVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -100,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    y: -50,
    scale: 0.9,
    transition: transitions.quick,
  },
};
