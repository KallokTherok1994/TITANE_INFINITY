/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ — FRAME HARMONIZER
 * Fusion de tous les timings visuels
 *
 * © 2025 Kevin Thibault — Licence MIT
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface FrameMetrics {
  currentFPS: number;
  targetFPS: number;
  frameTime: number;
  avgFrameTime: number;
  minFrameTime: number;
  maxFrameTime: number;
  droppedFrames: number;
  scheduledRenders: number;
  executedRenders: number;
  harmonizationScore: number;
}

interface ScheduledRender {
  id: string;
  fn: () => void;
  priority: number;
  scheduledAt: number;
}

export class FrameHarmonizer {
  private targetHz: number;
  private targetFrameTime: number;
  private frameHistory: number[] = [];
  private maxHistorySize = 60;
  private scheduledRenders: ScheduledRender[] = [];
  private executedCount = 0;
  private droppedCount = 0;
  private lastHarmonizeTime = 0;
  private isHarmonizing = false;

  constructor(targetHz: number = 120) {
    this.targetHz = targetHz;
    this.targetFrameTime = 1000 / targetHz;
  }

  /**
   * Harmonise le frame timing
   */
  harmonize(deltaTime: number): void {
    this.isHarmonizing = true;
    const now = performance.now();

    // Enregistrer le frame time
    this.frameHistory.push(deltaTime);
    if (this.frameHistory.length > this.maxHistorySize) {
      this.frameHistory.shift();
    }

    // Détecter les frames dropped
    if (deltaTime > this.targetFrameTime * 1.5) {
      this.droppedCount++;
    }

    // Exécuter les rendus schedulés de manière harmonisée
    this.executeScheduledRenders(now);

    this.lastHarmonizeTime = now;
    this.isHarmonizing = false;
  }

  /**
   * Schedule un rendu pour le prochain frame harmonisé
   */
  scheduleRender(fn: () => void, priority: number = 5): string {
    const id = `render_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.scheduledRenders.push({
      id,
      fn,
      priority,
      scheduledAt: performance.now(),
    });

    // Trier par priorité (haute priorité = exécution en premier)
    this.scheduledRenders.sort((a, b) => b.priority - a.priority);

    return id;
  }

  /**
   * Annule un rendu schedulé
   */
  cancelRender(id: string): boolean {
    const index = this.scheduledRenders.findIndex(r => r.id === id);
    if (index !== -1) {
      this.scheduledRenders.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Exécute les rendus schedulés
   */
  private executeScheduledRenders(now: number): void {
    const maxExecutionTime = this.targetFrameTime * 0.8; // 80% du frame budget
    const startTime = now;
    const toExecute = [...this.scheduledRenders];
    this.scheduledRenders = [];

    for (const render of toExecute) {
      // Vérifier le budget temps
      if (performance.now() - startTime > maxExecutionTime) {
        // Reporter les rendus restants
        this.scheduledRenders.push(render);
        continue;
      }

      try {
        render.fn();
        this.executedCount++;
      } catch (error) {
        console.error('[FrameHarmonizer] Render error:', error);
      }
    }
  }

  /**
   * Synchronise une animation avec le rythme global
   */
  syncAnimation(duration: number): number {
    // Arrondir au multiple du frame time le plus proche
    const frames = Math.round(duration / this.targetFrameTime);
    return frames * this.targetFrameTime;
  }

  /**
   * Calcule le délai optimal pour une transition
   */
  getOptimalDelay(requestedDelay: number): number {
    // Aligner sur les boundaries de frame
    return Math.ceil(requestedDelay / this.targetFrameTime) * this.targetFrameTime;
  }

  /**
   * Récupère les métriques
   */
  getMetrics(): FrameMetrics {
    const times = this.frameHistory;
    const avgFrameTime = times.length > 0
      ? times.reduce((a, b) => a + b, 0) / times.length
      : this.targetFrameTime;

    return {
      currentFPS: times.length > 0 ? 1000 / times[times.length - 1] : this.targetHz,
      targetFPS: this.targetHz,
      frameTime: times.length > 0 ? times[times.length - 1] : this.targetFrameTime,
      avgFrameTime,
      minFrameTime: times.length > 0 ? Math.min(...times) : this.targetFrameTime,
      maxFrameTime: times.length > 0 ? Math.max(...times) : this.targetFrameTime,
      droppedFrames: this.droppedCount,
      scheduledRenders: this.scheduledRenders.length,
      executedRenders: this.executedCount,
      harmonizationScore: this.calculateHarmonizationScore(),
    };
  }

  private calculateHarmonizationScore(): number {
    if (this.frameHistory.length < 2) return 1.0;

    // Calculer la variance des frame times
    const avg = this.frameHistory.reduce((a, b) => a + b, 0) / this.frameHistory.length;
    const variance = this.frameHistory.reduce((sum, time) =>
      sum + Math.pow(time - avg, 2), 0) / this.frameHistory.length;
    const stdDev = Math.sqrt(variance);

    // Score basé sur la stabilité (faible variance = bon score)
    const normalizedDev = stdDev / this.targetFrameTime;
    return Math.max(0, 1 - normalizedDev);
  }

  /**
   * Reset les compteurs
   */
  reset(): void {
    this.frameHistory = [];
    this.scheduledRenders = [];
    this.executedCount = 0;
    this.droppedCount = 0;
  }
}

export default FrameHarmonizer;
