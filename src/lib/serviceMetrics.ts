/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v17.3.0 - Service Metrics
 * Tracking latency, error rate, retry count, cache hits
 * ═══════════════════════════════════════════════════════════════
 */

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

export interface ServiceMetric {
  command: string;
  service: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  retries: number;
  error?: string;
}

export interface ServiceStats {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  totalRetries: number;
  averageLatency: number;
  minLatency: number;
  maxLatency: number;
  errorRate: number; // 0-1
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;
}

export interface CommandStats {
  command: string;
  calls: number;
  avgLatency: number;
  errorRate: number;
  lastCall: number;
}

// ────────────────────────────────────────────────────────────────
// Metrics Tracker
// ────────────────────────────────────────────────────────────────

export class ServiceMetrics {
  private static metrics: ServiceMetric[] = [];
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

    const metric: ServiceMetric = {
      command,
      service,
      startTime: Date.now(),
      success: false,
      retries: 0,
    };

    // Stocker temporairement dans Map pour récupération rapide
    (this as any)._activeMetrics = (this as any)._activeMetrics || new Map();
    (this as any)._activeMetrics.set(id, metric);

    return id;
  }

  /**
   * Terminer mesure métrique
   */
  static endMetric(id: string, success: boolean, error?: string, retries = 0): void {
    if (!this.enabled || !id) return;

    const activeMetrics = (this as any)._activeMetrics as Map<string, ServiceMetric>;
    if (!activeMetrics) return;

    const metric = activeMetrics.get(id);
    if (!metric) return;

    metric.endTime = Date.now();
    metric.duration = metric.endTime - metric.startTime;
    metric.success = success;
    metric.retries = retries;
    metric.error = error;

    // Ajouter aux métriques historiques
    this.metrics.push(metric);

    // Limiter taille
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }

    // Nettoyer active metrics
    activeMetrics.delete(id);
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
  }

  /**
   * Statistiques par service
   */
  static getServiceStats(service: string, timeWindow?: number): ServiceStats {
    const now = Date.now();
    const windowStart = timeWindow ? now - timeWindow : 0;

    const serviceMetrics = this.metrics.filter(
      (m) => m.service === service && m.startTime >= windowStart && m.duration !== undefined
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
        p50Latency: 0,
        p95Latency: 0,
        p99Latency: 0,
      };
    }

    const totalCalls = serviceMetrics.length;
    const successfulCalls = serviceMetrics.filter((m) => m.success).length;
    const failedCalls = totalCalls - successfulCalls;
    const totalRetries = serviceMetrics.reduce((sum, m) => sum + m.retries, 0);

    const durations = serviceMetrics
      .map((m) => m.duration!)
      .filter((d) => d !== undefined)
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

    return {
      totalCalls,
      successfulCalls,
      failedCalls,
      totalRetries,
      averageLatency: Math.round(averageLatency),
      minLatency,
      maxLatency,
      errorRate: Math.round(errorRate * 100) / 100,
      p50Latency: durations[p50Index] || 0,
      p95Latency: durations[p95Index] || 0,
      p99Latency: durations[p99Index] || 0,
    };
  }

  /**
   * Top commandes par volume
   */
  static getTopCommands(limit = 10): CommandStats[] {
    const commandMap = new Map<string, ServiceMetric[]>();

    for (const metric of this.metrics) {
      const key = `${metric.service}.${metric.command}`;
      if (!commandMap.has(key)) {
        commandMap.set(key, []);
      }
      commandMap.get(key)!.push(metric);
    }

    const commandStats: CommandStats[] = [];

    for (const [command, metrics] of commandMap.entries()) {
      const durations = metrics
        .filter((m) => m.duration !== undefined)
        .map((m) => m.duration!);
      const avgLatency =
        durations.reduce((sum, d) => sum + d, 0) / durations.length || 0;
      const failed = metrics.filter((m) => !m.success).length;
      const errorRate = failed / metrics.length || 0;
      const lastCall = Math.max(...metrics.map((m) => m.startTime));

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
    const commandMap = new Map<string, ServiceMetric[]>();

    for (const metric of this.metrics) {
      const key = `${metric.service}.${metric.command}`;
      if (!commandMap.has(key)) {
        commandMap.set(key, []);
      }
      commandMap.get(key)!.push(metric);
    }

    const commandStats: CommandStats[] = [];

    for (const [command, metrics] of commandMap.entries()) {
      const durations = metrics
        .filter((m) => m.duration !== undefined)
        .map((m) => m.duration!);
      if (durations.length === 0) continue;

      const avgLatency =
        durations.reduce((sum, d) => sum + d, 0) / durations.length || 0;
      const failed = metrics.filter((m) => !m.success).length;
      const errorRate = failed / metrics.length || 0;
      const lastCall = Math.max(...metrics.map((m) => m.startTime));

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
    const commandMap = new Map<string, ServiceMetric[]>();

    for (const metric of this.metrics) {
      const key = `${metric.service}.${metric.command}`;
      if (!commandMap.has(key)) {
        commandMap.set(key, []);
      }
      commandMap.get(key)!.push(metric);
    }

    const commandStats: CommandStats[] = [];

    for (const [command, metrics] of commandMap.entries()) {
      const durations = metrics
        .filter((m) => m.duration !== undefined)
        .map((m) => m.duration!);
      const avgLatency =
        durations.reduce((sum, d) => sum + d, 0) / durations.length || 0;
      const failed = metrics.filter((m) => !m.success).length;
      const errorRate = failed / metrics.length || 0;
      const lastCall = Math.max(...metrics.map((m) => m.startTime));

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
    const services = [...new Set(this.metrics.map((m) => m.service))];
    const totalRetries = this.metrics.reduce((sum, m) => sum + m.retries, 0);
    const failed = this.metrics.filter((m) => !m.success).length;
    const globalErrorRate = this.metrics.length > 0 ? failed / this.metrics.length : 0;
    const durations = this.metrics
      .filter((m) => m.duration !== undefined)
      .map((m) => m.duration!);
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
    (this as any)._activeMetrics = new Map();
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
  return function <T extends (...args: any[]) => Promise<any>>(
    _target: any,
    _propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const originalMethod = descriptor.value!;

    descriptor.value = async function (...args: any[]) {
      const metricId = ServiceMetrics.startMetric(command, service);
      let retries = 0;

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
