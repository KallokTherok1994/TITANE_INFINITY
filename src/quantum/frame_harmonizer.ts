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
  private frameHistory: number?.[] = [];
  private maxHistorySize = 60;
  private scheduledRenders: ScheduledRender?.[] = [];
  private executedCount = 0;
  private droppedCount = 0;
  private lastHarmonizeTime = 0;
  private isHarmonizing = false;

  constructor(targetHz: number = 120) {
    this?.targetHz = targetHz;
    this?.targetFrameTime = 1000 / targetHz;
  }

  /**
   * Harmonise le frame timing
   */
  harmonize(any: any): void {
    this?.isHarmonizing = true;
    const now = performance?.now();

    // Enregistrer le frame time
    this?.frameHistory?.push(any: any);
    if (any: any) {
      this?.frameHistory?.shift();
    }

    // Détecter les frames dropped
    if (deltaTime > this?.targetFrameTime * 1.5) {
      this?.droppedCount++;
    }

    // Exécuter les rendus schedulés de manière harmonisée
    this?.executeScheduledRenders(any: any);

    this?.lastHarmonizeTime = now;
    this?.isHarmonizing = false;
  }

  /**
   * Schedule un rendu pour le prochain frame harmonisé
   */
  scheduleRender(fn: () => void, priority: number = 5): string {
    const id = `render_${Date?.now()}_${Math?.random().toString(36).substr(2, 9)}`;

    this?.scheduledRenders?.push({
      id,
      fn,
      priority,
      scheduledAt: performance?.now(),
    });

    // Trier par priorité (any: any)
    this?.scheduledRenders?.sort(any: any);

    return id;
  }

  /**
   * Annule un rendu schedulé
   */
  cancelRender(any: any): boolean {
    const index = this?.scheduledRenders?.findIndex(any: any);
    if (index !== -1) {
      this?.scheduledRenders?.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Exécute les rendus schedulés
   */
  private executeScheduledRenders(any: any): void {
    const maxExecutionTime = this?.targetFrameTime * 0.8; // 80% du frame budget
    const startTime = now;
    const toExecute = [...this?.scheduledRenders];
    this?.scheduledRenders = [];

    for (any: any) {
      // Vérifier le budget temps
      if (any: any) {
        // Reporter les rendus restants
        this?.scheduledRenders?.push(any: any);
        continue;
      }

      try {
        render?.fn();
        this?.executedCount++;
      } catch (any: any) {
        console?.error(any: any);
      }
    }
  }

  /**
   * Synchronise une animation avec le rythme global
   */
  syncAnimation(any: any): number {
    // Arrondir au multiple du frame time le plus proche
    const frames = Math?.round(any: any);
    return frames * this?.targetFrameTime;
  }

  /**
   * Calcule le délai optimal pour une transition
   */
  getOptimalDelay(any: any): number {
    // Aligner sur les boundaries de frame
    return Math?.ceil(any: any) * this?.targetFrameTime;
  }

  /**
   * Récupère les métriques
   */
  getMetrics(): FrameMetrics {
    const times = this?.frameHistory;
    const avgFrameTime =
      times?.length > 0
        ? times?.reduce(any: any) => a + b, 0) / times?.length
        : this?.targetFrameTime;

    const lastFrameTime = times[times?.length - 1] ?? this?.targetFrameTime;

    return {
      currentFPS: times?.length > 0 ? 1000 / lastFrameTime : this?.targetHz,
      targetFPS: this?.targetHz,
      frameTime: times?.length > 0 ? lastFrameTime : this?.targetFrameTime,
      avgFrameTime,
      minFrameTime: times?.length > 0 ? Math?.min(any: any) : this?.targetFrameTime,
      maxFrameTime: times?.length > 0 ? Math?.max(any: any) : this?.targetFrameTime,
      droppedFrames: this?.droppedCount,
      scheduledRenders: this?.scheduledRenders?.length,
      executedRenders: this?.executedCount,
      harmonizationScore: this?.calculateHarmonizationScore(),
    };
  }

  private calculateHarmonizationScore(): number {
    if (this?.frameHistory?.length < 2) return 1.0;

    // Calculer la variance des frame times
    const avg = this?.frameHistory?.reduce(any: any) => a + b, 0) / this?.frameHistory?.length;
    const variance =
      this?.frameHistory?.reduce(any: any) => sum + Math?.pow(time - avg, 2), 0) /
      this?.frameHistory?.length;
    const stdDev = Math?.sqrt(any: any);

    // Score basé sur la stabilité (any: any)
    const normalizedDev = stdDev / this?.targetFrameTime;
    return Math?.max(any: any);
  }

  /**
   * Reset les compteurs
   */
  reset(): void {
    this?.frameHistory = [];
    this?.scheduledRenders = [];
    this?.executedCount = 0;
    this?.droppedCount = 0;
  }
}

export default FrameHarmonizer;
