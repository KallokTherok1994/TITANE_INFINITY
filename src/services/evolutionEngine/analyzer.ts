/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * TITANE∞ EVOLUTION ENGINE — Analyzer (Evolution Analyzer)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @file        analyzer.ts
 * @version     vΩ∞Ω∞
 *
 * Analyse les données collectées pour extraire patterns, insights et scores
 * Transforme les données brutes en compréhension actionnable
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import type {
  EvolutionDataPoint,
  EvolutionPattern,
  EvolutionInsight,
  EvolutionScores,
  EvolutionReport,
  PatternType,
  DataCategory,
  TitaneModule,
  RiskLevel,
  TrendDirection,
  PerformanceTrend,
  AnalyzerConfig,
  IAUsageStats,
  EngineUsageStats,
  SelfHealingMetrics,
  PromptMemoryMetrics,
} from './evolutionEngine.config';
import {
  generateEvolutionId,
  calculateEvolutionScore,
  scoreToGrade,
  determineTrend,
  calculateTimeSeriesStats,
  detectAnomalies,
  DEFAULT_ANALYZER_CONFIG,
} from './evolutionEngine.config';
import { getCollector } from './collector';

// =============================================================================
// TYPES INTERNES
// =============================================================================

interface AnalyzerState {
  patterns: EvolutionPattern[];
  insights: EvolutionInsight[];
  scores: EvolutionScores;
  lastAnalysis: number;
  isAnalyzing: boolean;
}

type PatternListener = (pattern: EvolutionPattern) => void;
type InsightListener = (insight: EvolutionInsight) => void;
type ReportListener = (report: EvolutionReport) => void;

// =============================================================================
// ANALYZER CLASS
// =============================================================================

/**
 * Analyseur de données d'évolution
 * Extrait patterns, insights et calcule les scores
 */
export class Analyzer {
  private config: AnalyzerConfig;
  private state: AnalyzerState;
  private patternListeners: Set<PatternListener> = new Set();
  private insightListeners: Set<InsightListener> = new Set();
  private reportListeners: Set<ReportListener> = new Set();
  private analyzeIntervalId: NodeJS.Timeout | null = null;

  constructor(config?: Partial<AnalyzerConfig>) {
    this.config = { ...DEFAULT_ANALYZER_CONFIG, ...config };
    this.state = this.createInitialState();
  }

  // ===========================================================================
  // INITIALISATION
  // ===========================================================================

  private createInitialState(): AnalyzerState {
    return {
      patterns: [],
      insights: [],
      scores: {
        stabilityIndex: 100,
        cognitiveEfficiency: 100,
        contextRelevance: 100,
        engineReliability: 100,
        overallScore: 100,
        grade: 'S',
        trend: 'STABLE',
        lastCalculated: Date.now(),
      },
      lastAnalysis: 0,
      isAnalyzing: false,
    };
  }

  // ===========================================================================
  // DÉMARRAGE / ARRÊT
  // ===========================================================================

  /**
   * Démarre l'analyse automatique
   */
  start(): void {
    if (!this.config.enabled) return;
    if (this.analyzeIntervalId) return;

    this.analyzeIntervalId = setInterval(() => {
      this.analyzeCycle();
    }, this.config.analyzeInterval);
  }

  /**
   * Arrête l'analyse
   */
  stop(): void {
    if (this.analyzeIntervalId) {
      clearInterval(this.analyzeIntervalId);
      this.analyzeIntervalId = null;
    }
  }

  /**
   * Cycle d'analyse principal
   */
  async analyzeCycle(): Promise<EvolutionReport | null> {
    if (this.state.isAnalyzing) return null;

    const collector = getCollector();
    const dataPoints = collector.getRecentDataPoints(10000);

    if (dataPoints.length < this.config.minDataPointsForAnalysis) {
      return null;
    }

    this.state.isAnalyzing = true;

    try {
      // 1. Détecter les patterns
      const newPatterns = this.detectPatterns(dataPoints);
      this.mergePatterns(newPatterns);

      // 2. Extraire les insights
      const newInsights = this.extractInsights(this.state.patterns, dataPoints);
      this.mergeInsights(newInsights);

      // 3. Calculer les scores
      this.calculateScores(dataPoints, collector.getEngineStats());

      // 4. Générer le rapport
      const report = this.generateReport(collector);

      this.state.lastAnalysis = Date.now();

      // Notifier les listeners
      this.reportListeners.forEach((listener) => {
        try {
          listener(report);
        } catch (e) {
          console.error('[Analyzer] Report listener error:', e);
        }
      });

      return report;
    } catch (error) {
      console.error('[Analyzer] Erreur analyse:', error);
      return null;
    } finally {
      this.state.isAnalyzing = false;
    }
  }

  // ===========================================================================
  // DÉTECTION DE PATTERNS
  // ===========================================================================

  /**
   * Détecte les patterns dans les données
   */
  private detectPatterns(dataPoints: EvolutionDataPoint[]): EvolutionPattern[] {
    const patterns: EvolutionPattern[] = [];

    // Grouper par module
    const byModule = this.groupByModule(dataPoints);

    for (const [moduleId, points] of byModule.entries()) {
      // Détecter les inefficiences
      const inefficiencies = this.detectInefficiencyPatterns(moduleId, points);
      patterns.push(...inefficiencies);

      // Détecter les répétitions
      const repetitions = this.detectRepetitionPatterns(moduleId, points);
      patterns.push(...repetitions);

      // Détecter les surcharges
      const overloads = this.detectOverloadPatterns(moduleId, points);
      patterns.push(...overloads);

      // Détecter les latences
      const latencies = this.detectLatencyPatterns(moduleId, points);
      patterns.push(...latencies);

      // Détecter les succès (patterns positifs)
      const successes = this.detectSuccessPatterns(moduleId, points);
      patterns.push(...successes);
    }

    // Limiter le nombre de patterns
    return patterns
      .filter((p) => p.confidence >= this.config.patternConfidenceThreshold)
      .slice(0, this.config.maxPatternsPerCycle);
  }

  private groupByModule(
    dataPoints: EvolutionDataPoint[]
  ): Map<TitaneModule, EvolutionDataPoint[]> {
    const map = new Map<TitaneModule, EvolutionDataPoint[]>();
    for (const dp of dataPoints) {
      const existing = map.get(dp.moduleId) || [];
      existing.push(dp);
      map.set(dp.moduleId, existing);
    }
    return map;
  }

  /**
   * Détecte les patterns d'inefficience
   */
  private detectInefficiencyPatterns(
    moduleId: TitaneModule,
    points: EvolutionDataPoint[]
  ): EvolutionPattern[] {
    const patterns: EvolutionPattern[] = [];

    // Analyser les latences élevées
    const latencyPoints = points.filter(
      (p) => p.metric === 'avg_latency' && typeof p.value === 'number'
    );
    if (latencyPoints.length > 10) {
      const values = latencyPoints.map((p) => p.value as number);
      const stats = calculateTimeSeriesStats(values);

      if (stats.average > 500) {
        // > 500ms moyenne
        patterns.push({
          id: generateEvolutionId('pat'),
          type: 'INEFFICIENCY',
          moduleId,
          description: `Latence moyenne élevée (${stats.average.toFixed(0)}ms)`,
          occurrences: latencyPoints.length,
          firstSeen: latencyPoints[0].timestamp,
          lastSeen: latencyPoints[latencyPoints.length - 1].timestamp,
          confidence: Math.min(90, 50 + latencyPoints.length),
          impact: stats.average > 1000 ? 'HIGH' : 'MEDIUM',
          relatedMetrics: ['avg_latency'],
          suggestedAction: 'Optimiser les appels ou ajouter du cache',
        });
      }
    }

    // Analyser les erreurs fréquentes
    const errorPoints = points.filter((p) => p.metric === 'error_count');
    if (errorPoints.length > 5) {
      const totalErrors = errorPoints.reduce(
        (sum, p) => sum + (typeof p.value === 'number' ? p.value : 0),
        0
      );
      if (totalErrors > 10) {
        patterns.push({
          id: generateEvolutionId('pat'),
          type: 'INEFFICIENCY',
          moduleId,
          description: `Taux d'erreurs élevé (${totalErrors} erreurs détectées)`,
          occurrences: totalErrors,
          firstSeen: errorPoints[0].timestamp,
          lastSeen: errorPoints[errorPoints.length - 1].timestamp,
          confidence: Math.min(95, 60 + totalErrors),
          impact: totalErrors > 50 ? 'HIGH' : 'MEDIUM',
          relatedMetrics: ['error_count', 'error_rate'],
          suggestedAction: 'Investiguer les causes des erreurs',
        });
      }
    }

    return patterns;
  }

  /**
   * Détecte les patterns de répétition
   */
  private detectRepetitionPatterns(
    moduleId: TitaneModule,
    points: EvolutionDataPoint[]
  ): EvolutionPattern[] {
    const patterns: EvolutionPattern[] = [];

    // Détecter les appels répétitifs dans un court laps de temps
    const callPoints = points.filter((p) => p.metric === 'total_calls');
    if (callPoints.length > 20) {
      const intervals: number[] = [];
      for (let i = 1; i < callPoints.length; i++) {
        intervals.push(callPoints[i].timestamp - callPoints[i - 1].timestamp);
      }

      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      if (avgInterval < 1000) {
        // Appels toutes les secondes ou moins
        patterns.push({
          id: generateEvolutionId('pat'),
          type: 'REPETITION',
          moduleId,
          description: `Appels très fréquents (interval moyen: ${avgInterval.toFixed(0)}ms)`,
          occurrences: callPoints.length,
          firstSeen: callPoints[0].timestamp,
          lastSeen: callPoints[callPoints.length - 1].timestamp,
          confidence: 75,
          impact: 'MEDIUM',
          relatedMetrics: ['total_calls'],
          suggestedAction: 'Considérer le debouncing ou le batching',
        });
      }
    }

    return patterns;
  }

  /**
   * Détecte les patterns de surcharge
   */
  private detectOverloadPatterns(
    moduleId: TitaneModule,
    points: EvolutionDataPoint[]
  ): EvolutionPattern[] {
    const patterns: EvolutionPattern[] = [];

    // CPU élevé
    const cpuPoints = points.filter(
      (p) => p.metric === 'cpu' && typeof p.value === 'number'
    );
    if (cpuPoints.length > 5) {
      const highCpuCount = cpuPoints.filter((p) => (p.value as number) > 80).length;
      if (highCpuCount > cpuPoints.length * 0.3) {
        patterns.push({
          id: generateEvolutionId('pat'),
          type: 'OVERLOAD',
          moduleId,
          description: `CPU fréquemment élevé (>80% dans ${((highCpuCount / cpuPoints.length) * 100).toFixed(0)}% des cas)`,
          occurrences: highCpuCount,
          firstSeen: cpuPoints[0].timestamp,
          lastSeen: cpuPoints[cpuPoints.length - 1].timestamp,
          confidence: 80,
          impact: 'HIGH',
          relatedMetrics: ['cpu'],
          suggestedAction: 'Optimiser les calculs ou augmenter les ressources',
        });
      }
    }

    // RAM élevée
    const ramPoints = points.filter(
      (p) => p.metric === 'ram' && typeof p.value === 'number'
    );
    if (ramPoints.length > 5) {
      const highRamCount = ramPoints.filter((p) => (p.value as number) > 85).length;
      if (highRamCount > ramPoints.length * 0.3) {
        patterns.push({
          id: generateEvolutionId('pat'),
          type: 'OVERLOAD',
          moduleId,
          description: `RAM fréquemment élevée (>85% dans ${((highRamCount / ramPoints.length) * 100).toFixed(0)}% des cas)`,
          occurrences: highRamCount,
          firstSeen: ramPoints[0].timestamp,
          lastSeen: ramPoints[ramPoints.length - 1].timestamp,
          confidence: 80,
          impact: 'HIGH',
          relatedMetrics: ['ram'],
          suggestedAction: 'Libérer la mémoire ou optimiser les structures',
        });
      }
    }

    return patterns;
  }

  /**
   * Détecte les patterns de latence
   */
  private detectLatencyPatterns(
    moduleId: TitaneModule,
    points: EvolutionDataPoint[]
  ): EvolutionPattern[] {
    const patterns: EvolutionPattern[] = [];

    const latencyPoints = points.filter(
      (p) =>
        (p.metric === 'latency' || p.metric === 'avg_latency') &&
        typeof p.value === 'number'
    );

    if (latencyPoints.length > 10) {
      const values = latencyPoints.map((p) => p.value as number);
      const anomalies = detectAnomalies(values, this.config.anomalyDetectionSensitivity);

      if (anomalies.length > 3) {
        patterns.push({
          id: generateEvolutionId('pat'),
          type: 'LATENCY',
          moduleId,
          description: `Pics de latence détectés (${anomalies.length} anomalies)`,
          occurrences: anomalies.length,
          firstSeen: latencyPoints[0].timestamp,
          lastSeen: latencyPoints[latencyPoints.length - 1].timestamp,
          confidence: 70,
          impact: 'MEDIUM',
          relatedMetrics: ['latency', 'avg_latency'],
          suggestedAction: 'Investiguer les causes des pics',
        });
      }
    }

    return patterns;
  }

  /**
   * Détecte les patterns de succès
   */
  private detectSuccessPatterns(
    moduleId: TitaneModule,
    points: EvolutionDataPoint[]
  ): EvolutionPattern[] {
    const patterns: EvolutionPattern[] = [];

    // Stabilité du module
    const errorPoints = points.filter(
      (p) => p.metric === 'error_count' && typeof p.value === 'number'
    );
    const totalCalls = points.filter((p) => p.metric === 'total_calls').length;

    if (totalCalls > 50 && errorPoints.length > 0) {
      const totalErrors = errorPoints.reduce((sum, p) => sum + (p.value as number), 0);
      const successRate = ((totalCalls - totalErrors) / totalCalls) * 100;

      if (successRate > 98) {
        patterns.push({
          id: generateEvolutionId('pat'),
          type: 'SUCCESS',
          moduleId,
          description: `Taux de succès excellent (${successRate.toFixed(1)}%)`,
          occurrences: totalCalls,
          firstSeen: points[0].timestamp,
          lastSeen: points[points.length - 1].timestamp,
          confidence: 90,
          impact: 'LOW',
          relatedMetrics: ['success_rate'],
        });
      }
    }

    return patterns;
  }

  /**
   * Fusionne les nouveaux patterns avec les existants
   */
  private mergePatterns(newPatterns: EvolutionPattern[]): void {
    for (const newPattern of newPatterns) {
      const existing = this.state.patterns.find(
        (p) =>
          p.type === newPattern.type &&
          p.moduleId === newPattern.moduleId &&
          p.description === newPattern.description
      );

      if (existing) {
        existing.occurrences += newPattern.occurrences;
        existing.lastSeen = newPattern.lastSeen;
        existing.confidence = Math.min(100, (existing.confidence + newPattern.confidence) / 2);
      } else {
        this.state.patterns.push(newPattern);

        // Notifier les listeners
        this.patternListeners.forEach((listener) => {
          try {
            listener(newPattern);
          } catch (e) {
            console.error('[Analyzer] Pattern listener error:', e);
          }
        });
      }
    }

    // Limiter le nombre de patterns
    if (this.state.patterns.length > 100) {
      this.state.patterns = this.state.patterns
        .sort((a, b) => b.lastSeen - a.lastSeen)
        .slice(0, 100);
    }
  }

  // ===========================================================================
  // EXTRACTION D'INSIGHTS
  // ===========================================================================

  /**
   * Extrait les insights des patterns et données
   */
  private extractInsights(
    patterns: EvolutionPattern[],
    dataPoints: EvolutionDataPoint[]
  ): EvolutionInsight[] {
    const insights: EvolutionInsight[] = [];

    // Grouper les patterns par type
    const byType = new Map<PatternType, EvolutionPattern[]>();
    for (const pattern of patterns) {
      const existing = byType.get(pattern.type) || [];
      existing.push(pattern);
      byType.set(pattern.type, existing);
    }

    // Insight: Problèmes de performance globaux
    const inefficiencies = byType.get('INEFFICIENCY') || [];
    const overloads = byType.get('OVERLOAD') || [];
    if (inefficiencies.length + overloads.length > 3) {
      insights.push({
        id: generateEvolutionId('ins'),
        timestamp: Date.now(),
        category: 'PERFORMANCE',
        title: 'Problèmes de performance détectés',
        description: `${inefficiencies.length + overloads.length} patterns de performance négatifs identifiés`,
        patterns: [...inefficiencies, ...overloads].map((p) => p.id),
        severity: 'MEDIUM',
        actionable: true,
        recommendedActions: [
          'Optimiser les modules critiques',
          'Vérifier les ressources système',
          'Activer le mode performance',
        ],
        affectedModules: [...new Set([...inefficiencies, ...overloads].map((p) => p.moduleId))],
        validUntil: Date.now() + 86400000,
      });
    }

    // Insight: Stabilité système
    const successes = byType.get('SUCCESS') || [];
    if (successes.length > 5) {
      insights.push({
        id: generateEvolutionId('ins'),
        timestamp: Date.now(),
        category: 'SYSTEM_METRICS',
        title: 'Système stable',
        description: `${successes.length} modules fonctionnent avec un excellent taux de succès`,
        patterns: successes.map((p) => p.id),
        severity: 'LOW',
        actionable: false,
        recommendedActions: [],
        affectedModules: [...new Set(successes.map((p) => p.moduleId))],
        validUntil: Date.now() + 86400000,
      });
    }

    // Insight: Problèmes de répétition
    const repetitions = byType.get('REPETITION') || [];
    if (repetitions.length > 2) {
      insights.push({
        id: generateEvolutionId('ins'),
        timestamp: Date.now(),
        category: 'ENGINE_USAGE',
        title: 'Appels redondants détectés',
        description: 'Plusieurs modules effectuent des appels trop fréquents',
        patterns: repetitions.map((p) => p.id),
        severity: 'MEDIUM',
        actionable: true,
        recommendedActions: [
          'Implémenter du debouncing',
          'Utiliser le batching',
          'Optimiser les fréquences de polling',
        ],
        affectedModules: [...new Set(repetitions.map((p) => p.moduleId))],
        validUntil: Date.now() + 86400000,
      });
    }

    return insights
      .filter((i) => this.calculateInsightRelevance(i) >= this.config.insightRelevanceThreshold)
      .slice(0, this.config.maxInsightsPerCycle);
  }

  private calculateInsightRelevance(insight: EvolutionInsight): number {
    let score = 50;

    // Plus de patterns = plus pertinent
    score += Math.min(30, insight.patterns.length * 5);

    // Actionnable = plus pertinent
    if (insight.actionable) score += 10;

    // Sévérité
    if (insight.severity === 'HIGH' || insight.severity === 'CRITICAL') score += 10;

    return score;
  }

  /**
   * Fusionne les nouveaux insights
   */
  private mergeInsights(newInsights: EvolutionInsight[]): void {
    for (const newInsight of newInsights) {
      const existing = this.state.insights.find(
        (i) => i.title === newInsight.title && i.category === newInsight.category
      );

      if (existing) {
        existing.timestamp = newInsight.timestamp;
        existing.patterns = [...new Set([...existing.patterns, ...newInsight.patterns])];
        existing.validUntil = newInsight.validUntil;
      } else {
        this.state.insights.push(newInsight);

        this.insightListeners.forEach((listener) => {
          try {
            listener(newInsight);
          } catch (e) {
            console.error('[Analyzer] Insight listener error:', e);
          }
        });
      }
    }

    // Nettoyer les insights expirés
    const now = Date.now();
    this.state.insights = this.state.insights.filter((i) => i.validUntil > now);
  }

  // ===========================================================================
  // CALCUL DES SCORES
  // ===========================================================================

  /**
   * Calcule les scores d'évolution
   */
  private calculateScores(
    dataPoints: EvolutionDataPoint[],
    engineStats: EngineUsageStats[]
  ): void {
    const now = Date.now();

    // Stability Index: basé sur les erreurs et anomalies
    const errorPatterns = this.state.patterns.filter(
      (p) => p.type === 'INEFFICIENCY' || p.type === 'OVERLOAD'
    );
    const stabilityIndex = Math.max(0, 100 - errorPatterns.length * 5);

    // Cognitive Efficiency: basé sur les latences et répétitions
    const latencyPatterns = this.state.patterns.filter(
      (p) => p.type === 'LATENCY' || p.type === 'REPETITION'
    );
    const cognitiveEfficiency = Math.max(0, 100 - latencyPatterns.length * 4);

    // Context Relevance: basé sur les métriques prompt/memory
    const contextPoints = dataPoints.filter((p) => p.category === 'PROMPT_MEMORY');
    const relevanceScores = contextPoints
      .filter((p) => p.metric === 'relevance_score' && typeof p.value === 'number')
      .map((p) => p.value as number);
    const contextRelevance =
      relevanceScores.length > 0
        ? relevanceScores.reduce((a, b) => a + b, 0) / relevanceScores.length
        : 100;

    // Engine Reliability: basé sur les success rates
    const successRates = engineStats
      .filter((s) => s.totalCalls > 0)
      .map((s) => s.successRate);
    const engineReliability =
      successRates.length > 0
        ? successRates.reduce((a, b) => a + b, 0) / successRates.length
        : 100;

    // Score global
    const overallScore = calculateEvolutionScore({
      stabilityIndex,
      cognitiveEfficiency,
      contextRelevance,
      engineReliability,
    });

    // Tendance
    const previousScore = this.state.scores.overallScore;
    const samples = [previousScore, overallScore];
    const trend = determineTrend(samples, 2);

    this.state.scores = {
      stabilityIndex: Math.round(stabilityIndex),
      cognitiveEfficiency: Math.round(cognitiveEfficiency),
      contextRelevance: Math.round(contextRelevance),
      engineReliability: Math.round(engineReliability),
      overallScore,
      grade: scoreToGrade(overallScore),
      trend,
      lastCalculated: now,
    };
  }

  // ===========================================================================
  // GÉNÉRATION DE RAPPORT
  // ===========================================================================

  /**
   * Génère un rapport d'évolution complet
   */
  private generateReport(collector: ReturnType<typeof getCollector>): EvolutionReport {
    const now = Date.now();
    const windowMs = this.config.trendWindowMs;

    // Collecter les données pour le rapport
    const iaStats = collector.getIAStats();
    const engineStats = collector.getEngineStats();

    // Générer les tendances de performance
    const performanceTrends: PerformanceTrend[] = this.generatePerformanceTrends(collector);

    // Métriques Self-Healing (simulées si non disponibles)
    const selfHealingMetrics: SelfHealingMetrics = {
      totalRepairs: 0,
      successfulRepairs: 0,
      failedRepairs: 0,
      averageRepairTime: 0,
      mostCommonIssues: [],
      preventedCrashes: 0,
      systemStabilityScore: this.state.scores.stabilityIndex,
    };

    // Métriques Prompt/Memory (simulées si non disponibles)
    const promptMemoryMetrics: PromptMemoryMetrics = {
      contextSize: 0,
      compressionRatio: 1,
      memoryUtilization: 0,
      contextRelevanceScore: this.state.scores.contextRelevance,
      overflowEvents: 0,
      truncationEvents: 0,
      averagePromptLength: 0,
      efficientPatterns: [],
      inefficientPatterns: [],
    };

    // Suggestions (à remplir par le Planner)
    const suggestions = this.generateBasicSuggestions();

    // Déterminer le niveau de risque global
    const riskAssessment = this.assessOverallRisk();

    // Générer le résumé
    const summary = this.generateSummary();

    return {
      id: generateEvolutionId('rep'),
      generatedAt: now,
      period: {
        start: now - windowMs,
        end: now,
        durationMs: windowMs,
      },
      scores: { ...this.state.scores },
      iaStats,
      engineStats,
      performanceTrends,
      selfHealingMetrics,
      promptMemoryMetrics,
      patterns: [...this.state.patterns],
      insights: [...this.state.insights],
      suggestions,
      summary,
      riskAssessment,
    };
  }

  private generatePerformanceTrends(
    collector: ReturnType<typeof getCollector>
  ): PerformanceTrend[] {
    const trends: PerformanceTrend[] = [];
    const metrics = ['cpu', 'ram', 'fps', 'latency'];

    for (const metric of metrics) {
      const series = collector.getTimeSeries('performance', metric, this.config.trendWindowMs);

      if (series.length > 5) {
        const values = series.map((s) => s.value);
        const stats = calculateTimeSeriesStats(values);
        const anomalies = detectAnomalies(values, this.config.anomalyDetectionSensitivity);

        trends.push({
          metric,
          samples: series,
          average: stats.average,
          min: stats.min,
          max: stats.max,
          stdDeviation: stats.stdDeviation,
          trend: determineTrend(values),
          anomalyCount: anomalies.length,
        });
      }
    }

    return trends;
  }

  private generateBasicSuggestions(): never[] {
    // Les suggestions sont générées par le Planner
    return [];
  }

  private assessOverallRisk(): RiskLevel {
    const criticalPatterns = this.state.patterns.filter((p) => p.impact === 'CRITICAL').length;
    const highPatterns = this.state.patterns.filter((p) => p.impact === 'HIGH').length;

    if (criticalPatterns > 0) return 'CRITICAL';
    if (highPatterns > 2) return 'HIGH';
    if (highPatterns > 0 || this.state.scores.overallScore < 70) return 'MEDIUM';
    return 'LOW';
  }

  private generateSummary(): string {
    const { scores, patterns, insights } = this.state;

    let summary = `Score global: ${scores.overallScore}/100 (${scores.grade}). `;
    summary += `Tendance: ${scores.trend}. `;
    summary += `${patterns.length} patterns détectés, ${insights.length} insights actifs. `;

    const criticalIssues = patterns.filter(
      (p) => p.impact === 'HIGH' || p.impact === 'CRITICAL'
    ).length;
    if (criticalIssues > 0) {
      summary += `⚠️ ${criticalIssues} problèmes critiques nécessitent attention.`;
    } else {
      summary += '✅ Système stable.';
    }

    return summary;
  }

  // ===========================================================================
  // GETTERS
  // ===========================================================================

  getScores(): EvolutionScores {
    return { ...this.state.scores };
  }

  getPatterns(): EvolutionPattern[] {
    return [...this.state.patterns];
  }

  getInsights(): EvolutionInsight[] {
    return [...this.state.insights];
  }

  getPatternsByType(type: PatternType): EvolutionPattern[] {
    return this.state.patterns.filter((p) => p.type === type);
  }

  getPatternsByModule(moduleId: TitaneModule): EvolutionPattern[] {
    return this.state.patterns.filter((p) => p.moduleId === moduleId);
  }

  getActiveInsights(): EvolutionInsight[] {
    const now = Date.now();
    return this.state.insights.filter((i) => i.validUntil > now);
  }

  getActionableInsights(): EvolutionInsight[] {
    return this.getActiveInsights().filter((i) => i.actionable);
  }

  // ===========================================================================
  // LISTENERS
  // ===========================================================================

  onPattern(listener: PatternListener): () => void {
    this.patternListeners.add(listener);
    return () => this.patternListeners.delete(listener);
  }

  onInsight(listener: InsightListener): () => void {
    this.insightListeners.add(listener);
    return () => this.insightListeners.delete(listener);
  }

  onReport(listener: ReportListener): () => void {
    this.reportListeners.add(listener);
    return () => this.reportListeners.delete(listener);
  }

  // ===========================================================================
  // MAINTENANCE
  // ===========================================================================

  /**
   * Force une analyse immédiate
   */
  async analyze(): Promise<EvolutionReport | null> {
    return this.analyzeCycle();
  }

  /**
   * Réinitialise l'analyseur
   */
  reset(): void {
    this.state = this.createInitialState();
  }

  /**
   * Libère les ressources
   */
  dispose(): void {
    this.stop();
    this.patternListeners.clear();
    this.insightListeners.clear();
    this.reportListeners.clear();
    this.state.patterns = [];
    this.state.insights = [];
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let analyzerInstance: Analyzer | null = null;

export function getAnalyzer(): Analyzer {
  if (!analyzerInstance) {
    analyzerInstance = new Analyzer();
  }
  return analyzerInstance;
}

export function resetAnalyzer(): void {
  if (analyzerInstance) {
    analyzerInstance.dispose();
    analyzerInstance = null;
  }
}

export default Analyzer;
