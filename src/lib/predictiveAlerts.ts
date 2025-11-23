/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v17.3.0 - Phase 7: Predictive Alerts
 * Prédiction de tendances avec régression linéaire
 * ═══════════════════════════════════════════════════════════════
 */

import { MetricsHistory } from './metricsHistory';
import { ServiceMetrics } from './serviceMetrics';

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

export type PredictionMetric = 'latency' | 'errorRate' | 'retryRate';
export type TrendDirection = 'increasing' | 'decreasing' | 'stable';

export interface Prediction {
  service: string;
  metric: PredictionMetric;
  currentValue: number;
  predictedValue: number;
  timeHorizonMinutes: number;
  confidence: number; // 0-1
  trend: TrendDirection;
  slope: number; // Coefficient directeur
  intercept: number; // Ordonnée à l'origine
  r2: number; // Coefficient de détermination (qualité du modèle)
  timestamp: number;
}

export interface PredictiveAlert {
  id: string;
  service: string;
  metric: PredictionMetric;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  currentValue: number;
  predictedValue: number;
  threshold: number;
  timeToThreshold: number; // Minutes avant violation
  confidence: number;
  timestamp: number;
}

export interface PredictionThresholds {
  latency: number; // ms
  errorRate: number; // %
  retryRate: number; // %
}

// ────────────────────────────────────────────────────────────────
// Configuration
// ────────────────────────────────────────────────────────────────

const DEFAULT_THRESHOLDS: PredictionThresholds = {
  latency: 1000, // 1s
  errorRate: 5, // 5%
  retryRate: 10, // 10%
};

const CONFIDENCE_THRESHOLD = 0.8; // 80% minimum
const MIN_DATA_POINTS = 10; // Minimum 10 points pour prédire
const PREDICTION_HORIZONS = [5, 10, 15]; // Minutes dans le futur

// ────────────────────────────────────────────────────────────────
// Predictive Alerts Engine
// ────────────────────────────────────────────────────────────────

export class PredictiveAlerts {
  private static predictions = new Map<string, Prediction[]>();
  private static alerts: PredictiveAlert[] = [];
  private static thresholds = new Map<string, PredictionThresholds>();
  private static isTracking = false;
  private static trackingInterval: NodeJS.Timeout | null = null;

  /**
   * Configurer les seuils pour un service
   */
  static setThresholds(service: string, thresholds: Partial<PredictionThresholds>): void {
    const current = this.thresholds.get(service) || { ...DEFAULT_THRESHOLDS };
    this.thresholds.set(service, { ...current, ...thresholds });
  }

  /**
   * Calculer la régression linéaire simple
   * y = mx + b (où m = slope, b = intercept)
   *
   * Formules:
   * - slope (m) = Σ[(xi - x̄)(yi - ȳ)] / Σ[(xi - x̄)²]
   * - intercept (b) = ȳ - m × x̄
   * - R² = 1 - (SS_res / SS_tot)
   */
  private static calculateLinearRegression(
    dataPoints: Array<{ x: number; y: number }>
  ): { slope: number; intercept: number; r2: number } {
    const n = dataPoints.length;

    if (n < 2) {
      return { slope: 0, intercept: 0, r2: 0 };
    }

    // Moyennes
    const meanX = dataPoints.reduce((sum, p) => sum + p.x, 0) / n;
    const meanY = dataPoints.reduce((sum, p) => sum + p.y, 0) / n;

    // Calcul du slope (pente)
    let numerator = 0;
    let denominator = 0;
    for (const point of dataPoints) {
      const diffX = point.x - meanX;
      const diffY = point.y - meanY;
      numerator += diffX * diffY;
      denominator += diffX * diffX;
    }

    const slope = denominator === 0 ? 0 : numerator / denominator;
    const intercept = meanY - slope * meanX;

    // Calcul R² (coefficient de détermination)
    let ssRes = 0; // Somme des carrés des résidus
    let ssTot = 0; // Somme totale des carrés
    for (const point of dataPoints) {
      const predicted = slope * point.x + intercept;
      ssRes += Math.pow(point.y - predicted, 2);
      ssTot += Math.pow(point.y - meanY, 2);
    }

    const r2 = ssTot === 0 ? 0 : 1 - (ssRes / ssTot);

    return { slope, intercept, r2: Math.max(0, Math.min(1, r2)) };
  }

  /**
   * Prédire une valeur future
   */
  private static predictFuture(
    service: string,
    metric: PredictionMetric,
    timeHorizonMinutes: number
  ): Prediction | null {
    const history = MetricsHistory.getServiceHistory(service);

    if (history.length < MIN_DATA_POINTS) {
      return null;
    }

    // Préparer les données (x = temps relatif, y = valeur métrique)
    const dataPoints = history.map((snapshot, index) => {
      let value: number;
      switch (metric) {
        case 'latency':
          value = snapshot.avgLatency;
          break;
        case 'errorRate':
          value = snapshot.errorRate;
          break;
        case 'retryRate':
          value = snapshot.retryRate;
          break;
      }
      return { x: index, y: value };
    });

    // Régression linéaire
    const { slope, intercept, r2 } = this.calculateLinearRegression(dataPoints);

    // Qualité du modèle (R² proche de 1 = bon modèle)
    const confidence = r2;

    if (confidence < CONFIDENCE_THRESHOLD) {
      return null; // Modèle pas assez fiable
    }

    // Prédire la valeur future
    // Chaque point = 5s, donc pour N minutes = N * 60 / 5 = N * 12 points
    const futureIndex = history.length + (timeHorizonMinutes * 12);
    const predictedValue = slope * futureIndex + intercept;
    const lastPoint = dataPoints[dataPoints.length - 1];
    if (!lastPoint) return null;
    const currentValue = lastPoint.y;

    // Déterminer la tendance
    let trend: TrendDirection;
    const changePercent = Math.abs((predictedValue - currentValue) / currentValue) * 100;
    if (changePercent < 5) {
      trend = 'stable';
    } else if (predictedValue > currentValue) {
      trend = 'increasing';
    } else {
      trend = 'decreasing';
    }

    return {
      service,
      metric,
      currentValue,
      predictedValue: Math.max(0, predictedValue), // Pas de valeurs négatives
      timeHorizonMinutes,
      confidence,
      trend,
      slope,
      intercept,
      r2,
      timestamp: Date.now(),
    };
  }

  /**
   * Générer des alertes prédictives
   */
  private static generateAlerts(): void {
    const services = ServiceMetrics.getAllServices();
    const newAlerts: PredictiveAlert[] = [];

    for (const service of services) {
      const thresholds = this.thresholds.get(service) || DEFAULT_THRESHOLDS;
      const metrics: PredictionMetric[] = ['latency', 'errorRate', 'retryRate'];

      for (const metric of metrics) {
        // Prédire pour différents horizons temporels
        for (const horizonMinutes of PREDICTION_HORIZONS) {
          const prediction = this.predictFuture(service, metric, horizonMinutes);

          if (!prediction) continue;

          // Stocker la prédiction
          const key = `${service}-${metric}`;
          if (!this.predictions.has(key)) {
            this.predictions.set(key, []);
          }
          const predictionList = this.predictions.get(key);
          if (predictionList) {
            predictionList.push(prediction);
          }

          // Vérifier si on va dépasser le seuil
          const threshold = thresholds[metric];
          const willExceed = prediction.predictedValue > threshold;

          if (willExceed && prediction.confidence >= CONFIDENCE_THRESHOLD) {
            // Calculer la sévérité basée sur le dépassement et le temps
            const exceedPercent = ((prediction.predictedValue - threshold) / threshold) * 100;
            let severity: PredictiveAlert['severity'];

            if (exceedPercent > 50 || horizonMinutes <= 5) {
              severity = 'critical';
            } else if (exceedPercent > 25 || horizonMinutes <= 10) {
              severity = 'high';
            } else if (exceedPercent > 10) {
              severity = 'medium';
            } else {
              severity = 'low';
            }

            const alert: PredictiveAlert = {
              id: `${service}-${metric}-${Date.now()}`,
              service,
              metric,
              severity,
              message: `${metric} prédite à ${prediction.predictedValue.toFixed(2)} dans ${horizonMinutes}min (seuil: ${threshold})`,
              currentValue: prediction.currentValue,
              predictedValue: prediction.predictedValue,
              threshold,
              timeToThreshold: horizonMinutes,
              confidence: prediction.confidence,
              timestamp: Date.now(),
            };

            newAlerts.push(alert);
          }
        }
      }
    }

    // Remplacer les anciennes alertes par les nouvelles
    this.alerts = newAlerts;

    // Nettoyer les vieilles prédictions (garder max 100 par metric)
    for (const [key, predictions] of this.predictions.entries()) {
      if (predictions.length > 100) {
        this.predictions.set(key, predictions.slice(-100));
      }
    }
  }

  /**
   * Démarrer le tracking prédictif
   */
  static startTracking(intervalMs = 60000): void {
    if (this.isTracking) return;

    this.isTracking = true;
    this.generateAlerts();

    this.trackingInterval = setInterval(() => {
      this.generateAlerts();
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
   * Obtenir toutes les alertes prédictives actives
   */
  static getAlerts(minSeverity?: PredictiveAlert['severity']): PredictiveAlert[] {
    if (!minSeverity) {
      return [...this.alerts];
    }

    const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
    const minLevel = severityOrder[minSeverity];

    return this.alerts.filter(a => severityOrder[a.severity] >= minLevel);
  }

  /**
   * Obtenir les alertes pour un service
   */
  static getServiceAlerts(service: string): PredictiveAlert[] {
    return this.alerts.filter(a => a.service === service);
  }

  /**
   * Obtenir les prédictions pour un service/métrique
   */
  static getPredictions(service: string, metric: PredictionMetric): Prediction[] {
    const key = `${service}-${metric}`;
    return this.predictions.get(key) || [];
  }

  /**
   * Obtenir les statistiques des alertes
   */
  static getAlertStats(): {
    total: number;
    bySeverity: Record<PredictiveAlert['severity'], number>;
    byService: Record<string, number>;
    byMetric: Record<PredictionMetric, number>;
  } {
    const stats = {
      total: this.alerts.length,
      bySeverity: { low: 0, medium: 0, high: 0, critical: 0 } as Record<PredictiveAlert['severity'], number>,
      byService: {} as Record<string, number>,
      byMetric: { latency: 0, errorRate: 0, retryRate: 0 } as Record<PredictionMetric, number>,
    };

    for (const alert of this.alerts) {
      stats.bySeverity[alert.severity]++;
      stats.byService[alert.service] = (stats.byService[alert.service] || 0) + 1;
      stats.byMetric[alert.metric]++;
    }

    return stats;
  }

  /**
   * Réinitialiser toutes les données
   */
  static reset(): void {
    this.stopTracking();
    this.predictions.clear();
    this.alerts = [];
    this.thresholds.clear();
  }
}
