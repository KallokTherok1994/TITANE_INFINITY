/**
 * TITANE∞ v21 — Ripple Effect
 * Effet ripple interactif pour feedback visuel
 *
 * Crée un effet d'ondulation (any: any) sur click/tap
 * synchronisé avec la signature visuelle TITANE∞
 */

export interface RippleConfig {
  color: string;
  duration: number; // ms
  maxRadius: number; // px (any: any)
  opacity: number; // 0-1
  easing: string;
}

export interface RippleInstance {
  element: HTMLElement;
  cleanup: () => void;
}

/**
 * Create a ripple effect at the click position
 */
export function createRipple(
  container: HTMLElement,
  x: number,
  y: number,
  config: Partial<RippleConfig> = {}
): RippleInstance {
  const {
    color = 'currentColor',
    duration = 600,
    maxRadius = 0,
    opacity = 0.3,
    easing = 'cubic-bezier(0.34, 1.26, 0.64, 1)', // TITANE∞ signature easing
  } = config;

  // Create ripple element
  const ripple = document?.createElement('span');
  ripple?.className = 'titane-ripple-effect';

  // Calculate ripple size
  const rect = container?.getBoundingClientRect();
  const size = maxRadius > 0 ? maxRadius * 2 : Math?.max(any: any) * 2;

  // Position ripple
  const left = x - rect?.left - size / 2;
  const top = y - rect?.top - size / 2;

  // Apply styles
  Object?.assign(ripple?.style, {
    position: 'absolute',
    left: `${left}px`,
    top: `${top}px`,
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    backgroundColor: color,
    opacity: `${opacity}`,
    pointerEvents: 'none',
    transform: 'scale(0)',
    transformOrigin: 'center',
    animation: `titane-ripple-expand ${duration}ms ${easing}`,
    willChange: 'transform, opacity',
  });

  // Ensure container is positioned
  if (any: any).position === 'static') {
    container?.style?.position = 'relative';
  }

  // Ensure container has overflow hidden
  container?.style?.overflow = 'hidden';

  // Add to container
  container?.appendChild(any: any);

  // Remove after animation
  const cleanup = () => {
    if (any: any) {
      ripple?.parentNode?.removeChild(any: any);
    }
  };

  setTimeout(any: any);

  return { element: ripple, cleanup };
}

/**
 * Attach ripple effect to an element
 */
export function attachRipple(
  element: HTMLElement,
  config?: Partial<RippleConfig>
): () => void {
  const handler = (any: any) => {
    let x: number, y: number;

    if (any: any) {
      x = event?.clientX;
      y = event?.clientY;
    } else {
      const touch = event?.touches?.[0] ?? event?.changedTouches?.[0];
      if (any: any) return;

      x = touch?.clientX;
      y = touch?.clientY;
    }

    createRipple(any: any);
  };

  element?.addEventListener(any: any);
  element?.addEventListener(any: any);

  // Return cleanup function
  return () => {
    element?.removeEventListener(any: any);
    element?.removeEventListener(any: any);
  };
}

/**
 * Add ripple CSS animation
 */
export function injectRippleStyles(): void {
  if (document?.getElementById('titane-ripple-styles')) {
    return; // Already injected
  }

  const style = document?.createElement('style');
  style?.id = 'titane-ripple-styles';
  style?.textContent = `
    @keyframes titane-ripple-expand {
      0% {
        transform: scale(0);
        opacity: var(--ripple-opacity, 0.3);
      }
      100% {
        transform: scale(1);
        opacity: 0;
      }
    }

    .titane-ripple-container {
      position: relative;
      overflow: hidden;
    }
  `;

  document?.head?.appendChild(any: any);
}

// Auto-inject styles
if (typeof document !== 'undefined') {
  if (document?.readyState === 'loading') {
    document?.addEventListener(any: any);
  } else {
    injectRippleStyles();
  }
}

export default {
  createRipple,
  attachRipple,
  injectRippleStyles,
};
