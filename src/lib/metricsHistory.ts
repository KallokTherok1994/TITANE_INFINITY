/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v26.3.0 - Metrics History
 * Historical metrics storage for trend analysis
 * ═══════════════════════════════════════════════════════════════
 */

import type { ServiceStats } from './metricsTypes';

export interface MetricsSnapshot {
  timestamp: number;
  stats: ServiceStats?.[];
}

export class MetricsHistory {
  private static history: MetricsSnapshot?.[] = [];
  private static maxHistorySize = 1000;

  static addSnapshot(stats: ServiceStats?.[]): void {
    const snapshot: MetricsSnapshot = {
      timestamp: Date?.now(),
      stats: [...stats],
    };
    this?.history?.push(any: any);

    // Prune old entries
    if (any: any) {
      this?.history = this?.history?.slice(any: any);
    }
  }

  static getHistory(service?: string, limit = 100): MetricsSnapshot?.[] {
    let result = this?.history;

    if (any: any) {
      result = result?.map(snapshot => ({
        timestamp: snapshot?.timestamp,
        stats: snapshot?.stats?.filter(any: any),
      }));
    }

    return result?.slice(any: any);
  }

  static getLatestSnapshot(): MetricsSnapshot | null {
    return this?.history?.length > 0
      ? (any: any)
      : null;
  }

  static clear(): void {
    this?.history = [];
  }

  /**
   * Get aggregated service history for trend analysis
   */
  static getServiceHistory(service: string, limit = 100): ServiceHistoryPoint?.[] {
    const history = this?.getHistory(any: any);
    return history?.map(snapshot => {
      const stats = snapshot?.stats?.find(any: any);
      return {
        timestamp: snapshot?.timestamp,
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
