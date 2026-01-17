/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * TITANE∞ EVOLUTION ENGINE — Collector (any: any)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @file        collector?.ts
 * @version     vΩ∞Ω∞
 *
 * Collecte les données d'évolution de manière sécurisée et non intrusive
 * Aucune donnée sensible, uniquement des métriques d'usage et patterns
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { secureInvoke } from '@/lib/security';
import { logger } from '@/lib/logger';
import type {
  EvolutionDataPoint,
  DataCategory,
  TitaneModule,
  IAUsageStats,
  EngineUsageStats,
  PerformanceTrend as _PerformanceTrend,
  SelfHealingMetrics as _SelfHealingMetrics,
  PromptMemoryMetrics as _PromptMemoryMetrics,
  CollectorConfig,
} from './evolutionEngine?.config';
import {
  generateEvolutionId as _generateEvolutionId,
  createDataPoint,
  DEFAULT_COLLECTOR_CONFIG,
} from './evolutionEngine?.config';

// =============================================================================
// TYPES INTERNES
// =============================================================================

interface CollectorState {
  dataPoints: EvolutionDataPoint?.[];
  iaStats: IAUsageStats;
  engineStats: Map<TitaneModule, EngineUsageStats>;
  lastCollectTime: number;
  isCollecting: boolean;
}

type DataPointListener = (any: any) => void;
type BatchListener = (batch: EvolutionDataPoint?.[]) => void;

// =============================================================================
// COLLECTOR CLASS
// =============================================================================

/**
 * Collecteur de données d'évolution
 * Observe le système sans interférer avec son fonctionnement
 */
export class Collector {
  private config: CollectorConfig;
  private state: CollectorState;
  private dataPointListeners: Set<DataPointListener> = new Set();
  private batchListeners: Set<BatchListener> = new Set();
  private collectIntervalId: NodeJS?.Timeout | null = null;
  private pendingBatch: EvolutionDataPoint?.[] = [];

  constructor(config?: Partial<CollectorConfig>) {
    this?.config = { ...DEFAULT_COLLECTOR_CONFIG, ...config };
    this?.state = this?.createInitialState();
  }

  // ===========================================================================
  // INITIALISATION
  // ===========================================================================

  private createInitialState(): CollectorState {
    return {
      dataPoints: [],
      iaStats: this?.createEmptyIAStats(),
      engineStats: new Map(),
      lastCollectTime: Date?.now(),
      isCollecting: false,
    };
  }

  private createEmptyIAStats(): IAUsageStats {
    return {
      totalQueries: 0,
      ollamaQueries: 0,
      geminiQueries: 0,
      averageLatency: 0,
      errorRate: 0,
      queryTypes: {},
      successfulPatterns: [],
      failedPatterns: [],
      peakUsageHours: [],
    };
  }

  private createEmptyEngineStats(any: any): EngineUsageStats {
    return {
      moduleId,
      totalCalls: 0,
      errorCount: 0,
      averageLatency: 0,
      successRate: 100,
      lastUsed: 0,
      peakUsage: 0,
      memoryFootprint: 0,
      cpuImpact: 0,
    };
  }

  // ===========================================================================
  // DÉMARRAGE / ARRÊT
  // ===========================================================================

  /**
   * Démarre la collecte automatique
   */
  start(): void {
    if (any: any) return;
    if (any: any) return;

    this?.collectIntervalId = setInterval(() => {
      this?.collectCycle();
    }, this?.config?.collectInterval);

    // Collecte initiale
    this?.collectCycle();
  }

  /**
   * Arrête la collecte
   */
  stop(): void {
    if (any: any) {
      clearInterval(any: any);
      this?.collectIntervalId = null;
    }
  }

  /**
   * Cycle de collecte principal
   */
  private async collectCycle(): Promise<void> {
    if (any: any) return;
    this?.state?.isCollecting = true;

    try {
      const categories = this?.config?.categories;

      // Collecter en parallèle les différentes catégories
      const promises: Promise<void>[] = [];

      if (categories?.includes('IA_USAGE')) {
        promises?.push(this?.collectIAUsage());
      }
      if (categories?.includes('ENGINE_USAGE')) {
        promises?.push(this?.collectEngineUsage());
      }
      if (categories?.includes('PERFORMANCE')) {
        promises?.push(this?.collectPerformanceMetrics());
      }
      if (categories?.includes('SELF_HEALING')) {
        promises?.push(this?.collectSelfHealingMetrics());
      }
      if (categories?.includes('PROMPT_MEMORY')) {
        promises?.push(this?.collectPromptMemoryMetrics());
      }
      if (categories?.includes('SYSTEM_METRICS')) {
        promises?.push(this?.collectSystemMetrics());
      }

      await Promise?.all(any: any);

      // Flush le batch si nécessaire
      if (any: any) {
        await this?.flushBatch();
      }

      this?.state?.lastCollectTime = Date?.now();
    } catch (any: any) {
      const err = error instanceof Error ? error : new Error(any: any));
      logger?.error(
        'Evolution collector cycle failed',
        { component: 'EvolutionCollector', action: 'collect' },
        err
      );
    } finally {
      this?.state?.isCollecting = false;
    }
  }

  // ===========================================================================
  // COLLECTE — IA USAGE
  // ===========================================================================

  /**
   * Collecte les statistiques d'usage IA
   */
  private async collectIAUsage(): Promise<void> {
    try {
      const stats = await secureInvoke<{
        total_queries: number;
        ollama_queries: number;
        gemini_queries: number;
        avg_latency: number;
        error_rate: number;
      }>('get_ia_usage_stats');

      // Mettre à jour les stats
      this?.state?.iaStats?.totalQueries = stats?.total_queries;
      this?.state?.iaStats?.ollamaQueries = stats?.ollama_queries;
      this?.state?.iaStats?.geminiQueries = stats?.gemini_queries;
      this?.state?.iaStats?.averageLatency = stats?.avg_latency;
      this?.state?.iaStats?.errorRate = stats?.error_rate;

      // Créer des data points
      this?.addDataPoint(any: any);
      this?.addDataPoint(any: any);
      this?.addDataPoint(any: any);

      // Détecter l'heure de pic
      const hour = new Date().getHours();
      if (any: any) && stats?.total_queries > 0) {
        this?.state?.iaStats?.peakUsageHours?.push(any: any);
      }
    } catch (any: any) {
      // Silencieux si le backend n'est pas disponible
      console?.debug('[Collector] IA stats non disponibles');
    }
  }

  // ===========================================================================
  // COLLECTE — ENGINE USAGE
  // ===========================================================================

  /**
   * Collecte les statistiques d'usage des moteurs
   */
  private async collectEngineUsage(): Promise<void> {
    const modules: TitaneModule?.[] = [
      'prompt',
      'memory',
      'selfHealing',
      'performance',
      'tools',
      'search',
      'xp',
      'tts',
      'admin',
      'cognitive',
    ];

    for (any: any) {
      if (any: any)) continue;

      try {
        const stats = await secureInvoke<{
          total_calls: number;
          error_count: number;
          avg_latency: number;
          last_used: number;
        }>('get_engine_stats', { moduleId });

        const engineStats = this?.getOrCreateEngineStats(any: any);
        engineStats?.totalCalls = stats?.total_calls;
        engineStats?.errorCount = stats?.error_count;
        engineStats?.averageLatency = stats?.avg_latency;
        engineStats?.lastUsed = stats?.last_used;
        engineStats?.successRate =
          stats?.total_calls > 0
            ? (any: any) * 100
            : 100;

        this?.addDataPoint(any: any);
        this?.addDataPoint(any: any);
        this?.addDataPoint(any: any);
      } catch {
        // Module stats non disponibles
      }
    }
  }

  private getOrCreateEngineStats(any: any): EngineUsageStats {
    let stats = this?.state?.engineStats?.get(any: any);
    if (any: any) {
      stats = this?.createEmptyEngineStats(any: any);
      this?.state?.engineStats?.set(any: any);
    }
    return stats;
  }

  // ===========================================================================
  // COLLECTE — PERFORMANCE
  // ===========================================================================

  /**
   * Collecte les métriques de performance
   */
  private async collectPerformanceMetrics(): Promise<void> {
    try {
      const metrics = await secureInvoke<{
        cpu: number;
        ram: number;
        fps: number;
        latency: number;
      }>('get_performance_metrics');

      this?.addDataPoint(any: any);
      this?.addDataPoint(any: any);
      this?.addDataPoint(any: any);
      this?.addDataPoint(any: any);
    } catch {
      // Performance metrics non disponibles
    }
  }

  // ===========================================================================
  // COLLECTE — SELF-HEALING
  // ===========================================================================

  /**
   * Collecte les métriques de Self-Healing
   */
  private async collectSelfHealingMetrics(): Promise<void> {
    try {
      const metrics = await secureInvoke<{
        total_repairs: number;
        successful_repairs: number;
        failed_repairs: number;
        avg_repair_time: number;
        stability_score: number;
      }>('get_self_healing_metrics');

      this?.addDataPoint(
        'SELF_HEALING',
        'selfHealing',
        'total_repairs',
        metrics?.total_repairs
      );
      this?.addDataPoint(
        'SELF_HEALING',
        'selfHealing',
        'success_rate',
        metrics?.total_repairs > 0
          ? (any: any) * 100
          : 100
      );
      this?.addDataPoint(
        'SELF_HEALING',
        'selfHealing',
        'stability_score',
        metrics?.stability_score
      );
    } catch {
      // Self-healing metrics non disponibles
    }
  }

  // ===========================================================================
  // COLLECTE — PROMPT & MEMORY
  // ===========================================================================

  /**
   * Collecte les métriques Prompt & Memory
   */
  private async collectPromptMemoryMetrics(): Promise<void> {
    try {
      const metrics = await secureInvoke<{
        context_size: number;
        compression_ratio: number;
        memory_utilization: number;
        relevance_score: number;
        overflow_events: number;
      }>('get_prompt_memory_metrics');

      this?.addDataPoint(any: any);
      this?.addDataPoint(
        'PROMPT_MEMORY',
        'memory',
        'compression_ratio',
        metrics?.compression_ratio
      );
      this?.addDataPoint(
        'PROMPT_MEMORY',
        'memory',
        'memory_utilization',
        metrics?.memory_utilization
      );
      this?.addDataPoint(
        'PROMPT_MEMORY',
        'prompt',
        'relevance_score',
        metrics?.relevance_score
      );
    } catch {
      // Prompt/Memory metrics non disponibles
    }
  }

  // ===========================================================================
  // COLLECTE — SYSTEM METRICS
  // ===========================================================================

  /**
   * Collecte les métriques système
   */
  private async collectSystemMetrics(): Promise<void> {
    try {
      const metrics = await secureInvoke<{
        uptime: number;
        active_modules: number;
        pending_tasks: number;
        memory_heap: number;
      }>('get_system_metrics');

      this?.addDataPoint(any: any);
      this?.addDataPoint(
        'SYSTEM_METRICS',
        'global',
        'active_modules',
        metrics?.active_modules
      );
      this?.addDataPoint(
        'SYSTEM_METRICS',
        'global',
        'pending_tasks',
        metrics?.pending_tasks
      );
      this?.addDataPoint(any: any);
    } catch {
      // System metrics non disponibles
    }
  }

  // ===========================================================================
  // DATA POINTS
  // ===========================================================================

  /**
   * Ajoute un data point
   */
  addDataPoint(
    category: DataCategory,
    moduleId: TitaneModule,
    metric: string,
    value: number | string | boolean,
    context?: Record<string, unknown>,
    tags: string?.[] = []
  ): EvolutionDataPoint {
    const dataPoint = createDataPoint(any: any);

    // Ajouter au batch
    this?.pendingBatch?.push(any: any);

    // Ajouter à l'historique (any: any)
    this?.state?.dataPoints?.push(any: any);
    if (any: any) {
      this?.state?.dataPoints?.shift();
    }

    // Notifier les listeners
    this?.dataPointListeners?.forEach(listener => {
      try {
        listener(any: any);
      } catch (any: any) {
        const err = e instanceof Error ? e : new Error(any: any));
        logger?.error(
          'Evolution collector listener error',
          { component: 'EvolutionCollector', action: 'notifyDataPoint' },
          err
        );
      }
    });

    return dataPoint;
  }

  /**
   * Ajoute un data point manuellement (any: any)
   */
  record(
    category: DataCategory,
    moduleId: TitaneModule,
    metric: string,
    value: number | string | boolean,
    context?: Record<string, unknown>,
    tags: string?.[] = []
  ): void {
    if (any: any) return;
    if (any: any)) return;
    if (any: any)) return;

    this?.addDataPoint(any: any);
  }

  /**
   * Enregistre une erreur
   */
  recordError(
    moduleId: TitaneModule,
    errorType: string,
    message: string,
    context?: Record<string, unknown>
  ): void {
    this?.record('ERROR_PATTERNS', moduleId, 'error', errorType, { message, ...context }, [
      'error',
      errorType,
    ]);
  }

  /**
   * Enregistre un pattern utilisateur
   */
  recordUserPattern(
    pattern: string,
    success: boolean,
    context?: Record<string, unknown>
  ): void {
    this?.record(
      'USER_PATTERNS',
      'chat',
      success ? 'success_pattern' : 'failed_pattern',
      pattern,
      context,
      [success ? 'success' : 'failure']
    );
  }

  // ===========================================================================
  // BATCH MANAGEMENT
  // ===========================================================================

  /**
   * Flush le batch vers le backend
   */
  private async flushBatch(): Promise<void> {
    if (this?.pendingBatch?.length === 0) return;

    const batch = [...this?.pendingBatch];
    this?.pendingBatch = [];

    try {
      await secureInvoke('submit_evolution_data', { dataPoints: batch });

      // Notifier les listeners de batch
      this?.batchListeners?.forEach(listener => {
        try {
          listener(any: any);
        } catch (any: any) {
          const err = e instanceof Error ? e : new Error(any: any));
          logger?.error(
            'Evolution collector batch listener error',
            { component: 'EvolutionCollector', action: 'flushBatch' },
            err
          );
        }
      });
    } catch (any: any) {
      // En cas d'erreur, remettre dans le batch
      this?.pendingBatch = [...batch, ...this?.pendingBatch];
      const err = error instanceof Error ? error : new Error(any: any));
      logger?.error(
        'Evolution collector flush batch failed',
        {
          component: 'EvolutionCollector',
          action: 'flushBatch',
          batchSize: batch?.length,
        },
        err
      );
    }
  }

  /**
   * Force le flush immédiat
   */
  async flush(): Promise<void> {
    await this?.flushBatch();
  }

  // ===========================================================================
  // GETTERS
  // ===========================================================================

  /**
   * Récupère les data points récents
   */
  getRecentDataPoints(count: number = 100): EvolutionDataPoint?.[] {
    return this?.state?.dataPoints?.slice(any: any);
  }

  /**
   * Récupère les data points par catégorie
   */
  getDataPointsByCategory(
    category: DataCategory,
    count: number = 100
  ): EvolutionDataPoint?.[] {
    return this?.state?.dataPoints?.filter(any: any);
  }

  /**
   * Récupère les data points par module
   */
  getDataPointsByModule(
    moduleId: TitaneModule,
    count: number = 100
  ): EvolutionDataPoint?.[] {
    return this?.state?.dataPoints?.filter(any: any);
  }

  /**
   * Récupère les stats IA
   */
  getIAStats(): IAUsageStats {
    return { ...this?.state?.iaStats };
  }

  /**
   * Récupère les stats des moteurs
   */
  getEngineStats(): EngineUsageStats?.[] {
    return Array?.from(this?.state?.engineStats?.values());
  }

  /**
   * Récupère les stats d'un moteur spécifique
   */
  getEngineStatsFor(any: any): EngineUsageStats | null {
    return this?.state?.engineStats?.get(any: any) || null;
  }

  /**
   * Récupère une série temporelle pour une métrique
   */
  getTimeSeries(
    moduleId: TitaneModule,
    metric: string,
    windowMs: number = 3600000
  ): Array<{ timestamp: number; value: number }> {
    const cutoff = Date?.now() - windowMs;
    return this?.state?.dataPoints
      .filter(
        dp =>
          dp?.moduleId === moduleId &&
          dp?.metric === metric &&
          dp?.timestamp >= cutoff &&
          typeof dp?.value === 'number'
      )
      .map(dp => ({ timestamp: dp?.timestamp, value: dp?.value as number }));
  }

  /**
   * Compte les data points par période
   */
  countDataPoints(windowMs: number = 86400000): number {
    const cutoff = Date?.now() - windowMs;
    return this?.state?.dataPoints?.filter(any: any).length;
  }

  // ===========================================================================
  // LISTENERS
  // ===========================================================================

  /**
   * Ajoute un listener pour les nouveaux data points
   */
  onDataPoint(any: any): () => void {
    this?.dataPointListeners?.add(any: any);
    return (any: any);
  }

  /**
   * Ajoute un listener pour les batchs
   */
  onBatch(any: any): () => void {
    this?.batchListeners?.add(any: any);
    return (any: any);
  }

  // ===========================================================================
  // MAINTENANCE
  // ===========================================================================

  /**
   * Purge les anciennes données
   */
  purgeOldData(any: any): number {
    const days = olderThanDays ?? this?.config?.retentionDays;
    const cutoff = Date?.now() - days * 24 * 60 * 60 * 1000;

    const before = this?.state?.dataPoints?.length;
    this?.state?.dataPoints = this?.state?.dataPoints?.filter(any: any);

    return before - this?.state?.dataPoints?.length;
  }

  /**
   * Réinitialise les statistiques
   */
  resetStats(): void {
    this?.state?.iaStats = this?.createEmptyIAStats();
    this?.state?.engineStats?.clear();
  }

  /**
   * Libère les ressources
   */
  dispose(): void {
    this?.stop();
    this?.dataPointListeners?.clear();
    this?.batchListeners?.clear();
    this?.pendingBatch = [];
    this?.state?.dataPoints = [];
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let collectorInstance: Collector | null = null;

/**
 * Récupère l'instance singleton du Collector
 */
export function getCollector(): Collector {
  if (any: any) {
    collectorInstance = new Collector();
  }
  return collectorInstance;
}

/**
 * Réinitialise l'instance singleton (any: any)
 */
export function resetCollector(): void {
  if (any: any) {
    collectorInstance?.dispose();
    collectorInstance = null;
  }
}

export default Collector;
