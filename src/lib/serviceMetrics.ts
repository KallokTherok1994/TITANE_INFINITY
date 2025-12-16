/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v15 - Service Metrics
 * Tracking latency, error rate, retry count, cache hits
 * Phase 5: Optimized with intelligent caching
 * ═══════════════════════════════════════════════════════════════
 */

import { MetricsCache } from './metricsCache';
import type { ServiceMetric, ServiceStats, CommandStats } from './metricsTypes';

// ────────────────────────────────────────────────────────────────
// Types (Re-exported)
// ────────────────────────────────────────────────────────────────

export type { ServiceMetric, ServiceStats, CommandStats };

// ────────────────────────────────────────────────────────────────
// Metrics Tracker
// ────────────────────────────────────────────────────────────────

export class ServiceMetrics {
  private static metrics: ServiceMetric[] = [];

  /**
   * Obtenir tous les services avec métriques
   */
  static getAllServices(): string[] {
    const services = new Set<string>();
    for (const metric of this.metrics) {
      services.add(metric.service);
    }
    return Array.from(services);
  }
  private static activeMetrics = new Map<string, ServiceMetric>();
  private static MAX_METRICS = 1000;
  private static enabled = true;

  /**
   * Démarrer mesure métrique
   */
  static startMetric(command: string, service: string): string {
    if (!this.enabled) return '';

    const id = `${service}_${command}_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const now = Date.now();
    const metric: ServiceMetric = {
      command,
      service,
      timestamp: now,
      latency: 0,
      success: false,
      cached: false,
      retried: false,
      startTime: now,
      retries: 0,
    };

    // Stocker temporairement dans Map pour récupération rapide
    this.activeMetrics.set(id, metric);

    return id;
  }

  /**
   * Terminer mesure métrique
   */
  static endMetric(id: string, success: boolean, error?: string, retries = 0): void {
    if (!this.enabled || !id) return;

    const metric = this.activeMetrics.get(id);
    if (!metric) return;

    const endTime = Date.now();
    const startTime = metric.startTime ?? metric.timestamp;

    metric.endTime = endTime;
    metric.duration = endTime - startTime;
    metric.latency = metric.duration;
    metric.success = success;
    metric.retries = retries ?? 0;
    metric.retried = (retries ?? 0) > 0;
    metric.error = error;

    // Ajouter aux métriques historiques
    this.metrics.push(metric);
    if (typeof console !== 'undefined' && process?.env?.VITEST_WORKER_ID) {
      console.log('[ServiceMetrics] endMetric', {
        service: metric.service,
        command: metric.command,
        success: metric.success,
        retries: metric.retries,
        error: metric.error,
      });
      console.log('[ServiceMetrics] metrics length =', this.metrics.length);
    }

    // Limiter taille
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }

    // Notifier cache du changement
    MetricsCache.updateMetricsCount(this.metrics.length);

    // Nettoyer active metrics
    this.activeMetrics.delete(id);
  }

  /**
   * Enregistrer métrique complète (wrapper)
   */
  static recordMetric(
    command: string,
    service: string,
    duration: number,
    success: boolean,
    retries = 0,
    error?: string
  ): void {
    if (!this.enabled) return;

    const metric: ServiceMetric = {
      command,
      service,
      startTime: Date.now() - duration,
      endTime: Date.now(),
      duration,
      success,
      retries,
      error,
    };

    this.metrics.push(metric);

    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }

    // Notifier cache du changement
    MetricsCache.updateMetricsCount(this.metrics.length);
  }

  /**
   * Statistiques par service
   */
  static getServiceStats(service: string, timeWindow?: number): ServiceStats {
    const cacheKey = `${service}_${timeWindow || 'all'}`;

    return MetricsCache.getServiceStats(cacheKey, this.metrics.length, () =>
      this.calculateServiceStats(service, timeWindow)
    );
  }

  /**
   * Calculer stats service (appelé si cache miss)
   */
  private static calculateServiceStats(
    service: string,
    timeWindow?: number
  ): ServiceStats {
    const now = Date.now();
    const windowStart = timeWindow ? now - timeWindow : 0;

    const serviceMetrics = this.metrics.filter(
      m =>
        m.service === service &&
        (m.startTime ?? m.timestamp) >= windowStart &&
        m.duration !== undefined
    );

    if (serviceMetrics.length === 0) {
      return {
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        totalRetries: 0,
        averageLatency: 0,
        minLatency: 0,
        maxLatency: 0,
        errorRate: 0,
        successRate: 0,
        cacheHitRate: 0,
        retryRate: 0,
        p50Latency: 0,
        p95Latency: 0,
        p99Latency: 0,
      };
    }

    const totalCalls = serviceMetrics.length;
    const successfulCalls = serviceMetrics.filter(m => m.success).length;
    const failedCalls = totalCalls - successfulCalls;
    const totalRetries = serviceMetrics.reduce((sum, m) => sum + (m.retries ?? 0), 0);

    const durations = serviceMetrics
      .map(m => m.duration as number)
      .filter(d => d !== undefined)
      .sort((a, b) => a - b);

    const averageLatency =
      durations.reduce((sum, d) => sum + d, 0) / durations.length || 0;
    const minLatency = durations[0] || 0;
    const maxLatency = durations[durations.length - 1] || 0;
    const errorRate = failedCalls / totalCalls || 0;

    // Percentiles
    const p50Index = Math.floor(durations.length * 0.5);
    const p95Index = Math.floor(durations.length * 0.95);
    const p99Index = Math.floor(durations.length * 0.99);

    const successRate = totalCalls > 0 ? successfulCalls / totalCalls : 0;
    const retryRate = totalCalls > 0 ? totalRetries / totalCalls : 0;

    return {
      totalCalls,
      successfulCalls,
      failedCalls,
      totalRetries,
      averageLatency: Math.round(averageLatency),
      minLatency,
      maxLatency,
      errorRate: Math.round(errorRate * 100) / 100,
      successRate: Math.round(successRate * 100) / 100,
      cacheHitRate: 0, // TODO: track cache hits
      retryRate: Math.round(retryRate * 100) / 100,
      p50Latency: durations[p50Index] || 0,
      p95Latency: durations[p95Index] || 0,
      p99Latency: durations[p99Index] || 0,
    };
  }

  /**
   * Top commandes par volume
   */
  static getTopCommands(limit = 10): CommandStats[] {
    const cacheKey = `top_${limit}`;

    return MetricsCache.getCommandStats(cacheKey, this.metrics.length, () =>
      this.calculateTopCommands(limit)
    );
  }

  /**
   * Calculer top commandes (appelé si cache miss)
   */
  private static calculateTopCommands(limit: number): CommandStats[] {
    const commandMap = new Map<string, ServiceMetric[]>();

    for (const metric of this.metrics) {
      const key = `${metric.service}.${metric.command}`;
      if (!commandMap.has(key)) {
        commandMap.set(key, []);
      }
      const arr = commandMap.get(key);
      if (arr) arr.push(metric);
    }

    const commandStats: CommandStats[] = [];

    for (const [command, metrics] of Array.from(commandMap.entries())) {
      const durations = metrics
        .filter(m => m.duration !== undefined)
        .map(m => m.duration as number);
      const avgLatency = durations.reduce((sum, d) => sum + d, 0) / durations.length || 0;
      const failed = metrics.filter(m => !m.success).length;
      const errorRate = failed / metrics.length || 0;
      const lastCall = Math.max(...metrics.map(m => m.startTime ?? m.timestamp ?? 0));

      commandStats.push({
        command,
        calls: metrics.length,
        avgLatency: Math.round(avgLatency),
        errorRate: Math.round(errorRate * 100) / 100,
        lastCall,
      });
    }

    return commandStats.sort((a, b) => b.calls - a.calls).slice(0, limit);
  }

  /**
   * Commandes les plus lentes
   */
  static getSlowestCommands(limit = 10): CommandStats[] {
    const cacheKey = `slowest_${limit}`;

    return MetricsCache.getCommandStats(cacheKey, this.metrics.length, () =>
      this.calculateSlowestCommands(limit)
    );
  }

  /**
   * Calculer commandes lentes (appelé si cache miss)
   */
  private static calculateSlowestCommands(limit: number): CommandStats[] {
    const commandMap = new Map<string, ServiceMetric[]>();

    for (const metric of this.metrics) {
      const key = `${metric.service}.${metric.command}`;
      if (!commandMap.has(key)) {
        commandMap.set(key, []);
      }
      const arr = commandMap.get(key);
      if (arr) arr.push(metric);
    }

    const commandStats: CommandStats[] = [];

    for (const [command, metrics] of Array.from(commandMap.entries())) {
      const durations = metrics
        .filter(m => m.duration !== undefined)
        .map(m => m.duration as number);
      if (durations.length === 0) continue;

      const avgLatency = durations.reduce((sum, d) => sum + d, 0) / durations.length || 0;
      const failed = metrics.filter(m => !m.success).length;
      const errorRate = failed / metrics.length || 0;
      const lastCall = Math.max(...metrics.map(m => m.startTime ?? m.timestamp ?? 0));

      commandStats.push({
        command,
        calls: metrics.length,
        avgLatency: Math.round(avgLatency),
        errorRate: Math.round(errorRate * 100) / 100,
        lastCall,
      });
    }

    return commandStats.sort((a, b) => b.avgLatency - a.avgLatency).slice(0, limit);
  }

  /**
   * Commandes avec le plus d'erreurs
   */
  static getErrorProneCommands(limit = 10): CommandStats[] {
    const cacheKey = `errors_${limit}`;

    return MetricsCache.getCommandStats(cacheKey, this.metrics.length, () =>
      this.calculateErrorProneCommands(limit)
    );
  }

  /**
   * Calculer commandes avec erreurs (appelé si cache miss)
   */
  private static calculateErrorProneCommands(limit: number): CommandStats[] {
    const commandMap = new Map<string, ServiceMetric[]>();

    for (const metric of this.metrics) {
      const key = `${metric.service}.${metric.command}`;
      if (!commandMap.has(key)) {
        commandMap.set(key, []);
      }
      const arr = commandMap.get(key);
      if (arr) arr.push(metric);
    }

    const commandStats: CommandStats[] = [];

    for (const [command, metrics] of Array.from(commandMap.entries())) {
      const durations = metrics
        .filter(m => m.duration !== undefined)
        .map(m => m.duration as number);
      const avgLatency = durations.reduce((sum, d) => sum + d, 0) / durations.length || 0;
      const failed = metrics.filter(m => !m.success).length;
      const errorRate = failed / metrics.length || 0;
      const lastCall = Math.max(...metrics.map(m => m.startTime ?? m.timestamp ?? 0));

      if (failed > 0) {
        commandStats.push({
          command,
          calls: metrics.length,
          avgLatency: Math.round(avgLatency),
          errorRate: Math.round(errorRate * 100) / 100,
          lastCall,
        });
      }
    }

    return commandStats.sort((a, b) => b.errorRate - a.errorRate).slice(0, limit);
  }

  /**
   * Statistiques globales
   */
  static getGlobalStats(): {
    totalMetrics: number;
    services: string[];
    totalRetries: number;
    globalErrorRate: number;
    globalAvgLatency: number;
  } {
    return MetricsCache.getGlobalStats(this.metrics.length, () =>
      this.calculateGlobalStats()
    );
  }

  /**
   * Calculer stats globales (appelé si cache miss)
   */
  private static calculateGlobalStats(): {
    totalMetrics: number;
    services: string[];
    totalRetries: number;
    globalErrorRate: number;
    globalAvgLatency: number;
  } {
    const services = [...new Set(this.metrics.map(m => m.service))];
    const totalRetries = this.metrics.reduce((sum, m) => sum + (m.retries ?? 0), 0);
    const failed = this.metrics.filter(m => !m.success).length;
    const globalErrorRate = this.metrics.length > 0 ? failed / this.metrics.length : 0;
    const durations = this.metrics
      .filter(m => m.duration !== undefined)
      .map(m => m.duration as number);
    const globalAvgLatency =
      durations.length > 0
        ? durations.reduce((sum, d) => sum + d, 0) / durations.length
        : 0;

    return {
      totalMetrics: this.metrics.length,
      services,
      totalRetries,
      globalErrorRate: Math.round(globalErrorRate * 100) / 100,
      globalAvgLatency: Math.round(globalAvgLatency),
    };
  }

  /**
   * Effacer métriques
   */
  static clear(): void {
    this.metrics = [];
    this.activeMetrics.clear();
    MetricsCache.invalidateAll();
  }

  /**
   * Activer/désactiver tracking
   */
  static setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Export métriques
   */
  static export(): ServiceMetric[] {
    return [...this.metrics];
  }
}

// ────────────────────────────────────────────────────────────────
// Helper: Wrapper pour mesurer automatiquement
// ────────────────────────────────────────────────────────────────

/**
 * Décorateur pour mesurer performance
 */
export function measurePerformance(service: string, command: string) {
  return function <T extends (this: unknown, ...args: unknown[]) => Promise<unknown>>(
    _target: unknown,
    _propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const originalMethod = descriptor.value;
    if (!originalMethod) return descriptor;

    descriptor.value = async function (this: unknown, ...args: unknown[]) {
      const metricId = ServiceMetrics.startMetric(command, service);
      const retries = 0;

      try {
        const result = await originalMethod.apply(this, args);
        ServiceMetrics.endMetric(metricId, true, undefined, retries);
        return result;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        ServiceMetrics.endMetric(metricId, false, errorMsg, retries);
        throw error;
      }
    } as T;

    return descriptor;
  };
}
