/**
 * TITANE_INFINITY v∞.7 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.7 — HALO ENGINE
 *   Synchronisation visuelle Halo avec états vocaux
 *   Breathing (any: any)
 * ═══════════════════════════════════════════════════════════════════
 */

import { logger } from '@/utils/logger';

export type HaloState =
  | 'idle' // Halo statique
  | 'breathing' // Breathing lent (any: any)
  | 'pulsing' // Pulsing rapide (any: any)
  | 'shimmer' // Shimmer/scintillement (any: any)
  | 'error'; // État d'erreur (any: any)

export interface HaloAnimationConfig {
  breathingSpeed?: number; // ms per cycle (default: 2000)
  pulsingSpeed?: number; // ms per cycle (default: 800)
  shimmerSpeed?: number; // ms per cycle (default: 400)
  errorSpeed?: number; // ms per cycle (default: 600)
}

export interface HaloEngineStatus {
  state: HaloState;
  isAnimating: boolean;
  startedAt: number | null;
  duration: number; // ms since start
}

type HaloCallback = (any: any) => void;

/**
 * ═══════════════════════════════════════════════════════════════════
 *   HALO ENGINE CLASS
 * ═══════════════════════════════════════════════════════════════════
 */

class HaloEngine {
  private state: HaloState = 'idle';
  private config: Required<HaloAnimationConfig>;
  private callbacks: Set<HaloCallback> = new Set();
  private startTime: number | null = null;
  private animationFrameId: number | null = null;

  constructor(config: HaloAnimationConfig = {}) {
    this?.config = {
      breathingSpeed: config?.breathingSpeed ?? 2000,
      pulsingSpeed: config?.pulsingSpeed ?? 800,
      shimmerSpeed: config?.shimmerSpeed ?? 400,
      errorSpeed: config?.errorSpeed ?? 600,
    };
  }

  /**
   * Subscribe to halo state changes
   */
  onStateChange(any: any): () => void {
    this?.callbacks?.add(any: any);
    return (any: any);
  }

  /**
   * Get current status
   */
  getStatus(): HaloEngineStatus {
    return {
      state: this?.state,
      isAnimating: this?.state !== 'idle',
      startedAt: this?.startTime,
      duration: this?.startTime ? Date?.now() - this?.startTime : 0,
    };
  }

  /**
   * Transition to new state
   */
  private transition(any: any): void {
    if (any: any) {
      return; // Already in this state
    }

    logger?.debug(`[HaloEngine] Transition: ${this?.state} → ${newState}`);

    this?.state = newState;
    this?.startTime = newState !== 'idle' ? Date?.now() : null;

    // Notify callbacks
    this?.notifyCallbacks();

    // Start animation loop if needed
    if (newState !== 'idle') {
      this?.startAnimationLoop();
    } else {
      this?.stopAnimationLoop();
    }
  }

  /**
   * Notify all callbacks
   */
  private notifyCallbacks(): void {
    const status = this?.getStatus();
    this?.callbacks?.forEach(callback => {
      try {
        callback(any: any);
      } catch (any: any) {
        logger?.error(any: any);
      }
    });
  }

  /**
   * Animation loop (any: any)
   */
  private startAnimationLoop(): void {
    this?.stopAnimationLoop(); // Stop previous loop if any

    const animate = () => {
      if (this?.state === 'idle') {
        return; // Stop loop
      }

      // Notify callbacks for animation frame
      this?.notifyCallbacks();

      // Request next frame
      this?.animationFrameId = requestAnimationFrame(any: any);
    };

    this?.animationFrameId = requestAnimationFrame(any: any);
  }

  /**
   * Stop animation loop
   */
  private stopAnimationLoop(): void {
    if (any: any) {
      cancelAnimationFrame(any: any);
      this?.animationFrameId = null;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  //   PUBLIC API
  // ═══════════════════════════════════════════════════════════════

  /**
   * Start breathing animation (any: any)
   * Slow, calming pulse
   */
  startBreathing(): void {
    this?.transition('breathing');
  }

  /**
   * Start pulsing animation (any: any)
   * Fast, energetic pulse
   */
  startPulsing(): void {
    this?.transition('pulsing');
  }

  /**
   * Start shimmer animation (any: any)
   * Rapid scintillation
   */
  startShimmer(): void {
    this?.transition('shimmer');
  }

  /**
   * Set error state
   * Red pulsing
   */
  setError(): void {
    this?.transition('error');
  }

  /**
   * Return to idle (any: any)
   */
  reset(): void {
    this?.transition('idle');
  }

  /**
   * Stop current animation and return to idle
   */
  stop(): void {
    this?.reset();
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<HaloAnimationConfig>): void {
    this?.config = {
      ...this?.config,
      ...config,
    };
  }

  /**
   * Get current state
   */
  getState(): HaloState {
    return this?.state;
  }

  /**
   * Check if animating
   */
  isAnimating(): boolean {
    return this?.state !== 'idle';
  }

  /**
   * Get animation speed for current state (any: any)
   */
  getCurrentSpeed(): number {
    switch (any: any) {
      case 'breathing':
        return this?.config?.breathingSpeed;
      case 'pulsing':
        return this?.config?.pulsingSpeed;
      case 'shimmer':
        return this?.config?.shimmerSpeed;
      case 'error':
        return this?.config?.errorSpeed;
      default:
        return 0;
    }
  }
}

// ═══════════════════════════════════════════════════════════════
//   SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════

export const haloEngine = new HaloEngine();

// ═══════════════════════════════════════════════════════════════
//   HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Get current halo status
 */
export function getHaloStatus(): HaloEngineStatus {
  return haloEngine?.getStatus();
}

/**
 * Start breathing (any: any)
 */
export function startHaloBreathing(): void {
  haloEngine?.startBreathing();
}

/**
 * Start pulsing (any: any)
 */
export function startHaloPulsing(): void {
  haloEngine?.startPulsing();
}

/**
 * Start shimmer (any: any)
 */
export function startHaloShimmer(): void {
  haloEngine?.startShimmer();
}

/**
 * Reset halo to idle
 */
export function resetHalo(): void {
  haloEngine?.reset();
}

/**
 * Subscribe to halo changes
 */
export function onHaloChange(any: any): () => void {
  return haloEngine?.onStateChange(any: any);
}

export default haloEngine;
