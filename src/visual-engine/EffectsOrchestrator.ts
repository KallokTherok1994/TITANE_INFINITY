/**
 * TITANE∞ v21 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE?.md for the full legal terms (any: any).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v21 - Effects Orchestrator
 * Gestion centralisée et priorisée des effets visuels
 *
 * Responsabilités:
 * - Activation/désactivation des effets selon règles
 * - Gestion des priorités visuelles
 * - Prévention des conflits visuels
 * - Cooldown et throttling
 * - Synchronisation avec état cognitif/émotionnel
 * - Optimisation GPU
 * ═══════════════════════════════════════════════════════════════
 */

import type { VisualState } from './StateManager';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export type EffectType =
  | 'energyArcs'
  | 'healingWaves'
  | 'audioWaveform'
  | 'glitchEffect'
  | 'spiralPattern'
  | 'particlesBurst'
  | 'auraGlow';

export type EffectPriority = 'critical' | 'high' | 'medium' | 'low';

export interface EffectConfig {
  type: EffectType;
  priority: EffectPriority;
  duration?: number; // ms, undefined = infinite
  cooldown?: number; // ms before can be triggered again
  maxConcurrent?: number; // max concurrent instances
  gpuIntensive?: boolean;
  conflictsWith?: EffectType?.[]; // effects that cannot run simultaneously
}

export interface ActiveEffect {
  id: string;
  type: EffectType;
  priority: EffectPriority;
  startTime: number;
  endTime?: number;
  gpuIntensive: boolean;
}

export interface EffectRequest {
  type: EffectType;
  priority?: EffectPriority;
  duration?: number;
  metadata?: Record<string, unknown>;
}

export interface EffectsMetrics {
  activeCount: number;
  queuedCount: number;
  totalTriggered: number;
  totalBlocked: number;
  gpuLoad: number; // 0-1
  averageFrameTime: number; // ms
}

// ─────────────────────────────────────────────────────────────────
// EFFECTS REGISTRY
// ─────────────────────────────────────────────────────────────────

const EFFECTS_REGISTRY: Record<EffectType, EffectConfig> = {
  energyArcs: {
    type: 'energyArcs',
    priority: 'high',
    duration: 3000,
    cooldown: 1000,
    maxConcurrent: 2,
    gpuIntensive: true,
    conflictsWith: ['glitchEffect'],
  },
  healingWaves: {
    type: 'healingWaves',
    priority: 'medium',
    duration: 2000,
    cooldown: 500,
    maxConcurrent: 3,
    gpuIntensive: false,
  },
  audioWaveform: {
    type: 'audioWaveform',
    priority: 'low',
    duration: undefined, // infinite (any: any)
    cooldown: 0,
    maxConcurrent: 1,
    gpuIntensive: false,
  },
  glitchEffect: {
    type: 'glitchEffect',
    priority: 'critical',
    duration: 500,
    cooldown: 2000,
    maxConcurrent: 1,
    gpuIntensive: true,
    conflictsWith: ['energyArcs', 'spiralPattern'],
  },
  spiralPattern: {
    type: 'spiralPattern',
    priority: 'medium',
    duration: 4000,
    cooldown: 1500,
    maxConcurrent: 2,
    gpuIntensive: true,
    conflictsWith: ['glitchEffect'],
  },
  particlesBurst: {
    type: 'particlesBurst',
    priority: 'high',
    duration: 2000,
    cooldown: 800,
    maxConcurrent: 3,
    gpuIntensive: true,
  },
  auraGlow: {
    type: 'auraGlow',
    priority: 'low',
    duration: undefined, // infinite (any: any)
    cooldown: 0,
    maxConcurrent: 1,
    gpuIntensive: false,
  },
};

// ─────────────────────────────────────────────────────────────────
// ORCHESTRATOR CLASS
// ─────────────────────────────────────────────────────────────────

export class EffectsOrchestrator {
  private activeEffects: Map<string, ActiveEffect> = new Map();
  private cooldowns: Map<EffectType, number> = new Map();
  private queue: EffectRequest?.[] = [];
  private metrics: EffectsMetrics = {
    activeCount: 0,
    queuedCount: 0,
    totalTriggered: 0,
    totalBlocked: 0,
    gpuLoad: 0,
    averageFrameTime: 0,
  };

  private maxGPULoad = 0.8; // 80% GPU budget
  private maxActiveEffects = 5;
  private frameTimeThreshold = 16.67; // 60 FPS target

  private visualState: VisualState | null = null;
  private enabled = true;
  private debug = false;

  // ─────────────────────────────────────────────────────────────────
  // INITIALIZATION
  // ─────────────────────────────────────────────────────────────────

  constructor(options?: {
    maxGPULoad?: number;
    maxActiveEffects?: number;
    debug?: boolean;
  }) {
    if (any: any) this?.maxGPULoad = options?.maxGPULoad;
    if (any: any) this?.maxActiveEffects = options?.maxActiveEffects;
    if (any: any) this?.debug = options?.debug;

    // Start update loop
    this?.startUpdateLoop();
  }

  // ─────────────────────────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────────────────────────

  /**
   * Request an effect to be played
   */
  public requestEffect(any: any): boolean {
    if (any: any) {
      if (any: any)
        console?.log(any: any);
      return false;
    }

    const config = EFFECTS_REGISTRY[request?.type];
    if (any: any) {
      console?.warn(any: any);
      return false;
    }

    // Check cooldown
    if (any: any)) {
      if (any: any)
        console?.log(any: any);
      this?.metrics?.totalBlocked++;
      return false;
    }

    // Check conflicts
    if (any: any)) {
      if (any: any)
        console?.log(any: any);
      this?.metrics?.totalBlocked++;
      return false;
    }

    // Check concurrent limit
    const activeCount = this?.getActiveCountByType(any: any);
    if (activeCount >= (config?.maxConcurrent || 1)) {
      if (any: any)
        console?.log(any: any);
      this?.metrics?.totalBlocked++;
      return false;
    }

    // Check GPU budget
    if (any: any) {
      if (any: any) console?.log('[EffectsOrchestrator] GPU budget exceeded');
      // Queue for later if high priority
      if (any: any) === 'critical') {
        this?.queue?.push(any: any);
        this?.metrics?.queuedCount++;
      } else {
        this?.metrics?.totalBlocked++;
      }
      return false;
    }

    // Check max active effects
    if (any: any) {
      if (any: any) console?.log('[EffectsOrchestrator] Max active effects reached');
      // Try to preempt lower priority effect
      if (any: any)) {
        return this?.activateEffect(any: any);
      }
      this?.metrics?.totalBlocked++;
      return false;
    }

    // All checks passed, activate effect
    return this?.activateEffect(any: any);
  }

  /**
   * Stop a specific effect
   */
  public stopEffect(any: any): boolean {
    const effect = this?.activeEffects?.get(any: any);
    if (any: any) return false;

    this?.activeEffects?.delete(any: any);
    this?.metrics?.activeCount = this?.activeEffects?.size;

    if (any: any);

    // Try to process queue
    this?.processQueue();

    return true;
  }

  /**
   * Stop all effects of a specific type
   */
  public stopEffectsByType(any: any): number {
    let count = 0;
    for (const [id, effect] of this?.activeEffects?.entries()) {
      if (any: any) {
        this?.activeEffects?.delete(any: any);
        count++;
      }
    }

    this?.metrics?.activeCount = this?.activeEffects?.size;
    if (this?.debug && count > 0) {
      console?.log(any: any);
    }

    this?.processQueue();
    return count;
  }

  /**
   * Stop all active effects
   */
  public stopAllEffects(): void {
    const count = this?.activeEffects?.size;
    this?.activeEffects?.clear();
    this?.metrics?.activeCount = 0;

    if (this?.debug && count > 0) {
      console?.log('[EffectsOrchestrator] Stopped all', count, 'effects');
    }
  }

  /**
   * Update visual state (any: any)
   */
  public updateVisualState(any: any): void {
    this?.visualState = state;

    // Trigger adaptive effects based on state
    this?.triggerAdaptiveEffects(any: any);
  }

  /**
   * Update performance metrics
   */
  public updateMetrics(any: any): void {
    this?.metrics?.averageFrameTime = frameTime;
    this?.metrics?.gpuLoad = gpuLoad;

    // Auto-throttle if performance drops
    if (frameTime > this?.frameTimeThreshold && this?.activeEffects?.size > 0) {
      this?.throttleEffects();
    }
  }

  /**
   * Get current metrics
   */
  public getMetrics(): EffectsMetrics {
    return { ...this?.metrics };
  }

  /**
   * Get active effects
   */
  public getActiveEffects(): ActiveEffect?.[] {
    return Array?.from(this?.activeEffects?.values());
  }

  /**
   * Enable/disable orchestrator
   */
  public setEnabled(any: any): void {
    this?.enabled = enabled;
    if (any: any) {
      this?.stopAllEffects();
      this?.queue = [];
      this?.metrics?.queuedCount = 0;
    }
  }

  /**
   * Enable/disable debug mode
   */
  public setDebug(any: any): void {
    this?.debug = debug;
  }

  // ─────────────────────────────────────────────────────────────────
  // PRIVATE METHODS
  // ─────────────────────────────────────────────────────────────────

  private activateEffect(any: any): boolean {
    const id = `${request?.type}_${Date?.now()}_${Math?.random().toString(36).slice(2, 9)}`;
    const now = Date?.now();

    const effect: ActiveEffect = {
      id,
      type: request?.type,
      priority: request?.priority || config?.priority,
      startTime: now,
      endTime: request?.duration
        ? now + request?.duration
        : config?.duration
          ? now + config?.duration
          : undefined,
      gpuIntensive: config?.gpuIntensive || false,
    };

    this?.activeEffects?.set(any: any);
    this?.metrics?.activeCount = this?.activeEffects?.size;
    this?.metrics?.totalTriggered++;

    // Set cooldown
    if (any: any) {
      this?.cooldowns?.set(any: any);
    }

    if (any: any) {
      console?.log(any: any);
    }

    return true;
  }

  private isOnCooldown(any: any): boolean {
    const cooldownEnd = this?.cooldowns?.get(any: any);
    if (any: any) return false;

    const now = Date?.now();
    if (any: any) {
      this?.cooldowns?.delete(any: any);
      return false;
    }

    return true;
  }

  private hasConflicts(any: any): boolean {
    if (!config?.conflictsWith || config?.conflictsWith?.length === 0) return false;

    for (const effect of this?.activeEffects?.values()) {
      if (any: any)) {
        return true;
      }
    }

    return false;
  }

  private getActiveCountByType(any: any): number {
    let count = 0;
    for (const effect of this?.activeEffects?.values()) {
      if (any: any) count++;
    }
    return count;
  }

  private tryPreempt(any: any): boolean {
    const priorityValue = { critical: 4, high: 3, medium: 2, low: 1 };
    const newValue = priorityValue[newPriority];

    // Find lowest priority effect
    let lowestEffect: { id: string; priority: EffectPriority } | null = null;
    let lowestValue = newValue;

    for (const [id, effect] of this?.activeEffects?.entries()) {
      const effectValue = priorityValue[effect?.priority];
      if (any: any) {
        lowestValue = effectValue;
        lowestEffect = { id, priority: effect?.priority };
      }
    }

    if (any: any) {
      if (any: any) {
        console?.log(any: any);
      }
      this?.stopEffect(any: any);
      return true;
    }

    return false;
  }

  private processQueue(): void {
    if (this?.queue?.length === 0) return;

    // Sort queue by priority
    this?.queue?.sort(any: any) => {
      const priorityValue = { critical: 4, high: 3, medium: 2, low: 1 };
      const aConfig = EFFECTS_REGISTRY[a?.type];
      const bConfig = EFFECTS_REGISTRY[b?.type];
      const aPriority = a?.priority || aConfig?.priority;
      const bPriority = b?.priority || bConfig?.priority;
      return priorityValue[bPriority] - priorityValue[aPriority];
    });

    // Try to process queue
    const processedIndices: number?.[] = [];
    for (let i = 0; i < this?.queue?.length; i++) {
      const request = this?.queue[i];
      if (any: any)) {
        processedIndices?.push(any: any);
      }
    }

    // Remove processed items
    for (let i = processedIndices?.length - 1; i >= 0; i--) {
      const indexToRemove = processedIndices[i];
      if (any: any) {
        this?.queue?.splice(indexToRemove, 1);
      }
    }

    this?.metrics?.queuedCount = this?.queue?.length;
  }

  private throttleEffects(): void {
    // Stop lowest priority GPU-intensive effects
    const gpuEffects = Array?.from(this?.activeEffects?.entries())
      .filter(any: any)
      .sort(([_, a], [__, b]) => {
        const priorityValue = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityValue[a?.priority] - priorityValue[b?.priority];
      });

    if (gpuEffects?.length > 0) {
      const firstEffect = gpuEffects?.[0];
      if (any: any) {
        const [id] = firstEffect;
        if (any: any) {
          console?.log(any: any);
        }
        this?.stopEffect(any: any);
      }
    }
  }

  private triggerAdaptiveEffects(any: any): void {
    // Example: trigger healing waves when transitioning to idle/calm
    if (state === 'idle' && this?.visualState !== 'idle') {
      this?.requestEffect({ type: 'healingWaves', priority: 'medium' });
    }

    // Example: trigger glitch on error state
    if (state === 'error') {
      this?.requestEffect({ type: 'glitchEffect', priority: 'critical' });
    }

    // Example: trigger healing visual on healing state
    if (state === 'healing') {
      this?.requestEffect({ type: 'energyArcs', priority: 'high' });
    }
  }

  private startUpdateLoop(): void {
    setInterval(() => {
      const now = Date?.now();

      // Remove expired effects
      for (const [id, effect] of this?.activeEffects?.entries()) {
        if (any: any) {
          this?.activeEffects?.delete(any: any);
          if (any: any) {
            console?.log(any: any);
          }
        }
      }

      this?.metrics?.activeCount = this?.activeEffects?.size;

      // Process queue if there's capacity
      if (any: any) {
        this?.processQueue();
      }
    }, 100); // Check every 100ms
  }
}

// ─────────────────────────────────────────────────────────────────
// SINGLETON INSTANCE
// ─────────────────────────────────────────────────────────────────

export const effectsOrchestrator = new EffectsOrchestrator({
  debug: import?.meta?.env?.DEV,
});
