/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v17.3.0 - Phase 6: Correlation Analysis
 * Analyse corrélations entre services (Pearson, cascade failures)
 * ═══════════════════════════════════════════════════════════════
 */

import { MetricsHistory } from './metricsHistory';

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

export interface CorrelationPair {
  service1: string;
  service2: string;
  metric: 'latency' | 'errorRate';
  coefficient: number; // -1 à 1 (Pearson)
  strength: 'none' | 'weak' | 'moderate' | 'strong' | 'very_strong';
  sampleSize: number;
  confidence: number; // 0-1
}

export interface CascadeFailure {
  timestamp: number;
  rootService: string;
  affectedServices: string[];
  errorRateSpike: number; // % augmentation
  propagationTime: number; // ms
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ServiceDependency {
  source: string;
  target: string;
  weight: number; // Force corrélation
  type: 'sync' | 'async' | 'indirect';
}

// ────────────────────────────────────────────────────────────────
// Correlation Analyzer
// ────────────────────────────────────────────────────────────────

export class CorrelationAnalyzer {
  private static correlationMatrix: Map<string, CorrelationPair> = new Map();
  private static cascadeFailures: CascadeFailure[] = [];
  private static dependencies: ServiceDependency[] = [];
  private static maxCascades = 50;

  /**
   * Calculer matrice corrélation complète
   */
  static calculateCorrelationMatrix(): CorrelationPair[] {
    const services = ['memory', 'chat', 'voice', 'persona', 'system', 'evolution'];
    const metrics: Array<'latency' | 'errorRate'> = ['latency', 'errorRate'];
    const pairs: CorrelationPair[] = [];

    // Toutes combinaisons paires
    for (let i = 0; i < services.length; i++) {
      for (let j = i + 1; j < services.length; j++) {
        for (const metric of metrics) {
          const correlation = this.calculatePearsonCorrelation(
            services[i],
            services[j],
            metric
          );
          if (correlation) {
            const key = `${services[i]}_${services[j]}_${metric}`;
            this.correlationMatrix.set(key, correlation);
            pairs.push(correlation);
          }
        }
      }
    }

    return pairs;
  }

  /**
   * Calculer corrélation Pearson entre deux services
   */
  private static calculatePearsonCorrelation(
    service1: string,
    service2: string,
    metric: 'latency' | 'errorRate'
  ): CorrelationPair | null {
    const history1 = MetricsHistory.getServiceHistory(service1);
    const history2 = MetricsHistory.getServiceHistory(service2);

    // Besoin min 10 points
    if (history1.length < 10 || history2.length < 10) return null;

    // Aligner timestamps (prendre intersection)
    const timestamps1 = new Set(history1.map((h) => h.timestamp));
    const aligned1: number[] = [];
    const aligned2: number[] = [];

    for (const snapshot2 of history2) {
      if (timestamps1.has(snapshot2.timestamp)) {
        const snapshot1 = history1.find((h) => h.timestamp === snapshot2.timestamp);
        if (!snapshot1) continue;

        aligned1.push(this.extractMetricValue(snapshot1, metric));
        aligned2.push(this.extractMetricValue(snapshot2, metric));
      }
    }

    const n = aligned1.length;
    if (n < 10) return null;

    // Moyennes
    const mean1 = aligned1.reduce((sum, v) => sum + v, 0) / n;
    const mean2 = aligned2.reduce((sum, v) => sum + v, 0) / n;

    // Covariance et écarts-types
    let covariance = 0;
    let variance1 = 0;
    let variance2 = 0;

    for (let i = 0; i < n; i++) {
      const diff1 = aligned1[i] - mean1;
      const diff2 = aligned2[i] - mean2;
      covariance += diff1 * diff2;
      variance1 += diff1 * diff1;
      variance2 += diff2 * diff2;
    }

    const stdDev1 = Math.sqrt(variance1 / n);
    const stdDev2 = Math.sqrt(variance2 / n);

    // Coefficient Pearson
    const coefficient =
      stdDev1 > 0 && stdDev2 > 0 ? covariance / (n * stdDev1 * stdDev2) : 0;

    // Force corrélation
    const absCoeff = Math.abs(coefficient);
    let strength: CorrelationPair['strength'] = 'none';
    if (absCoeff > 0.8) strength = 'very_strong';
    else if (absCoeff > 0.6) strength = 'strong';
    else if (absCoeff > 0.4) strength = 'moderate';
    else if (absCoeff > 0.2) strength = 'weak';

    // Confiance (plus de points = plus confiant)
    const confidence = Math.min(n / 50, 1.0);

    return {
      service1,
      service2,
      metric,
      coefficient,
      strength,
      sampleSize: n,
      confidence,
    };
  }

  /**
   * Extraire valeur métrique
   */
  private static extractMetricValue(
    snapshot: { avgLatency: number; errorRate: number },
    metric: 'latency' | 'errorRate'
  ): number {
    return metric === 'latency' ? snapshot.avgLatency : snapshot.errorRate;
  }

  /**
   * Détecter cascade failures
   */
  static detectCascadeFailures(): CascadeFailure[] {
    const services = ['memory', 'chat', 'voice', 'persona', 'system', 'evolution'];
    const now = Date.now();
    const detected: CascadeFailure[] = [];

    // Pour chaque service, vérifier spike erreurs récent
    for (const rootService of services) {
      const history = MetricsHistory.getServiceHistory(rootService);
      if (history.length < 5) continue;

      // 5 derniers points
      const recent = history.slice(-5);
      const errorRates = recent.map((h) => h.errorRate);

      // Spike = augmentation >50% soudaine
      const baseline = errorRates.slice(0, 3).reduce((s, v) => s + v, 0) / 3;
      const current = errorRates.slice(-2).reduce((s, v) => s + v, 0) / 2;
      const spike = current > 0 && baseline > 0 ? (current - baseline) / baseline : 0;

      if (spike < 0.5) continue; // Pas de spike significatif

      // Trouver services corrélés qui ont aussi spiké
      const affected: string[] = [];
      let minPropTime = Infinity;

      for (const targetService of services) {
        if (targetService === rootService) continue;

        const targetHistory = MetricsHistory.getServiceHistory(targetService);
        if (targetHistory.length < 5) continue;

        const targetRecent = targetHistory.slice(-5);
        const targetErrorRates = targetRecent.map((h) => h.errorRate);
        const targetBaseline =
          targetErrorRates.slice(0, 3).reduce((s, v) => s + v, 0) / 3;
        const targetCurrent =
          targetErrorRates.slice(-2).reduce((s, v) => s + v, 0) / 2;
        const targetSpike =
          targetCurrent > 0 && targetBaseline > 0
            ? (targetCurrent - targetBaseline) / targetBaseline
            : 0;

        if (targetSpike > 0.3) {
          // Service affecté
          affected.push(targetService);

          // Temps propagation (approximatif)
          const rootTs = recent[recent.length - 1].timestamp;
          const targetTs = targetRecent[targetRecent.length - 1].timestamp;
          const propTime = Math.abs(targetTs - rootTs);
          minPropTime = Math.min(minPropTime, propTime);
        }
      }

      if (affected.length > 0) {
        // Déterminer sévérité
        let severity: CascadeFailure['severity'] = 'low';
        if (affected.length >= 4 || spike > 2.0) severity = 'critical';
        else if (affected.length >= 3 || spike > 1.0) severity = 'high';
        else if (affected.length >= 2 || spike > 0.7) severity = 'medium';

        const cascade: CascadeFailure = {
          timestamp: now,
          rootService,
          affectedServices: affected,
          errorRateSpike: spike * 100,
          propagationTime: minPropTime,
          severity,
        };

        detected.push(cascade);
        this.cascadeFailures.push(cascade);

        // Limiter taille
        if (this.cascadeFailures.length > this.maxCascades) {
          this.cascadeFailures.shift();
        }
      }
    }

    return detected;
  }

  /**
   * Construire graph dépendances
   */
  static buildDependencyGraph(): ServiceDependency[] {
    const pairs = this.calculateCorrelationMatrix();
    const dependencies: ServiceDependency[] = [];

    for (const pair of pairs) {
      // Seulement corrélations fortes (> 0.6)
      if (Math.abs(pair.coefficient) < 0.6) continue;

      // Type dépendance selon force
      let type: ServiceDependency['type'] = 'indirect';
      if (Math.abs(pair.coefficient) > 0.8) type = 'sync';
      else if (Math.abs(pair.coefficient) > 0.7) type = 'async';

      dependencies.push({
        source: pair.service1,
        target: pair.service2,
        weight: Math.abs(pair.coefficient),
        type,
      });
    }

    this.dependencies = dependencies;
    return dependencies;
  }

  /**
   * Obtenir corrélations fortes
   */
  static getStrongCorrelations(minStrength: 'moderate' | 'strong' | 'very_strong' = 'strong'): CorrelationPair[] {
    const strengthOrder = { weak: 0, moderate: 1, strong: 2, very_strong: 3 };
    const minLevel = strengthOrder[minStrength];

    return Array.from(this.correlationMatrix.values()).filter(
      (pair) => strengthOrder[pair.strength] >= minLevel
    );
  }

  /**
   * Obtenir cascade failures récentes
   */
  static getCascadeFailures(limit = 20): CascadeFailure[] {
    return this.cascadeFailures
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Obtenir dépendances service
   */
  static getServiceDependencies(service: string): ServiceDependency[] {
    return this.dependencies.filter(
      (dep) => dep.source === service || dep.target === service
    );
  }

  /**
   * Analyser root cause (service le plus corrélé avec échecs)
   */
  static analyzeRootCause(failedServices: string[]): {
    likelyRoot: string;
    confidence: number;
    correlations: CorrelationPair[];
  } | null {
    if (failedServices.length < 2) return null;

    // Trouver service avec plus fortes corrélations vers autres
    const scores = new Map<string, number>();

    for (const service of failedServices) {
      let score = 0;
      const correlations: CorrelationPair[] = [];

      for (const other of failedServices) {
        if (service === other) continue;

        const key1 = `${service}_${other}_errorRate`;
        const key2 = `${other}_${service}_errorRate`;
        const corr = this.correlationMatrix.get(key1) || this.correlationMatrix.get(key2);

        if (corr && Math.abs(corr.coefficient) > 0.5) {
          score += Math.abs(corr.coefficient);
          correlations.push(corr);
        }
      }

      scores.set(service, score);
    }

    // Service avec score max = root cause probable
    let maxScore = 0;
    let likelyRoot = '';
    for (const [service, score] of scores.entries()) {
      if (score > maxScore) {
        maxScore = score;
        likelyRoot = service;
      }
    }

    if (!likelyRoot) return null;

    const confidence = Math.min(maxScore / failedServices.length, 1.0);
    const correlations = Array.from(this.correlationMatrix.values()).filter(
      (c) => c.service1 === likelyRoot || c.service2 === likelyRoot
    );

    return { likelyRoot, confidence, correlations };
  }

  /**
   * Effacer historique
   */
  static clear(): void {
    this.correlationMatrix.clear();
    this.cascadeFailures = [];
    this.dependencies = [];
  }
}
