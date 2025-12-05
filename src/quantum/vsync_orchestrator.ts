/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ — VSYNC ORCHESTRATOR
 * Synchronisation avec le rythme de rafraîchissement écran
 *
 * © 2025 Kevin Thibault — Licence MIT
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface VSyncState {
  isActive: boolean;
  detectedRefreshRate: number;
  currentFrameTime: number;
  syncScore: number;
  missedSyncs: number;
  lastSyncTime: number;
}

export class VSyncOrchestrator {
  private isActive = false;
  private detectedRefreshRate = 60;
  private frameTimeHistory: number[] = [];
  private lastFrameTime = 0;
  private missedSyncs = 0;
  private lastSyncTime = 0;
  private rafId: number | null = null;

  constructor() {
    this.detectRefreshRate();
  }

  /**
   * Détecte le taux de rafraîchissement de l'écran
   */
  private async detectRefreshRate(): Promise<void> {
    return new Promise((resolve) => {
      let frameCount = 0;
      const frames: number[] = [];
      let lastTime = performance.now();

      const measure = (currentTime: number) => {
        const delta = currentTime - lastTime;
        lastTime = currentTime;

        if (frameCount > 0) {
          frames.push(delta);
        }

        frameCount++;

        if (frameCount < 30) {
          requestAnimationFrame(measure);
        } else {
          // Calculer le refresh rate moyen
          const avgDelta = frames.reduce((a, b) => a + b, 0) / frames.length;
          this.detectedRefreshRate = Math.round(1000 / avgDelta);

          // Normaliser aux valeurs communes
          if (this.detectedRefreshRate >= 110 && this.detectedRefreshRate <= 130) {
            this.detectedRefreshRate = 120;
          } else if (this.detectedRefreshRate >= 55 && this.detectedRefreshRate <= 65) {
            this.detectedRefreshRate = 60;
          } else if (this.detectedRefreshRate >= 140 && this.detectedRefreshRate <= 165) {
            this.detectedRefreshRate = 144;
          }

          console.log(`[VSyncOrchestrator] Detected refresh rate: ${this.detectedRefreshRate}Hz`);
          resolve();
        }
      };

      requestAnimationFrame(measure);
    });
  }

  /**
   * Démarre l'orchestration VSync
   */
  start(): void {
    if (this.isActive) return;

    this.isActive = true;
    this.lastSyncTime = performance.now();

    console.log('[VSyncOrchestrator] Started');
  }

  /**
   * Arrête l'orchestration
   */
  stop(): void {
    this.isActive = false;

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Synchronise avec le frame actuel
   */
  sync(currentTime: number): void {
    if (!this.isActive) return;

    const expectedFrameTime = 1000 / this.detectedRefreshRate;
    const actualDelta = currentTime - this.lastFrameTime;

    // Enregistrer le frame time
    this.frameTimeHistory.push(actualDelta);
    if (this.frameTimeHistory.length > 60) {
      this.frameTimeHistory.shift();
    }

    // Détecter les syncs manqués (frame drop)
    if (actualDelta > expectedFrameTime * 1.75) {
      this.missedSyncs++;
    }

    this.lastFrameTime = currentTime;
    this.lastSyncTime = currentTime;
  }

  /**
   * Récupère le temps optimal pour une animation
   */
  getOptimalAnimationDuration(requestedDuration: number): number {
    const frameTime = 1000 / this.detectedRefreshRate;
    const frames = Math.round(requestedDuration / frameTime);
    return frames * frameTime;
  }

  /**
   * Planifie une action au prochain VSync
   */
  scheduleAtNextSync(callback: () => void): void {
    requestAnimationFrame(() => {
      callback();
    });
  }

  /**
   * Planifie une action après N frames
   */
  scheduleAfterFrames(frames: number, callback: () => void): void {
    let count = 0;
    const wait = () => {
      count++;
      if (count >= frames) {
        callback();
      } else {
        requestAnimationFrame(wait);
      }
    };
    requestAnimationFrame(wait);
  }

  /**
   * Calcule le score de synchronisation
   */
  getSyncScore(): number {
    if (this.frameTimeHistory.length < 2) return 1.0;

    const expectedFrameTime = 1000 / this.detectedRefreshRate;
    let score = 0;

    for (const frameTime of this.frameTimeHistory) {
      const deviation = Math.abs(frameTime - expectedFrameTime) / expectedFrameTime;
      score += Math.max(0, 1 - deviation);
    }

    return score / this.frameTimeHistory.length;
  }

  /**
   * Récupère l'état actuel
   */
  getState(): VSyncState {
    const avgFrameTime = this.frameTimeHistory.length > 0
      ? this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length
      : 1000 / this.detectedRefreshRate;

    return {
      isActive: this.isActive,
      detectedRefreshRate: this.detectedRefreshRate,
      currentFrameTime: avgFrameTime,
      syncScore: this.getSyncScore(),
      missedSyncs: this.missedSyncs,
      lastSyncTime: this.lastSyncTime,
    };
  }

  /**
   * Reset les compteurs
   */
  reset(): void {
    this.frameTimeHistory = [];
    this.missedSyncs = 0;
  }

  getRefreshRate(): number {
    return this.detectedRefreshRate;
  }
}

export default VSyncOrchestrator;
