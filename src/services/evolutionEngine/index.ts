/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * TITANE∞ EVOLUTION ENGINE — Index
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @file        index.ts
 * @version     vΩ∞Ω∞
 *
 * Point d'entrée principal de l'Evolution Engine
 * Orchestration des 4 sous-moteurs: Collector, Analyzer, Planner, Executor
 *
 * Loi fondamentale: Sécurité > Stabilité > Cohérence > Optimisation > Évolution
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// =============================================================================
// EXPORTS — CONFIGURATION & TYPES
// =============================================================================

export type {
  // Types fondamentaux
  RiskLevel,
  GovernanceRole,
  SuggestionStatus,
  DataCategory,
  PatternType,
  SuggestionCategory,
  EvolutionActionType,
  ActionResult,
  EvolutionPhase,
  TitaneModule,
  TrendDirection,

  // Interfaces — Données
  EvolutionDataPoint,
  IAUsageStats,
  EngineUsageStats,
  PerformanceTrend,
  SelfHealingMetrics,
  PromptMemoryMetrics,

  // Interfaces — Analyse
  EvolutionPattern,
  EvolutionInsight,
  EvolutionScores,
  EvolutionReport,

  // Interfaces — Suggestions & Actions
  EvolutionSuggestion,
  EvolutionAction,
  ActionPrecondition,
  ActionPostcondition,
  EvolutionActionRequest,
  EvolutionActionResult,

  // Interfaces — Gouvernance
  ValidationPolicy,
  ActionWhitelistEntry,
  EvolutionHistoryEntry,

  // Interfaces — Apprentissage
  LearnedKnowledge,
  ImprovementStrategy,
  CumulativeLearningState,

  // Interfaces — Configuration
  CollectorConfig,
  AnalyzerConfig,
  PlannerConfig,
  ExecutorConfig,
  EvolutionEngineConfig,

  // Interfaces — État
  EvolutionStateSnapshot,
  EvolutionDashboardState,

  // Types Rust
  RustEvolutionTypes,
} from './evolutionEngine.config';

export {
  // Constantes de configuration
  DEFAULT_COLLECTOR_CONFIG,
  DEFAULT_ANALYZER_CONFIG,
  DEFAULT_PLANNER_CONFIG,
  DEFAULT_EXECUTOR_CONFIG,
  DEFAULT_EVOLUTION_ENGINE_CONFIG,
  DEFAULT_ACTION_WHITELIST,
  DEFAULT_VALIDATION_POLICIES,

  // Constantes d'affichage
  MODULE_DISPLAY_NAMES,
  MODULE_ICONS,
  RISK_LEVEL_COLORS,
  TREND_COLORS,
  SUGGESTION_STATUS_COLORS,
  ACTION_RESULT_COLORS,

  // Fonctions utilitaires
  generateEvolutionId,
  determineRiskLevel,
  hasPermission,
  isActionWhitelisted,
  calculateEvolutionScore,
  scoreToGrade,
  determineTrend,
  formatDuration,
  formatTimestamp,
  createEmptySnapshot,
  createDataPoint,
  createSuggestion,
  createAction,
  createHistoryEntry,
  checkPreconditions,
  calculateTimeSeriesStats,
  detectAnomalies,
} from './evolutionEngine.config';

// =============================================================================
// EXPORTS — SERVICES
// =============================================================================

export { Collector, getCollector, resetCollector } from './collector';
export { Analyzer, getAnalyzer, resetAnalyzer } from './analyzer';
export { Planner, getPlanner, resetPlanner } from './planner';
export { Executor, getExecutor, resetExecutor } from './executor';

// =============================================================================
// IMPORTS INTERNES
// =============================================================================

import { Collector, getCollector, resetCollector } from './collector';
import { Analyzer, getAnalyzer, resetAnalyzer } from './analyzer';
import { Planner, getPlanner, resetPlanner } from './planner';
import { Executor, getExecutor, resetExecutor } from './executor';
import type {
  EvolutionStateSnapshot,
  EvolutionReport,
  EvolutionSuggestion,
  EvolutionHistoryEntry,
  EvolutionScores,
  EvolutionPattern,
  EvolutionInsight,
  EvolutionDataPoint,
  GovernanceRole,
  DataCategory,
  TitaneModule,
  EvolutionActionResult,
  EvolutionEngineConfig,
} from './evolutionEngine.config';
import {
  createEmptySnapshot,
  DEFAULT_EVOLUTION_ENGINE_CONFIG,
} from './evolutionEngine.config';

// =============================================================================
// EVOLUTION ENGINE — FACADE PRINCIPALE
// =============================================================================

/**
 * Facade principale de l'Evolution Engine
 * Orchestration des 4 sous-moteurs avec synchronisation Singularity
 */
export class EvolutionEngine {
  private collector: Collector;
  private analyzer: Analyzer;
  private planner: Planner;
  private executor: Executor;
  private config: EvolutionEngineConfig;
  private initialized: boolean = false;
  private singularitySyncIntervalId: NodeJS.Timeout | null = null;

  constructor(config?: Partial<EvolutionEngineConfig>) {
    this.config = { ...DEFAULT_EVOLUTION_ENGINE_CONFIG, ...config };
    this.collector = getCollector();
    this.analyzer = getAnalyzer();
    this.planner = getPlanner();
    this.executor = getExecutor();
  }

  // ===========================================================================
  // INITIALISATION
  // ===========================================================================

  /**
   * Initialise l'Evolution Engine
   */
  initialize(): void {
    if (this.initialized) return;
    if (!this.config.enabled) return;

    // Démarrer les sous-moteurs
    if (this.config.collector.enabled) {
      this.collector.start();
    }

    if (this.config.analyzer.enabled) {
      this.analyzer.start();
    }

    if (this.config.planner.enabled) {
      this.planner.start();
    }

    // Démarrer la synchronisation Singularity
    if (this.config.singularitySyncEnabled) {
      this.startSingularitySync();
    }

    this.initialized = true;

    // Log d'initialisation
    this.collector.record('SYSTEM_METRICS', 'evolution', 'initialized', true, {
      timestamp: Date.now(),
    });
  }

  /**
   * Arrête l'Evolution Engine
   */
  stop(): void {
    this.collector.stop();
    this.analyzer.stop();
    this.planner.stop();
    this.stopSingularitySync();
    this.initialized = false;
  }

  // ===========================================================================
  // SINGULARITY SYNC
  // ===========================================================================

  private startSingularitySync(): void {
    if (this.singularitySyncIntervalId) return;

    this.singularitySyncIntervalId = setInterval(() => {
      this.syncWithSingularity();
    }, this.config.singularitySyncInterval);
  }

  private stopSingularitySync(): void {
    if (this.singularitySyncIntervalId) {
      clearInterval(this.singularitySyncIntervalId);
      this.singularitySyncIntervalId = null;
    }
  }

  private async syncWithSingularity(): Promise<void> {
    // Synchronisation avec la Singularity Layer
    // Cette méthode sera implémentée quand le Singularity Engine sera disponible
    try {
      const snapshot = this.getSnapshot();
      // await tauriClient.syncEvolutionState({ snapshot });
      console.debug('[EvolutionEngine] Singularity sync:', snapshot.scores.overallScore);
    } catch (error) {
      console.error('[EvolutionEngine] Singularity sync error:', error);
    }
  }

  // ===========================================================================
  // COLLECTE
  // ===========================================================================

  /**
   * Enregistre un data point
   */
  record(
    category: DataCategory,
    moduleId: TitaneModule,
    metric: string,
    value: number | string | boolean,
    context?: Record<string, unknown>,
    tags?: string[]
  ): void {
    this.collector.record(category, moduleId, metric, value, context, tags);
  }

  /**
   * Enregistre une erreur
   */
  recordError(
    moduleId: TitaneModule,
    errorType: string,
    message: string,
    context?: Record<string, unknown>
  ): void {
    this.collector.recordError(moduleId, errorType, message, context);
  }

  /**
   * Enregistre un pattern utilisateur
   */
  recordUserPattern(
    pattern: string,
    success: boolean,
    context?: Record<string, unknown>
  ): void {
    this.collector.recordUserPattern(pattern, success, context);
  }

  /**
   * Récupère les data points récents
   */
  getRecentData(count?: number): EvolutionDataPoint[] {
    return this.collector.getRecentDataPoints(count);
  }

  // ===========================================================================
  // ANALYSE
  // ===========================================================================

  /**
   * Force une analyse immédiate
   */
  async analyze(): Promise<EvolutionReport | null> {
    return this.analyzer.analyze();
  }

  /**
   * Récupère les scores actuels
   */
  getScores(): EvolutionScores {
    return this.analyzer.getScores();
  }

  /**
   * Récupère les patterns détectés
   */
  getPatterns(): EvolutionPattern[] {
    return this.analyzer.getPatterns();
  }

  /**
   * Récupère les insights actifs
   */
  getInsights(): EvolutionInsight[] {
    return this.analyzer.getActiveInsights();
  }

  /**
   * Récupère les insights actionnables
   */
  getActionableInsights(): EvolutionInsight[] {
    return this.analyzer.getActionableInsights();
  }

  // ===========================================================================
  // PLANIFICATION
  // ===========================================================================

  /**
   * Force une planification immédiate
   */
  async plan(): Promise<EvolutionSuggestion[]> {
    return this.planner.plan();
  }

  /**
   * Récupère les suggestions en attente
   */
  getPendingSuggestions(): EvolutionSuggestion[] {
    return this.planner.getPendingSuggestions();
  }

  /**
   * Récupère toutes les suggestions
   */
  getAllSuggestions(): EvolutionSuggestion[] {
    return this.planner.getSuggestions();
  }

  /**
   * Récupère une suggestion par ID
   */
  getSuggestion(id: string): EvolutionSuggestion | null {
    return this.planner.getSuggestionById(id);
  }

  /**
   * Approuve une suggestion
   */
  approveSuggestion(id: string, approver: 'DEV' | 'ADMIN'): boolean {
    return this.planner.approveSuggestion(id, approver);
  }

  /**
   * Rejette une suggestion
   */
  rejectSuggestion(id: string): boolean {
    return this.planner.rejectSuggestion(id);
  }

  // ===========================================================================
  // EXÉCUTION
  // ===========================================================================

  /**
   * Exécute une suggestion approuvée
   */
  async executeSuggestion(
    suggestionId: string,
    userRole: GovernanceRole,
    reason?: string
  ): Promise<EvolutionActionResult[]> {
    return this.executor.executeSuggestion(suggestionId, userRole, reason);
  }

  /**
   * Annule une action exécutée
   */
  async rollback(
    result: EvolutionActionResult,
    userRole: GovernanceRole
  ): Promise<EvolutionActionResult> {
    return this.executor.rollback(result, userRole);
  }

  /**
   * Récupère l'historique des actions
   */
  getHistory(limit?: number): EvolutionHistoryEntry[] {
    return this.executor.getHistory(limit);
  }

  /**
   * Vérifie si des actions sont en cours
   */
  isExecuting(): boolean {
    return this.executor.isExecuting();
  }

  // ===========================================================================
  // SNAPSHOT & ÉTAT
  // ===========================================================================

  /**
   * Récupère un snapshot de l'état actuel
   */
  getSnapshot(): EvolutionStateSnapshot {
    const scores = this.analyzer.getScores();
    const patterns = this.analyzer.getPatterns();
    const insights = this.analyzer.getInsights();
    const suggestions = this.planner.getPendingSuggestions();
    const history = this.executor.getHistory(10);
    const dataCount = this.collector.countDataPoints(86400000); // 24h

    const snapshot = createEmptySnapshot();
    snapshot.timestamp = Date.now();
    snapshot.scores = scores;
    snapshot.activeSuggestions = suggestions.length;
    snapshot.pendingActions = suggestions.reduce((sum, s) => sum + s.actions.length, 0);
    snapshot.executingActions = this.executor.isExecuting() ? 1 : 0;
    snapshot.recentResults = [];

    snapshot.learning = {
      totalDataPoints: dataCount,
      totalPatterns: patterns.length,
      totalInsights: insights.length,
      totalActionsExecuted: history.length,
      successfulActions: history.filter(h => h.result === 'SUCCESS').length,
      knowledgeBase: [],
      strategies: [],
      lastLearningCycle: this.analyzer.getScores().lastCalculated,
      maturityLevel: Math.min(100, dataCount / 100),
      confidenceScore: scores.overallScore,
    };

    snapshot.health = {
      collectorHealthy: true,
      analyzerHealthy: true,
      plannerHealthy: true,
      executorHealthy: !this.executor.isExecuting(),
      overallHealthy: true,
    };

    snapshot.metrics = {
      dataPointsLast24h: dataCount,
      patternsDetectedLast24h: patterns.filter(p => Date.now() - p.lastSeen < 86400000)
        .length,
      suggestionsGeneratedLast24h: suggestions.filter(
        s => Date.now() - s.createdAt < 86400000
      ).length,
      actionsExecutedLast24h: history.filter(h => Date.now() - h.timestamp < 86400000)
        .length,
      successRateLast24h: this.calculateSuccessRate(history),
    };

    return snapshot;
  }

  private calculateSuccessRate(history: EvolutionHistoryEntry[]): number {
    const recent = history.filter(h => Date.now() - h.timestamp < 86400000);
    if (recent.length === 0) return 100;

    const successful = recent.filter(h => h.result === 'SUCCESS').length;
    return Math.round((successful / recent.length) * 100);
  }

  // ===========================================================================
  // LISTENERS
  // ===========================================================================

  /**
   * Ajoute un listener pour les nouveaux data points
   */
  onDataPoint(listener: (dp: EvolutionDataPoint) => void): () => void {
    return this.collector.onDataPoint(listener);
  }

  /**
   * Ajoute un listener pour les nouveaux patterns
   */
  onPattern(listener: (pattern: EvolutionPattern) => void): () => void {
    return this.analyzer.onPattern(listener);
  }

  /**
   * Ajoute un listener pour les nouveaux insights
   */
  onInsight(listener: (insight: EvolutionInsight) => void): () => void {
    return this.analyzer.onInsight(listener);
  }

  /**
   * Ajoute un listener pour les nouveaux rapports
   */
  onReport(listener: (report: EvolutionReport) => void): () => void {
    return this.analyzer.onReport(listener);
  }

  /**
   * Ajoute un listener pour les nouvelles suggestions
   */
  onSuggestion(listener: (suggestion: EvolutionSuggestion) => void): () => void {
    return this.planner.onSuggestion(listener);
  }

  /**
   * Ajoute un listener pour les résultats d'action
   */
  onActionResult(listener: (result: EvolutionActionResult) => void): () => void {
    return this.executor.onResult(listener);
  }

  /**
   * Ajoute un listener pour l'historique
   */
  onHistoryEntry(listener: (entry: EvolutionHistoryEntry) => void): () => void {
    return this.executor.onHistory(listener);
  }

  // ===========================================================================
  // MAINTENANCE
  // ===========================================================================

  /**
   * Purge les anciennes données
   */
  purgeOldData(olderThanDays?: number): number {
    return this.collector.purgeOldData(olderThanDays);
  }

  /**
   * Réinitialise l'engine
   */
  reset(): void {
    this.stop();
    resetCollector();
    resetAnalyzer();
    resetPlanner();
    resetExecutor();
    this.collector = getCollector();
    this.analyzer = getAnalyzer();
    this.planner = getPlanner();
    this.executor = getExecutor();
    this.initialized = false;
  }

  /**
   * Libère les ressources
   */
  dispose(): void {
    this.stop();
    this.collector.dispose();
    this.analyzer.dispose();
    this.planner.dispose();
    this.executor.dispose();
    this.initialized = false;
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let evolutionEngineInstance: EvolutionEngine | null = null;

/**
 * Récupère l'instance singleton de l'Evolution Engine
 */
export function getEvolutionEngine(): EvolutionEngine {
  if (!evolutionEngineInstance) {
    evolutionEngineInstance = new EvolutionEngine();
  }
  return evolutionEngineInstance;
}

/**
 * Réinitialise l'instance singleton (pour tests)
 */
export function resetEvolutionEngine(): void {
  if (evolutionEngineInstance) {
    evolutionEngineInstance.dispose();
    evolutionEngineInstance = null;
  }
}

// =============================================================================
// EXPORTS — TAURI BINDINGS vΩ∞
// =============================================================================

export {
  // Types Tauri
  type EvolutionRiskLevel as TauriRiskLevel,
  type GovernanceRole as TauriGovernanceRole,
  type SuggestionStatus as TauriSuggestionStatus,
  type DataCategory as TauriDataCategory,
  type PatternType as TauriPatternType,
  type SuggestionCategory as TauriSuggestionCategory,
  type EvolutionActionType as TauriActionType,
  type ActionResult as TauriActionResult,
  type EvolutionPhase as TauriPhase,
  type TitaneModule as TauriModule,
  type TrendDirection as TauriTrendDirection,

  // Interfaces Tauri
  type EvolutionDataPoint as TauriDataPoint,
  type EvolutionPattern as TauriPattern,
  type EvolutionInsight as TauriInsight,
  type EvolutionScores as TauriScores,
  type EvolutionFullReport as TauriFullReport,
  type EvolutionSuggestion as TauriSuggestion,
  type EvolutionAction as TauriAction,
  type EvolutionHistoryEntry as TauriHistoryEntry,
  type EvolutionEngineState as TauriEngineState,
  type EvolutionStatistics as TauriStatistics,

  // Fonctions de binding
  getEvolutionState,
  startEvolutionEngine,
  stopEvolutionEngine,
  getEvolutionScores,
  updateEvolutionScore,
  generateEvolutionReport,
  addEvolutionDataPoint,
  getEvolutionDataPoints,
  getEvolutionPatterns,
  getEvolutionInsights,
  getEvolutionSuggestions,
  approveEvolutionSuggestion,
  rejectEvolutionSuggestion,
  createEvolutionAction,
  executeEvolutionAction,
  rollbackEvolutionAction,
  getEvolutionHistory,
  clearOldEvolutionHistory,
  runFullEvolutionCycle,
  getEvolutionStatistics,

  // Legacy
  evolutionRunCycle,
  evolutionGetStats,

  // Client class
  EvolutionEngineClient,
} from './evolutionEngine.bindings';

export default EvolutionEngine;
