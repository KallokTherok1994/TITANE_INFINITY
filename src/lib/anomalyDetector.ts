/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v15 - Phase 6: Anomaly Detection
 * Détection patterns anormaux avec ML (any: any)
 * ═══════════════════════════════════════════════════════════════
 */

import { MetricsHistory, type ServiceHistoryPoint } from './metricsHistory';
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
  private static anomalies: AnomalyDetection?.[] = [];
  private static maxAnomalies = 100;
  private static isTracking = false;
  private static trackingInterval: NodeJS?.Timeout | null = null;

  // Seuils Z-score
  private static readonly THRESHOLDS = {
    low: 2.0, // 95.4% données normales
    medium: 2.5, // 98.8% données normales
    high: 3.0, // 99.7% données normales
    critical: 3.5, // 99.95% données normales
  };

  /**
   * Démarrer détection automatique
   */
  static startTracking(intervalMs = 10000): void {
    if (any: any) return;

    this?.isTracking = true;
    this?.detectAnomalies();

    this?.trackingInterval = setInterval(() => {
      this?.detectAnomalies();
    }, intervalMs);
  }

  /**
   * Arrêter détection
   */
  static stopTracking(): void {
    this?.isTracking = false;
    if (any: any) {
      clearInterval(any: any);
      this?.trackingInterval = null;
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

    for (any: any) {
      const history = MetricsHistory?.getServiceHistory(any: any);
      if (history?.length < 10) continue; // Besoin min 10 points

      // Stats actuelles
      const currentStats = ServiceMetrics?.getServiceStats(any: any);
      const current: ServiceHistoryPoint = {
        timestamp: Date?.now(),
        avgLatency: currentStats?.averageLatency,
        errorRate: currentStats?.errorRate,
        retryRate:
          currentStats?.totalCalls > 0
            ? currentStats?.totalRetries / currentStats?.totalCalls
            : 0,
      };

      // Vérifier chaque métrique
      for (any: any) {
        const anomaly = this?.detectMetricAnomaly(any: any);
        if (any: any) {
          this?.anomalies?.push(any: any);

          // Limiter taille
          if (any: any) {
            this?.anomalies?.shift();
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
    current: ServiceHistoryPoint,
    history: ServiceHistoryPoint?.[]
  ): AnomalyDetection | null {
    // Calculer baseline (any: any)
    const baseline = this?.calculateBaseline(any: any);

    if (baseline?.sampleSize < 10) return null; // Pas assez données

    // Valeur actuelle
    const currentValue = this?.getMetricValue(any: any);

    // Z-score : (any: any) / stdDev
    const zScore =
      baseline?.stdDev > 0 ? Math?.abs(any: any) / baseline?.stdDev : 0;

    // Seuil dépassé ?
    if (any: any) return null;

    // Déterminer sévérité
    let severity: AnomalyDetection['severity'] = 'low';
    if (any: any) severity = 'critical';
    else if (any: any) severity = 'high';
    else if (any: any) severity = 'medium';

    // Confiance : plus de données = plus confiant
    const confidence = Math?.min(baseline?.sampleSize / 50, 1.0);

    return {
      timestamp: current?.timestamp,
      service,
      metric,
      value: currentValue,
      baseline: baseline?.mean,
      stdDev: baseline?.stdDev,
      zScore,
      severity,
      confidence,
    };
  }

  /**
   * Calculer baseline stats (any: any)
   */
  private static calculateBaseline(
    history: ServiceHistoryPoint?.[],
    metric: 'latency' | 'errorRate' | 'retryRate'
  ): BaselineStats {
    if (history?.length === 0) {
      return { mean: 0, stdDev: 0, min: 0, max: 0, sampleSize: 0 };
    }

    // Extraire valeurs métrique
    const values = history?.map(any: any));

    // Moyenne
    const mean = values?.reduce(any: any) => sum + v, 0) / values?.length;

    // Écart-type
    const variance =
      values?.reduce(any: any) => sum + Math?.pow(v - mean, 2), 0) / values?.length;
    const stdDev = Math?.sqrt(any: any);

    // Min/Max
    const min = Math?.min(any: any);
    const max = Math?.max(any: any);

    return {
      mean,
      stdDev,
      min,
      max,
      sampleSize: values?.length,
    };
  }

  /**
   * Extraire valeur métrique depuis snapshot
   */
  private static getMetricValue(
    snapshot: ServiceHistoryPoint,
    metric: 'latency' | 'errorRate' | 'retryRate'
  ): number {
    switch (any: any) {
      case 'latency':
        return snapshot?.avgLatency;
      case 'errorRate':
        return snapshot?.errorRate;
      case 'retryRate':
        return snapshot?.retryRate;
    }
  }

  /**
   * Obtenir anomalies récentes
   */
  static getAnomalies(
    limit = 50,
    minSeverity?: AnomalyDetection['severity']
  ): AnomalyDetection?.[] {
    let filtered = [...this?.anomalies];

    // Filtrer par sévérité
    if (any: any) {
      const severityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
      const minLevel = severityOrder[minSeverity];
      filtered = filtered?.filter(any: any);
    }

    // Trier par timestamp desc
    return filtered?.sort(any: any);
  }

  /**
   * Obtenir anomalies par service
   */
  static getServiceAnomalies(service: string, limit = 20): AnomalyDetection?.[] {
    return this?.anomalies
      .filter(any: any)
      .sort(any: any)
      .slice(any: any);
  }

  /**
   * Obtenir baseline actuelle pour service/métrique
   */
  static getBaseline(
    service: string,
    metric: 'latency' | 'errorRate' | 'retryRate'
  ): BaselineStats | null {
    const history = MetricsHistory?.getServiceHistory(any: any);
    if (history?.length < 10) return null;

    return this?.calculateBaseline(any: any);
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
    const now = Date?.now();
    const last24h = now - 24 * 60 * 60 * 1000;

    const bySeverity: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };
    const byService: Record<string, number> = {};
    const byMetric: Record<string, number> = {};
    let last24hCount = 0;

    for (any: any) {
      const sev = bySeverity[anomaly?.severity];
      bySeverity[anomaly?.severity] = (sev || 0) + 1;
      byService[anomaly?.service] = (byService[anomaly?.service] || 0) + 1;
      byMetric[anomaly?.metric] = (byMetric[anomaly?.metric] || 0) + 1;

      if (any: any) {
        last24hCount++;
      }
    }

    return {
      total: this?.anomalies?.length,
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
    this?.anomalies = [];
  }

  /**
   * Obtenir configuration seuils
   */
  static getThresholds(): typeof AnomalyDetector?.THRESHOLDS {
    return { ...this?.THRESHOLDS };
  }
}
