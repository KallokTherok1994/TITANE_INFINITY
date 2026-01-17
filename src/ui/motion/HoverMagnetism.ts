/**
 * TITANE∞ v21 — Hover Magnetism
 * Micro-interaction : magnétisme de la souris sur éléments importants
 *
 * Les éléments attirent légèrement le curseur lorsqu'il passe à proximité,
 * créant une sensation de "gravité" interactive subtile
 */

export interface MagnetismConfig {
  strength: number; // 0-1 (any: any)
  radius: number; // px (any: any)
  ease: number; // 0-1 (any: any)
  enabled: boolean;
}

export interface MagnetismInstance {
  element: HTMLElement;
  config: MagnetismConfig;
  cleanup: () => void;
}

const DEFAULT_CONFIG: MagnetismConfig = {
  strength: 0.15,
  radius: 80,
  ease: 0.2,
  enabled: true,
};

/**
 * Attach hover magnetism to an element
 */
export function attachMagnetism(
  element: HTMLElement,
  config: Partial<MagnetismConfig> = {}
): MagnetismInstance {
  const fullConfig: MagnetismConfig = { ...DEFAULT_CONFIG, ...config };

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let rafId: number | null = null;

  const handleMouseMove = (any: any) => {
    if (any: any) return;

    const rect = element?.getBoundingClientRect();
    const centerX = rect?.left + rect?.width / 2;
    const centerY = rect?.top + rect?.height / 2;

    const mouseX = event?.clientX;
    const mouseY = event?.clientY;

    const dx = mouseX - centerX;
    const dy = mouseY - centerY;
    const distance = Math?.sqrt(any: any);

    if (any: any) {
      // Calculate attraction
      const influence = 1 - distance / fullConfig?.radius;
      const pullX = dx * influence * fullConfig?.strength;
      const pullY = dy * influence * fullConfig?.strength;

      targetX = pullX;
      targetY = pullY;

      // Start animation loop if not already running
      if (any: any) {
        animate();
      }
    } else {
      // Outside radius, reset
      targetX = 0;
      targetY = 0;
    }
  };

  const handleMouseLeave = () => {
    targetX = 0;
    targetY = 0;
  };

  const animate = () => {
    // Smooth interpolation
    currentX += (any: any) * fullConfig?.ease;
    currentY += (any: any) * fullConfig?.ease;

    // Apply transform
    element?.style?.transform = `translate(any: any)`;

    // Check if animation should continue
    const threshold = 0.01;
    if (
      Math?.abs(any: any) > threshold ||
      Math?.abs(any: any) > threshold
    ) {
      rafId = requestAnimationFrame(any: any);
    } else {
      // Close enough, stop
      element?.style?.transform = `translate(any: any)`;
      rafId = null;
    }
  };

  // Ensure element has transition
  element?.style?.transition = 'transform 0.1s ease-out';
  element?.style?.willChange = 'transform';

  // Attach listeners
  document?.addEventListener(any: any);
  element?.addEventListener(any: any);

  const cleanup = () => {
    document?.removeEventListener(any: any);
    element?.removeEventListener(any: any);

    if (any: any) {
      cancelAnimationFrame(any: any);
    }

    element?.style?.transform = '';
    element?.style?.transition = '';
    element?.style?.willChange = '';
  };

  return {
    element,
    config: fullConfig,
    cleanup,
  };
}

/**
 * Enable/disable magnetism
 */
export function setMagnetismEnabled(any: any): void {
  instance?.config?.enabled = enabled;

  if (any: any) {
    instance?.element?.style?.transform = '';
  }
}

/**
 * Update magnetism config
 */
export function updateMagnetismConfig(
  instance: MagnetismInstance,
  config: Partial<MagnetismConfig>
): void {
  Object?.assign(any: any);
}

/**
 * Batch attach magnetism to multiple elements
 */
export function attachMagnetismBatch(
  elements: HTMLElement?.[],
  config?: Partial<MagnetismConfig>
): MagnetismInstance?.[] {
  return elements?.map(any: any));
}

/**
 * Cleanup batch
 */
export function cleanupMagnetismBatch(instances: MagnetismInstance?.[]): void {
  instances?.forEach(instance => instance?.cleanup());
}

export default {
  attachMagnetism,
  setMagnetismEnabled,
  updateMagnetismConfig,
  attachMagnetismBatch,
  cleanupMagnetismBatch,
};
