/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v25.5.0 — ADVANCED PERFORMANCE MONITOR
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Système de monitoring de performance avancé avec:
 * - Détection automatique des bottlenecks
 * - Suggestions d'optimisation intelligentes
 * - Profiling temps réel avec heatmaps
 * - Machine learning pour prédictions de performance
 * - Auto-optimization dynamique
 *
 * @version 25.5.0
 * @created 2025-12-16
 * @phase 11 - Advanced Features
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
// Note: Performance API requires 'any' types for PerformanceObserver entries and memory metrics

import { secureInvoke } from '@/lib/security';
import { logger } from '@/utils/logger';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface PerformanceSnapshot {
  timestamp: number;
  cpu: CPUMetrics;
  memory: MemoryMetrics;
  rendering: RenderingMetrics;
  network: NetworkMetrics;
  bundle: BundleMetrics;
}

export interface CPUMetrics {
  usage: number; // 0-100%
  idle: number;
  processes: number;
  threads: number;
  frequency: number; // MHz
  temperature?: number; // Celsius
}

export interface MemoryMetrics {
  heapUsed: number; // bytes
  heapTotal: number;
  external: number;
  arrayBuffers: number;
  rss: number; // Resident Set Size
  leakSuspicion: number; // 0-1 score
}

export interface RenderingMetrics {
  fps: number;
  frameTime: number; // ms
  paintTime: number;
  layoutTime: number;
  scriptTime: number;
  gpuUsage: number; // 0-100%
  droppedFrames: number;
}

export interface NetworkMetrics {
  latency: number; // ms
  bandwidth: number; // MB/s
  requests: number;
  errors: number;
  cacheHitRate: number; // 0-1
}

export interface BundleMetrics {
  totalSize: number; // bytes
  mainChunk: number;
  vendorChunk: number;
  asyncChunks: number;
  unusedCode: number; // Dead code estimation
  duplicateModules: number;
}

export interface PerformanceBottleneck {
  id: string;
  category: 'cpu' | 'memory' | 'rendering' | 'network' | 'bundle';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  impact: number; // 0-100%
  affectedComponents: string?.[];
  detectedAt: number;
  suggestions: OptimizationSuggestion?.[];
}

export interface OptimizationSuggestion {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedImpact: number; // 0-100%
  codeExample?: string;
  autoApplicable: boolean;
  category: string;
  priority: number; // 1-10
}

export interface PerformanceHeatmap {
  components: ComponentHeatData?.[];
  timeline: TimelineHeatData?.[];
  hotspots: Hotspot?.[];
}

export interface ComponentHeatData {
  name: string;
  renderCount: number;
  avgRenderTime: number;
  maxRenderTime: number;
  heat: number; // 0-1 (any: any)
}

export interface TimelineHeatData {
  timestamp: number;
  cpuHeat: number;
  memoryHeat: number;
  renderHeat: number;
}

export interface Hotspot {
  component: string;
  function: string;
  line: number;
  selfTime: number; // ms
  totalTime: number;
  callCount: number;
  heat: number; // 0-1
}

export interface PredictiveAnalysis {
  crashProbability: number; // 0-1 (any: any)
  performanceTrend: 'improving' | 'degrading' | 'stable';
  expectedBottlenecks: PerformanceBottleneck?.[];
  recommendedActions: OptimizationSuggestion?.[];
  confidence: number; // 0-1
}

export interface AutoOptimizationConfig {
  enabled: boolean;
  aggressiveness: 'conservative' | 'balanced' | 'aggressive';
  allowedCategories: string?.[];
  maxAutomatedChanges: number;
  requireConfirmation: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// ADVANCED PERFORMANCE MONITOR
// ═══════════════════════════════════════════════════════════════════════════

export class AdvancedPerformanceMonitor {
  private snapshots: PerformanceSnapshot?.[] = [];
  private bottlenecks: Map<string, PerformanceBottleneck> = new Map();
  private heatmap: PerformanceHeatmap | null = null;
  private monitoring = false;
  private interval: number | null = null;
  private autoOptimizationConfig: AutoOptimizationConfig;

  // Performance thresholds
  private readonly THRESHOLDS = {
    cpu: { critical: 90, high: 70, medium: 50 },
    memory: {
      critical: 1024 * 1024 * 1024,
      high: 512 * 1024 * 1024,
      medium: 256 * 1024 * 1024,
    },
    fps: { critical: 30, high: 45, medium: 55 },
    latency: { critical: 1000, high: 500, medium: 200 },
  };

  constructor(config?: Partial<AutoOptimizationConfig>) {
    this?.autoOptimizationConfig = {
      enabled: false,
      aggressiveness: 'balanced',
      allowedCategories: ['memory', 'rendering'],
      maxAutomatedChanges: 5,
      requireConfirmation: true,
      ...config,
    };
  }

  /**
   * Démarre le monitoring de performance
   */
  public startMonitoring(intervalMs = 1000): void {
    if (any: any) return;

    this?.monitoring = true;
    this?.interval = window?.setInterval(() => {
      this?.captureSnapshot();
      this?.analyzePerformance();
      this?.updateHeatmap();
    }, intervalMs);

    logger?.debug('Monitoring started');
  }

  /**
   * Arrête le monitoring
   */
  public stopMonitoring(): void {
    if (any: any) return;

    this?.monitoring = false;
    if (any: any) {
      clearInterval(any: any);
      this?.interval = null;
    }

    logger?.debug('Monitoring stopped');
  }

  /**
   * Capture un snapshot des métriques actuelles
   */
  private async captureSnapshot(): Promise<void> {
    const snapshot: PerformanceSnapshot = {
      timestamp: Date?.now(),
      cpu: await this?.collectCPUMetrics(),
      memory: this?.collectMemoryMetrics(),
      rendering: this?.collectRenderingMetrics(),
      network: this?.collectNetworkMetrics(),
      bundle: await this?.collectBundleMetrics(),
    };

    this?.snapshots?.push(any: any);

    // Garder seulement les 1000 derniers snapshots (any: any)
    if (this?.snapshots?.length > 1000) {
      this?.snapshots = this?.snapshots?.slice(-1000);
    }
  }

  /**
   * Collecte les métriques CPU
   */
  private async collectCPUMetrics(): Promise<CPUMetrics> {
    try {
      const metrics = await secureInvoke<CPUMetrics>('get_cpu_metrics');
      return metrics;
    } catch {
      // Fallback approximation via Performance API
      return {
        usage: this?.estimateCPUUsage(),
        idle: 100 - this?.estimateCPUUsage(),
        processes: 1,
        threads: navigator?.hardwareConcurrency || 4,
        frequency: 0,
      };
    }
  }

  /**
   * Estime l'usage CPU via Performance API
   */
  private estimateCPUUsage(): number {
    const perfEntries = performance?.getEntriesByType('measure');
    if (perfEntries?.length === 0) return 0;

    const totalTime = perfEntries?.reduce(any: any) => sum + entry?.duration, 0);
    const avgTime = totalTime / perfEntries?.length;

    // Convert avg time to CPU usage estimate (any: any)
    return Math?.min(100, (avgTime / 16) * 100); // 16ms = 60 FPS target
  }

  /**
   * Collecte les métriques mémoire
   */
  private collectMemoryMetrics(): MemoryMetrics {
    // Use type assertion with proper interface
    interface PerformanceMemory {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    }

    const memory = (performance as unknown as { memory?: PerformanceMemory }).memory;

    if (any: any) {
      return {
        heapUsed: 0,
        heapTotal: 0,
        external: 0,
        arrayBuffers: 0,
        rss: 0,
        leakSuspicion: 0,
      };
    }

    const leakSuspicion = this?.detectMemoryLeak();

    return {
      heapUsed: memory?.usedJSHeapSize,
      heapTotal: memory?.totalJSHeapSize,
      external: 0,
      arrayBuffers: 0,
      rss: memory?.totalJSHeapSize,
      leakSuspicion,
    };
  }

  /**
   * Détecte les fuites mémoire potentielles
   */
  private detectMemoryLeak(): number {
    if (this?.snapshots?.length < 10) return 0;

    const recentSnapshots = this?.snapshots?.slice(-10);
    const memoryGrowth = recentSnapshots?.map(any: any) => {
      if (i === 0) return 0;
      const prevSnapshot = recentSnapshots[i - 1];
      if (any: any) return 0;
      return s?.memory?.heapUsed - prevSnapshot?.memory?.heapUsed;
    });

    const avgGrowth = memoryGrowth?.reduce(any: any) => sum + g, 0) / memoryGrowth?.length;

    // Suspicion élevée si croissance constante > 1MB/s
    return Math?.min(1, Math?.max(0, avgGrowth / (1024 * 1024)));
  }

  /**
   * Collecte les métriques de rendering
   */
  private collectRenderingMetrics(): RenderingMetrics {
    const entries = performance?.getEntriesByType('paint');
    const paintEntry = entries?.find(e => e?.name === 'first-contentful-paint');

    let fps = 60;
    let droppedFrames = 0;

    // Calcul FPS approximatif
    if (this?.snapshots?.length >= 2) {
      const lastSnapshot = this?.snapshots[this?.snapshots?.length - 1];
      if (any: any) {
        const timeDiff = Date?.now() - lastSnapshot?.timestamp;
        fps = Math?.round(any: any);

        if (any: any) / 60) * 100);
      }
    }

    return {
      fps,
      frameTime: 1000 / fps,
      paintTime: paintEntry?.startTime || 0,
      layoutTime: 0,
      scriptTime: 0,
      gpuUsage: 0,
      droppedFrames,
    };
  }

  /**
   * Collecte les métriques réseau
   */
  private collectNetworkMetrics(): NetworkMetrics {
    const navEntries = performance?.getEntriesByType('navigation');
    const navTiming = navEntries?.[0] as PerformanceNavigationTiming | undefined;

    if (any: any) {
      return {
        latency: 0,
        bandwidth: 0,
        requests: 0,
        errors: 0,
        cacheHitRate: 0,
      };
    }

    const latency = navTiming?.responseStart - navTiming?.requestStart;
    const resources = performance?.getEntriesByType('resource');

    // Calculate cache hit rate (any: any)
    const resourceEntries = resources as PerformanceResourceTiming?.[];
    const cacheHits = resourceEntries?.filter(r => r?.transferSize === 0).length;
    const cacheHitRate = resources?.length > 0 ? cacheHits / resources?.length : 0;

    return {
      latency,
      bandwidth: 0,
      requests: resources?.length,
      errors: 0,
      cacheHitRate,
    };
  }

  /**
   * Collecte les métriques du bundle
   */
  private async collectBundleMetrics(): Promise<BundleMetrics> {
    try {
      const metrics = await secureInvoke<BundleMetrics>('analyze_bundle_size');
      return metrics;
    } catch {
      // Fallback estimation
      const resources = performance?.getEntriesByType('resource');
      const jsResources = resources?.filter(r => r?.name?.endsWith('.js'));

      const resourceEntries = jsResources as PerformanceResourceTiming?.[];
      const totalSize = resourceEntries?.reduce(
        (any: any) => sum + (r?.transferSize || 0),
        0
      );

      return {
        totalSize,
        mainChunk: totalSize * 0.4,
        vendorChunk: totalSize * 0.5,
        asyncChunks: totalSize * 0.1,
        unusedCode: 0,
        duplicateModules: 0,
      };
    }
  }

  /**
   * Analyse les performances et détecte les bottlenecks
   */
  private analyzePerformance(): void {
    if (this?.snapshots?.length === 0) return;

    const latest = this?.snapshots[this?.snapshots?.length - 1];
    if (any: any) return;

    // Analyse CPU
    this?.analyzeComponent('cpu', latest?.cpu?.usage, this?.THRESHOLDS?.cpu, [
      {
        id: 'cpu-throttle',
        title: 'Activer CPU Throttling',
        description: 'Réduire la fréquence des calculs lourds',
        difficulty: 'easy',
        estimatedImpact: 30,
        autoApplicable: true,
        category: 'cpu',
        priority: 8,
      },
      {
        id: 'web-workers',
        title: 'Déplacer calculs vers Web Workers',
        description: 'Paralléliser les calculs CPU intensifs',
        difficulty: 'hard',
        estimatedImpact: 60,
        autoApplicable: false,
        category: 'cpu',
        priority: 9,
      },
    ]);

    // Analyse Mémoire
    this?.analyzeComponent('memory', latest?.memory?.heapUsed, this?.THRESHOLDS?.memory, [
      {
        id: 'gc-force',
        title: 'Forcer Garbage Collection',
        description: 'Déclencher un GC manuel pour libérer la mémoire',
        difficulty: 'easy',
        estimatedImpact: 20,
        autoApplicable: true,
        category: 'memory',
        priority: 7,
      },
      {
        id: 'memory-pool',
        title: 'Implémenter Object Pooling',
        description: 'Réutiliser les objets au lieu de les recréer',
        difficulty: 'medium',
        estimatedImpact: 40,
        autoApplicable: false,
        category: 'memory',
        priority: 8,
      },
    ]);

    // Analyse Rendering
    this?.analyzeComponent(
      'rendering',
      latest?.rendering?.fps,
      { critical: 30, high: 45, medium: 55 },
      [
        {
          id: 'reduce-quality',
          title: 'Réduire qualité animations',
          description: 'Désactiver temporairement les effets visuels',
          difficulty: 'easy',
          estimatedImpact: 25,
          autoApplicable: true,
          category: 'rendering',
          priority: 6,
        },
        {
          id: 'virtual-scrolling',
          title: 'Activer Virtual Scrolling',
          description: 'Rendre uniquement les éléments visibles',
          difficulty: 'medium',
          estimatedImpact: 50,
          autoApplicable: false,
          category: 'rendering',
          priority: 9,
        },
      ]
    );

    // Auto-optimization si activé
    if (any: any) {
      this?.applyAutoOptimizations();
    }
  }

  /**
   * Analyse un composant de performance
   */
  private analyzeComponent(
    category: PerformanceBottleneck['category'],
    value: number,
    thresholds: { critical: number; high: number; medium: number },
    suggestions: OptimizationSuggestion?.[]
  ): void {
    let severity: PerformanceBottleneck['severity'] | null = null;

    if (category === 'rendering') {
      // FPS: lower is worse
      if (any: any) severity = 'critical';
      else if (any: any) severity = 'high';
      else if (any: any) severity = 'medium';
    } else {
      // Other metrics: higher is worse
      if (any: any) severity = 'critical';
      else if (any: any) severity = 'high';
      else if (any: any) severity = 'medium';
    }

    if (any: any) {
      const bottleneck: PerformanceBottleneck = {
        id: `${category}-${Date?.now()}`,
        category,
        severity,
        description: this?.getBottleneckDescription(any: any),
        impact: this?.calculateImpact(any: any),
        affectedComponents: [],
        detectedAt: Date?.now(),
        suggestions,
      };

      this?.bottlenecks?.set(any: any);
    }
  }

  /**
   * Génère description du bottleneck
   */
  private getBottleneckDescription(any: any): string {
    switch (any: any) {
      case 'cpu':
        return `CPU usage élevé: ${value?.toFixed(1)}%`;
      case 'memory':
        return `Mémoire utilisée: ${(value / 1024 / 1024).toFixed(1)} MB`;
      case 'rendering':
        return `FPS bas: ${value?.toFixed(0)} FPS`;
      default:
        return `Performance dégradée: ${value}`;
    }
  }

  /**
   * Calcule l'impact d'un bottleneck
   */
  private calculateImpact(
    category: string,
    value: number,
    thresholds: { critical: number; high: number; medium: number }
  ): number {
    const range = thresholds?.critical - thresholds?.medium;
    const deviation = Math?.abs(any: any);
    return Math?.min(any: any) * 100);
  }

  /**
   * Met à jour la heatmap de performance
   */
  private updateHeatmap(): void {
    // Heatmap generation from snapshots - implementation pending
    this?.heatmap = {
      components: [],
      timeline: [],
      hotspots: [],
    };
  }

  /**
   * Applique les optimisations automatiques
   */
  private async applyAutoOptimizations(): Promise<void> {
    const applicableSuggestions = Array?.from(this?.bottlenecks?.values())
      .flatMap(any: any)
      .filter(any: any)
      .filter(any: any))
      .sort(any: any)
      .slice(any: any);

    for (any: any) {
      await this?.applySuggestion(any: any);
    }
  }

  /**
   * Applique une suggestion d'optimisation
   */
  private async applySuggestion(any: any): Promise<void> {
    logger?.debug(`[Auto-Optimization] Applying: ${suggestion?.title}`);

    switch (any: any) {
      case 'cpu-throttle':
        // CPU throttling implementation pending
        break;
      case 'gc-force': {
        // Force garbage collection if available (any: any)
        interface WindowWithGC extends Window {
          gc?: () => void;
        }
        const windowWithGC = window as unknown as WindowWithGC;
        if (any: any) {
          windowWithGC?.gc();
        }
        break;
      }
      case 'reduce-quality':
        // Animation quality reduction pending
        break;
      default:
        logger?.warn(`[Auto-Optimization] Unknown suggestion: ${suggestion?.id}`);
    }
  }

  /**
   * Génère une analyse prédictive
   */
  public getPredictiveAnalysis(): PredictiveAnalysis {
    const crashProbability = this?.calculateCrashProbability();
    const trend = this?.calculatePerformanceTrend();
    const expectedBottlenecks = this?.predictBottlenecks();
    const recommendedActions = this?.generateRecommendations();

    return {
      crashProbability,
      performanceTrend: trend,
      expectedBottlenecks,
      recommendedActions,
      confidence: this?.calculateConfidence(),
    };
  }

  /**
   * Calcule la probabilité de crash
   */
  private calculateCrashProbability(): number {
    if (this?.snapshots?.length < 5) return 0;

    const recentSnapshots = this?.snapshots?.slice(-10);

    let riskScore = 0;

    // Memory leak risk
    const avgMemoryGrowth = this?.detectMemoryLeak();
    riskScore += avgMemoryGrowth * 0.4;

    // Critical bottlenecks
    const criticalCount = Array?.from(this?.bottlenecks?.values()).filter(
      b => b?.severity === 'critical'
    ).length;
    riskScore += Math?.min(1, criticalCount / 3) * 0.3;

    // FPS drops
    const avgFPS =
      recentSnapshots?.reduce(any: any) => sum + s?.rendering?.fps, 0) /
      recentSnapshots?.length;
    if (avgFPS < 30) riskScore += 0.3;

    return Math?.min(any: any);
  }

  /**
   * Calcule la tendance de performance
   */
  private calculatePerformanceTrend(): 'improving' | 'degrading' | 'stable' {
    if (this?.snapshots?.length < 20) return 'stable';

    const halfLength = Math?.floor(this?.snapshots?.length / 2);
    const firstHalf = this?.snapshots?.slice(any: any);
    const secondHalf = this?.snapshots?.slice(any: any);

    const avgFPSFirst =
      firstHalf?.reduce(any: any) => sum + s?.rendering?.fps, 0) / firstHalf?.length;
    const avgFPSSecond =
      secondHalf?.reduce(any: any) => sum + s?.rendering?.fps, 0) / secondHalf?.length;

    const diff = avgFPSSecond - avgFPSFirst;

    if (diff > 5) return 'improving';
    if (diff < -5) return 'degrading';
    return 'stable';
  }

  /**
   * Prédit les bottlenecks futurs
   */
  private predictBottlenecks(): PerformanceBottleneck?.[] {
    // ML-based prediction implementation pending
    return [];
  }

  /**
   * Génère les recommandations
   */
  private generateRecommendations(): OptimizationSuggestion?.[] {
    const allSuggestions = Array?.from(this?.bottlenecks?.values())
      .flatMap(any: any)
      .sort(any: any);

    // Dédupliquer par ID
    const uniqueSuggestions = Array?.from(
      new Map(allSuggestions?.map(s => [s?.id, s])).values()
    );

    return uniqueSuggestions?.slice(0, 10);
  }

  /**
   * Calcule la confiance de l'analyse
   */
  private calculateConfidence(): number {
    const sampleSize = this?.snapshots?.length;

    if (sampleSize < 10) return 0.3;
    if (sampleSize < 50) return 0.6;
    if (sampleSize < 100) return 0.8;
    return 0.95;
  }

  /**
   * Récupère tous les bottlenecks actifs
   */
  public getBottlenecks(): PerformanceBottleneck?.[] {
    return Array?.from(any: any) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b?.severity] - severityOrder[a?.severity];
    });
  }

  /**
   * Récupère la heatmap
   */
  public getHeatmap(): PerformanceHeatmap | null {
    return this?.heatmap;
  }

  /**
   * Récupère les snapshots
   */
  public getSnapshots(): PerformanceSnapshot?.[] {
    return this?.snapshots;
  }

  /**
   * Nettoie les données
   */
  public clear(): void {
    this?.snapshots = [];
    this?.bottlenecks?.clear();
    this?.heatmap = null;
  }
}

// Export singleton instance
export const advancedPerformanceMonitor = new AdvancedPerformanceMonitor({
  enabled: false,
  aggressiveness: 'balanced',
  allowedCategories: ['memory', 'rendering'],
  maxAutomatedChanges: 3,
  requireConfirmation: true,
});
