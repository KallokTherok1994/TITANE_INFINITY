/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * TITANE∞ EVOLUTION ENGINE — Collector (Learning Collector)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @file        collector.ts
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
} from './evolutionEngine.config';
import {
  generateEvolutionId as _generateEvolutionId,
  createDataPoint,
  DEFAULT_COLLECTOR_CONFIG,
} from './evolutionEngine.config';

// =============================================================================
// TYPES INTERNES
// =============================================================================

interface CollectorState {
  dataPoints: EvolutionDataPoint[];
  iaStats: IAUsageStats;
  engineStats: Map<TitaneModule, EngineUsageStats>;
  lastCollectTime: number;
  isCollecting: boolean;
}

type DataPointListener = (dataPoint: EvolutionDataPoint) => void;
type BatchListener = (batch: EvolutionDataPoint[]) => void;

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
  private collectIntervalId: NodeJS.Timeout | null = null;
  private pendingBatch: EvolutionDataPoint[] = [];

  constructor(config?: Partial<CollectorConfig>) {
    this.config = { ...DEFAULT_COLLECTOR_CONFIG, ...config };
    this.state = this.createInitialState();
  }

  // ===========================================================================
  // INITIALISATION
  // ===========================================================================

  private createInitialState(): CollectorState {
    return {
      dataPoints: [],
      iaStats: this.createEmptyIAStats(),
      engineStats: new Map(),
      lastCollectTime: Date.now(),
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

  private createEmptyEngineStats(moduleId: TitaneModule): EngineUsageStats {
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
    if (!this.config.enabled) return;
    if (this.collectIntervalId) return;

    this.collectIntervalId = setInterval(() => {
      this.collectCycle();
    }, this.config.collectInterval);

    // Collecte initiale
    this.collectCycle();
  }

  /**
   * Arrête la collecte
   */
  stop(): void {
    if (this.collectIntervalId) {
      clearInterval(this.collectIntervalId);
      this.collectIntervalId = null;
    }
  }

  /**
   * Cycle de collecte principal
   */
  private async collectCycle(): Promise<void> {
    if (this.state.isCollecting) return;
    this.state.isCollecting = true;

    try {
      const categories = this.config.categories;

      // Collecter en parallèle les différentes catégories
      const promises: Promise<void>[] = [];

      if (categories.includes('IA_USAGE')) {
        promises.push(this.collectIAUsage());
      }
      if (categories.includes('ENGINE_USAGE')) {
        promises.push(this.collectEngineUsage());
      }
      if (categories.includes('PERFORMANCE')) {
        promises.push(this.collectPerformanceMetrics());
      }
      if (categories.includes('SELF_HEALING')) {
        promises.push(this.collectSelfHealingMetrics());
      }
      if (categories.includes('PROMPT_MEMORY')) {
        promises.push(this.collectPromptMemoryMetrics());
      }
      if (categories.includes('SYSTEM_METRICS')) {
        promises.push(this.collectSystemMetrics());
      }

      await Promise.all(promises);

      // Flush le batch si nécessaire
      if (this.pendingBatch.length >= this.config.batchSize) {
        await this.flushBatch();
      }

      this.state.lastCollectTime = Date.now();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        'Evolution collector cycle failed',
        { component: 'EvolutionCollector', action: 'collect' },
        err
      );
    } finally {
      this.state.isCollecting = false;
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
      this.state.iaStats.totalQueries = stats.total_queries;
      this.state.iaStats.ollamaQueries = stats.ollama_queries;
      this.state.iaStats.geminiQueries = stats.gemini_queries;
      this.state.iaStats.averageLatency = stats.avg_latency;
      this.state.iaStats.errorRate = stats.error_rate;

      // Créer des data points
      this.addDataPoint('IA_USAGE', 'chat', 'total_queries', stats.total_queries);
      this.addDataPoint('IA_USAGE', 'chat', 'avg_latency', stats.avg_latency);
      this.addDataPoint('IA_USAGE', 'chat', 'error_rate', stats.error_rate);

      // Détecter l'heure de pic
      const hour = new Date().getHours();
      if (!this.state.iaStats.peakUsageHours.includes(hour) && stats.total_queries > 0) {
        this.state.iaStats.peakUsageHours.push(hour);
      }
    } catch (error) {
      // Silencieux si le backend n'est pas disponible
      console.debug('[Collector] IA stats non disponibles');
    }
  }

  // ===========================================================================
  // COLLECTE — ENGINE USAGE
  // ===========================================================================

  /**
   * Collecte les statistiques d'usage des moteurs
   */
  private async collectEngineUsage(): Promise<void> {
    const modules: TitaneModule[] = [
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

    for (const moduleId of modules) {
      if (this.config.excludedModules.includes(moduleId)) continue;

      try {
        const stats = await secureInvoke<{
          total_calls: number;
          error_count: number;
          avg_latency: number;
          last_used: number;
        }>('get_engine_stats', { moduleId });

        const engineStats = this.getOrCreateEngineStats(moduleId);
        engineStats.totalCalls = stats.total_calls;
        engineStats.errorCount = stats.error_count;
        engineStats.averageLatency = stats.avg_latency;
        engineStats.lastUsed = stats.last_used;
        engineStats.successRate =
          stats.total_calls > 0
            ? ((stats.total_calls - stats.error_count) / stats.total_calls) * 100
            : 100;

        this.addDataPoint('ENGINE_USAGE', moduleId, 'total_calls', stats.total_calls);
        this.addDataPoint('ENGINE_USAGE', moduleId, 'error_count', stats.error_count);
        this.addDataPoint('ENGINE_USAGE', moduleId, 'avg_latency', stats.avg_latency);
      } catch {
        // Module stats non disponibles
      }
    }
  }

  private getOrCreateEngineStats(moduleId: TitaneModule): EngineUsageStats {
    let stats = this.state.engineStats.get(moduleId);
    if (!stats) {
      stats = this.createEmptyEngineStats(moduleId);
      this.state.engineStats.set(moduleId, stats);
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

      this.addDataPoint('PERFORMANCE', 'performance', 'cpu', metrics.cpu);
      this.addDataPoint('PERFORMANCE', 'performance', 'ram', metrics.ram);
      this.addDataPoint('PERFORMANCE', 'performance', 'fps', metrics.fps);
      this.addDataPoint('PERFORMANCE', 'performance', 'latency', metrics.latency);
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

      this.addDataPoint(
        'SELF_HEALING',
        'selfHealing',
        'total_repairs',
        metrics.total_repairs
      );
      this.addDataPoint(
        'SELF_HEALING',
        'selfHealing',
        'success_rate',
        metrics.total_repairs > 0
          ? (metrics.successful_repairs / metrics.total_repairs) * 100
          : 100
      );
      this.addDataPoint(
        'SELF_HEALING',
        'selfHealing',
        'stability_score',
        metrics.stability_score
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

      this.addDataPoint('PROMPT_MEMORY', 'prompt', 'context_size', metrics.context_size);
      this.addDataPoint(
        'PROMPT_MEMORY',
        'memory',
        'compression_ratio',
        metrics.compression_ratio
      );
      this.addDataPoint(
        'PROMPT_MEMORY',
        'memory',
        'memory_utilization',
        metrics.memory_utilization
      );
      this.addDataPoint(
        'PROMPT_MEMORY',
        'prompt',
        'relevance_score',
        metrics.relevance_score
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

      this.addDataPoint('SYSTEM_METRICS', 'global', 'uptime', metrics.uptime);
      this.addDataPoint(
        'SYSTEM_METRICS',
        'global',
        'active_modules',
        metrics.active_modules
      );
      this.addDataPoint(
        'SYSTEM_METRICS',
        'global',
        'pending_tasks',
        metrics.pending_tasks
      );
      this.addDataPoint('SYSTEM_METRICS', 'global', 'memory_heap', metrics.memory_heap);
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
    tags: string[] = []
  ): EvolutionDataPoint {
    const dataPoint = createDataPoint(category, moduleId, metric, value, context, tags);

    // Ajouter au batch
    this.pendingBatch.push(dataPoint);

    // Ajouter à l'historique (avec limite)
    this.state.dataPoints.push(dataPoint);
    if (this.state.dataPoints.length > this.config.maxDataPoints) {
      this.state.dataPoints.shift();
    }

    // Notifier les listeners
    this.dataPointListeners.forEach(listener => {
      try {
        listener(dataPoint);
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        logger.error(
          'Evolution collector listener error',
          { component: 'EvolutionCollector', action: 'notifyDataPoint' },
          err
        );
      }
    });

    return dataPoint;
  }

  /**
   * Ajoute un data point manuellement (API publique)
   */
  record(
    category: DataCategory,
    moduleId: TitaneModule,
    metric: string,
    value: number | string | boolean,
    context?: Record<string, unknown>,
    tags: string[] = []
  ): void {
    if (!this.config.enabled) return;
    if (this.config.excludedModules.includes(moduleId)) return;
    if (!this.config.categories.includes(category)) return;

    this.addDataPoint(category, moduleId, metric, value, context, tags);
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
    this.record('ERROR_PATTERNS', moduleId, 'error', errorType, { message, ...context }, [
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
    this.record(
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
    if (this.pendingBatch.length === 0) return;

    const batch = [...this.pendingBatch];
    this.pendingBatch = [];

    try {
      await secureInvoke('submit_evolution_data', { dataPoints: batch });

      // Notifier les listeners de batch
      this.batchListeners.forEach(listener => {
        try {
          listener(batch);
        } catch (e) {
          const err = e instanceof Error ? e : new Error(String(e));
          logger.error(
            'Evolution collector batch listener error',
            { component: 'EvolutionCollector', action: 'flushBatch' },
            err
          );
        }
      });
    } catch (error) {
      // En cas d'erreur, remettre dans le batch
      this.pendingBatch = [...batch, ...this.pendingBatch];
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        'Evolution collector flush batch failed',
        {
          component: 'EvolutionCollector',
          action: 'flushBatch',
          batchSize: batch.length,
        },
        err
      );
    }
  }

  /**
   * Force le flush immédiat
   */
  async flush(): Promise<void> {
    await this.flushBatch();
  }

  // ===========================================================================
  // GETTERS
  // ===========================================================================

  /**
   * Récupère les data points récents
   */
  getRecentDataPoints(count: number = 100): EvolutionDataPoint[] {
    return this.state.dataPoints.slice(-count);
  }

  /**
   * Récupère les data points par catégorie
   */
  getDataPointsByCategory(
    category: DataCategory,
    count: number = 100
  ): EvolutionDataPoint[] {
    return this.state.dataPoints.filter(dp => dp.category === category).slice(-count);
  }

  /**
   * Récupère les data points par module
   */
  getDataPointsByModule(
    moduleId: TitaneModule,
    count: number = 100
  ): EvolutionDataPoint[] {
    return this.state.dataPoints.filter(dp => dp.moduleId === moduleId).slice(-count);
  }

  /**
   * Récupère les stats IA
   */
  getIAStats(): IAUsageStats {
    return { ...this.state.iaStats };
  }

  /**
   * Récupère les stats des moteurs
   */
  getEngineStats(): EngineUsageStats[] {
    return Array.from(this.state.engineStats.values());
  }

  /**
   * Récupère les stats d'un moteur spécifique
   */
  getEngineStatsFor(moduleId: TitaneModule): EngineUsageStats | null {
    return this.state.engineStats.get(moduleId) || null;
  }

  /**
   * Récupère une série temporelle pour une métrique
   */
  getTimeSeries(
    moduleId: TitaneModule,
    metric: string,
    windowMs: number = 3600000
  ): Array<{ timestamp: number; value: number }> {
    const cutoff = Date.now() - windowMs;
    return this.state.dataPoints
      .filter(
        dp =>
          dp.moduleId === moduleId &&
          dp.metric === metric &&
          dp.timestamp >= cutoff &&
          typeof dp.value === 'number'
      )
      .map(dp => ({ timestamp: dp.timestamp, value: dp.value as number }));
  }

  /**
   * Compte les data points par période
   */
  countDataPoints(windowMs: number = 86400000): number {
    const cutoff = Date.now() - windowMs;
    return this.state.dataPoints.filter(dp => dp.timestamp >= cutoff).length;
  }

  // ===========================================================================
  // LISTENERS
  // ===========================================================================

  /**
   * Ajoute un listener pour les nouveaux data points
   */
  onDataPoint(listener: DataPointListener): () => void {
    this.dataPointListeners.add(listener);
    return () => this.dataPointListeners.delete(listener);
  }

  /**
   * Ajoute un listener pour les batchs
   */
  onBatch(listener: BatchListener): () => void {
    this.batchListeners.add(listener);
    return () => this.batchListeners.delete(listener);
  }

  // ===========================================================================
  // MAINTENANCE
  // ===========================================================================

  /**
   * Purge les anciennes données
   */
  purgeOldData(olderThanDays?: number): number {
    const days = olderThanDays ?? this.config.retentionDays;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

    const before = this.state.dataPoints.length;
    this.state.dataPoints = this.state.dataPoints.filter(dp => dp.timestamp >= cutoff);

    return before - this.state.dataPoints.length;
  }

  /**
   * Réinitialise les statistiques
   */
  resetStats(): void {
    this.state.iaStats = this.createEmptyIAStats();
    this.state.engineStats.clear();
  }

  /**
   * Libère les ressources
   */
  dispose(): void {
    this.stop();
    this.dataPointListeners.clear();
    this.batchListeners.clear();
    this.pendingBatch = [];
    this.state.dataPoints = [];
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
  if (!collectorInstance) {
    collectorInstance = new Collector();
  }
  return collectorInstance;
}

/**
 * Réinitialise l'instance singleton (pour tests)
 */
export function resetCollector(): void {
  if (collectorInstance) {
    collectorInstance.dispose();
    collectorInstance = null;
  }
}

export default Collector;
