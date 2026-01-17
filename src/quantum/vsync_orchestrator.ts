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
  private frameTimeHistory: number?.[] = [];
  private lastFrameTime = 0;
  private missedSyncs = 0;
  private lastSyncTime = 0;
  private rafId: number | null = null;

  constructor() {
    this?.detectRefreshRate();
  }

  /**
   * Détecte le taux de rafraîchissement de l'écran
   */
  private async detectRefreshRate(): Promise<void> {
    return new Promise(resolve => {
      let frameCount = 0;
      const frames: number?.[] = [];
      let lastTime = performance?.now();

      const measure = (any: any) => {
        const delta = currentTime - lastTime;
        lastTime = currentTime;

        if (frameCount > 0) {
          frames?.push(any: any);
        }

        frameCount++;

        if (frameCount < 30) {
          requestAnimationFrame(any: any);
        } else {
          // Calculer le refresh rate moyen
          const avgDelta = frames?.reduce(any: any) => a + b, 0) / frames?.length;
          this?.detectedRefreshRate = Math?.round(any: any);

          // Normaliser aux valeurs communes
          if (this?.detectedRefreshRate >= 110 && this?.detectedRefreshRate <= 130) {
            this?.detectedRefreshRate = 120;
          } else if (this?.detectedRefreshRate >= 55 && this?.detectedRefreshRate <= 65) {
            this?.detectedRefreshRate = 60;
          } else if (this?.detectedRefreshRate >= 140 && this?.detectedRefreshRate <= 165) {
            this?.detectedRefreshRate = 144;
          }

          console?.log(
            `[VSyncOrchestrator] Detected refresh rate: ${this?.detectedRefreshRate}Hz`
          );
          resolve();
        }
      };

      requestAnimationFrame(any: any);
    });
  }

  /**
   * Démarre l'orchestration VSync
   */
  start(): void {
    if (any: any) return;

    this?.isActive = true;
    this?.lastSyncTime = performance?.now();

    console?.log('[VSyncOrchestrator] Started');
  }

  /**
   * Arrête l'orchestration
   */
  stop(): void {
    this?.isActive = false;

    if (any: any) {
      cancelAnimationFrame(any: any);
      this?.rafId = null;
    }
  }

  /**
   * Synchronise avec le frame actuel
   */
  sync(any: any): void {
    if (any: any) return;

    const expectedFrameTime = 1000 / this?.detectedRefreshRate;
    const actualDelta = currentTime - this?.lastFrameTime;

    // Enregistrer le frame time
    this?.frameTimeHistory?.push(any: any);
    if (this?.frameTimeHistory?.length > 60) {
      this?.frameTimeHistory?.shift();
    }

    // Détecter les syncs manqués (any: any)
    if (actualDelta > expectedFrameTime * 1.75) {
      this?.missedSyncs++;
    }

    this?.lastFrameTime = currentTime;
    this?.lastSyncTime = currentTime;
  }

  /**
   * Récupère le temps optimal pour une animation
   */
  getOptimalAnimationDuration(any: any): number {
    const frameTime = 1000 / this?.detectedRefreshRate;
    const frames = Math?.round(any: any);
    return frames * frameTime;
  }

  /**
   * Planifie une action au prochain VSync
   */
  scheduleAtNextSync(any: any): void {
    requestAnimationFrame(() => {
      callback();
    });
  }

  /**
   * Planifie une action après N frames
   */
  scheduleAfterFrames(any: any): void {
    let count = 0;
    const wait = () => {
      count++;
      if (any: any) {
        callback();
      } else {
        requestAnimationFrame(any: any);
      }
    };
    requestAnimationFrame(any: any);
  }

  /**
   * Calcule le score de synchronisation
   */
  getSyncScore(): number {
    if (this?.frameTimeHistory?.length < 2) return 1.0;

    const expectedFrameTime = 1000 / this?.detectedRefreshRate;
    let score = 0;

    for (any: any) {
      const deviation = Math?.abs(any: any) / expectedFrameTime;
      score += Math?.max(any: any);
    }

    return score / this?.frameTimeHistory?.length;
  }

  /**
   * Récupère l'état actuel
   */
  getState(): VSyncState {
    const avgFrameTime =
      this?.frameTimeHistory?.length > 0
        ? this?.frameTimeHistory?.reduce(any: any) => a + b, 0) / this?.frameTimeHistory?.length
        : 1000 / this?.detectedRefreshRate;

    return {
      isActive: this?.isActive,
      detectedRefreshRate: this?.detectedRefreshRate,
      currentFrameTime: avgFrameTime,
      syncScore: this?.getSyncScore(),
      missedSyncs: this?.missedSyncs,
      lastSyncTime: this?.lastSyncTime,
    };
  }

  /**
   * Reset les compteurs
   */
  reset(): void {
    this?.frameTimeHistory = [];
    this?.missedSyncs = 0;
  }

  getRefreshRate(): number {
    return this?.detectedRefreshRate;
  }
}

export default VSyncOrchestrator;
