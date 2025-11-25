/**
 * TITANE_INFINITY v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v14 - Motion System (Framer Motion Variants)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Système d'animations unifié avec throttling performance adaptatif.
 *
 * RÈGLES v14:
 * - Durées courtes (120-250ms)
 * - Easings organiques (easeOut, easeInOut)
 * - Propriétés animables uniquement (opacity, y, scale, x)
 * - JAMAIS: rgba(), background-color, border-color (non animables)
 * - Toujours utiliser 'transparent' au lieu de rgba(0,0,0,0)
 * - Throttling adaptatif via useAnimation() hook
 *
 * USAGE AVEC THROTTLING:
 * ```tsx
 * import { useAnimation } from '../contexts/AnimationContext';
 * import { FadeIn } from '../design-system/motion';
 *
 * const { animationConfig } = useAnimation();
 *
 * <motion.div
 *   variants={FadeIn}
 *   transition={{ duration: animationConfig.duration }}
 * />
 * ```
 */

import type { Variants } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════════
// VARIANTS OFFICIELS v∞.F
// ═══════════════════════════════════════════════════════════════════

/**
 * FadeIn - Apparition simple (opacity uniquement)
 * Usage: Textes, icônes, éléments statiques
 */
export const FadeIn: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.18,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15,
    },
  },
};

/**
 * SlideUp - Montée depuis le bas
 * Usage: Modales, tooltips, notifications
 */
export const SlideUp: Variants = {
  initial: {
    y: 10,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.22,
      ease: 'easeOut',
    },
  },
  exit: {
    y: 10,
    opacity: 0,
    transition: {
      duration: 0.15,
    },
  },
};

/**
 * SlideDown - Descente depuis le haut
 * Usage: Dropdowns, menus
 */
export const SlideDown: Variants = {
  initial: {
    y: -10,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.22,
      ease: 'easeOut',
    },
  },
  exit: {
    y: -10,
    opacity: 0,
    transition: {
      duration: 0.15,
    },
  },
};

/**
 * ScaleIn - Agrandissement depuis le centre
 * Usage: Boutons actifs, cards interactives
 */
export const ScaleIn: Variants = {
  initial: {
    scale: 0.95,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  exit: {
    scale: 0.97,
    opacity: 0,
    transition: {
      duration: 0.15,
    },
  },
};

/**
 * SlideLeft - Entrée depuis la droite
 * Usage: Sidebars, panels
 */
export const SlideLeft: Variants = {
  initial: {
    x: 20,
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.25,
      ease: 'easeOut',
    },
  },
  exit: {
    x: 20,
    opacity: 0,
    transition: {
      duration: 0.18,
    },
  },
};

/**
 * SlideRight - Entrée depuis la gauche
 * Usage: Sidebars, panels (sens inverse)
 */
export const SlideRight: Variants = {
  initial: {
    x: -20,
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.25,
      ease: 'easeOut',
    },
  },
  exit: {
    x: -20,
    opacity: 0,
    transition: {
      duration: 0.18,
    },
  },
};

/**
 * Stagger - Container pour animations décalées
 * Usage: Listes, grilles d'éléments
 */
export const StaggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

/**
 * StaggerItem - Élément enfant pour Stagger
 * Usage: Items individuels dans listes
 */
export const StaggerItem: Variants = {
  initial: {
    y: 10,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
  exit: {
    y: 10,
    opacity: 0,
    transition: {
      duration: 0.15,
    },
  },
};

// ═══════════════════════════════════════════════════════════════════
// TRANSITIONS CSS (à utiliser dans --transition)
// ═══════════════════════════════════════════════════════════════════

export const transitions = {
  fast: '80ms ease',
  base: '120ms ease',
  medium: '200ms ease',
  slow: '300ms ease',
  smooth: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
};

// ═══════════════════════════════════════════════════════════════════
// EASINGS CUSTOM
// ═══════════════════════════════════════════════════════════════════

export const easings = {
  easeInOut: [0.4, 0, 0.2, 1],
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  sharp: [0.4, 0, 0.6, 1],
  smooth: [0.25, 0.1, 0.25, 1],
};

// Export default pour usage simplifié
export default {
  FadeIn,
  SlideUp,
  SlideDown,
  ScaleIn,
  SlideLeft,
  SlideRight,
  StaggerContainer,
  StaggerItem,
  transitions,
  easings,
};
