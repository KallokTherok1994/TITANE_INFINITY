/**
 * TITANE∞ v20Ω — Metrics Hub
 * Collecte des métriques en temps réel
 */

export interface MetricsSnapshot {
  timestamp: number;
  omegaLatency: number;
  engineLatencies: Record<string, number>;
  errorCount: number;
  requestCount: number;
  cacheHitRate: number;
  memoryUsage: number;
}

export interface LatencyRecord {
  engineId: string;
  latency: number;
  timestamp: number;
}

/**
 * Hub de métriques temps réel
 */
export class MetricsHub {
  private latencies: Map<string, number[]> = new Map();
  private errors: Map<string, number> = new Map();
  private requestCount = 0;
  private cacheHits = 0;
  private cacheMisses = 0;
  private history: MetricsSnapshot[] = [];
  private maxHistory = 100;

  /**
   * Enregistre une latence
   */
  recordLatency(engineId: string, latencyMs: number): void {
    if (!this.latencies.has(engineId)) {
      this.latencies.set(engineId, []);
    }
    const records = this.latencies.get(engineId)!;
    records.push(latencyMs);

    // Garder les 50 dernières valeurs
    if (records.length > 50) {
      records.shift();
    }

    this.requestCount++;
  }

  /**
   * Enregistre une erreur
   */
  recordError(source: string): void {
    const count = this.errors.get(source) ?? 0;
    this.errors.set(source, count + 1);
  }

  /**
   * Enregistre un hit/miss de cache
   */
  recordCache(hit: boolean): void {
    if (hit) {
      this.cacheHits++;
    } else {
      this.cacheMisses++;
    }
  }

  /**
   * Calcule la latence moyenne pour un moteur
   */
  getAverageLatency(engineId: string): number {
    const records = this.latencies.get(engineId);
    if (!records || records.length === 0) return 0;
    return records.reduce((a, b) => a + b, 0) / records.length;
  }

  /**
   * Calcule la latence OMEGA totale
   */
  getOmegaLatency(): number {
    let total = 0;
    for (const records of this.latencies.values()) {
      if (records.length > 0) {
        total += records[records.length - 1];
      }
    }
    return total;
  }

  /**
   * Retourne le taux de hit cache
   */
  getCacheHitRate(): number {
    const total = this.cacheHits + this.cacheMisses;
    if (total === 0) return 1;
    return this.cacheHits / total;
  }

  /**
   * Retourne le nombre total d'erreurs
   */
  getTotalErrors(): number {
    let total = 0;
    for (const count of this.errors.values()) {
      total += count;
    }
    return total;
  }

  /**
   * Tick - sauvegarde un snapshot
   */
  tick(): void {
    const snapshot = this.snapshot();
    this.history.push(snapshot);

    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  /**
   * Crée un snapshot actuel
   */
  snapshot(): MetricsSnapshot {
    const engineLatencies: Record<string, number> = {};
    for (const [id, records] of this.latencies.entries()) {
      if (records.length > 0) {
        engineLatencies[id] = records[records.length - 1];
      }
    }

    return {
      timestamp: Date.now(),
      omegaLatency: this.getOmegaLatency(),
      engineLatencies,
      errorCount: this.getTotalErrors(),
      requestCount: this.requestCount,
      cacheHitRate: this.getCacheHitRate(),
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  /**
   * Estimation de l'usage mémoire (simplifié)
   */
  private estimateMemoryUsage(): number {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as unknown as { memory?: { usedJSHeapSize?: number; jsHeapSizeLimit?: number } }).memory;
      if (memory?.usedJSHeapSize && memory.jsHeapSizeLimit) {
        return memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      }
    }
    return 0.5; // Valeur par défaut
  }

  /**
   * Retourne l'historique
   */
  getHistory(): MetricsSnapshot[] {
    return [...this.history];
  }

  /**
   * Réinitialise
   */
  reset(): void {
    this.latencies.clear();
    this.errors.clear();
    this.requestCount = 0;
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.history = [];
  }
}

export default MetricsHub;
