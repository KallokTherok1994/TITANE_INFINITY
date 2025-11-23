/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v17.3.0 - Phase 6: Anomaly Detection
 * Détection patterns anormaux avec ML (Z-score, baseline dynamique)
 * ═══════════════════════════════════════════════════════════════
 */

import { MetricsHistory, type MetricsSnapshot } from './metricsHistory';
import { ServiceMetrics } from './serviceMetrics';

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

export interface AnomalyDetection {
  timestamp: number;
  service: string;
  metric: 'latency' | 'errorRate' | 'retryRate';
  value: number;
  baseline: number;
  stdDev: number;
  zScore: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-1
}

export interface BaselineStats {
  mean: number;
  stdDev: number;
  min: number;
  max: number;
  sampleSize: number;
}

// ────────────────────────────────────────────────────────────────
// Anomaly Detector
// ────────────────────────────────────────────────────────────────

export class AnomalyDetector {
  private static anomalies: AnomalyDetection[] = [];
  private static maxAnomalies = 100;
  private static isTracking = false;
  private static trackingInterval: NodeJS.Timeout | null = null;

  // Seuils Z-score
  private static readonly THRESHOLDS = {
    low: 2.0,       // 95.4% données normales
    medium: 2.5,    // 98.8% données normales
    high: 3.0,      // 99.7% données normales
    critical: 3.5,  // 99.95% données normales
  };

  /**
   * Démarrer détection automatique
   */
  static startTracking(intervalMs = 10000): void {
    if (this.isTracking) return;

    this.isTracking = true;
    this.detectAnomalies();

    this.trackingInterval = setInterval(() => {
      this.detectAnomalies();
    }, intervalMs);
  }

  /**
   * Arrêter détection
   */
  static stopTracking(): void {
    this.isTracking = false;
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }
  }

  /**
   * Détecter anomalies sur tous les services
   */
  private static detectAnomalies(): void {
    const services = ['memory', 'chat', 'voice', 'persona', 'system', 'evolution'];
    const metrics: Array<'latency' | 'errorRate' | 'retryRate'> = [
      'latency',
      'errorRate',
      'retryRate',
    ];

    for (const service of services) {
      const history = MetricsHistory.getServiceHistory(service);
      if (history.length < 10) continue; // Besoin min 10 points

      // Stats actuelles
      const currentStats = ServiceMetrics.getServiceStats(service);
      const current: MetricsSnapshot = {
        timestamp: Date.now(),
        service,
        totalCalls: currentStats.totalCalls,
        successRate: currentStats.totalCalls > 0
          ? currentStats.successfulCalls / currentStats.totalCalls
          : 0,
        avgLatency: currentStats.averageLatency,
        errorRate: currentStats.errorRate,
        retryRate: currentStats.totalCalls > 0
          ? currentStats.totalRetries / currentStats.totalCalls
          : 0,
      };

      // Vérifier chaque métrique
      for (const metric of metrics) {
        const anomaly = this.detectMetricAnomaly(service, metric, current, history);
        if (anomaly) {
          this.anomalies.push(anomaly);

          // Limiter taille
          if (this.anomalies.length > this.maxAnomalies) {
            this.anomalies.shift();
          }
        }
      }
    }
  }

  /**
   * Détecter anomalie pour une métrique spécifique
   */
  private static detectMetricAnomaly(
    service: string,
    metric: 'latency' | 'errorRate' | 'retryRate',
    current: MetricsSnapshot,
    history: MetricsSnapshot[]
  ): AnomalyDetection | null {
    // Calculer baseline (moyenne + stddev sur historique)
    const baseline = this.calculateBaseline(history, metric);

    if (baseline.sampleSize < 10) return null; // Pas assez données

    // Valeur actuelle
    const currentValue = this.getMetricValue(current, metric);

    // Z-score : (value - mean) / stdDev
    const zScore = baseline.stdDev > 0
      ? Math.abs(currentValue - baseline.mean) / baseline.stdDev
      : 0;

    // Seuil dépassé ?
    if (zScore < this.THRESHOLDS.low) return null;

    // Déterminer sévérité
    let severity: AnomalyDetection['severity'] = 'low';
    if (zScore >= this.THRESHOLDS.critical) severity = 'critical';
    else if (zScore >= this.THRESHOLDS.high) severity = 'high';
    else if (zScore >= this.THRESHOLDS.medium) severity = 'medium';

    // Confiance : plus de données = plus confiant
    const confidence = Math.min(baseline.sampleSize / 50, 1.0);

    return {
      timestamp: current.timestamp,
      service,
      metric,
      value: currentValue,
      baseline: baseline.mean,
      stdDev: baseline.stdDev,
      zScore,
      severity,
      confidence,
    };
  }

  /**
   * Calculer baseline stats (rolling window)
   */
  private static calculateBaseline(
    history: MetricsSnapshot[],
    metric: 'latency' | 'errorRate' | 'retryRate'
  ): BaselineStats {
    if (history.length === 0) {
      return { mean: 0, stdDev: 0, min: 0, max: 0, sampleSize: 0 };
    }

    // Extraire valeurs métrique
    const values = history.map((snapshot) => this.getMetricValue(snapshot, metric));

    // Moyenne
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;

    // Écart-type
    const variance =
      values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // Min/Max
    const min = Math.min(...values);
    const max = Math.max(...values);

    return {
      mean,
      stdDev,
      min,
      max,
      sampleSize: values.length,
    };
  }

  /**
   * Extraire valeur métrique depuis snapshot
   */
  private static getMetricValue(
    snapshot: MetricsSnapshot,
    metric: 'latency' | 'errorRate' | 'retryRate'
  ): number {
    switch (metric) {
      case 'latency':
        return snapshot.avgLatency;
      case 'errorRate':
        return snapshot.errorRate;
      case 'retryRate':
        return snapshot.retryRate;
    }
  }

  /**
   * Obtenir anomalies récentes
   */
  static getAnomalies(
    limit = 50,
    minSeverity?: AnomalyDetection['severity']
  ): AnomalyDetection[] {
    let filtered = [...this.anomalies];

    // Filtrer par sévérité
    if (minSeverity) {
      const severityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
      const minLevel = severityOrder[minSeverity];
      filtered = filtered.filter(
        (a) => severityOrder[a.severity] >= minLevel
      );
    }

    // Trier par timestamp desc
    return filtered.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }

  /**
   * Obtenir anomalies par service
   */
  static getServiceAnomalies(service: string, limit = 20): AnomalyDetection[] {
    return this.anomalies
      .filter((a) => a.service === service)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Obtenir baseline actuelle pour service/métrique
   */
  static getBaseline(
    service: string,
    metric: 'latency' | 'errorRate' | 'retryRate'
  ): BaselineStats | null {
    const history = MetricsHistory.getServiceHistory(service);
    if (history.length < 10) return null;

    return this.calculateBaseline(history, metric);
  }

  /**
   * Obtenir stats globales anomalies
   */
  static getAnomalyStats(): {
    total: number;
    bySeverity: Record<string, number>;
    byService: Record<string, number>;
    byMetric: Record<string, number>;
    last24h: number;
  } {
    const now = Date.now();
    const last24h = now - 24 * 60 * 60 * 1000;

    const bySeverity: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
    const byService: Record<string, number> = {};
    const byMetric: Record<string, number> = {};
    let last24hCount = 0;

    for (const anomaly of this.anomalies) {
      const sev = bySeverity[anomaly.severity];
      bySeverity[anomaly.severity] = (sev || 0) + 1;
      byService[anomaly.service] = (byService[anomaly.service] || 0) + 1;
      byMetric[anomaly.metric] = (byMetric[anomaly.metric] || 0) + 1;

      if (anomaly.timestamp >= last24h) {
        last24hCount++;
      }
    }

    return {
      total: this.anomalies.length,
      bySeverity,
      byService,
      byMetric,
      last24h: last24hCount,
    };
  }

  /**
   * Effacer historique anomalies
   */
  static clear(): void {
    this.anomalies = [];
  }

  /**
   * Obtenir configuration seuils
   */
  static getThresholds(): typeof AnomalyDetector.THRESHOLDS {
    return { ...this.THRESHOLDS };
  }
}
