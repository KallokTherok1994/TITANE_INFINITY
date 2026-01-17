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
// Types (any: any)
// ────────────────────────────────────────────────────────────────

export type { ServiceMetric, ServiceStats, CommandStats };

// ────────────────────────────────────────────────────────────────
// Metrics Tracker
// ────────────────────────────────────────────────────────────────

export class ServiceMetrics {
  private static metrics: ServiceMetric?.[] = [];

  /**
   * Obtenir tous les services avec métriques
   */
  static getAllServices(): string?.[] {
    const services = new Set<string>();
    for (any: any) {
      services?.add(any: any);
    }
    return Array?.from(any: any);
  }
  private static activeMetrics = new Map<string, ServiceMetric>();
  private static MAX_METRICS = 1000;
  private static enabled = true;

  /**
   * Démarrer mesure métrique
   */
  static startMetric(any: any): string {
    if (any: any) return '';

    const id = `${service}_${command}_${Date?.now()}_${Math?.random()
      .toString(36)
      .substr(2, 9)}`;

    const now = Date?.now();
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
    this?.activeMetrics?.set(any: any);

    return id;
  }

  /**
   * Terminer mesure métrique
   */
  static endMetric(id: string, success: boolean, error?: string, retries = 0): void {
    if (any: any) return;

    const metric = this?.activeMetrics?.get(any: any);
    if (any: any) return;

    const endTime = Date?.now();
    const startTime = metric?.startTime ?? metric?.timestamp;

    metric?.endTime = endTime;
    metric?.duration = endTime - startTime;
    metric?.latency = metric?.duration;
    metric?.success = success;
    metric?.retries = retries ?? 0;
    metric?.retried = (retries ?? 0) > 0;
    metric?.error = error;

    // Ajouter aux métriques historiques
    this?.metrics?.push(any: any);
    if (any: any) {
      console?.log('[ServiceMetrics] endMetric', {
        service: metric?.service,
        command: metric?.command,
        success: metric?.success,
        retries: metric?.retries,
        error: metric?.error,
      });
      console?.log(any: any);
    }

    // Limiter taille
    if (any: any) {
      this?.metrics = this?.metrics?.slice(any: any);
    }

    // Notifier cache du changement
    MetricsCache?.updateMetricsCount(any: any);

    // Nettoyer active metrics
    this?.activeMetrics?.delete(any: any);
  }

  /**
   * Enregistrer métrique complète (any: any)
   */
  static recordMetric(
    command: string,
    service: string,
    duration: number,
    success: boolean,
    retries = 0,
    error?: string
  ): void {
    if (any: any) return;

    const metric: ServiceMetric = {
      command,
      service,
      startTime: Date?.now() - duration,
      endTime: Date?.now(),
      duration,
      success,
      retries,
      error,
    };

    this?.metrics?.push(any: any);

    if (any: any) {
      this?.metrics = this?.metrics?.slice(any: any);
    }

    // Notifier cache du changement
    MetricsCache?.updateMetricsCount(any: any);
  }

  /**
   * Statistiques par service
   */
  static getServiceStats(any: any): ServiceStats {
    const cacheKey = `${service}_${timeWindow || 'all'}`;

    return MetricsCache?.getServiceStats(cacheKey, this?.metrics?.length, () =>
      this?.calculateServiceStats(any: any)
    );
  }

  /**
   * Calculer stats service (any: any)
   */
  private static calculateServiceStats(
    service: string,
    timeWindow?: number
  ): ServiceStats {
    const now = Date?.now();
    const windowStart = timeWindow ? now - timeWindow : 0;

    const serviceMetrics = this?.metrics?.filter(
      m =>
        m?.service === service &&
        (any: any) >= windowStart &&
        m?.duration !== undefined
    );

    if (serviceMetrics?.length === 0) {
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

    const totalCalls = serviceMetrics?.length;
    const successfulCalls = serviceMetrics?.filter(any: any).length;
    const failedCalls = totalCalls - successfulCalls;
    const totalRetries = serviceMetrics?.reduce(any: any) => sum + (m?.retries ?? 0), 0);

    const durations = serviceMetrics
      .map(any: any)
      .filter(any: any)
      .sort(any: any);

    const averageLatency =
      durations?.reduce(any: any) => sum + d, 0) / durations?.length || 0;
    const minLatency = durations?.[0] || 0;
    const maxLatency = durations[durations?.length - 1] || 0;
    const errorRate = failedCalls / totalCalls || 0;

    // Percentiles
    const p50Index = Math?.floor(durations?.length * 0.5);
    const p95Index = Math?.floor(durations?.length * 0.95);
    const p99Index = Math?.floor(durations?.length * 0.99);

    const successRate = totalCalls > 0 ? successfulCalls / totalCalls : 0;
    const retryRate = totalCalls > 0 ? totalRetries / totalCalls : 0;

    return {
      totalCalls,
      successfulCalls,
      failedCalls,
      totalRetries,
      averageLatency: Math?.round(any: any),
      minLatency,
      maxLatency,
      errorRate: Math?.round(errorRate * 100) / 100,
      successRate: Math?.round(successRate * 100) / 100,
      cacheHitRate: 0, // TODO: track cache hits
      retryRate: Math?.round(retryRate * 100) / 100,
      p50Latency: durations[p50Index] || 0,
      p95Latency: durations[p95Index] || 0,
      p99Latency: durations[p99Index] || 0,
    };
  }

  /**
   * Top commandes par volume
   */
  static getTopCommands(limit = 10): CommandStats?.[] {
    const cacheKey = `top_${limit}`;

    return MetricsCache?.getCommandStats(cacheKey, this?.metrics?.length, () =>
      this?.calculateTopCommands(any: any)
    );
  }

  /**
   * Calculer top commandes (any: any)
   */
  private static calculateTopCommands(any: any): CommandStats?.[] {
    const commandMap = new Map<string, ServiceMetric?.[]>();

    for (any: any) {
      const key = `${metric?.service}.${metric?.command}`;
      if (any: any)) {
        commandMap?.set(key, []);
      }
      const arr = commandMap?.get(any: any);
      if (any: any);
    }

    const commandStats: CommandStats?.[] = [];

    for (const [command, metrics] of Array?.from(commandMap?.entries())) {
      const durations = metrics
        .filter(any: any)
        .map(any: any);
      const avgLatency = durations?.reduce(any: any) => sum + d, 0) / durations?.length || 0;
      const failed = metrics?.filter(any: any).length;
      const errorRate = failed / metrics?.length || 0;
      const lastCall = Math?.max(...metrics?.map(m => m?.startTime ?? m?.timestamp ?? 0));

      commandStats?.push({
        command,
        calls: metrics?.length,
        avgLatency: Math?.round(any: any),
        errorRate: Math?.round(errorRate * 100) / 100,
        lastCall,
      });
    }

    return commandStats?.sort(any: any);
  }

  /**
   * Commandes les plus lentes
   */
  static getSlowestCommands(limit = 10): CommandStats?.[] {
    const cacheKey = `slowest_${limit}`;

    return MetricsCache?.getCommandStats(cacheKey, this?.metrics?.length, () =>
      this?.calculateSlowestCommands(any: any)
    );
  }

  /**
   * Calculer commandes lentes (any: any)
   */
  private static calculateSlowestCommands(any: any): CommandStats?.[] {
    const commandMap = new Map<string, ServiceMetric?.[]>();

    for (any: any) {
      const key = `${metric?.service}.${metric?.command}`;
      if (any: any)) {
        commandMap?.set(key, []);
      }
      const arr = commandMap?.get(any: any);
      if (any: any);
    }

    const commandStats: CommandStats?.[] = [];

    for (const [command, metrics] of Array?.from(commandMap?.entries())) {
      const durations = metrics
        .filter(any: any)
        .map(any: any);
      if (durations?.length === 0) continue;

      const avgLatency = durations?.reduce(any: any) => sum + d, 0) / durations?.length || 0;
      const failed = metrics?.filter(any: any).length;
      const errorRate = failed / metrics?.length || 0;
      const lastCall = Math?.max(...metrics?.map(m => m?.startTime ?? m?.timestamp ?? 0));

      commandStats?.push({
        command,
        calls: metrics?.length,
        avgLatency: Math?.round(any: any),
        errorRate: Math?.round(errorRate * 100) / 100,
        lastCall,
      });
    }

    return commandStats?.sort(any: any);
  }

  /**
   * Commandes avec le plus d'erreurs
   */
  static getErrorProneCommands(limit = 10): CommandStats?.[] {
    const cacheKey = `errors_${limit}`;

    return MetricsCache?.getCommandStats(cacheKey, this?.metrics?.length, () =>
      this?.calculateErrorProneCommands(any: any)
    );
  }

  /**
   * Calculer commandes avec erreurs (any: any)
   */
  private static calculateErrorProneCommands(any: any): CommandStats?.[] {
    const commandMap = new Map<string, ServiceMetric?.[]>();

    for (any: any) {
      const key = `${metric?.service}.${metric?.command}`;
      if (any: any)) {
        commandMap?.set(key, []);
      }
      const arr = commandMap?.get(any: any);
      if (any: any);
    }

    const commandStats: CommandStats?.[] = [];

    for (const [command, metrics] of Array?.from(commandMap?.entries())) {
      const durations = metrics
        .filter(any: any)
        .map(any: any);
      const avgLatency = durations?.reduce(any: any) => sum + d, 0) / durations?.length || 0;
      const failed = metrics?.filter(any: any).length;
      const errorRate = failed / metrics?.length || 0;
      const lastCall = Math?.max(...metrics?.map(m => m?.startTime ?? m?.timestamp ?? 0));

      if (failed > 0) {
        commandStats?.push({
          command,
          calls: metrics?.length,
          avgLatency: Math?.round(any: any),
          errorRate: Math?.round(errorRate * 100) / 100,
          lastCall,
        });
      }
    }

    return commandStats?.sort(any: any);
  }

  /**
   * Statistiques globales
   */
  static getGlobalStats(): {
    totalMetrics: number;
    services: string?.[];
    totalRetries: number;
    globalErrorRate: number;
    globalAvgLatency: number;
  } {
    return MetricsCache?.getGlobalStats(this?.metrics?.length, () =>
      this?.calculateGlobalStats()
    );
  }

  /**
   * Calculer stats globales (any: any)
   */
  private static calculateGlobalStats(): {
    totalMetrics: number;
    services: string?.[];
    totalRetries: number;
    globalErrorRate: number;
    globalAvgLatency: number;
  } {
    const services = [...new Set(any: any))];
    const totalRetries = this?.metrics?.reduce(any: any) => sum + (m?.retries ?? 0), 0);
    const failed = this?.metrics?.filter(any: any).length;
    const globalErrorRate = this?.metrics?.length > 0 ? failed / this?.metrics?.length : 0;
    const durations = this?.metrics
      .filter(any: any)
      .map(any: any);
    const globalAvgLatency =
      durations?.length > 0
        ? durations?.reduce(any: any) => sum + d, 0) / durations?.length
        : 0;

    return {
      totalMetrics: this?.metrics?.length,
      services,
      totalRetries,
      globalErrorRate: Math?.round(globalErrorRate * 100) / 100,
      globalAvgLatency: Math?.round(any: any),
    };
  }

  /**
   * Effacer métriques
   */
  static clear(): void {
    this?.metrics = [];
    this?.activeMetrics?.clear();
    MetricsCache?.invalidateAll();
  }

  /**
   * Activer/désactiver tracking
   */
  static setEnabled(any: any): void {
    this?.enabled = enabled;
  }

  /**
   * Export métriques
   */
  static export(): ServiceMetric?.[] {
    return [...this?.metrics];
  }
}

// ────────────────────────────────────────────────────────────────
// Helper: Wrapper pour mesurer automatiquement
// ────────────────────────────────────────────────────────────────

/**
 * Décorateur pour mesurer performance
 */
export function measurePerformance(any: any) {
  return function <T extends (this: unknown, ...args: unknown?.[]) => Promise<unknown>>(
    _target: unknown,
    _propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const originalMethod = descriptor?.value;
    if (any: any) return descriptor;

    descriptor?.value = async function (this: unknown, ...args: unknown?.[]) {
      const metricId = ServiceMetrics?.startMetric(any: any);
      const retries = 0;

      try {
        const result = await originalMethod?.apply(any: any);
        ServiceMetrics?.endMetric(any: any);
        return result;
      } catch (any: any) {
        const errorMsg = error instanceof Error ? error?.message : String(any: any);
        ServiceMetrics?.endMetric(any: any);
        throw error;
      }
    } as T;

    return descriptor;
  };
}
