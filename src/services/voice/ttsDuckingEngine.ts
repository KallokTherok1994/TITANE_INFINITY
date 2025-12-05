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
  private releaseTimeoutHandle?: NodeJS.Timeout;

  constructor(config: DuckingConfig = {}) {
    this.config = {
      duckLevel: config.duckLevel ?? 0.3,
      transitionSpeed: config.transitionSpeed ?? 150,
      autoReleaseDelay: config.autoReleaseDelay ?? 1000,
    };

    console.log('[TTSDuckingEngine] 🎛️ Initialized:', this.config);
  }

  /**
   * Initialise le contexte audio pour ducking
   */
  async initialize(): Promise<void> {
    try {
      this.audioContext = new AudioContext();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = 1.0;
      this.gainNode.connect(this.audioContext.destination);

      console.log('[TTSDuckingEngine] ✅ Audio context ready');
    } catch (error) {
      console.error('[TTSDuckingEngine] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Enregistre un élément audio pour ducking
   */
  registerAudioElement(audio: HTMLAudioElement): void {
    this.audioElements.add(audio);
    this.originalVolume = audio.volume;

    // Connect to Web Audio API if available
    if (this.audioContext && this.gainNode && !audio.dataset.connected) {
      try {
        const source = this.audioContext.createMediaElementSource(audio);
        source.connect(this.gainNode);
        audio.dataset.connected = 'true';
      } catch (error) {
        // Element might already be connected
        console.warn('[TTSDuckingEngine] Could not connect audio element:', error);
      }
    }

    console.log('[TTSDuckingEngine] 🔊 Audio element registered');
  }

  /**
   * Désenregistre un élément audio
   */
  unregisterAudioElement(audio: HTMLAudioElement): void {
    this.audioElements.delete(audio);
    delete audio.dataset.connected;
  }

  /**
   * Applique le ducking (réduction de volume)
   * @param level - Niveau de ducking (0-1), utilise config.duckLevel si non spécifié
   */
  async applyDucking(level?: number): Promise<void> {
    const targetLevel = level ?? this.config.duckLevel;

    if (this.state === 'stopped') {
      console.warn('[TTSDuckingEngine] Cannot duck: TTS already stopped');
      return;
    }

    this.state = 'ducked';
    this.currentVolume = targetLevel;

    console.log(`[TTSDuckingEngine] 🔉 Ducking to ${(targetLevel * 100).toFixed(0)}%`);

    // Clear any pending release
    if (this.releaseTimeoutHandle) {
      clearTimeout(this.releaseTimeoutHandle);
    }

    // Apply ducking via Web Audio API
    if (this.gainNode) {
      const currentTime = this.audioContext!.currentTime;
      this.gainNode.gain.cancelScheduledValues(currentTime);
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, currentTime);
      this.gainNode.gain.linearRampToValueAtTime(
        targetLevel,
        currentTime + this.config.transitionSpeed / 1000
      );
    }

    // Fallback: direct volume control
    this.audioElements.forEach(audio => {
      audio.volume = targetLevel * this.originalVolume;
    });

    // Auto-release après délai
    this.releaseTimeoutHandle = setTimeout(() => {
      this.releaseDucking();
    }, this.config.autoReleaseDelay);
  }

  /**
   * Relâche le ducking (restaure volume normal)
   */
  async releaseDucking(): Promise<void> {
    if (this.state !== 'ducked') {
      return;
    }

    this.state = 'normal';
    this.currentVolume = this.originalVolume;

    console.log('[TTSDuckingEngine] 🔊 Releasing ducking');

    // Clear release timeout
    if (this.releaseTimeoutHandle) {
      clearTimeout(this.releaseTimeoutHandle);
      this.releaseTimeoutHandle = undefined;
    }

    // Restore via Web Audio API
    if (this.gainNode) {
      const currentTime = this.audioContext!.currentTime;
      this.gainNode.gain.cancelScheduledValues(currentTime);
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, currentTime);
      this.gainNode.gain.linearRampToValueAtTime(
        1.0,
        currentTime + this.config.transitionSpeed / 1000
      );
    }

    // Fallback: direct volume control
    this.audioElements.forEach(audio => {
      audio.volume = this.originalVolume;
    });
  }

  /**
   * Stoppe immédiatement le TTS
   */
  async stopImmediately(): Promise<void> {
    if (this.state === 'stopped') {
      return;
    }

    this.state = 'stopped';
    console.log('[TTSDuckingEngine] ⏹️ Stopping TTS immediately');

    // Clear any pending release
    if (this.releaseTimeoutHandle) {
      clearTimeout(this.releaseTimeoutHandle);
      this.releaseTimeoutHandle = undefined;
    }

    // Stop via Web Audio API
    if (this.gainNode) {
      this.gainNode.gain.cancelScheduledValues(this.audioContext!.currentTime);
      this.gainNode.gain.value = 0;
    }

    // Stop all registered audio elements
    this.audioElements.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });

    // Clear registered elements
    this.audioElements.clear();
  }

  /**
   * Reset l'état après arrêt
   */
  reset(): void {
    this.state = 'normal';
    this.currentVolume = this.originalVolume;

    if (this.releaseTimeoutHandle) {
      clearTimeout(this.releaseTimeoutHandle);
      this.releaseTimeoutHandle = undefined;
    }

    if (this.gainNode) {
      this.gainNode.gain.value = 1.0;
    }

    console.log('[TTSDuckingEngine] 🔄 Reset to normal');
  }

  /**
   * Obtient l'état actuel
   */
  getState(): DuckingState {
    return this.state;
  }

  /**
   * Obtient le volume actuel
   */
  getCurrentVolume(): number {
    return this.currentVolume;
  }

  /**
   * Vérifie si ducking actif
   */
  isDucked(): boolean {
    return this.state === 'ducked';
  }

  /**
   * Vérifie si TTS stoppé
   */
  isStopped(): boolean {
    return this.state === 'stopped';
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.releaseTimeoutHandle) {
      clearTimeout(this.releaseTimeoutHandle);
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.gainNode = null;
    this.audioElements.clear();

    console.log('[TTSDuckingEngine] 🔌 Destroyed');
  }
}

/**
 * Singleton instance
 */
export const ttsDuckingEngine = new TTSDuckingEngine();
