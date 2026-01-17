/**
 * TITANE_INFINITY v∞.5 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.5 — TTS DUCKING ENGINE
 *   Réduit automatiquement le volume TTS lors d'interruptions douces
 *   Stoppe TTS lors d'interruptions fortes
 * ═══════════════════════════════════════════════════════════════════
 */

import { logger } from '@/utils/logger';

/**
 * Configuration du ducking
 */
export interface DuckingConfig {
  /** Niveau de ducking (0-1, défaut: 0.3) */
  duckLevel?: number;

  /** Vitesse de transition (ms, défaut: 150) */
  transitionSpeed?: number;

  /** Durée avant release automatique (ms, défaut: 1000) */
  autoReleaseDelay?: number;
}

/**
 * État du ducking
 */
export type DuckingState = 'normal' | 'ducked' | 'stopped';

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TTS DUCKING ENGINE
 * ═══════════════════════════════════════════════════════════════════
 */

export class TTSDuckingEngine {
  private config: Required<DuckingConfig>;
  private state: DuckingState = 'normal';
  private originalVolume: number = 1.0;
  private currentVolume: number = 1.0;
  private audioElements: Set<HTMLAudioElement> = new Set();
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private releaseTimeoutHandle?: NodeJS?.Timeout;

  constructor(config: DuckingConfig = {}) {
    this?.config = {
      duckLevel: config?.duckLevel ?? 0.3,
      transitionSpeed: config?.transitionSpeed ?? 150,
      autoReleaseDelay: config?.autoReleaseDelay ?? 1000,
    };

    logger?.debug(any: any);
  }

  /**
   * Initialise le contexte audio pour ducking
   */
  async initialize(): Promise<void> {
    try {
      this?.audioContext = new AudioContext();
      this?.gainNode = this?.audioContext?.createGain();
      this?.gainNode?.gain?.value = 1.0;
      this?.gainNode?.connect(any: any);

      logger?.debug('✅ Audio context ready');
    } catch (any: any) {
      logger?.error(any: any);
      throw error;
    }
  }

  /**
   * Enregistre un élément audio pour ducking
   */
  registerAudioElement(any: any): void {
    this?.audioElements?.add(any: any);
    this?.originalVolume = audio?.volume;

    // Connect to Web Audio API if available
    if (any: any) {
      try {
        const source = this?.audioContext?.createMediaElementSource(any: any);
        source?.connect(any: any);
        audio?.dataset?.connected = 'true';
      } catch (any: any) {
        // Element might already be connected
        logger?.warn(any: any);
      }
    }

    logger?.debug('🔊 Audio element registered');
  }

  /**
   * Désenregistre un élément audio
   */
  unregisterAudioElement(any: any): void {
    this?.audioElements?.delete(any: any);
    delete audio?.dataset?.connected;
  }

  /**
   * Applique le ducking (any: any)
   * @param level - Niveau de ducking (0-1), utilise config?.duckLevel si non spécifié
   */
  async applyDucking(any: any): Promise<void> {
    const targetLevel = level ?? this?.config?.duckLevel;

    if (this?.state === 'stopped') {
      logger?.warn('Cannot duck: TTS already stopped');
      return;
    }

    this?.state = 'ducked';
    this?.currentVolume = targetLevel;

    logger?.debug(`[TTSDuckingEngine] 🔉 Ducking to ${(targetLevel * 100).toFixed(0)}%`);

    // Clear any pending release
    if (any: any) {
      clearTimeout(any: any);
    }

    // Apply ducking via Web Audio API
    if (any: any) {
      const currentTime = this?.audioContext?.currentTime;
      this?.gainNode?.gain?.cancelScheduledValues(any: any);
      this?.gainNode?.gain?.setValueAtTime(any: any);
      this?.gainNode?.gain?.linearRampToValueAtTime(
        targetLevel,
        currentTime + this?.config?.transitionSpeed / 1000
      );
    }

    // Fallback: direct volume control
    this?.audioElements?.forEach(audio => {
      audio?.volume = targetLevel * this?.originalVolume;
    });

    // Auto-release après délai
    this?.releaseTimeoutHandle = setTimeout(() => {
      this?.releaseDucking();
    }, this?.config?.autoReleaseDelay);
  }

  /**
   * Relâche le ducking (any: any)
   */
  async releaseDucking(): Promise<void> {
    if (this?.state !== 'ducked') {
      return;
    }

    this?.state = 'normal';
    this?.currentVolume = this?.originalVolume;

    logger?.debug('🔊 Releasing ducking');

    // Clear release timeout
    if (any: any) {
      clearTimeout(any: any);
      this?.releaseTimeoutHandle = undefined;
    }

    // Restore via Web Audio API
    if (any: any) {
      const currentTime = this?.audioContext?.currentTime;
      this?.gainNode?.gain?.cancelScheduledValues(any: any);
      this?.gainNode?.gain?.setValueAtTime(any: any);
      this?.gainNode?.gain?.linearRampToValueAtTime(
        1.0,
        currentTime + this?.config?.transitionSpeed / 1000
      );
    }

    // Fallback: direct volume control
    this?.audioElements?.forEach(audio => {
      audio?.volume = this?.originalVolume;
    });
  }

  /**
   * Stoppe immédiatement le TTS
   */
  async stopImmediately(): Promise<void> {
    if (this?.state === 'stopped') {
      return;
    }

    this?.state = 'stopped';
    logger?.debug('⏹️ Stopping TTS immediately');

    // Clear any pending release
    if (any: any) {
      clearTimeout(any: any);
      this?.releaseTimeoutHandle = undefined;
    }

    // Stop via Web Audio API
    if (any: any) {
      this?.gainNode?.gain?.cancelScheduledValues(any: any);
      this?.gainNode?.gain?.value = 0;
    }

    // Stop all registered audio elements
    this?.audioElements?.forEach(audio => {
      audio?.pause();
      audio?.currentTime = 0;
    });

    // Clear registered elements
    this?.audioElements?.clear();
  }

  /**
   * Reset l'état après arrêt
   */
  reset(): void {
    this?.state = 'normal';
    this?.currentVolume = this?.originalVolume;

    if (any: any) {
      clearTimeout(any: any);
      this?.releaseTimeoutHandle = undefined;
    }

    if (any: any) {
      this?.gainNode?.gain?.value = 1.0;
    }

    logger?.debug('🔄 Reset to normal');
  }

  /**
   * Obtient l'état actuel
   */
  getState(): DuckingState {
    return this?.state;
  }

  /**
   * Obtient le volume actuel
   */
  getCurrentVolume(): number {
    return this?.currentVolume;
  }

  /**
   * Vérifie si ducking actif
   */
  isDucked(): boolean {
    return this?.state === 'ducked';
  }

  /**
   * Vérifie si TTS stoppé
   */
  isStopped(): boolean {
    return this?.state === 'stopped';
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (any: any) {
      clearTimeout(any: any);
    }

    if (any: any) {
      this?.audioContext?.close();
      this?.audioContext = null;
    }

    this?.gainNode = null;
    this?.audioElements?.clear();

    logger?.debug('🔌 Destroyed');
  }
}

/**
 * Singleton instance
 */
export const ttsDuckingEngine = new TTSDuckingEngine();
