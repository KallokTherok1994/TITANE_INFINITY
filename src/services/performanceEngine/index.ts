/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  TITANE INFINITY - Performance Engine - Orchestrator                          ║
 * ║  Point d'entrée unifié du Performance Engine                                  ║
 * ║  Version: Ω∞Ω+ | SUPER PROMPT #8                                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// ════════════════════════════════════════════════════════════════════════════════
// IMPORTS
// ════════════════════════════════════════════════════════════════════════════════

// Config & Types
import { logger } from '@/lib/logger';
import {
  DEFAULT_PERFORMANCE_CONFIG,
  createEmptySnapshot,
  generateSnapshotId,
  calculateGrade,
  formatBytes,
  formatDuration,
  DEVELOPMENT_THRESHOLDS,
  PRODUCTION_THRESHOLDS,
  BENCHMARK_THRESHOLDS,
  LOWPOWER_THRESHOLDS,
  THRESHOLD_PROFILES,
  METRIC_DEFINITIONS,
  RECOMMENDATION_TEMPLATES,
} from './performanceEngine.config';

import type {
  PerformanceEngineConfig,
  MetricsSnapshot,
  PerformanceIssue,
  Recommendation,
  PerformanceProfile,
  ThresholdConfig,
  SeverityLevel,
  TitaneModule,
  PerformanceGrade,
  PerformanceEvent,
  PerformanceEventListener,
  SelfHealingIntegration,
} from './performanceEngine.config';

// Sub-engines
import { MetricsCollector } from './metricsCollector';
import { PerformanceAnalyzer } from './analyzerEngine';
import type { AnalysisResult, TrendAnalysis, TrendDirection } from './analyzerEngine';
import { PerformanceAdvisor } from './advisorEngine';
import type { AdvisorResult } from './advisorEngine';
import { PerformanceReporter } from './reporter';
import type { PerformanceReport, DashboardData } from './reporter';

// ════════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════════

/**
 * État global du Performance Engine
 */
interface PerformanceEngineState {
  running: boolean;
  startedAt: number | null;
  lastCycleAt: number;
  cycleCount: number;
  healthScore: number;
  grade: PerformanceGrade;
  activeIssues: number;
  activeRecommendations: number;
}

/**
 * Résultat d'un cycle de performance
 */
interface PerformanceCycleResult {
  timestamp: number;
  snapshot: MetricsSnapshot;
  analysis: AnalysisResult;
  advisor: AdvisorResult;
  cycleTimeMs: number;
}

// ════════════════════════════════════════════════════════════════════════════════
// CLASSE PRINCIPALE - PerformanceEngine
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Performance Engine TITANE∞ — Orchestrateur principal
 *
 * Architecture 4 sous-moteurs:
 * 1. MetricsCollector — Collecte multi-source (System, React, IA)
 * 2. PerformanceAnalyzer — Détection d'anomalies et classification
 * 3. PerformanceAdvisor — Génération de recommandations actionnables
 * 4. PerformanceReporter — Dashboard + intégration Self-Healing
 */
export class PerformanceEngine {
  private config: PerformanceEngineConfig;
  private state: PerformanceEngineState;

  // Sub-engines
  private collector: MetricsCollector;
  private analyzer: PerformanceAnalyzer;
  private advisor: PerformanceAdvisor;
  private reporter: PerformanceReporter;

  // Event system
  private eventListeners: Map<string, Set<PerformanceEventListener>>;

  // Timers
  private collectionTimer: ReturnType<typeof setInterval> | null = null;

  constructor(config: Partial<PerformanceEngineConfig> = {}) {
    this.config = { ...DEFAULT_PERFORMANCE_CONFIG, ...config };
    this.state = this.createInitialState();
    this.eventListeners = new Map();

    // Initialiser les sous-moteurs
    this.collector = MetricsCollector.getInstance({
      ...this.config.collector,
    });

    this.analyzer = new PerformanceAnalyzer({
      historySize: this.config.collector.historySize,
      thresholds: this.config.thresholds,
    });

    this.advisor = new PerformanceAdvisor({
      maxRecommendations: this.config.advisor.maxRecommendations,
      autoApply: this.config.advisor.autoApply,
      autoApplySeverity: this.config.advisor.autoApplySeverity,
    });

    this.reporter = new PerformanceReporter({
      enabled: this.config.reporter.enabled,
      logLevel: this.config.reporter.logLevel,
      selfHealingIntegration: this.config.reporter.selfHealingIntegration,
      dashboardEnabled: this.config.reporter.dashboardEnabled,
    });

    // Connecter les événements internes
    this.setupInternalEvents();

    logger.debug('PerformanceEngine initialized', {
      component: 'PerformanceEngine',
      action: 'constructor',
      profile: this.config.profile,
    });
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // MÉTHODES PUBLIQUES - LIFECYCLE
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Démarre le Performance Engine
   */
  start(): void {
    if (this.state.running) {
      logger.warn('PerformanceEngine already running', {
        component: 'PerformanceEngine',
        action: 'start',
      });
      return;
    }

    this.state.running = true;
    this.state.startedAt = Date.now();

    // Démarrer les sous-moteurs
    this.collector.start();
    this.analyzer.start();
    this.advisor.start();
    this.reporter.start();

    // Démarrer le cycle de collecte
    this.startCollectionCycle();

    this.emit('engine_started', {
      profile: this.config.profile,
      timestamp: this.state.startedAt,
    });

    logger.info('PerformanceEngine started', {
      component: 'PerformanceEngine',
      action: 'start',
      profile: this.config.profile,
    });
  }

  /**
   * Arrête le Performance Engine
   */
  stop(): void {
    if (!this.state.running) {
      logger.warn('PerformanceEngine not running', {
        component: 'PerformanceEngine',
        action: 'stop',
      });
      return;
    }

    this.state.running = false;

    // Arrêter le timer
    if (this.collectionTimer) {
      clearInterval(this.collectionTimer);
      this.collectionTimer = null;
    }

    // Arrêter les sous-moteurs
    this.collector.stop();
    this.analyzer.stop();
    this.advisor.stop();
    this.reporter.stop();

    this.emit('engine_stopped', {
      timestamp: Date.now(),
      cycleCount: this.state.cycleCount,
    });

    console.log('[PerformanceEngine] Arrêté');
  }

  /**
   * Redémarre le Performance Engine
   */
  restart(): void {
    this.stop();
    this.state = this.createInitialState();
    this.start();
  }

  /**
   * Vérifie si le moteur est en cours d'exécution
   */
  isRunning(): boolean {
    return this.state.running;
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // MÉTHODES PUBLIQUES - CONFIGURATION
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Change le profil de performance
   */
  setProfile(profile: PerformanceProfile): void {
    this.config.profile = profile;
    this.config.thresholds = THRESHOLD_PROFILES[profile];

    // Mettre à jour les sous-moteurs
    this.analyzer.updateThresholds(this.config.thresholds);

    this.emit('profile_changed', {
      profile,
      timestamp: Date.now(),
    });

    console.log('[PerformanceEngine] Profil changé:', profile);
  }

  /**
   * Récupère le profil actuel
   */
  getProfile(): PerformanceProfile {
    return this.config.profile;
  }

  /**
   * Met à jour la configuration
   */
  updateConfig(config: Partial<PerformanceEngineConfig>): void {
    this.config = { ...this.config, ...config };

    if (config.thresholds) {
      this.analyzer.updateThresholds(config.thresholds);
    }

    console.log('[PerformanceEngine] Configuration mise à jour');
  }

  /**
   * Configure l'intégration Self-Healing
   */
  setSelfHealingIntegration(integration: SelfHealingIntegration): void {
    this.reporter.setSelfHealingIntegration(integration);
    console.log('[PerformanceEngine] Self-Healing intégré');
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // MÉTHODES PUBLIQUES - DONNÉES
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Exécute un cycle de performance manuellement
   */
  async runCycle(): Promise<PerformanceCycleResult> {
    const startTime = performance.now();

    // 1. Collecter les métriques
    const snapshot = await this.collector.collect();

    // 2. Analyser
    const analysis = this.analyzer.analyze(snapshot);

    // 3. Générer les recommandations
    const advisor = this.advisor.generateRecommendations(analysis);

    // 4. Reporter
    this.reporter.receiveSnapshot(snapshot);
    this.reporter.receiveAnalysis(analysis);
    this.reporter.receiveAdvisorResult(advisor);

    // Mettre à jour l'état
    this.state.lastCycleAt = Date.now();
    this.state.cycleCount++;
    this.state.healthScore = analysis.healthScore;
    this.state.grade = analysis.grade;
    this.state.activeIssues = analysis.issues.length;
    this.state.activeRecommendations = advisor.recommendations.length;

    const result: PerformanceCycleResult = {
      timestamp: this.state.lastCycleAt,
      snapshot,
      analysis,
      advisor,
      cycleTimeMs: performance.now() - startTime,
    };

    this.emit('snapshot_collected', result);

    return result;
  }

  /**
   * Récupère le dernier snapshot
   */
  getLastSnapshot(): MetricsSnapshot | null {
    return this.collector.getLastSnapshot();
  }

  /**
   * Récupère les problèmes actifs
   */
  getActiveIssues(): PerformanceIssue[] {
    return this.analyzer.getActiveIssues();
  }

  /**
   * Récupère les recommandations actives
   */
  getActiveRecommendations(): Recommendation[] {
    return this.advisor.getActiveRecommendations();
  }

  /**
   * Génère un rapport de performance
   */
  generateReport(): PerformanceReport {
    return this.reporter.generateReport();
  }

  /**
   * Récupère les données pour le dashboard
   */
  getDashboardData(): DashboardData {
    return this.reporter.getDashboardData();
  }

  /**
   * Récupère le score de santé actuel
   */
  getHealthScore(): number {
    return this.state.healthScore;
  }

  /**
   * Récupère le grade actuel
   */
  getGrade(): PerformanceGrade {
    return this.state.grade;
  }

  /**
   * Récupère l'état global
   */
  getState(): PerformanceEngineState {
    return { ...this.state };
  }

  /**
   * Récupère les statistiques détaillées
   */
  getStats(): Record<string, unknown> {
    return {
      engine: {
        running: this.state.running,
        startedAt: this.state.startedAt,
        cycleCount: this.state.cycleCount,
        lastCycleAt: this.state.lastCycleAt,
        healthScore: this.state.healthScore,
        grade: this.state.grade,
        profile: this.config.profile,
      },
      collector: this.collector.getStats(),
      analyzer: this.analyzer.getStats(),
      advisor: this.advisor.getStats(),
      reporter: this.reporter.getStats(),
    };
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // MÉTHODES PUBLIQUES - ACTIONS
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Applique une recommandation
   */
  async applyRecommendation(recommendationId: string): Promise<boolean> {
    return this.advisor.applyRecommendation(recommendationId);
  }

  /**
   * Annule une recommandation appliquée
   */
  async rollbackRecommendation(recommendationId: string): Promise<boolean> {
    return this.advisor.rollbackRecommendation(recommendationId);
  }

  /**
   * Réinitialise le Performance Engine
   */
  reset(): void {
    this.collector.resetStats();
    this.analyzer.reset();
    this.advisor.reset();
    this.reporter.reset();
    this.state = this.createInitialState();

    console.log('[PerformanceEngine] Réinitialisé');
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // MÉTHODES PUBLIQUES - ÉVÉNEMENTS
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * S'abonner à un événement
   */
  on(event: string, listener: PerformanceEventListener): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.add(listener);
    }

    return () => {
      this.eventListeners.get(event)?.delete(listener);
    };
  }

  /**
   * Se désabonner d'un événement
   */
  off(event: string, listener: PerformanceEventListener): void {
    this.eventListeners.get(event)?.delete(listener);
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // MÉTHODES PRIVÉES
  // ══════════════════════════════════════════════════════════════════════════════

  private createInitialState(): PerformanceEngineState {
    return {
      running: false,
      startedAt: null,
      lastCycleAt: 0,
      cycleCount: 0,
      healthScore: 100,
      grade: 'S',
      activeIssues: 0,
      activeRecommendations: 0,
    };
  }

  private startCollectionCycle(): void {
    if (this.collectionTimer) {
      clearInterval(this.collectionTimer);
    }

    // Exécuter immédiatement le premier cycle
    this.runCycle().catch(error => {
      console.error('[PerformanceEngine] Erreur cycle initial:', error);
    });

    // Configurer le timer pour les cycles suivants
    this.collectionTimer = setInterval(() => {
      if (this.state.running) {
        this.runCycle().catch(error => {
          console.error('[PerformanceEngine] Erreur cycle:', error);
        });
      }
    }, this.config.collector.intervalMs);
  }

  private setupInternalEvents(): void {
    // Relayer les événements des sous-moteurs
    this.collector.on((event: PerformanceEvent) => {
      if (event.type === 'snapshot_collected') {
        this.emit('snapshot_collected', event.data);
      }
    });

    this.analyzer.on('issue_detected', event => {
      this.emit('issue_detected', event.data);
    });

    this.analyzer.on('threshold_exceeded', event => {
      this.emit('threshold_exceeded', event.data);
    });

    this.advisor.on('recommendation_created', event => {
      this.emit('recommendation_created', event.data);
    });

    this.advisor.on('recommendation_applied', event => {
      this.emit('recommendation_applied', event.data);
    });
  }

  private emit(eventType: string, data: unknown): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const event: PerformanceEvent = {
        type: eventType as PerformanceEvent['type'],
        timestamp: Date.now(),
        data,
        source: 'collector',
      };

      for (const listener of listeners) {
        try {
          listener(event);
        } catch (error) {
          logger.error(
            'Event listener failed',
            { component: 'PerformanceEngine', action: 'emit', eventType },
            error as Error
          );
        }
      }
    }
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// SINGLETON
// ════════════════════════════════════════════════════════════════════════════════

let performanceEngineInstance: PerformanceEngine | null = null;

/**
 * Récupère l'instance singleton du Performance Engine
 */
export function getPerformanceEngine(): PerformanceEngine {
  if (!performanceEngineInstance) {
    performanceEngineInstance = new PerformanceEngine();
  }
  return performanceEngineInstance;
}

/**
 * Réinitialise l'instance singleton (pour les tests)
 */
export function resetPerformanceEngine(): void {
  if (performanceEngineInstance) {
    performanceEngineInstance.stop();
    performanceEngineInstance = null;
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// RE-EXPORTS
// ════════════════════════════════════════════════════════════════════════════════

// Types principaux
export type {
  PerformanceEngineConfig,
  MetricsSnapshot,
  PerformanceIssue,
  Recommendation,
  PerformanceProfile,
  ThresholdConfig,
  SeverityLevel,
  TitaneModule,
  PerformanceGrade,
  PerformanceEvent,
  PerformanceEventListener,
  SelfHealingIntegration,
};

// Types d'analyse
export type { AnalysisResult, TrendAnalysis, TrendDirection };

// Types advisor
export type { AdvisorResult };

// Types reporter
export type { PerformanceReport, DashboardData };

// Types locaux
export type { PerformanceEngineState, PerformanceCycleResult };

// Constantes
export {
  DEFAULT_PERFORMANCE_CONFIG,
  DEVELOPMENT_THRESHOLDS,
  PRODUCTION_THRESHOLDS,
  BENCHMARK_THRESHOLDS,
  LOWPOWER_THRESHOLDS,
  THRESHOLD_PROFILES,
  METRIC_DEFINITIONS,
  RECOMMENDATION_TEMPLATES,
};

// Utilitaires
export {
  createEmptySnapshot,
  generateSnapshotId,
  calculateGrade,
  formatBytes,
  formatDuration,
};

// Sub-engines (pour usage avancé)
export { MetricsCollector } from './metricsCollector';
export { PerformanceAnalyzer } from './analyzerEngine';
export { PerformanceAdvisor } from './advisorEngine';
export { PerformanceReporter } from './reporter';
