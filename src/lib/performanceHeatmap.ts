/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v15 - Phase 7: Performance Heatmap
 * Heatmap de latence par service × heure
 * ═══════════════════════════════════════════════════════════════
 */

import { MetricsSnapshot } from './metricsHistory';
import { ServiceMetrics } from './serviceMetrics';

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

export interface HeatmapCell {
  service: string;
  hour: number; // 0-23
  avgLatency: number;
  minLatency: number;
  maxLatency: number;
  sampleCount: number;
  errorRate: number;
}

export interface HeatmapData {
  cells: HeatmapCell[];
  services: string[];
  hours: number[];
  maxLatency: number;
  minLatency: number;
}

export interface TimePattern {
  service: string;
  peakHours: number[]; // Heures de pointe (latence élevée)
  lowHours: number[]; // Heures creuses (latence faible)
  averageLatencyByHour: Record<number, number>;
  patternType: 'business_hours' | 'night_peak' | 'uniform' | 'irregular';
}

// ────────────────────────────────────────────────────────────────
// Performance Heatmap Engine
// ────────────────────────────────────────────────────────────────

export class PerformanceHeatmap {
  private static hourlyData = new Map<string, MetricsSnapshot[]>(); // key: "service-hour"
  private static isTracking = false;
  private static trackingInterval: NodeJS.Timeout | null = null;

  /**
   * Collecter les données par heure
   */
  private static collectHourlyData(): void {
    const services = ServiceMetrics.getAllServices();

    for (const service of services) {
      const stats = ServiceMetrics.getServiceStats(service);
      const now = new Date();
      const hour = now.getHours();
      const key = `${service}-${hour}`;

      const snapshot: MetricsSnapshot = {
        timestamp: now.getTime(),
        service,
        totalCalls: stats.totalCalls,
        successRate: (stats.successfulCalls / stats.totalCalls) * 100 || 0,
        avgLatency: stats.averageLatency,
        errorRate: stats.errorRate * 100,
        retryRate: (stats.totalRetries / stats.totalCalls) * 100 || 0,
      };

      if (!this.hourlyData.has(key)) {
        this.hourlyData.set(key, []);
      }

      const hourData = this.hourlyData.get(key);
      if (hourData) {
        hourData.push(snapshot);

        // Garder max 100 snapshots par heure (environ 8min avec refresh 5s)
        if (hourData.length > 100) {
          hourData.shift();
        }
      }
    }
  }

  /**
   * Générer la heatmap complète
   */
  static generateHeatmap(): HeatmapData {
    const services = ServiceMetrics.getAllServices();
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const cells: HeatmapCell[] = [];
    let globalMaxLatency = 0;
    let globalMinLatency = Infinity;

    for (const service of services) {
      for (const hour of hours) {
        const key = `${service}-${hour}`;
        const snapshots = this.hourlyData.get(key) || [];

        if (snapshots.length === 0) {
          // Pas de données pour cette cellule
          cells.push({
            service,
            hour,
            avgLatency: 0,
            minLatency: 0,
            maxLatency: 0,
            sampleCount: 0,
            errorRate: 0,
          });
          continue;
        }

        // Calculer stats pour cette cellule
        const latencies = snapshots.map(s => s.avgLatency);
        const avgLatency = latencies.reduce((sum, l) => sum + l, 0) / latencies.length;
        const minLatency = Math.min(...latencies);
        const maxLatency = Math.max(...latencies);
        const errorRates = snapshots.map(s => s.errorRate);
        const avgErrorRate =
          errorRates.reduce((sum, e) => sum + e, 0) / errorRates.length;

        globalMaxLatency = Math.max(globalMaxLatency, maxLatency);
        globalMinLatency = Math.min(globalMinLatency, minLatency);

        cells.push({
          service,
          hour,
          avgLatency,
          minLatency,
          maxLatency,
          sampleCount: snapshots.length,
          errorRate: avgErrorRate,
        });
      }
    }

    return {
      cells,
      services,
      hours,
      maxLatency: globalMaxLatency,
      minLatency: globalMinLatency === Infinity ? 0 : globalMinLatency,
    };
  }

  /**
   * Analyser les patterns temporels pour un service
   */
  static analyzeTimePatterns(service: string): TimePattern {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const averageLatencyByHour: Record<number, number> = {};
    const latenciesByHour: number[] = [];

    for (const hour of hours) {
      const key = `${service}-${hour}`;
      const snapshots = this.hourlyData.get(key) || [];

      if (snapshots.length === 0) {
        averageLatencyByHour[hour] = 0;
        latenciesByHour.push(0);
        continue;
      }

      const avgLatency =
        snapshots.reduce((sum, s) => sum + s.avgLatency, 0) / snapshots.length;
      averageLatencyByHour[hour] = avgLatency;
      latenciesByHour.push(avgLatency);
    }

    // Calculer moyenne globale et écart-type
    const validLatencies = latenciesByHour.filter(l => l > 0);
    if (validLatencies.length === 0) {
      return {
        service,
        peakHours: [],
        lowHours: [],
        averageLatencyByHour,
        patternType: 'uniform',
      };
    }

    const meanLatency =
      validLatencies.reduce((sum, l) => sum + l, 0) / validLatencies.length;
    const variance =
      validLatencies.reduce((sum, l) => sum + Math.pow(l - meanLatency, 2), 0) /
      validLatencies.length;
    const stdDev = Math.sqrt(variance);

    // Identifier heures de pointe (> mean + 0.5*stdDev)
    const peakThreshold = meanLatency + 0.5 * stdDev;
    const lowThreshold = meanLatency - 0.5 * stdDev;
    const peakHours: number[] = [];
    const lowHours: number[] = [];

    for (let hour = 0; hour < 24; hour++) {
      const latency = latenciesByHour[hour];
      if (latency !== undefined && latency > peakThreshold) {
        peakHours.push(hour);
      } else if (latency !== undefined && latency < lowThreshold && latency > 0) {
        lowHours.push(hour);
      }
    }

    // Déterminer le type de pattern
    let patternType: TimePattern['patternType'];
    if (stdDev < meanLatency * 0.2) {
      patternType = 'uniform'; // Peu de variation
    } else if (peakHours.some(h => h >= 9 && h <= 17)) {
      patternType = 'business_hours'; // Pics pendant heures bureau
    } else if (peakHours.some(h => h >= 0 && h <= 6)) {
      patternType = 'night_peak'; // Pics la nuit (batch jobs?)
    } else {
      patternType = 'irregular'; // Pattern irrégulier
    }

    return {
      service,
      peakHours,
      lowHours,
      averageLatencyByHour,
      patternType,
    };
  }

  /**
   * Obtenir les patterns pour tous les services
   */
  static getAllPatterns(): TimePattern[] {
    const services = ServiceMetrics.getAllServices();
    return services.map(service => this.analyzeTimePatterns(service));
  }

  /**
   * Obtenir la latence pour une cellule spécifique
   */
  static getCellData(service: string, hour: number): HeatmapCell | null {
    const key = `${service}-${hour}`;
    const snapshots = this.hourlyData.get(key) || [];

    if (snapshots.length === 0) {
      return null;
    }

    const latencies = snapshots.map(s => s.avgLatency);
    const avgLatency = latencies.reduce((sum, l) => sum + l, 0) / latencies.length;
    const errorRates = snapshots.map(s => s.errorRate);
    const avgErrorRate = errorRates.reduce((sum, e) => sum + e, 0) / errorRates.length;

    return {
      service,
      hour,
      avgLatency,
      minLatency: Math.min(...latencies),
      maxLatency: Math.max(...latencies),
      sampleCount: snapshots.length,
      errorRate: avgErrorRate,
    };
  }

  /**
   * Démarrer le tracking
   */
  static startTracking(intervalMs = 300000): void {
    // Default 5min
    if (this.isTracking) return;

    this.isTracking = true;
    this.collectHourlyData();

    this.trackingInterval = setInterval(() => {
      this.collectHourlyData();
    }, intervalMs);
  }

  /**
   * Arrêter le tracking
   */
  static stopTracking(): void {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }
    this.isTracking = false;
  }

  /**
   * Réinitialiser les données
   */
  static reset(): void {
    this.stopTracking();
    this.hourlyData.clear();
  }

  /**
   * Exporter les données brutes
   */
  static exportData(): Record<string, MetricsSnapshot[]> {
    const exported: Record<string, MetricsSnapshot[]> = {};
    for (const [key, snapshots] of this.hourlyData.entries()) {
      exported[key] = [...snapshots];
    }
    return exported;
  }
}
