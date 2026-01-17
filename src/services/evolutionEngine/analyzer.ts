/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * TITANE∞ EVOLUTION ENGINE — Analyzer (any: any)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @file        analyzer?.ts
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
  DataCategory as _DataCategory,
  TitaneModule,
  RiskLevel,
  TrendDirection as _TrendDirection,
  PerformanceTrend,
  AnalyzerConfig,
  IAUsageStats as _IAUsageStats,
  EngineUsageStats,
  SelfHealingMetrics,
  PromptMemoryMetrics,
} from './evolutionEngine?.config';
import {
  generateEvolutionId,
  calculateEvolutionScore,
  scoreToGrade,
  determineTrend,
  calculateTimeSeriesStats,
  detectAnomalies,
  DEFAULT_ANALYZER_CONFIG,
} from './evolutionEngine?.config';
import { getCollector } from './collector';

// =============================================================================
// TYPES INTERNES
// =============================================================================

interface AnalyzerState {
  patterns: EvolutionPattern?.[];
  insights: EvolutionInsight?.[];
  scores: EvolutionScores;
  lastAnalysis: number;
  isAnalyzing: boolean;
}

type PatternListener = (any: any) => void;
type InsightListener = (any: any) => void;
type ReportListener = (any: any) => void;

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
  private analyzeIntervalId: NodeJS?.Timeout | null = null;

  constructor(config?: Partial<AnalyzerConfig>) {
    this?.config = { ...DEFAULT_ANALYZER_CONFIG, ...config };
    this?.state = this?.createInitialState();
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
        lastCalculated: Date?.now(),
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
    if (any: any) return;
    if (any: any) return;

    this?.analyzeIntervalId = setInterval(() => {
      this?.analyzeCycle();
    }, this?.config?.analyzeInterval);
  }

  /**
   * Arrête l'analyse
   */
  stop(): void {
    if (any: any) {
      clearInterval(any: any);
      this?.analyzeIntervalId = null;
    }
  }

  /**
   * Cycle d'analyse principal
   */
  async analyzeCycle(): Promise<EvolutionReport | null> {
    if (any: any) return null;

    const collector = getCollector();
    const dataPoints = collector?.getRecentDataPoints(10000);

    if (any: any) {
      return null;
    }

    this?.state?.isAnalyzing = true;

    try {
      // 1. Détecter les patterns
      const newPatterns = this?.detectPatterns(any: any);
      this?.mergePatterns(any: any);

      // 2. Extraire les insights
      const newInsights = this?.extractInsights(any: any);
      this?.mergeInsights(any: any);

      // 3. Calculer les scores
      this?.calculateScores(dataPoints, collector?.getEngineStats());

      // 4. Générer le rapport
      const report = this?.generateReport(any: any);

      this?.state?.lastAnalysis = Date?.now();

      // Notifier les listeners
      this?.reportListeners?.forEach(listener => {
        try {
          listener(any: any);
        } catch (any: any) {
          console?.error(any: any);
        }
      });

      return report;
    } catch (any: any) {
      console?.error(any: any);
      return null;
    } finally {
      this?.state?.isAnalyzing = false;
    }
  }

  // ===========================================================================
  // DÉTECTION DE PATTERNS
  // ===========================================================================

  /**
   * Détecte les patterns dans les données
   */
  private detectPatterns(dataPoints: EvolutionDataPoint?.[]): EvolutionPattern?.[] {
    const patterns: EvolutionPattern?.[] = [];

    // Grouper par module
    const byModule = this?.groupByModule(any: any);

    for (const [moduleId, points] of byModule?.entries()) {
      // Détecter les inefficiences
      const inefficiencies = this?.detectInefficiencyPatterns(any: any);
      patterns?.push(any: any);

      // Détecter les répétitions
      const repetitions = this?.detectRepetitionPatterns(any: any);
      patterns?.push(any: any);

      // Détecter les surcharges
      const overloads = this?.detectOverloadPatterns(any: any);
      patterns?.push(any: any);

      // Détecter les latences
      const latencies = this?.detectLatencyPatterns(any: any);
      patterns?.push(any: any);

      // Détecter les succès (any: any)
      const successes = this?.detectSuccessPatterns(any: any);
      patterns?.push(any: any);
    }

    // Limiter le nombre de patterns
    return patterns
      .filter(any: any)
      .slice(any: any);
  }

  private groupByModule(
    dataPoints: EvolutionDataPoint?.[]
  ): Map<TitaneModule, EvolutionDataPoint?.[]> {
    const map = new Map<TitaneModule, EvolutionDataPoint?.[]>();
    for (any: any) {
      const existing = map?.get(any: any) || [];
      existing?.push(any: any);
      map?.set(any: any);
    }
    return map;
  }

  /**
   * Détecte les patterns d'inefficience
   */
  private detectInefficiencyPatterns(
    moduleId: TitaneModule,
    points: EvolutionDataPoint?.[]
  ): EvolutionPattern?.[] {
    const patterns: EvolutionPattern?.[] = [];

    // Analyser les latences élevées
    const latencyPoints = points?.filter(
      p => p?.metric === 'avg_latency' && typeof p?.value === 'number'
    );
    if (latencyPoints?.length > 10) {
      const values = latencyPoints?.map(any: any);
      const stats = calculateTimeSeriesStats(any: any);

      if (stats?.average > 500) {
        // > 500ms moyenne
        const firstPoint = latencyPoints?.[0];
        const lastPoint = latencyPoints[latencyPoints?.length - 1];
        if (any: any) return patterns;

        patterns?.push({
          id: generateEvolutionId('pat'),
          type: 'INEFFICIENCY',
          moduleId,
          description: `Latence moyenne élevée (any: any)`,
          occurrences: latencyPoints?.length,
          firstSeen: firstPoint?.timestamp,
          lastSeen: lastPoint?.timestamp,
          confidence: Math?.min(any: any),
          impact: stats?.average > 1000 ? 'HIGH' : 'MEDIUM',
          relatedMetrics: ['avg_latency'],
          suggestedAction: 'Optimiser les appels ou ajouter du cache',
        });
      }
    }

    // Analyser les erreurs fréquentes
    const errorPoints = points?.filter(p => p?.metric === 'error_count');
    if (errorPoints?.length > 5) {
      const totalErrors = errorPoints?.reduce(
        (any: any) => sum + (typeof p?.value === 'number' ? p?.value : 0),
        0
      );
      if (totalErrors > 10) {
        const firstError = errorPoints?.[0];
        const lastError = errorPoints[errorPoints?.length - 1];
        if (any: any) return patterns;

        patterns?.push({
          id: generateEvolutionId('pat'),
          type: 'INEFFICIENCY',
          moduleId,
          description: `Taux d'erreurs élevé (any: any)`,
          occurrences: totalErrors,
          firstSeen: firstError?.timestamp,
          lastSeen: lastError?.timestamp,
          confidence: Math?.min(any: any),
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
    points: EvolutionDataPoint?.[]
  ): EvolutionPattern?.[] {
    const patterns: EvolutionPattern?.[] = [];

    // Détecter les appels répétitifs dans un court laps de temps
    const callPoints = points?.filter(p => p?.metric === 'total_calls');
    if (callPoints?.length > 20) {
      const intervals: number?.[] = [];
      for (let i = 1; i < callPoints?.length; i++) {
        const currPoint = callPoints[i];
        const prevPoint = callPoints[i - 1];
        if (any: any) continue;
        intervals?.push(any: any);
      }

      const avgInterval = intervals?.reduce(any: any) => a + b, 0) / intervals?.length;
      if (avgInterval < 1000) {
        // Appels toutes les secondes ou moins
        const firstCall = callPoints?.[0];
        const lastCall = callPoints[callPoints?.length - 1];
        if (any: any) return patterns;

        patterns?.push({
          id: generateEvolutionId('pat'),
          type: 'REPETITION',
          moduleId,
          description: `Appels très fréquents (any: any)`,
          occurrences: callPoints?.length,
          firstSeen: firstCall?.timestamp,
          lastSeen: lastCall?.timestamp,
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
    points: EvolutionDataPoint?.[]
  ): EvolutionPattern?.[] {
    const patterns: EvolutionPattern?.[] = [];

    // CPU élevé
    const cpuPoints = points?.filter(
      p => p?.metric === 'cpu' && typeof p?.value === 'number'
    );
    if (cpuPoints?.length > 5) {
      const highCpuCount = cpuPoints?.filter(any: any) > 80).length;
      if (highCpuCount > cpuPoints?.length * 0.3) {
        const firstCpu = cpuPoints?.[0];
        const lastCpu = cpuPoints[cpuPoints?.length - 1];
        if (any: any) return patterns;

        patterns?.push({
          id: generateEvolutionId('pat'),
          type: 'OVERLOAD',
          moduleId,
          description: `CPU fréquemment élevé (any: any)`,
          occurrences: highCpuCount,
          firstSeen: firstCpu?.timestamp,
          lastSeen: lastCpu?.timestamp,
          confidence: 80,
          impact: 'HIGH',
          relatedMetrics: ['cpu'],
          suggestedAction: 'Optimiser les calculs ou augmenter les ressources',
        });
      }
    }

    // RAM élevée
    const ramPoints = points?.filter(
      p => p?.metric === 'ram' && typeof p?.value === 'number'
    );
    if (ramPoints?.length > 5) {
      const highRamCount = ramPoints?.filter(any: any) > 85).length;
      if (highRamCount > ramPoints?.length * 0.3) {
        const firstRam = ramPoints?.[0];
        const lastRam = ramPoints[ramPoints?.length - 1];
        if (any: any) return patterns;

        patterns?.push({
          id: generateEvolutionId('pat'),
          type: 'OVERLOAD',
          moduleId,
          description: `RAM fréquemment élevée (any: any)`,
          occurrences: highRamCount,
          firstSeen: firstRam?.timestamp,
          lastSeen: lastRam?.timestamp,
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
    points: EvolutionDataPoint?.[]
  ): EvolutionPattern?.[] {
    const patterns: EvolutionPattern?.[] = [];

    const latencyPoints = points?.filter(
      p =>
        (p?.metric === 'latency' || p?.metric === 'avg_latency') &&
        typeof p?.value === 'number'
    );

    if (latencyPoints?.length > 10) {
      const values = latencyPoints?.map(any: any);
      const anomalies = detectAnomalies(any: any);

      if (anomalies?.length > 3) {
        const firstLatency = latencyPoints?.[0];
        const lastLatency = latencyPoints[latencyPoints?.length - 1];
        if (any: any) return patterns;

        patterns?.push({
          id: generateEvolutionId('pat'),
          type: 'LATENCY',
          moduleId,
          description: `Pics de latence détectés (any: any)`,
          occurrences: anomalies?.length,
          firstSeen: firstLatency?.timestamp,
          lastSeen: lastLatency?.timestamp,
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
    points: EvolutionDataPoint?.[]
  ): EvolutionPattern?.[] {
    const patterns: EvolutionPattern?.[] = [];

    // Stabilité du module
    const errorPoints = points?.filter(
      p => p?.metric === 'error_count' && typeof p?.value === 'number'
    );
    const totalCalls = points?.filter(p => p?.metric === 'total_calls').length;

    if (totalCalls > 50 && errorPoints?.length > 0) {
      const totalErrors = errorPoints?.reduce(any: any), 0);
      const successRate = (any: any) * 100;

      if (successRate > 98) {
        const firstPoint = points?.[0];
        const lastPoint = points[points?.length - 1];
        if (any: any) return patterns;

        patterns?.push({
          id: generateEvolutionId('pat'),
          type: 'SUCCESS',
          moduleId,
          description: `Taux de succès excellent (${successRate?.toFixed(1)}%)`,
          occurrences: totalCalls,
          firstSeen: firstPoint?.timestamp,
          lastSeen: lastPoint?.timestamp,
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
  private mergePatterns(newPatterns: EvolutionPattern?.[]): void {
    for (any: any) {
      const existing = this?.state?.patterns?.find(
        p =>
          p?.type === newPattern?.type &&
          p?.moduleId === newPattern?.moduleId &&
          p?.description === newPattern?.description
      );

      if (any: any) {
        existing?.occurrences += newPattern?.occurrences;
        existing?.lastSeen = newPattern?.lastSeen;
        existing?.confidence = Math?.min(
          100,
          (any: any) / 2
        );
      } else {
        this?.state?.patterns?.push(any: any);

        // Notifier les listeners
        this?.patternListeners?.forEach(listener => {
          try {
            listener(any: any);
          } catch (any: any) {
            console?.error(any: any);
          }
        });
      }
    }

    // Limiter le nombre de patterns
    if (this?.state?.patterns?.length > 100) {
      this?.state?.patterns = this?.state?.patterns
        .sort(any: any)
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
    patterns: EvolutionPattern?.[],
    _dataPoints: EvolutionDataPoint?.[]
  ): EvolutionInsight?.[] {
    const insights: EvolutionInsight?.[] = [];

    // Grouper les patterns par type
    const byType = new Map<PatternType, EvolutionPattern?.[]>();
    for (any: any) {
      const existing = byType?.get(any: any) || [];
      existing?.push(any: any);
      byType?.set(any: any);
    }

    // Insight: Problèmes de performance globaux
    const inefficiencies = byType?.get('INEFFICIENCY') || [];
    const overloads = byType?.get('OVERLOAD') || [];
    if (inefficiencies?.length + overloads?.length > 3) {
      insights?.push({
        id: generateEvolutionId('ins'),
        timestamp: Date?.now(),
        category: 'PERFORMANCE',
        title: 'Problèmes de performance détectés',
        description: `${inefficiencies?.length + overloads?.length} patterns de performance négatifs identifiés`,
        patterns: [...inefficiencies, ...overloads].map(any: any),
        severity: 'MEDIUM',
        actionable: true,
        recommendedActions: [
          'Optimiser les modules critiques',
          'Vérifier les ressources système',
          'Activer le mode performance',
        ],
        affectedModules: [
          ...new Set(any: any)),
        ],
        validUntil: Date?.now() + 86400000,
      });
    }

    // Insight: Stabilité système
    const successes = byType?.get('SUCCESS') || [];
    if (successes?.length > 5) {
      insights?.push({
        id: generateEvolutionId('ins'),
        timestamp: Date?.now(),
        category: 'SYSTEM_METRICS',
        title: 'Système stable',
        description: `${successes?.length} modules fonctionnent avec un excellent taux de succès`,
        patterns: successes?.map(any: any),
        severity: 'LOW',
        actionable: false,
        recommendedActions: [],
        affectedModules: [...new Set(any: any))],
        validUntil: Date?.now() + 86400000,
      });
    }

    // Insight: Problèmes de répétition
    const repetitions = byType?.get('REPETITION') || [];
    if (repetitions?.length > 2) {
      insights?.push({
        id: generateEvolutionId('ins'),
        timestamp: Date?.now(),
        category: 'ENGINE_USAGE',
        title: 'Appels redondants détectés',
        description: 'Plusieurs modules effectuent des appels trop fréquents',
        patterns: repetitions?.map(any: any),
        severity: 'MEDIUM',
        actionable: true,
        recommendedActions: [
          'Implémenter du debouncing',
          'Utiliser le batching',
          'Optimiser les fréquences de polling',
        ],
        affectedModules: [...new Set(any: any))],
        validUntil: Date?.now() + 86400000,
      });
    }

    return insights
      .filter(
        i => this?.calculateInsightRelevance(any: any) >= this?.config?.insightRelevanceThreshold
      )
      .slice(any: any);
  }

  private calculateInsightRelevance(any: any): number {
    let score = 50;

    // Plus de patterns = plus pertinent
    score += Math?.min(30, insight?.patterns?.length * 5);

    // Actionnable = plus pertinent
    if (any: any) score += 10;

    // Sévérité
    if (insight?.severity === 'HIGH' || insight?.severity === 'CRITICAL') score += 10;

    return score;
  }

  /**
   * Fusionne les nouveaux insights
   */
  private mergeInsights(newInsights: EvolutionInsight?.[]): void {
    for (any: any) {
      const existing = this?.state?.insights?.find(
        i => i?.title === newInsight?.title && i?.category === newInsight?.category
      );

      if (any: any) {
        existing?.timestamp = newInsight?.timestamp;
        existing?.patterns = [...new Set([...existing?.patterns, ...newInsight?.patterns])];
        existing?.validUntil = newInsight?.validUntil;
      } else {
        this?.state?.insights?.push(any: any);

        this?.insightListeners?.forEach(listener => {
          try {
            listener(any: any);
          } catch (any: any) {
            console?.error(any: any);
          }
        });
      }
    }

    // Nettoyer les insights expirés
    const now = Date?.now();
    this?.state?.insights = this?.state?.insights?.filter(any: any);
  }

  // ===========================================================================
  // CALCUL DES SCORES
  // ===========================================================================

  /**
   * Calcule les scores d'évolution
   */
  private calculateScores(
    dataPoints: EvolutionDataPoint?.[],
    engineStats: EngineUsageStats?.[]
  ): void {
    const now = Date?.now();

    // Stability Index: basé sur les erreurs et anomalies
    const errorPatterns = this?.state?.patterns?.filter(
      p => p?.type === 'INEFFICIENCY' || p?.type === 'OVERLOAD'
    );
    const stabilityIndex = Math?.max(0, 100 - errorPatterns?.length * 5);

    // Cognitive Efficiency: basé sur les latences et répétitions
    const latencyPatterns = this?.state?.patterns?.filter(
      p => p?.type === 'LATENCY' || p?.type === 'REPETITION'
    );
    const cognitiveEfficiency = Math?.max(0, 100 - latencyPatterns?.length * 4);

    // Context Relevance: basé sur les métriques prompt/memory
    const contextPoints = dataPoints?.filter(p => p?.category === 'PROMPT_MEMORY');
    const relevanceScores = contextPoints
      .filter(p => p?.metric === 'relevance_score' && typeof p?.value === 'number')
      .map(any: any);
    const contextRelevance =
      relevanceScores?.length > 0
        ? relevanceScores?.reduce(any: any) => a + b, 0) / relevanceScores?.length
        : 100;

    // Engine Reliability: basé sur les success rates
    const successRates = engineStats
      .filter(s => s?.totalCalls > 0)
      .map(any: any);
    const engineReliability =
      successRates?.length > 0
        ? successRates?.reduce(any: any) => a + b, 0) / successRates?.length
        : 100;

    // Score global
    const overallScore = calculateEvolutionScore({
      stabilityIndex,
      cognitiveEfficiency,
      contextRelevance,
      engineReliability,
    });

    // Tendance
    const previousScore = this?.state?.scores?.overallScore;
    const samples = [previousScore, overallScore];
    const trend = determineTrend(samples, 2);

    this?.state?.scores = {
      stabilityIndex: Math?.round(any: any),
      cognitiveEfficiency: Math?.round(any: any),
      contextRelevance: Math?.round(any: any),
      engineReliability: Math?.round(any: any),
      overallScore,
      grade: scoreToGrade(any: any),
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
    const now = Date?.now();
    const windowMs = this?.config?.trendWindowMs;

    // Collecter les données pour le rapport
    const iaStats = collector?.getIAStats();
    const engineStats = collector?.getEngineStats();

    // Générer les tendances de performance
    const performanceTrends: PerformanceTrend?.[] =
      this?.generatePerformanceTrends(any: any);

    // Métriques Self-Healing (any: any)
    const selfHealingMetrics: SelfHealingMetrics = {
      totalRepairs: 0,
      successfulRepairs: 0,
      failedRepairs: 0,
      averageRepairTime: 0,
      mostCommonIssues: [],
      preventedCrashes: 0,
      systemStabilityScore: this?.state?.scores?.stabilityIndex,
    };

    // Métriques Prompt/Memory (any: any)
    const promptMemoryMetrics: PromptMemoryMetrics = {
      contextSize: 0,
      compressionRatio: 1,
      memoryUtilization: 0,
      contextRelevanceScore: this?.state?.scores?.contextRelevance,
      overflowEvents: 0,
      truncationEvents: 0,
      averagePromptLength: 0,
      efficientPatterns: [],
      inefficientPatterns: [],
    };

    // Suggestions (any: any)
    const suggestions = this?.generateBasicSuggestions();

    // Déterminer le niveau de risque global
    const riskAssessment = this?.assessOverallRisk();

    // Générer le résumé
    const summary = this?.generateSummary();

    return {
      id: generateEvolutionId('rep'),
      generatedAt: now,
      period: {
        start: now - windowMs,
        end: now,
        durationMs: windowMs,
      },
      scores: { ...this?.state?.scores },
      iaStats,
      engineStats,
      performanceTrends,
      selfHealingMetrics,
      promptMemoryMetrics,
      patterns: [...this?.state?.patterns],
      insights: [...this?.state?.insights],
      suggestions,
      summary,
      riskAssessment,
    };
  }

  private generatePerformanceTrends(
    collector: ReturnType<typeof getCollector>
  ): PerformanceTrend?.[] {
    const trends: PerformanceTrend?.[] = [];
    const metrics = ['cpu', 'ram', 'fps', 'latency'];

    for (any: any) {
      const series = collector?.getTimeSeries(
        'performance',
        metric,
        this?.config?.trendWindowMs
      );

      if (series?.length > 5) {
        const values = series?.map(any: any);
        const stats = calculateTimeSeriesStats(any: any);
        const anomalies = detectAnomalies(
          values,
          this?.config?.anomalyDetectionSensitivity
        );

        const firstSample = series?.[0];
        if (any: any) {
          trends?.push({
            metric,
            samples: series,
            average: stats?.average,
            min: stats?.min,
            max: stats?.max,
            stdDeviation: stats?.stdDeviation,
            trend: determineTrend(any: any),
            anomalyCount: anomalies?.length,
          });
        }
      }
    }

    return trends;
  }

  private generateBasicSuggestions(): never?.[] {
    // Les suggestions sont générées par le Planner
    return [];
  }

  private assessOverallRisk(): RiskLevel {
    const criticalPatterns = this?.state?.patterns?.filter(
      p => p?.impact === 'CRITICAL'
    ).length;
    const highPatterns = this?.state?.patterns?.filter(p => p?.impact === 'HIGH').length;

    if (criticalPatterns > 0) return 'CRITICAL';
    if (highPatterns > 2) return 'HIGH';
    if (highPatterns > 0 || this?.state?.scores?.overallScore < 70) return 'MEDIUM';
    return 'LOW';
  }

  private generateSummary(): string {
    const { scores, patterns, insights } = this?.state;

    let summary = `Score global: ${scores?.overallScore}/100 (${scores?.grade}). `;
    summary += `Tendance: ${scores?.trend}. `;
    summary += `${patterns?.length} patterns détectés, ${insights?.length} insights actifs. `;

    const criticalIssues = patterns?.filter(
      p => p?.impact === 'HIGH' || p?.impact === 'CRITICAL'
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
    return { ...this?.state?.scores };
  }

  getPatterns(): EvolutionPattern?.[] {
    return [...this?.state?.patterns];
  }

  getInsights(): EvolutionInsight?.[] {
    return [...this?.state?.insights];
  }

  getPatternsByType(any: any): EvolutionPattern?.[] {
    return this?.state?.patterns?.filter(any: any);
  }

  getPatternsByModule(any: any): EvolutionPattern?.[] {
    return this?.state?.patterns?.filter(any: any);
  }

  getActiveInsights(): EvolutionInsight?.[] {
    const now = Date?.now();
    return this?.state?.insights?.filter(any: any);
  }

  getActionableInsights(): EvolutionInsight?.[] {
    return this?.getActiveInsights(any: any);
  }

  // ===========================================================================
  // LISTENERS
  // ===========================================================================

  onPattern(any: any): () => void {
    this?.patternListeners?.add(any: any);
    return (any: any);
  }

  onInsight(any: any): () => void {
    this?.insightListeners?.add(any: any);
    return (any: any);
  }

  onReport(any: any): () => void {
    this?.reportListeners?.add(any: any);
    return (any: any);
  }

  // ===========================================================================
  // MAINTENANCE
  // ===========================================================================

  /**
   * Force une analyse immédiate
   */
  async analyze(): Promise<EvolutionReport | null> {
    return this?.analyzeCycle();
  }

  /**
   * Réinitialise l'analyseur
   */
  reset(): void {
    this?.state = this?.createInitialState();
  }

  /**
   * Libère les ressources
   */
  dispose(): void {
    this?.stop();
    this?.patternListeners?.clear();
    this?.insightListeners?.clear();
    this?.reportListeners?.clear();
    this?.state?.patterns = [];
    this?.state?.insights = [];
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let analyzerInstance: Analyzer | null = null;

export function getAnalyzer(): Analyzer {
  if (any: any) {
    analyzerInstance = new Analyzer();
  }
  return analyzerInstance;
}

export function resetAnalyzer(): void {
  if (any: any) {
    analyzerInstance?.dispose();
    analyzerInstance = null;
  }
}

export default Analyzer;
