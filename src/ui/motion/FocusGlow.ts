/**
 * TITANE∞ v21 — Focus Glow
 * Micro-interaction : halo lumineux synchronisé avec Identity Pulse sur focus
 *
 * Ajoute un glow pulsant aux éléments focalisés,
 * synchronisé avec le battement identitaire TITANE∞
 */

import type { PulseWaveform } from '@/visual-engine/signature/IdentityPulse';

export interface FocusGlowConfig {
  color: string;
  baseIntensity: number; // 0-1
  pulseSync: boolean; // sync with Identity Pulse
  blurRadius: number; // px
  duration: number; // ms (if not synced with pulse)
  enabled: boolean;
}

export interface FocusGlowInstance {
  element: HTMLElement;
  config: FocusGlowConfig;
  cleanup: () => void;
}

const DEFAULT_CONFIG: FocusGlowConfig = {
  color: 'rgba(68, 165, 255, 0.6)', // TITANE∞ blue
  baseIntensity: 0.6,
  pulseSync: true,
  blurRadius: 12,
  duration: 800,
  enabled: true,
};

let globalPulseWaveform: PulseWaveform | null = null;

/**
 * Set global pulse waveform (from IdentityPulse)
 */
export function setGlobalPulseWaveform(waveform: PulseWaveform | null): void {
  globalPulseWaveform = waveform;
}

/**
 * Attach focus glow to an element
 */
export function attachFocusGlow(
  element: HTMLElement,
  config: Partial<FocusGlowConfig> = {}
): FocusGlowInstance {
  const fullConfig: FocusGlowConfig = { ...DEFAULT_CONFIG, ...config };

  let rafId: number | null = null;
  let isFocused = false;

  const updateGlow = () => {
    if (!isFocused || !fullConfig.enabled) {
      return;
    }

    let intensity = fullConfig.baseIntensity;

    // Sync with pulse if available
    if (fullConfig.pulseSync && globalPulseWaveform) {
      intensity = fullConfig.baseIntensity * globalPulseWaveform.glowIntensity;
    }

    // Apply glow
    const blur = fullConfig.blurRadius * intensity;
    const alpha = intensity * 0.6; // Max 60% opacity
    const color = fullConfig.color.replace(/[\d.]+\)$/, `${alpha})`); // Replace alpha

    element.style.boxShadow = `
      0 0 ${blur}px ${color},
      0 0 ${blur * 0.5}px ${color},
      inset 0 0 ${blur * 0.3}px ${color}
    `;

    // Continue animation
    rafId = requestAnimationFrame(updateGlow);
  };

  const handleFocus = () => {
    isFocused = true;
    element.classList.add('titane-focus-active');

    if (!rafId) {
      updateGlow();
    }
  };

  const handleBlur = () => {
    isFocused = false;
    element.classList.remove('titane-focus-active');

    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    // Smooth fadeout
    element.style.transition = 'box-shadow 0.3s ease-out';
    element.style.boxShadow = 'none';

    setTimeout(() => {
      element.style.transition = '';
    }, 300);
  };

  // Attach listeners
  element.addEventListener('focus', handleFocus);
  element.addEventListener('blur', handleBlur);

  // Ensure focusable
  if (!element.hasAttribute('tabindex')) {
    element.setAttribute('tabindex', '0');
  }

  const cleanup = () => {
    element.removeEventListener('focus', handleFocus);
    element.removeEventListener('blur', handleBlur);

    if (rafId) {
      cancelAnimationFrame(rafId);
    }

    element.style.boxShadow = '';
    element.classList.remove('titane-focus-active');
  };

  return {
    element,
    config: fullConfig,
    cleanup,
  };
}

/**
 * Enable/disable focus glow
 */
export function setFocusGlowEnabled(instance: FocusGlowInstance, enabled: boolean): void {
  instance.config.enabled = enabled;

  if (!enabled) {
    instance.element.style.boxShadow = '';
  }
}

/**
 * Update focus glow config
 */
export function updateFocusGlowConfig(
  instance: FocusGlowInstance,
  config: Partial<FocusGlowConfig>
): void {
  Object.assign(instance.config, config);
}

/**
 * Batch attach focus glow to multiple elements
 */
export function attachFocusGlowBatch(
  elements: HTMLElement[],
  config?: Partial<FocusGlowConfig>
): FocusGlowInstance[] {
  return elements.map(el => attachFocusGlow(el, config));
}

/**
 * Cleanup batch
 */
export function cleanupFocusGlowBatch(instances: FocusGlowInstance[]): void {
  instances.forEach(instance => instance.cleanup());
}

/**
 * Inject focus glow styles
 */
export function injectFocusGlowStyles(): void {
  if (document.getElementById('titane-focus-glow-styles')) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'titane-focus-glow-styles';
  style.textContent = `
    .titane-focus-active {
      outline: none;
      transition: box-shadow 0.2s ease-out;
    }

    .titane-focus-active:focus {
      outline: none;
    }
  `;

  document.head.appendChild(style);
}

// Auto-inject styles
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectFocusGlowStyles);
  } else {
    injectFocusGlowStyles();
  }
}

export default {
  setGlobalPulseWaveform,
  attachFocusGlow,
  setFocusGlowEnabled,
  updateFocusGlowConfig,
  attachFocusGlowBatch,
  cleanupFocusGlowBatch,
  injectFocusGlowStyles,
};
