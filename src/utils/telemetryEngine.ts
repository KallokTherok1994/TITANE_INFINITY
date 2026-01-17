// @ts-nocheck
/**
 * TITANE∞ v26.3.0 — Advanced Telemetry & Analytics Engine
 * © 2025 TITANE Team. All rights reserved.
 *
 * 📊 MOTEUR DE TÉLÉMÉTRIE ET ANALYTICS AVANCÉ
 * Collecte, analyse et visualise les métriques système en temps réel
 */

import { titaneAI } from './aiPredictiveEngine';
import { titaneSelfHealing } from './selfHealingSystem';
import { bootHealthMonitor } from './advancedBootMonitor';
import { performanceOptimizer } from './performanceOptimizer';

interface TelemetryMetric {
  id: string;
  name: string;
  value: number | string | boolean;
  unit?: string;
  category: 'performance' | 'health' | 'user' | 'system' | 'security';
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  source: string;
  metadata?: { [key: string]: any };
}

interface AnalyticsPattern {
  id: string;
  name: string;
  description: string;
  type: 'trend' | 'anomaly' | 'correlation' | 'threshold' | 'cyclical';
  confidence: number;
  detected: number;
  impact: 'positive' | 'negative' | 'neutral';
  recommendations: string[];
  metrics: string[];
}

interface TelemetryReport {
  timestamp: number;
  period: string;
  summary: {
    totalMetrics: number;
    alertsGenerated: number;
    patternsDetected: number;
    systemHealth: number;
    performanceScore: number;
  };
  keyMetrics: TelemetryMetric[];
  detectedPatterns: AnalyticsPattern[];
  alerts: TelemetryAlert[];
  predictions: { [key: string]: number };
  recommendations: string[];
}

interface TelemetryAlert {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  metric: string;
  threshold: number;
  currentValue: number;
  timestamp: number;
  acknowledged: boolean;
  autoResolved: boolean;
}

interface MetricThreshold {
  metricId: string;
  warning: number;
  error: number;
  critical: number;
  direction: 'above' | 'below';
  enabled: boolean;
}

class TitaneTelemetryEngine {
  private metrics: Map<string, TelemetryMetric[]> = new Map();
  private patterns: Map<string, AnalyticsPattern> = new Map();
  private alerts: TelemetryAlert[] = [];
  private thresholds: Map<string, MetricThreshold> = new Map();
  private collectors: Map<string, () => TelemetryMetric[]> = new Map();
  private analyticsQueue: TelemetryMetric[] = [];
  private isAnalyzing: boolean = false;
  private lastAnalysis: number = 0;
  private retentionPeriod: number = 7 * 24 * 60 * 60 * 1000; // 7 jours

  constructor() {
    this.initializeTelemetryEngine();
  }

  /**
   * Initialise le moteur de télémétrie
   */
  private async initializeTelemetryEngine(): Promise<void> {
    console.log('📊 [TELEMETRY] Initializing advanced telemetry & analytics engine...');

    // Enregistrer les collecteurs de métriques
    this.registerMetricCollectors();

    // Configurer les seuils par défaut
    this.configureDefaultThresholds();

    // Démarrer la collecte en continu
    this.startContinuousCollection();

    // Démarrer l'analyse des patterns
    this.startPatternAnalysis();

    // Charger les données historiques
    await this.loadHistoricalData();

    console.log(
      '📈 [TELEMETRY] Advanced telemetry engine online with',
      this.collectors.size,
      'collectors'
    );
  }

  /**
   * Enregistre tous les collecteurs de métriques
   */
  private registerMetricCollectors(): void {
    // Collecteur de performance système
    this.collectors.set('system_performance', () => {
      const perfReport = performanceOptimizer.generatePerformanceReport();
      return [
        {
          id: 'cache_hit_rate',
          name: 'Cache Hit Rate',
          value: perfReport.cache?.hitRate || 0,
          unit: '%',
          category: 'performance',
          priority: 'high',
          timestamp: Date.now(),
          source: 'performance_optimizer',
          metadata: { cacheSize: perfReport.cache?.size || 0 },
        },
        {
          id: 'cache_size',
          name: 'Cache Size',
          value: perfReport.cache?.size || 0,
          unit: 'entries',
          category: 'performance',
          priority: 'medium',
          timestamp: Date.now(),
          source: 'performance_optimizer',
        },
        {
          id: 'preload_success_rate',
          name: 'Preload Success Rate',
          value: Math.random() * 100, // Simulation
          unit: '%',
          category: 'performance',
          priority: 'medium',
          timestamp: Date.now(),
          source: 'performance_optimizer',
        },
      ];
    });

    // Collecteur de santé système
    this.collectors.set('system_health', () => {
      const healthReport = bootHealthMonitor.generateReport();
      const healingState = titaneSelfHealing.getSystemState();

      return [
        {
          id: 'boot_success_rate',
          name: 'Boot Success Rate',
          value: healthReport.overview?.bootSuccessRate || 0.95,
          unit: '%',
          category: 'health',
          priority: 'critical',
          timestamp: Date.now(),
          source: 'boot_health_monitor',
        },
        {
          id: 'system_health_score',
          name: 'System Health Score',
          value: healingState.health,
          unit: 'score',
          category: 'health',
          priority: 'critical',
          timestamp: Date.now(),
          source: 'self_healing_system',
        },
        {
          id: 'active_issues_count',
          name: 'Active Issues Count',
          value: healingState.activeIssues.length,
          unit: 'count',
          category: 'health',
          priority: 'high',
          timestamp: Date.now(),
          source: 'self_healing_system',
        },
      ];
    });

    // Collecteur de métriques utilisateur
    this.collectors.set('user_experience', () => {
      if (typeof window === 'undefined') return [];

      return [
        {
          id: 'page_load_time',
          name: 'Page Load Time',
          value: performance.now(),
          unit: 'ms',
          category: 'user',
          priority: 'high',
          timestamp: Date.now(),
          source: 'browser_performance',
        },
        {
          id: 'memory_usage',
          name: 'Memory Usage',
          value: (performance as any).memory?.usedJSHeapSize || 0,
          unit: 'bytes',
          category: 'system',
          priority: 'medium',
          timestamp: Date.now(),
          source: 'browser_performance',
          metadata: {
            totalHeapSize: (performance as any).memory?.totalJSHeapSize || 0,
            heapSizeLimit: (performance as any).memory?.jsHeapSizeLimit || 0,
          },
        },
        {
          id: 'connection_type',
          name: 'Connection Type',
          value: (navigator as any)?.connection?.effectiveType || 'unknown',
          category: 'system',
          priority: 'low',
          timestamp: Date.now(),
          source: 'browser_network',
        },
      ];
    });

    // Collecteur d'IA et prédictions
    this.collectors.set('ai_predictions', () => {
      return [
        {
          id: 'ai_model_accuracy',
          name: 'AI Model Accuracy',
          value: 85 + Math.random() * 10, // Simulation
          unit: '%',
          category: 'system',
          priority: 'medium',
          timestamp: Date.now(),
          source: 'ai_predictive_engine',
        },
        {
          id: 'prediction_confidence',
          name: 'Prediction Confidence',
          value: 75 + Math.random() * 20, // Simulation
          unit: '%',
          category: 'system',
          priority: 'medium',
          timestamp: Date.now(),
          source: 'ai_predictive_engine',
        },
      ];
    });

    // Collecteur de sécurité
    this.collectors.set('security_metrics', () => {
      return [
        {
          id: 'failed_requests',
          name: 'Failed Requests',
          value: Math.floor(Math.random() * 5), // Simulation
          unit: 'count',
          category: 'security',
          priority: 'high',
          timestamp: Date.now(),
          source: 'security_monitor',
        },
        {
          id: 'suspicious_activity',
          name: 'Suspicious Activity Score',
          value: Math.random() * 100,
          unit: 'score',
          category: 'security',
          priority: 'critical',
          timestamp: Date.now(),
          source: 'security_monitor',
        },
      ];
    });
  }

  /**
   * Configure les seuils par défaut
   */
  private configureDefaultThresholds(): void {
    const defaultThresholds: MetricThreshold[] = [
      {
        metricId: 'cache_hit_rate',
        warning: 70,
        error: 50,
        critical: 30,
        direction: 'below',
        enabled: true,
      },
      {
        metricId: 'boot_success_rate',
        warning: 90,
        error: 80,
        critical: 60,
        direction: 'below',
        enabled: true,
      },
      {
        metricId: 'system_health_score',
        warning: 0.8,
        error: 0.6,
        critical: 0.4,
        direction: 'below',
        enabled: true,
      },
      {
        metricId: 'active_issues_count',
        warning: 3,
        error: 5,
        critical: 8,
        direction: 'above',
        enabled: true,
      },
      {
        metricId: 'memory_usage',
        warning: 100 * 1024 * 1024, // 100MB
        error: 200 * 1024 * 1024, // 200MB
        critical: 500 * 1024 * 1024, // 500MB
        direction: 'above',
        enabled: true,
      },
      {
        metricId: 'page_load_time',
        warning: 2000,
        error: 5000,
        critical: 10000,
        direction: 'above',
        enabled: true,
      },
    ];

    defaultThresholds.forEach(threshold => {
      this.thresholds.set(threshold.metricId, threshold);
    });
  }

  /**
   * Démarre la collecte continue de métriques
   */
  private startContinuousCollection(): void {
    const collect = async () => {
      try {
        const allMetrics: TelemetryMetric[] = [];

        // Collecter depuis tous les collecteurs
        for (const [collectorName, collector] of this.collectors.entries()) {
          try {
            const metrics = collector();
            allMetrics.push(...metrics);
          } catch (error) {
            console.warn(`📊 [TELEMETRY] Collector ${collectorName} failed:`, error);
          }
        }

        // Stocker les métriques
        allMetrics.forEach(metric => {
          this.storeMetric(metric);
        });

        // Ajouter à la queue d'analyse
        this.analyticsQueue.push(...allMetrics);

        // Vérifier les seuils et générer des alertes
        this.checkThresholds(allMetrics);

        // Nettoyer les anciennes données
        this.cleanupOldData();
      } catch (error) {
        console.error('📊 [TELEMETRY] Collection cycle failed:', error);
      }
    };

    // Collecte toutes les 30 secondes
    setInterval(collect, 30000);
    collect(); // Première exécution immédiate
  }

  /**
   * Démarre l'analyse des patterns
   */
  private startPatternAnalysis(): void {
    const analyze = async () => {
      if (this.isAnalyzing || this.analyticsQueue.length < 10) return;

      this.isAnalyzing = true;

      try {
        console.log(
          `📈 [TELEMETRY] Analyzing ${this.analyticsQueue.length} metrics for patterns...`
        );

        // Analyser les tendances
        await this.analyzeTrends();

        // Détecter les anomalies
        await this.detectAnomalies();

        // Trouver les corrélations
        await this.findCorrelations();

        // Détecter les cycles
        await this.detectCyclicalPatterns();

        // Générer des recommandations
        await this.generateRecommendations();

        // Nettoyer la queue
        this.analyticsQueue = [];
        this.lastAnalysis = Date.now();

        console.log(
          `🎯 [TELEMETRY] Pattern analysis completed. Found ${this.patterns.size} patterns.`
        );
      } catch (error) {
        console.error('📈 [TELEMETRY] Pattern analysis failed:', error);
      } finally {
        this.isAnalyzing = false;
      }
    };

    // Analyse toutes les 2 minutes
    setInterval(analyze, 120000);
  }

  /**
   * Stocke une métrique
   */
  private storeMetric(metric: TelemetryMetric): void {
    if (!this.metrics.has(metric.id)) {
      this.metrics.set(metric.id, []);
    }

    const metricHistory = this.metrics.get(metric.id)!;
    metricHistory.unshift(metric);

    // Limiter l'historique à 1000 entrées par métrique
    if (metricHistory.length > 1000) {
      metricHistory.splice(1000);
    }
  }

  /**
   * Vérifie les seuils et génère des alertes
   */
  private checkThresholds(metrics: TelemetryMetric[]): void {
    for (const metric of metrics) {
      const threshold = this.thresholds.get(metric.id);
      if (!threshold || !threshold.enabled || typeof metric.value !== 'number') continue;

      let alertLevel: 'info' | 'warning' | 'error' | 'critical' | null = null;
      let thresholdValue = 0;

      const value = metric.value as number;

      if (threshold.direction === 'above') {
        if (value >= threshold.critical) {
          alertLevel = 'critical';
          thresholdValue = threshold.critical;
        } else if (value >= threshold.error) {
          alertLevel = 'error';
          thresholdValue = threshold.error;
        } else if (value >= threshold.warning) {
          alertLevel = 'warning';
          thresholdValue = threshold.warning;
        }
      } else {
        // below
        if (value <= threshold.critical) {
          alertLevel = 'critical';
          thresholdValue = threshold.critical;
        } else if (value <= threshold.error) {
          alertLevel = 'error';
          thresholdValue = threshold.error;
        } else if (value <= threshold.warning) {
          alertLevel = 'warning';
          thresholdValue = threshold.warning;
        }
      }

      if (alertLevel) {
        this.generateAlert(alertLevel, metric, thresholdValue);
      }
    }
  }

  /**
   * Génère une alerte
   */
  private generateAlert(
    level: 'info' | 'warning' | 'error' | 'critical',
    metric: TelemetryMetric,
    threshold: number
  ): void {
    const alertId = `${metric.id}_${Date.now()}`;

    const alert: TelemetryAlert = {
      id: alertId,
      level,
      title: `${metric.name} ${level.toUpperCase()}`,
      message: `${metric.name} is ${metric.value}${metric.unit || ''} (threshold: ${threshold}${metric.unit || ''})`,
      metric: metric.id,
      threshold,
      currentValue: metric.value as number,
      timestamp: Date.now(),
      acknowledged: false,
      autoResolved: false,
    };

    this.alerts.unshift(alert);

    // Limiter à 100 alertes
    if (this.alerts.length > 100) {
      this.alerts.splice(100);
    }

    console.warn(`🚨 [TELEMETRY] ${level.toUpperCase()} Alert: ${alert.message}`);

    // Auto-résolution pour les alertes de niveau info
    if (level === 'info') {
      setTimeout(() => {
        alert.autoResolved = true;
      }, 60000); // 1 minute
    }
  }

  /**
   * Analyse des tendances
   */
  private async analyzeTrends(): Promise<void> {
    for (const [metricId, metricHistory] of this.metrics.entries()) {
      if (metricHistory.length < 5) continue;

      const recentMetrics = metricHistory.slice(0, 10);
      const values = recentMetrics
        .map(m => m.value)
        .filter(v => typeof v === 'number') as number[];

      if (values.length < 3) continue;

      // Calculer la tendance simple
      const trend = this.calculateTrend(values);

      if (Math.abs(trend) > 0.1) {
        // Seuil de détection de tendance
        const patternId = `trend_${metricId}`;

        this.patterns.set(patternId, {
          id: patternId,
          name: `${recentMetrics[0].name} Trend`,
          description: trend > 0 ? 'Upward trend detected' : 'Downward trend detected',
          type: 'trend',
          confidence: Math.min(Math.abs(trend) * 100, 100),
          detected: Date.now(),
          impact: this.determineTrendImpact(metricId, trend),
          recommendations: this.getTrendRecommendations(metricId, trend),
          metrics: [metricId],
        });
      }
    }
  }

  /**
   * Détection des anomalies
   */
  private async detectAnomalies(): Promise<void> {
    for (const [metricId, metricHistory] of this.metrics.entries()) {
      if (metricHistory.length < 20) continue;

      const values = metricHistory
        .slice(0, 50)
        .map(m => m.value)
        .filter(v => typeof v === 'number') as number[];

      if (values.length < 10) continue;

      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance =
        values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);

      const currentValue = values[0];
      const zScore = Math.abs((currentValue - mean) / stdDev);

      // Détecter les anomalies (z-score > 2)
      if (zScore > 2 && !isNaN(zScore)) {
        const patternId = `anomaly_${metricId}`;

        this.patterns.set(patternId, {
          id: patternId,
          name: `${metricHistory[0].name} Anomaly`,
          description: `Unusual value detected: ${currentValue} (expected: ${mean.toFixed(2)} ± ${stdDev.toFixed(2)})`,
          type: 'anomaly',
          confidence: Math.min(zScore * 25, 100),
          detected: Date.now(),
          impact: this.determineAnomalyImpact(metricId, zScore),
          recommendations: this.getAnomalyRecommendations(metricId, zScore),
          metrics: [metricId],
        });
      }
    }
  }

  /**
   * Recherche de corrélations
   */
  private async findCorrelations(): Promise<void> {
    const metricIds = Array.from(this.metrics.keys());

    for (let i = 0; i < metricIds.length - 1; i++) {
      for (let j = i + 1; j < metricIds.length; j++) {
        const correlation = this.calculateCorrelation(metricIds[i], metricIds[j]);

        if (Math.abs(correlation) > 0.7) {
          // Forte corrélation
          const patternId = `correlation_${metricIds[i]}_${metricIds[j]}`;

          this.patterns.set(patternId, {
            id: patternId,
            name: `Correlation: ${metricIds[i]} & ${metricIds[j]}`,
            description: `${correlation > 0 ? 'Positive' : 'Negative'} correlation detected (${correlation.toFixed(3)})`,
            type: 'correlation',
            confidence: Math.abs(correlation) * 100,
            detected: Date.now(),
            impact: 'neutral',
            recommendations: [
              `Monitor both ${metricIds[i]} and ${metricIds[j]} together`,
            ],
            metrics: [metricIds[i], metricIds[j]],
          });
        }
      }
    }
  }

  /**
   * Détection des patterns cycliques
   */
  private async detectCyclicalPatterns(): Promise<void> {
    // Implémentation simplifiée pour la détection de cycles
    for (const [metricId, metricHistory] of this.metrics.entries()) {
      if (metricHistory.length < 50) continue;

      const values = metricHistory
        .slice(0, 100)
        .map(m => m.value)
        .filter(v => typeof v === 'number') as number[];

      if (values.length < 20) continue;

      // Détecter des cycles simples (simulation)
      const hasCycle = this.detectSimpleCycle(values);

      if (hasCycle) {
        const patternId = `cycle_${metricId}`;

        this.patterns.set(patternId, {
          id: patternId,
          name: `${metricHistory[0].name} Cyclical Pattern`,
          description: 'Recurring pattern detected in metric values',
          type: 'cyclical',
          confidence: 60 + Math.random() * 30,
          detected: Date.now(),
          impact: 'neutral',
          recommendations: ['Consider time-based optimization strategies'],
          metrics: [metricId],
        });
      }
    }
  }

  /**
   * Génération de recommandations
   */
  private async generateRecommendations(): Promise<void> {
    // Les recommandations sont générées au niveau des patterns individuels
    // Cette méthode peut être étendue pour des recommandations globales
  }

  /**
   * Méthodes utilitaires pour les calculs
   */
  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;
    const n = values.length;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumX2 += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return isNaN(slope) ? 0 : slope;
  }

  private calculateCorrelation(metricId1: string, metricId2: string): number {
    const metrics1 = this.metrics.get(metricId1);
    const metrics2 = this.metrics.get(metricId2);

    if (!metrics1 || !metrics2) return 0;

    const values1 = metrics1
      .slice(0, 30)
      .map(m => m.value)
      .filter(v => typeof v === 'number') as number[];
    const values2 = metrics2
      .slice(0, 30)
      .map(m => m.value)
      .filter(v => typeof v === 'number') as number[];

    const minLength = Math.min(values1.length, values2.length);
    if (minLength < 5) return 0;

    const v1 = values1.slice(0, minLength);
    const v2 = values2.slice(0, minLength);

    const mean1 = v1.reduce((a, b) => a + b, 0) / minLength;
    const mean2 = v2.reduce((a, b) => a + b, 0) / minLength;

    let numerator = 0;
    let sum1Sq = 0;
    let sum2Sq = 0;

    for (let i = 0; i < minLength; i++) {
      const diff1 = v1[i] - mean1;
      const diff2 = v2[i] - mean2;
      numerator += diff1 * diff2;
      sum1Sq += diff1 * diff1;
      sum2Sq += diff2 * diff2;
    }

    const denominator = Math.sqrt(sum1Sq * sum2Sq);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  private detectSimpleCycle(values: number[]): boolean {
    // Détection de cycle simple (simulation)
    if (values.length < 10) return false;

    // Chercher des patterns répétitifs simples
    for (let cycleLength = 3; cycleLength <= values.length / 3; cycleLength++) {
      let matches = 0;
      const threshold = values.length / cycleLength;

      for (let i = 0; i < values.length - cycleLength; i++) {
        if (Math.abs(values[i] - values[i + cycleLength]) < values[i] * 0.1) {
          matches++;
        }
      }

      if (matches / threshold > 0.6) {
        return true;
      }
    }

    return false;
  }

  private determineTrendImpact(
    metricId: string,
    trend: number
  ): 'positive' | 'negative' | 'neutral' {
    const goodMetrics = [
      'cache_hit_rate',
      'boot_success_rate',
      'system_health_score',
      'ai_model_accuracy',
    ];
    const badMetrics = [
      'active_issues_count',
      'failed_requests',
      'page_load_time',
      'memory_usage',
    ];

    if (goodMetrics.includes(metricId)) {
      return trend > 0 ? 'positive' : 'negative';
    } else if (badMetrics.includes(metricId)) {
      return trend > 0 ? 'negative' : 'positive';
    }

    return 'neutral';
  }

  private determineAnomalyImpact(
    metricId: string,
    zScore: number
  ): 'positive' | 'negative' | 'neutral' {
    return zScore > 3 ? 'negative' : 'neutral';
  }

  private getTrendRecommendations(metricId: string, trend: number): string[] {
    const recommendations: { [key: string]: { positive: string[]; negative: string[] } } =
      {
        cache_hit_rate: {
          positive: ['Monitor cache performance', 'Consider increasing cache size'],
          negative: ['Optimize cache strategy', 'Review cache invalidation logic'],
        },
        boot_success_rate: {
          positive: ['Maintain current boot optimization'],
          negative: ['Investigate boot failures', 'Run diagnostic checks'],
        },
        memory_usage: {
          positive: ['Monitor memory leaks', 'Consider memory optimization'],
          negative: ['Memory usage improving', 'Continue current optimization'],
        },
      };

    const metricRecs = recommendations[metricId];
    if (!metricRecs) return ['Monitor this metric closely'];

    return trend > 0 ? metricRecs.positive : metricRecs.negative;
  }

  private getAnomalyRecommendations(metricId: string, zScore: number): string[] {
    return [
      'Investigate the cause of this anomaly',
      'Check for system changes or external factors',
      zScore > 3 ? 'Consider immediate attention' : 'Monitor closely for recurrence',
    ];
  }

  /**
   * Nettoyage des anciennes données
   */
  private cleanupOldData(): void {
    const cutoff = Date.now() - this.retentionPeriod;

    // Nettoyer les métriques anciennes
    for (const [metricId, metricHistory] of this.metrics.entries()) {
      const filteredHistory = metricHistory.filter(m => m.timestamp > cutoff);
      this.metrics.set(metricId, filteredHistory);
    }

    // Nettoyer les alertes anciennes
    this.alerts = this.alerts.filter(alert => alert.timestamp > cutoff);

    // Nettoyer les patterns anciens
    for (const [patternId, pattern] of this.patterns.entries()) {
      if (pattern.detected < cutoff) {
        this.patterns.delete(patternId);
      }
    }
  }

  /**
   * Charge les données historiques
   */
  private async loadHistoricalData(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('titane_telemetry_data');
      if (stored) {
        const data = JSON.parse(stored);

        // Charger les métriques
        if (data.metrics) {
          for (const [metricId, metricHistory] of Object.entries(data.metrics)) {
            this.metrics.set(metricId, metricHistory as TelemetryMetric[]);
          }
        }

        // Charger les alertes récentes
        if (data.alerts) {
          this.alerts = data.alerts.slice(0, 50);
        }

        console.log('📊 [TELEMETRY] Historical data loaded successfully');
      }
    } catch (error) {
      console.warn('📊 [TELEMETRY] Failed to load historical data:', error);
    }
  }

  /**
   * Sauvegarde les données
   */
  private async saveData(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const data = {
        metrics: Object.fromEntries(this.metrics.entries()),
        alerts: this.alerts.slice(0, 50),
        timestamp: Date.now(),
      };

      localStorage.setItem('titane_telemetry_data', JSON.stringify(data));
    } catch (error) {
      console.warn('📊 [TELEMETRY] Failed to save data:', error);
    }
  }

  /**
   * API publique pour obtenir un rapport complet
   */
  public generateTelemetryReport(period: string = '1h'): TelemetryReport {
    const now = Date.now();
    const cutoff = this.getPeriodCutoff(period);

    // Calculer les métriques de résumé
    const recentMetrics = Array.from(this.metrics.values())
      .flat()
      .filter(m => m.timestamp > cutoff);

    const recentAlerts = this.alerts.filter(a => a.timestamp > cutoff);
    const recentPatterns = Array.from(this.patterns.values()).filter(
      p => p.detected > cutoff
    );

    // Métriques clés
    const keyMetrics = this.getKeyMetrics();

    // Prédictions basées sur l'IA
    const predictions = this.generatePredictions();

    // Recommandations globales
    const recommendations = this.generateGlobalRecommendations();

    return {
      timestamp: now,
      period,
      summary: {
        totalMetrics: recentMetrics.length,
        alertsGenerated: recentAlerts.length,
        patternsDetected: recentPatterns.length,
        systemHealth: this.calculateOverallHealth(),
        performanceScore: this.calculatePerformanceScore(),
      },
      keyMetrics,
      detectedPatterns: recentPatterns,
      alerts: recentAlerts,
      predictions,
      recommendations,
    };
  }

  /**
   * API publique pour obtenir les métriques d'une catégorie
   */
  public getMetricsByCategory(category: TelemetryMetric['category']): TelemetryMetric[] {
    const allMetrics = Array.from(this.metrics.values()).flat();
    return allMetrics.filter(m => m.category === category);
  }

  /**
   * API publique pour obtenir l'historique d'une métrique
   */
  public getMetricHistory(metricId: string, limit: number = 50): TelemetryMetric[] {
    const history = this.metrics.get(metricId);
    return history ? history.slice(0, limit) : [];
  }

  /**
   * API publique pour configurer un seuil
   */
  public setThreshold(metricId: string, threshold: Partial<MetricThreshold>): void {
    const existing = this.thresholds.get(metricId) || {
      metricId,
      warning: 0,
      error: 0,
      critical: 0,
      direction: 'above',
      enabled: true,
    };

    this.thresholds.set(metricId, { ...existing, ...threshold });
  }

  /**
   * API publique pour acquitter une alerte
   */
  public acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  /**
   * Méthodes utilitaires pour les rapports
   */
  private getPeriodCutoff(period: string): number {
    const now = Date.now();
    const periods: { [key: string]: number } = {
      '15m': 15 * 60 * 1000,
      '30m': 30 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
    };

    return now - (periods[period] || periods['1h']);
  }

  private getKeyMetrics(): TelemetryMetric[] {
    const keyMetricIds = [
      'system_health_score',
      'boot_success_rate',
      'cache_hit_rate',
      'memory_usage',
      'page_load_time',
    ];

    return keyMetricIds
      .map(id => this.metrics.get(id)?.[0])
      .filter(Boolean) as TelemetryMetric[];
  }

  private generatePredictions(): { [key: string]: number } {
    // Simulation de prédictions basées sur l'IA
    return {
      boot_failure_risk: Math.random() * 30,
      performance_degradation: Math.random() * 40,
      resource_exhaustion: Math.random() * 25,
      user_experience_impact: Math.random() * 20,
    };
  }

  private generateGlobalRecommendations(): string[] {
    const recommendations = [];

    // Recommandations basées sur les patterns détectés
    const criticalAlerts = this.alerts.filter(
      a => a.level === 'critical' && !a.acknowledged
    );
    if (criticalAlerts.length > 0) {
      recommendations.push(
        `Address ${criticalAlerts.length} critical alert(s) immediately`
      );
    }

    const anomalies = Array.from(this.patterns.values()).filter(
      p => p.type === 'anomaly'
    );
    if (anomalies.length > 2) {
      recommendations.push('Multiple anomalies detected - investigate system stability');
    }

    // Recommandations génériques
    recommendations.push(
      'Monitor key performance indicators regularly',
      'Update thresholds based on system behavior',
      'Review and optimize based on detected patterns'
    );

    return recommendations;
  }

  private calculateOverallHealth(): number {
    const healthMetric = this.metrics.get('system_health_score');
    return healthMetric && healthMetric[0] ? (healthMetric[0].value as number) : 0.8;
  }

  private calculatePerformanceScore(): number {
    const cacheMetric = this.metrics.get('cache_hit_rate');
    const bootMetric = this.metrics.get('boot_success_rate');

    const cacheScore =
      cacheMetric && cacheMetric[0] ? (cacheMetric[0].value as number) / 100 : 0.8;
    const bootScore = bootMetric && bootMetric[0] ? (bootMetric[0].value as number) : 0.9;

    return (cacheScore + bootScore) / 2;
  }

  /**
   * Démarrage automatique de la sauvegarde périodique
   */
  private startPeriodicSave(): void {
    setInterval(
      () => {
        this.saveData();
      },
      5 * 60 * 1000
    ); // Sauvegarde toutes les 5 minutes
  }
}

// Instance globale
export const titaneTelemetry = new TitaneTelemetryEngine();

// Export des types
export type {
  TelemetryMetric,
  AnalyticsPattern,
  TelemetryReport,
  TelemetryAlert,
  MetricThreshold,
};
