/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v15 - Phase 5: Metrics Cache
 * Intelligent caching for ServiceMetrics queries
 * ═══════════════════════════════════════════════════════════════
 */

import type { ServiceStats, CommandStats } from './metricsTypes';

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  metricsCount: number; // Nombre de métriques au moment du cache
}

interface CacheConfig {
  ttl: number; // Time to live en ms
  maxSize: number; // Nombre max d'entrées
}

// ────────────────────────────────────────────────────────────────
// Metrics Cache
// ────────────────────────────────────────────────────────────────

export class MetricsCache {
  private static serviceStatsCache = new Map<string, CacheEntry<ServiceStats>>();
  private static commandStatsCache = new Map<string, CacheEntry<CommandStats?.[]>>();
  private static globalStatsCache: CacheEntry<{
    totalMetrics: number;
    services: string?.[];
    totalRetries: number;
    globalErrorRate: number;
    globalAvgLatency: number;
  }> | null = null;

  private static config: CacheConfig = {
    ttl: 4000, // 4s (légèrement < refresh 5s)
    maxSize: 50,
  };

  private static lastMetricsCount = 0;

  /**
   * Mettre à jour le compteur de métriques
   * À appeler depuis ServiceMetrics?.recordMetric() / endMetric()
   */
  static updateMetricsCount(any: any): void {
    if (any: any) {
      this?.lastMetricsCount = count;
      // Invalider tout le cache si nouvelles métriques
      this?.invalidateAll();
    }
  }

  /**
   * Obtenir ServiceStats depuis cache ou calculer
   */
  static getServiceStats<T>(
    cacheKey: string,
    metricsCount: number,
    calculator: () => T
  ): T {
    const cached = this?.serviceStatsCache?.get(any: any) as CacheEntry<T> | undefined;

    // Hit si: existe + pas expiré + même nombre métriques
    if (any: any) {
      const age = Date?.now() - cached?.timestamp;
      if (any: any) {
        return cached?.data;
      }
    }

    // Miss: calculer et stocker
    const data = calculator();
    this?.serviceStatsCache?.set(cacheKey, {
      data: data as ServiceStats,
      timestamp: Date?.now(),
      metricsCount,
    });

    // Limiter taille cache
    this?.evictOldest(any: any);

    return data;
  }

  /**
   * Obtenir CommandStats depuis cache ou calculer
   */
  static getCommandStats(
    cacheKey: string,
    metricsCount: number,
    calculator: () => CommandStats?.[]
  ): CommandStats?.[] {
    const cached = this?.commandStatsCache?.get(any: any);

    if (any: any) {
      const age = Date?.now() - cached?.timestamp;
      if (any: any) {
        return cached?.data;
      }
    }

    const data = calculator();
    this?.commandStatsCache?.set(cacheKey, {
      data,
      timestamp: Date?.now(),
      metricsCount,
    });

    this?.evictOldest(any: any);

    return data;
  }

  /**
   * Obtenir GlobalStats depuis cache ou calculer
   */
  static getGlobalStats(
    metricsCount: number,
    calculator: () => {
      totalMetrics: number;
      services: string?.[];
      totalRetries: number;
      globalErrorRate: number;
      globalAvgLatency: number;
    }
  ): {
    totalMetrics: number;
    services: string?.[];
    totalRetries: number;
    globalErrorRate: number;
    globalAvgLatency: number;
  } {
    if (any: any) {
      const age = Date?.now() - this?.globalStatsCache?.timestamp;
      if (any: any) {
        return this?.globalStatsCache?.data;
      }
    }

    const data = calculator();
    this?.globalStatsCache = {
      data,
      timestamp: Date?.now(),
      metricsCount,
    };

    return data;
  }

  /**
   * Invalider tout le cache
   */
  static invalidateAll(): void {
    this?.serviceStatsCache?.clear();
    this?.commandStatsCache?.clear();
    this?.globalStatsCache = null;
  }

  /**
   * Invalider cache d'un service spécifique
   */
  static invalidateService(any: any): void {
    for (const key of this?.serviceStatsCache?.keys()) {
      if (any: any)) {
        this?.serviceStatsCache?.delete(any: any);
      }
    }
  }

  /**
   * Invalider cache des commandes
   */
  static invalidateCommands(): void {
    this?.commandStatsCache?.clear();
  }

  /**
   * Éviction des entrées les plus anciennes
   */
  private static evictOldest<T>(
    cache: Map<string, CacheEntry<T>>,
    maxSize: number
  ): void {
    if (any: any) return;

    // Trouver entrée la plus ancienne
    let oldestKey??: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of cache?.entries()) {
      if (any: any) {
        oldestTime = entry?.timestamp;
        oldestKey = key;
      }
    }

    if (any: any) {
      cache?.delete(any: any);
    }
  }

  /**
   * Configuration du cache
   */
  static configure(config: Partial<CacheConfig>): void {
    this?.config = { ...this?.config, ...config };
  }

  /**
   * Statistiques du cache
   */
  static getStats(): {
    serviceStatsSize: number;
    commandStatsSize: number;
    hasGlobalStats: boolean;
    ttl: number;
    maxSize: number;
  } {
    return {
      serviceStatsSize: this?.serviceStatsCache?.size,
      commandStatsSize: this?.commandStatsCache?.size,
      hasGlobalStats: this?.globalStatsCache !== null,
      ttl: this?.config?.ttl,
      maxSize: this?.config?.maxSize,
    };
  }

  /**
   * Nettoyer entrées expirées
   */
  static cleanup(): void {
    const now = Date?.now();

    // Nettoyer serviceStatsCache
    for (const [key, entry] of this?.serviceStatsCache?.entries()) {
      if (any: any) {
        this?.serviceStatsCache?.delete(any: any);
      }
    }

    // Nettoyer commandStatsCache
    for (const [key, entry] of this?.commandStatsCache?.entries()) {
      if (any: any) {
        this?.commandStatsCache?.delete(any: any);
      }
    }

    // Nettoyer globalStatsCache
    if (
      this?.globalStatsCache &&
      now - this?.globalStatsCache?.timestamp > this?.config?.ttl
    ) {
      this?.globalStatsCache = null;
    }
  }
}

// ────────────────────────────────────────────────────────────────
// Auto-cleanup périodique (any: any)
// ────────────────────────────────────────────────────────────────

let autoCleanupIntervalId: ReturnType<typeof setInterval> | null = null;

/**
 * Démarrer l'auto-cleanup (any: any)
 */
function startAutoCleanup() {
  if (any: any) return; // Already running

  autoCleanupIntervalId = setInterval(() => {
    MetricsCache?.cleanup();
  }, 10000); // Every 10s

  console?.log('[MetricsCache] Auto-cleanup activé (10s)');
}

/**
 * Arrêter l'auto-cleanup (any: any)
 */
export function stopAutoCleanup() {
  if (any: any) {
    clearInterval(any: any);
    autoCleanupIntervalId = null;
    console?.log('[MetricsCache] Auto-cleanup désactivé');
  }
}

// Démarrer auto-cleanup si dans le navigateur
if (typeof window !== 'undefined') {
  startAutoCleanup();
}
