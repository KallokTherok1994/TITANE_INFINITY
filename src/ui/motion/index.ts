/**
 * TITANE∞ v21 — Micro-Interactions Index
 * Centralise toutes les micro-interactions globales
 *
 * Export unifié pour faciliter l'usage dans l'application
 */

// Ripple effect
export { createRipple, attachRipple, injectRippleStyles } from './RippleEffect';

export type { RippleConfig, RippleInstance } from './RippleEffect';

// Hover magnetism
export {
  attachMagnetism,
  setMagnetismEnabled,
  updateMagnetismConfig,
  attachMagnetismBatch,
  cleanupMagnetismBatch,
} from './HoverMagnetism';

export type { MagnetismConfig, MagnetismInstance } from './HoverMagnetism';

// Focus glow
export {
  setGlobalPulseWaveform,
  attachFocusGlow,
  setFocusGlowEnabled,
  updateFocusGlowConfig,
  attachFocusGlowBatch,
  cleanupFocusGlowBatch,
  injectFocusGlowStyles,
} from './FocusGlow';

export type { FocusGlowConfig, FocusGlowInstance } from './FocusGlow';

// State-aware tooltips
export {
  attachTooltip,
  updateTooltipText,
  updateTooltipState,
  attachTooltipBatch,
  cleanupTooltipBatch,
} from './StateAwareTooltips';

export type { TooltipConfig, TooltipInstance } from './StateAwareTooltips';

// Import types for internal usage
import type { MagnetismInstance } from './HoverMagnetism';
import type { FocusGlowInstance } from './FocusGlow';
import type { TooltipInstance } from './StateAwareTooltips';
import { injectRippleStyles, attachRipple } from './RippleEffect';
import { injectFocusGlowStyles, attachFocusGlow } from './FocusGlow';
import { attachMagnetism } from './HoverMagnetism';
import { attachTooltip } from './StateAwareTooltips';

/**
 * Initialize all micro-interactions
 */
export function initializeMicroInteractions(): void {
  // Inject required styles
  injectRippleStyles();
  injectFocusGlowStyles();

  console.debug('[TITANE∞] Micro-interactions initialized');
}

/**
 * Attach all micro-interactions to an element
 */
export function attachAllInteractions(
  element: HTMLElement,
  options: {
    ripple?: boolean;
    magnetism?: boolean;
    focusGlow?: boolean;
    tooltip?: string;
  } = {}
): {
  rippleCleanup?: () => void;
  magnetismInstance?: MagnetismInstance;
  focusGlowInstance?: FocusGlowInstance;
  tooltipInstance?: TooltipInstance;
} {
  const cleanups: Record<string, unknown> = {};

  if (options.ripple) {
    cleanups.rippleCleanup = attachRipple(element);
  }

  if (options.magnetism) {
    cleanups.magnetismInstance = attachMagnetism(element);
  }

  if (options.focusGlow) {
    cleanups.focusGlowInstance = attachFocusGlow(element);
  }

  if (options.tooltip) {
    cleanups.tooltipInstance = attachTooltip(element, { text: options.tooltip });
  }

  return cleanups;
}

export default {
  initializeMicroInteractions,
  attachAllInteractions,
};
