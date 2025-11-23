/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v17.3.0 - Phase 5: Metrics History
 * Historique des métriques pour graphiques temporels
 * ═══════════════════════════════════════════════════════════════
 */

import { ServiceMetrics } from './serviceMetrics';

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

export interface MetricsSnapshot {
  timestamp: number;
  service: string;
  totalCalls: number;
  successRate: number;
  avgLatency: number;
  errorRate: number;
  retryRate: number;
}

export interface GlobalSnapshot {
  timestamp: number;
  totalMetrics: number;
  servicesCount: number;
  globalErrorRate: number;
  globalAvgLatency: number;
  totalRetries: number;
}

// ────────────────────────────────────────────────────────────────
// Metrics History Manager
// ────────────────────────────────────────────────────────────────

export class MetricsHistory {
  private static serviceHistory = new Map<string, MetricsSnapshot[]>();
  private static globalHistory: GlobalSnapshot[] = [];
  private static maxSnapshots = 50; // Garder 50 points (environ 4 minutes avec refresh 5s)
  private static isTracking = false;
  private static trackingInterval: NodeJS.Timeout | null = null;

  /**
   * Démarrer le tracking automatique
   */
  static startTracking(intervalMs = 5000): void {
    if (this.isTracking) return;

    this.isTracking = true;
    this.captureSnapshot();

    this.trackingInterval = setInterval(() => {
      this.captureSnapshot();
    }, intervalMs);
  }

  /**
   * Arrêter le tracking
   */
  static stopTracking(): void {
    this.isTracking = false;
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }
  }

  /**
   * Capturer un snapshot des métriques
   */
  private static captureSnapshot(): void {
    const timestamp = Date.now();

    // Services
    const services = ['memory', 'chat', 'voice', 'persona', 'system', 'evolution'];

    for (const service of services) {
      const stats = ServiceMetrics.getServiceStats(service);

      const snapshot: MetricsSnapshot = {
        timestamp,
        service,
        totalCalls: stats.totalCalls,
        successRate: stats.totalCalls > 0 ? stats.successfulCalls / stats.totalCalls : 0,
        avgLatency: stats.averageLatency,
        errorRate: stats.errorRate,
        retryRate: stats.totalCalls > 0 ? stats.totalRetries / stats.totalCalls : 0,
      };

      if (!this.serviceHistory.has(service)) {
        this.serviceHistory.set(service, []);
      }

      const history = this.serviceHistory.get(service);
      if (!history) continue;

      history.push(snapshot);

      // Limiter taille
      if (history.length > this.maxSnapshots) {
        history.shift();
      }
    }

    // Global
    const globalStats = ServiceMetrics.getGlobalStats();
    const globalSnapshot: GlobalSnapshot = {
      timestamp,
      totalMetrics: globalStats.totalMetrics,
      servicesCount: globalStats.services.length,
      globalErrorRate: globalStats.globalErrorRate,
      globalAvgLatency: globalStats.globalAvgLatency,
      totalRetries: globalStats.totalRetries,
    };

    this.globalHistory.push(globalSnapshot);

    if (this.globalHistory.length > this.maxSnapshots) {
      this.globalHistory.shift();
    }
  }

  /**
   * Obtenir historique d'un service
   */
  static getServiceHistory(service: string): MetricsSnapshot[] {
    return this.serviceHistory.get(service) || [];
  }

  /**
   * Obtenir historique global
   */
  static getGlobalHistory(): GlobalSnapshot[] {
    return [...this.globalHistory];
  }

  /**
   * Effacer historique
   */
  static clear(): void {
    this.serviceHistory.clear();
    this.globalHistory = [];
  }

  /**
   * Configurer nombre max de snapshots
   */
  static setMaxSnapshots(max: number): void {
    this.maxSnapshots = max;
  }

  /**
   * Obtenir stats tracking
   */
  static getTrackingStats(): {
    isTracking: boolean;
    servicesCount: number;
    globalSnapshotsCount: number;
    maxSnapshots: number;
  } {
    return {
      isTracking: this.isTracking,
      servicesCount: this.serviceHistory.size,
      globalSnapshotsCount: this.globalHistory.length,
      maxSnapshots: this.maxSnapshots,
    };
  }
}
