/**
 * TITANE∞ v21 — Hover Magnetism
 * Micro-interaction : magnétisme de la souris sur éléments importants
 *
 * Les éléments attirent légèrement le curseur lorsqu'il passe à proximité,
 * créant une sensation de "gravité" interactive subtile
 */

export interface MagnetismConfig {
  strength: number; // 0-1 (force d'attraction)
  radius: number; // px (rayon d'influence)
  ease: number; // 0-1 (lissage du mouvement)
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

  const handleMouseMove = (event: MouseEvent) => {
    if (!fullConfig.enabled) return;

    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = event.clientX;
    const mouseY = event.clientY;

    const dx = mouseX - centerX;
    const dy = mouseY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < fullConfig.radius) {
      // Calculate attraction
      const influence = 1 - distance / fullConfig.radius;
      const pullX = dx * influence * fullConfig.strength;
      const pullY = dy * influence * fullConfig.strength;

      targetX = pullX;
      targetY = pullY;

      // Start animation loop if not already running
      if (!rafId) {
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
    currentX += (targetX - currentX) * fullConfig.ease;
    currentY += (targetY - currentY) * fullConfig.ease;

    // Apply transform
    element.style.transform = `translate(${currentX}px, ${currentY}px)`;

    // Check if animation should continue
    const threshold = 0.01;
    if (
      Math.abs(targetX - currentX) > threshold ||
      Math.abs(targetY - currentY) > threshold
    ) {
      rafId = requestAnimationFrame(animate);
    } else {
      // Close enough, stop
      element.style.transform = `translate(${targetX}px, ${targetY}px)`;
      rafId = null;
    }
  };

  // Ensure element has transition
  element.style.transition = 'transform 0.1s ease-out';
  element.style.willChange = 'transform';

  // Attach listeners
  document.addEventListener('mousemove', handleMouseMove);
  element.addEventListener('mouseleave', handleMouseLeave);

  const cleanup = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    element.removeEventListener('mouseleave', handleMouseLeave);

    if (rafId) {
      cancelAnimationFrame(rafId);
    }

    element.style.transform = '';
    element.style.transition = '';
    element.style.willChange = '';
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
export function setMagnetismEnabled(instance: MagnetismInstance, enabled: boolean): void {
  instance.config.enabled = enabled;

  if (!enabled) {
    instance.element.style.transform = '';
  }
}

/**
 * Update magnetism config
 */
export function updateMagnetismConfig(
  instance: MagnetismInstance,
  config: Partial<MagnetismConfig>
): void {
  Object.assign(instance.config, config);
}

/**
 * Batch attach magnetism to multiple elements
 */
export function attachMagnetismBatch(
  elements: HTMLElement[],
  config?: Partial<MagnetismConfig>
): MagnetismInstance[] {
  return elements.map(el => attachMagnetism(el, config));
}

/**
 * Cleanup batch
 */
export function cleanupMagnetismBatch(instances: MagnetismInstance[]): void {
  instances.forEach(instance => instance.cleanup());
}

export default {
  attachMagnetism,
  setMagnetismEnabled,
  updateMagnetismConfig,
  attachMagnetismBatch,
  cleanupMagnetismBatch,
};
