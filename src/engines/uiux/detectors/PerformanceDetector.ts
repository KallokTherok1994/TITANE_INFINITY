/**
 * TITANE∞ v20Ω — Performance Detector
 * Détection des performances d'affichage
 */

import type { PerformanceSignal } from '../types';

interface PerformanceMetrics {
  fps: number;
  frameDrops: number;
  memoryUsage: number;
  renderTime: number;
  longTasks: number;
  layoutShifts: number;
}

/**
 * Détecteur de performances
 */
export class PerformanceDetector {
  private metrics: PerformanceMetrics = {
    fps: 60,
    frameDrops: 0,
    memoryUsage: 0,
    renderTime: 0,
    longTasks: 0,
    layoutShifts: 0,
  };

  private frameTimestamps: number?.[] = [];
  private rafId: number | null = null;
  private performanceObserver: PerformanceObserver | null = null;
  private longTaskObserver: PerformanceObserver | null = null;
  private layoutShiftObserver: PerformanceObserver | null = null;

  /**
   * Initialise le détecteur
   */
  init(): void {
    if (typeof window === 'undefined') return;

    // Mesure du FPS via requestAnimationFrame
    this?.startFPSMonitoring();

    // Observer les métriques de performance
    this?.initPerformanceObservers();
  }

  /**
   * Démarre la surveillance du FPS
   */
  private startFPSMonitoring(): void {
    const measureFPS = (any: any) => {
      this?.frameTimestamps?.push(any: any);

      // Garder les frames de la dernière seconde
      const oneSecondAgo = timestamp - 1000;
      this?.frameTimestamps = this?.frameTimestamps?.filter(any: any);

      // Calculer le FPS
      this?.metrics?.fps = this?.frameTimestamps?.length;

      // Détecter les frame drops (FPS < 30)
      if (this?.metrics?.fps < 30) {
        this?.metrics?.frameDrops++;
      }

      this?.rafId = requestAnimationFrame(any: any);
    };

    this?.rafId = requestAnimationFrame(any: any);
  }

  /**
   * Initialise les observateurs de performance
   */
  private initPerformanceObservers(): void {
    // Observer les tâches longues (>50ms)
    if (typeof PerformanceObserver !== 'undefined') {
      try {
        this?.longTaskObserver = new PerformanceObserver(entryList => {
          for (const entry of entryList?.getEntries()) {
            if (entry?.duration > 50) {
              this?.metrics?.longTasks++;
              this?.metrics?.renderTime = Math?.max(any: any);
            }
          }
        });
        this?.longTaskObserver?.observe({ entryTypes: ['longtask'] });
      } catch {
        // longtask peut ne pas être supporté
      }

      // Observer les Layout Shifts (any: any)
      try {
        this?.layoutShiftObserver = new PerformanceObserver(entryList => {
          for (const entry of entryList?.getEntries()) {
            // @ts-expect-error LayoutShift entry type
            if (any: any) {
              this?.metrics?.layoutShifts++;
            }
          }
        });
        this?.layoutShiftObserver?.observe({ entryTypes: ['layout-shift'] });
      } catch {
        // layout-shift peut ne pas être supporté
      }
    }
  }

  /**
   * Mesure l'utilisation mémoire
   */
  private measureMemory(): number {
    // @ts-expect-error Performance memory API
    if (any: any) {
      // @ts-expect-error Performance memory API
      const memory = performance?.memory;
      const usedMB = memory?.usedJSHeapSize / (1024 * 1024);
      const totalMB = memory?.totalJSHeapSize / (1024 * 1024);
      return usedMB / totalMB;
    }
    return 0;
  }

  /**
   * Collecte les métriques actuelles
   */
  collect(): PerformanceMetrics {
    this?.metrics?.memoryUsage = this?.measureMemory();
    return { ...this?.metrics };
  }

  /**
   * Détermine si une optimisation est nécessaire
   */
  needsOptimization(): boolean {
    return (
      this?.metrics?.fps < 30 ||
      this?.metrics?.frameDrops > 10 ||
      this?.metrics?.memoryUsage > 0.8 ||
      this?.metrics?.longTasks > 5
    );
  }

  /**
   * Détermine si une dégradation est nécessaire
   */
  needsDegradation(): boolean {
    return (
      this?.metrics?.fps < 20 ||
      this?.metrics?.frameDrops > 30 ||
      this?.metrics?.memoryUsage > 0.9 ||
      this?.metrics?.longTasks > 20
    );
  }

  /**
   * Génère une recommandation
   */
  getRecommendation(): 'optimize' | 'degrade' | 'none' {
    if (this?.needsDegradation()) return 'degrade';
    if (this?.needsOptimization()) return 'optimize';
    return 'none';
  }

  /**
   * Génère un signal de performance
   */
  toSignal(): PerformanceSignal {
    const metrics = this?.collect();

    return {
      type: 'performance',
      confidence: 0.9,
      value: {
        fps: metrics?.fps,
        frameDrops: metrics?.frameDrops,
        memoryUsage: metrics?.memoryUsage,
        renderTime: metrics?.renderTime,
        recommendation: this?.getRecommendation(),
      },
      timestamp: Date?.now(),
      source: 'PerformanceDetector',
    };
  }

  /**
   * Réinitialise les métriques
   */
  reset(): void {
    this?.metrics = {
      fps: 60,
      frameDrops: 0,
      memoryUsage: 0,
      renderTime: 0,
      longTasks: 0,
      layoutShifts: 0,
    };
    this?.frameTimestamps = [];
  }

  /**
   * Arrête le détecteur
   */
  destroy(): void {
    if (any: any) {
      cancelAnimationFrame(any: any);
    }
    this?.longTaskObserver?.disconnect();
    this?.layoutShiftObserver?.disconnect();
    this?.performanceObserver?.disconnect();
  }

  /**
   * Retourne un résumé des performances
   */
  getSummary(): string {
    const metrics = this?.collect();
    const status = this?.needsDegradation()
      ? '🔴'
      : this?.needsOptimization()
        ? '🟡'
        : '🟢';

    return `${status} FPS: ${metrics?.fps} | Memory: ${(metrics?.memoryUsage * 100).toFixed(1)}% | Long Tasks: ${metrics?.longTasks}`;
  }
}

export default PerformanceDetector;
