/**
 * TITANE∞ v20Ω — Lifecycle Manager
 * Gestion du cycle de vie de l'application
 */

import type { LifecyclePhase, LifecycleHook } from '../types';
import { getEventBus } from '../bus/EventBus';

/**
 * Gestionnaire de cycle de vie
 */
export class LifecycleManager {
  private phase: LifecyclePhase = 'pre-init';
  private hooks: Map<LifecyclePhase, Set<LifecycleHook>> = new Map();
  private errorHandlers: Set<(error: Error, phase: LifecyclePhase) => void> = new Set();
  private eventBus = getEventBus();
  private startTime = 0;

  /**
   * Enregistre un hook pour une phase
   */
  on(phase: LifecyclePhase, hook: LifecycleHook): () => void {
    if (!this.hooks.has(phase)) {
      this.hooks.set(phase, new Set());
    }

    const phaseHooks = this.hooks.get(phase);
    if (phaseHooks) {
      phaseHooks.add(hook);
    }

    return () => {
      this.hooks.get(phase)?.delete(hook);
    };
  }

  /**
   * Enregistre un gestionnaire d'erreur
   */
  onError(handler: (error: Error, phase: LifecyclePhase) => void): () => void {
    this.errorHandlers.add(handler);
    return () => this.errorHandlers.delete(handler);
  }

  /**
   * Exécute une phase
   */
  private async executePhase(phase: LifecyclePhase): Promise<void> {
    const previousPhase = this.phase;
    this.phase = phase;

    this.eventBus.emit('lifecycle:phase', { phase, previousPhase }, 'LifecycleManager');

    const hooks = this.hooks.get(phase);
    if (!hooks || hooks.size === 0) return;

    const startTime = performance.now();

    for (const hook of hooks) {
      try {
        await hook();
      } catch (error) {
        console.error(`[Lifecycle] Error in ${phase} hook:`, error);
        this.handleError(error as Error, phase);
      }
    }

    const duration = performance.now() - startTime;
    this.eventBus.emit('lifecycle:phase_complete', { phase, duration }, 'LifecycleManager');
  }

  /**
   * Gère une erreur
   */
  private handleError(error: Error, phase: LifecyclePhase): void {
    for (const handler of this.errorHandlers) {
      try {
        handler(error, phase);
      } catch (handlerError) {
        console.error('[Lifecycle] Error handler failed:', handlerError);
      }
    }
  }

  /**
   * Initialise l'application
   */
  async init(): Promise<void> {
    this.startTime = Date.now();

    await this.executePhase('pre-init');
    await this.executePhase('init');
    await this.executePhase('post-init');

    this.eventBus.emit('lifecycle:initialized', {
      duration: Date.now() - this.startTime,
    }, 'LifecycleManager');
  }

  /**
   * Démarre l'application
   */
  async start(): Promise<void> {
    if (this.phase !== 'post-init' && this.phase !== 'post-stop') {
      throw new Error(`Cannot start from phase: ${this.phase}`);
    }

    await this.executePhase('pre-start');
    await this.executePhase('start');
    await this.executePhase('post-start');

    this.eventBus.emit('lifecycle:started', {
      uptime: this.getUptime(),
    }, 'LifecycleManager');
  }

  /**
   * Arrête l'application
   */
  async stop(): Promise<void> {
    if (this.phase !== 'post-start') {
      console.warn(`[Lifecycle] Stopping from unexpected phase: ${this.phase}`);
    }

    await this.executePhase('pre-stop');
    await this.executePhase('stop');
    await this.executePhase('post-stop');

    this.eventBus.emit('lifecycle:stopped', {
      uptime: this.getUptime(),
    }, 'LifecycleManager');
  }

  /**
   * Redémarre l'application
   */
  async restart(): Promise<void> {
    await this.stop();
    await this.start();

    this.eventBus.emit('lifecycle:restarted', null, 'LifecycleManager');
  }

  /**
   * Retourne la phase actuelle
   */
  getPhase(): LifecyclePhase {
    return this.phase;
  }

  /**
   * Vérifie si l'application est initialisée
   */
  isInitialized(): boolean {
    return this.phase !== 'pre-init' && this.phase !== 'init';
  }

  /**
   * Vérifie si l'application est démarrée
   */
  isStarted(): boolean {
    return this.phase === 'post-start';
  }

  /**
   * Vérifie si l'application est arrêtée
   */
  isStopped(): boolean {
    return this.phase === 'post-stop';
  }

  /**
   * Retourne le temps de fonctionnement
   */
  getUptime(): number {
    return this.startTime > 0 ? Date.now() - this.startTime : 0;
  }

  /**
   * Retourne les statistiques
   */
  getStats(): {
    phase: LifecyclePhase;
    uptime: number;
    hookCounts: Record<LifecyclePhase, number>;
  } {
    const hookCounts: Record<LifecyclePhase, number> = {} as Record<LifecyclePhase, number>;

    for (const [phase, hooks] of this.hooks) {
      hookCounts[phase] = hooks.size;
    }

    return {
      phase: this.phase,
      uptime: this.getUptime(),
      hookCounts,
    };
  }

  /**
   * Efface tous les hooks
   */
  clear(): void {
    this.hooks.clear();
    this.errorHandlers.clear();
  }
}

// Instance singleton
let instance: LifecycleManager | null = null;

export function getLifecycleManager(): LifecycleManager {
  if (!instance) {
    instance = new LifecycleManager();
  }
  return instance;
}

export default LifecycleManager;
