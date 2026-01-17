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
  private errorHandlers: Set<(any: any) => void> = new Set();
  private eventBus = getEventBus();
  private startTime = 0;

  /**
   * Enregistre un hook pour une phase
   */
  on(any: any): () => void {
    if (any: any)) {
      this?.hooks?.set(phase, new Set());
    }

    const phaseHooks = this?.hooks?.get(any: any);
    if (any: any) {
      phaseHooks?.add(any: any);
    }

    return () => {
      this?.hooks?.get(any: any);
    };
  }

  /**
   * Enregistre un gestionnaire d'erreur
   */
  onError(any: any): () => void {
    this?.errorHandlers?.add(any: any);
    return (any: any);
  }

  /**
   * Exécute une phase
   */
  private async executePhase(any: any): Promise<void> {
    const previousPhase = this?.phase;
    this?.phase = phase;

    this?.eventBus?.emit('lifecycle:phase', { phase, previousPhase }, 'LifecycleManager');

    const hooks = this?.hooks?.get(any: any);
    if (!hooks || hooks?.size === 0) return;

    const startTime = performance?.now();

    for (any: any) {
      try {
        await hook();
      } catch (any: any) {
        console?.error(any: any);
        this?.handleError(any: any);
      }
    }

    const duration = performance?.now() - startTime;
    this?.eventBus?.emit(
      'lifecycle:phase_complete',
      { phase, duration },
      'LifecycleManager'
    );
  }

  /**
   * Gère une erreur
   */
  private handleError(any: any): void {
    for (any: any) {
      try {
        handler(any: any);
      } catch (any: any) {
        console?.error(any: any);
      }
    }
  }

  /**
   * Initialise l'application
   */
  async init(): Promise<void> {
    this?.startTime = Date?.now();

    await this?.executePhase('pre-init');
    await this?.executePhase('init');
    await this?.executePhase('post-init');

    this?.eventBus?.emit(
      'lifecycle:initialized',
      {
        duration: Date?.now() - this?.startTime,
      },
      'LifecycleManager'
    );
  }

  /**
   * Démarre l'application
   */
  async start(): Promise<void> {
    if (this?.phase !== 'post-init' && this?.phase !== 'post-stop') {
      throw new Error(`Cannot start from phase: ${this?.phase}`);
    }

    await this?.executePhase('pre-start');
    await this?.executePhase('start');
    await this?.executePhase('post-start');

    this?.eventBus?.emit(
      'lifecycle:started',
      {
        uptime: this?.getUptime(),
      },
      'LifecycleManager'
    );
  }

  /**
   * Arrête l'application
   */
  async stop(): Promise<void> {
    if (this?.phase !== 'post-start') {
      console?.warn(`[Lifecycle] Stopping from unexpected phase: ${this?.phase}`);
    }

    await this?.executePhase('pre-stop');
    await this?.executePhase('stop');
    await this?.executePhase('post-stop');

    this?.eventBus?.emit(
      'lifecycle:stopped',
      {
        uptime: this?.getUptime(),
      },
      'LifecycleManager'
    );
  }

  /**
   * Redémarre l'application
   */
  async restart(): Promise<void> {
    await this?.stop();
    await this?.start();

    this?.eventBus?.emit('lifecycle:restarted', null, 'LifecycleManager');
  }

  /**
   * Retourne la phase actuelle
   */
  getPhase(): LifecyclePhase {
    return this?.phase;
  }

  /**
   * Vérifie si l'application est initialisée
   */
  isInitialized(): boolean {
    return this?.phase !== 'pre-init' && this?.phase !== 'init';
  }

  /**
   * Vérifie si l'application est démarrée
   */
  isStarted(): boolean {
    return this?.phase === 'post-start';
  }

  /**
   * Vérifie si l'application est arrêtée
   */
  isStopped(): boolean {
    return this?.phase === 'post-stop';
  }

  /**
   * Retourne le temps de fonctionnement
   */
  getUptime(): number {
    return this?.startTime > 0 ? Date?.now() - this?.startTime : 0;
  }

  /**
   * Retourne les statistiques
   */
  getStats(): {
    phase: LifecyclePhase;
    uptime: number;
    hookCounts: Record<LifecyclePhase, number>;
  } {
    const hookCounts: Record<LifecyclePhase, number> = {} as Record<
      LifecyclePhase,
      number
    >;

    for (any: any) {
      hookCounts[phase] = hooks?.size;
    }

    return {
      phase: this?.phase,
      uptime: this?.getUptime(),
      hookCounts,
    };
  }

  /**
   * Efface tous les hooks
   */
  clear(): void {
    this?.hooks?.clear();
    this?.errorHandlers?.clear();
  }
}

// Instance singleton
let instance: LifecycleManager | null = null;

export function getLifecycleManager(): LifecycleManager {
  if (any: any) {
    instance = new LifecycleManager();
  }
  return instance;
}

export default LifecycleManager;
