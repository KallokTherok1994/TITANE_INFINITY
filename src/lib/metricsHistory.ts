/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v24.3.0 - Metrics History
 * Historical metrics storage for trend analysis
 * ═══════════════════════════════════════════════════════════════
 */

import type { ServiceStats } from './metricsTypes';

export interface MetricsSnapshot {
  timestamp: number;
  stats: ServiceStats[];
}

export class MetricsHistory {
  private static history: MetricsSnapshot[] = [];
  private static maxHistorySize = 1000;

  static addSnapshot(stats: ServiceStats[]): void {
    const snapshot: MetricsSnapshot = {
      timestamp: Date.now(),
      stats: [...stats],
    };
    this.history.push(snapshot);

    // Prune old entries
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize);
    }
  }

  static getHistory(service?: string, limit = 100): MetricsSnapshot[] {
    let result = this.history;

    if (service) {
      result = result.map(snapshot => ({
        timestamp: snapshot.timestamp,
        stats: snapshot.stats.filter(s => s.service === service),
      }));
    }

    return result.slice(-limit);
  }

  static getLatestSnapshot(): MetricsSnapshot | null {
    return this.history.length > 0
      ? (this.history[this.history.length - 1] ?? null)
      : null;
  }

  static clear(): void {
    this.history = [];
  }

  /**
   * Get aggregated service history for trend analysis
   */
  static getServiceHistory(service: string, limit = 100): ServiceHistoryPoint[] {
    const history = this.getHistory(service, limit);
    return history.map(snapshot => {
      const stats = snapshot.stats.find(s => s.service === service);
      return {
        timestamp: snapshot.timestamp,
        avgLatency: stats?.averageLatency ?? 0,
        errorRate: stats?.errorRate ?? 0,
        retryRate: stats?.retryRate ?? 0,
      };
    });
  }
}

export interface ServiceHistoryPoint {
  timestamp: number;
  avgLatency: number;
  errorRate: number;
  retryRate: number;
}
