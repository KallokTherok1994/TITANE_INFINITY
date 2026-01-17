/**
 * TITANE∞ v21 — State-Aware Tooltips
 * Micro-interaction : tooltips colorés selon le contexte cognitif
 *
 * Tooltips intelligents qui s'adaptent à l'état cognitif + émotionnel
 * de l'assistant, avec colorimétrie signature TITANE∞
 */

import { CognitiveState, EmotionalTone } from '@/design-system/visual-states';

export interface TooltipConfig {
  text: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  delay: number; // ms
  duration: number; // ms (0 = infinite)
  cognitiveState?: CognitiveState;
  emotionalTone?: EmotionalTone;
  customColor?: string;
  enabled: boolean;
}

export interface TooltipInstance {
  element: HTMLElement;
  tooltip: HTMLElement | null;
  config: TooltipConfig;
  cleanup: () => void;
}

const DEFAULT_CONFIG: Partial<TooltipConfig> = {
  position: 'top',
  delay: 300,
  duration: 0,
  enabled: true,
};

// Cognitive state colors (TITANE∞ signature)
const COGNITIVE_COLORS: Partial<Record<CognitiveState, string>> = {
  [CognitiveState.IDLE]: 'rgba(100, 120, 150, 0.95)',
  [CognitiveState.THINKING]: 'rgba(68, 165, 255, 0.95)', // Blue
  [CognitiveState.PROCESSING]: 'rgba(155, 89, 208, 0.95)', // Purple
  [CognitiveState.SPEAKING]: 'rgba(46, 204, 113, 0.95)', // Green
  [CognitiveState.LISTENING]: 'rgba(68, 165, 255, 0.95)', // Blue
  [CognitiveState.REFLECTING]: 'rgba(255, 107, 157, 0.95)', // Pink
  [CognitiveState.LEARNING]: 'rgba(255, 160, 122, 0.95)', // Orange
  [CognitiveState.HEALING]: 'rgba(255, 215, 0, 0.95)', // Gold
  [CognitiveState.TRANSCENDENT]: 'rgba(200, 100, 255, 0.95)', // Purple-pink
};

// Emotional tone modifiers
const EMOTIONAL_MODIFIERS: Partial<
  Record<EmotionalTone, { hueShift: number; saturation: number }>
> = {
  [EmotionalTone.CALM]: { hueShift: 0, saturation: 0.8 },
  [EmotionalTone.CURIOUS]: { hueShift: 10, saturation: 1.1 },
  [EmotionalTone.EXCITED]: { hueShift: 20, saturation: 1.3 },
  [EmotionalTone.CONFIDENT]: { hueShift: -10, saturation: 1.0 },
  [EmotionalTone.CAUTIOUS]: { hueShift: -20, saturation: 0.7 },
  [EmotionalTone.CONCERNED]: { hueShift: 30, saturation: 1.2 },
  [EmotionalTone.EMPATHETIC]: { hueShift: 15, saturation: 1.1 },
  [EmotionalTone.PLAYFUL]: { hueShift: 25, saturation: 1.4 },
};

/**
 * Get tooltip color based on cognitive + emotional state
 */
function getTooltipColor(
  cognitiveState?: CognitiveState,
  emotionalTone?: EmotionalTone,
  customColor?: string
): string {
  if (customColor) return customColor;

  const defaultColor = 'rgba(100, 120, 150, 0.95)';
  if (!cognitiveState) return defaultColor;

  const baseColor = COGNITIVE_COLORS[cognitiveState] ?? defaultColor;

  // Apply emotional modulation (future enhancement)
  if (emotionalTone && EMOTIONAL_MODIFIERS[emotionalTone]) {
    // For now, just return base color
    // Future: apply hue shift + saturation
  }

  return baseColor;
}

/**
 * Create tooltip element
 */
function createTooltipElement(config: TooltipConfig): HTMLElement {
  const tooltip = document.createElement('div');
  tooltip.className = 'titane-tooltip';
  tooltip.textContent = config.text;

  const color = getTooltipColor(
    config.cognitiveState,
    config.emotionalTone,
    config.customColor
  );

  Object.assign(tooltip.style, {
    position: 'absolute',
    backgroundColor: color,
    color: '#ffffff',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    zIndex: '10000',
    opacity: '0',
    transform: 'scale(0.95)',
    transition: 'opacity 0.2s ease-out, transform 0.2s cubic-bezier(0.34, 1.26, 0.64, 1)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(8px)',
    willChange: 'opacity, transform',
  });

  return tooltip;
}

/**
 * Position tooltip relative to target
 */
function positionTooltip(
  tooltip: HTMLElement,
  target: HTMLElement,
  position: 'top' | 'bottom' | 'left' | 'right'
): void {
  const targetRect = target.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();

  let left = 0;
  let top = 0;

  const offset = 8; // px spacing

  switch (position) {
    case 'top':
      left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
      top = targetRect.top - tooltipRect.height - offset;
      break;
    case 'bottom':
      left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
      top = targetRect.bottom + offset;
      break;
    case 'left':
      left = targetRect.left - tooltipRect.width - offset;
      top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
      break;
    case 'right':
      left = targetRect.right + offset;
      top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
      break;
  }

  // Clamp to viewport
  const margin = 8;
  left = Math.max(margin, Math.min(left, window.innerWidth - tooltipRect.width - margin));
  top = Math.max(margin, Math.min(top, window.innerHeight - tooltipRect.height - margin));

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

/**
 * Attach tooltip to an element
 */
export function attachTooltip(
  element: HTMLElement,
  config: Partial<TooltipConfig> & { text: string }
): TooltipInstance {
  const fullConfig: TooltipConfig = { ...DEFAULT_CONFIG, ...config } as TooltipConfig;

  let tooltip: HTMLElement | null = null;
  let showTimeout: number | null = null;
  let hideTimeout: number | null = null;

  const show = () => {
    if (!fullConfig.enabled) return;

    // Create tooltip
    tooltip = createTooltipElement(fullConfig);
    document.body.appendChild(tooltip);

    // Position
    positionTooltip(tooltip, element, fullConfig.position);

    // Show with animation
    requestAnimationFrame(() => {
      if (tooltip) {
        tooltip.style.opacity = '1';
        tooltip.style.transform = 'scale(1)';
      }
    });

    // Auto-hide if duration set
    if (fullConfig.duration > 0) {
      hideTimeout = window.setTimeout(hide, fullConfig.duration);
    }
  };

  const hide = () => {
    if (tooltip) {
      tooltip.style.opacity = '0';
      tooltip.style.transform = 'scale(0.95)';

      setTimeout(() => {
        if (tooltip && tooltip.parentNode) {
          tooltip.parentNode.removeChild(tooltip);
        }
        tooltip = null;
      }, 200);
    }

    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
  };

  const handleMouseEnter = () => {
    if (showTimeout) clearTimeout(showTimeout);
    showTimeout = window.setTimeout(show, fullConfig.delay);
  };

  const handleMouseLeave = () => {
    if (showTimeout) {
      clearTimeout(showTimeout);
      showTimeout = null;
    }
    hide();
  };

  // Attach listeners
  element.addEventListener('mouseenter', handleMouseEnter);
  element.addEventListener('mouseleave', handleMouseLeave);

  const cleanup = () => {
    element.removeEventListener('mouseenter', handleMouseEnter);
    element.removeEventListener('mouseleave', handleMouseLeave);

    if (showTimeout) clearTimeout(showTimeout);
    if (hideTimeout) clearTimeout(hideTimeout);

    hide();
  };

  return {
    element,
    tooltip,
    config: fullConfig,
    cleanup,
  };
}

/**
 * Update tooltip text
 */
export function updateTooltipText(instance: TooltipInstance, text: string): void {
  instance.config.text = text;
  if (instance.tooltip) {
    instance.tooltip.textContent = text;
  }
}

/**
 * Update tooltip cognitive state
 */
export function updateTooltipState(
  instance: TooltipInstance,
  cognitiveState?: CognitiveState,
  emotionalTone?: EmotionalTone
): void {
  instance.config.cognitiveState = cognitiveState;
  instance.config.emotionalTone = emotionalTone;

  if (instance.tooltip) {
    const color = getTooltipColor(cognitiveState, emotionalTone);
    instance.tooltip.style.backgroundColor = color;
  }
}

/**
 * Batch attach tooltips
 */
export function attachTooltipBatch(
  elements: Array<{
    element: HTMLElement;
    config: Partial<TooltipConfig> & { text: string };
  }>
): TooltipInstance[] {
  return elements.map(({ element, config }) => attachTooltip(element, config));
}

/**
 * Cleanup batch
 */
export function cleanupTooltipBatch(instances: TooltipInstance[]): void {
  instances.forEach(instance => instance.cleanup());
}

export default {
  attachTooltip,
  updateTooltipText,
  updateTooltipState,
  attachTooltipBatch,
  cleanupTooltipBatch,
};
