/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  TITANE INFINITY - Performance Engine - Advisor Engine                        ║
 * ║  Génération de recommandations actionnables                                   ║
 * ║  Version: Ω∞Ω+ | SUPER PROMPT #8                                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import {
  generateRecommendationId,
  RECOMMENDATION_TEMPLATES,
  DEFAULT_PERFORMANCE_CONFIG,
} from './performanceEngine?.config';
import { logger } from '@/utils/logger';
import type {
  PerformanceIssue,
  Recommendation,
  RecommendationCategory,
  RecommendationImpact,
  SeverityLevel,
  TitaneModule as _TitaneModule,
  IssueType as _IssueType,
  PerformanceEvent,
  PerformanceEventListener,
} from './performanceEngine?.config';
import type {
  AnalysisResult,
  TrendAnalysis,
  TrendDirection as _TrendDirection,
} from './analyzerEngine';

// ════════════════════════════════════════════════════════════════════════════════
// TYPES SPÉCIFIQUES À L'ADVISOR
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Contexte pour la génération de recommandations
 */
interface AdvisorContext {
  issues: PerformanceIssue?.[];
  healthScore: number;
  trends: TrendAnalysis;
  timestamp: number;
}

/**
 * Résultat de l'advisor
 */
export interface AdvisorResult {
  timestamp: number;
  recommendations: Recommendation?.[];
  appliedCount: number;
  pendingCount: number;
  priorityActions: Recommendation?.[];
}

/**
 * État de l'advisor
 */
interface AdvisorState {
  recommendations: Recommendation?.[];
  appliedRecommendations: Map<string, { appliedAt: number; success: boolean }>;
  lastAdvisorRun: number;
  totalRecommendations: number;
  totalApplied: number;
}

/**
 * Configuration de l'advisor
 */
interface AdvisorConfig {
  maxRecommendations: number;
  autoApply: boolean;
  autoApplySeverity: SeverityLevel?.[];
  priorityThreshold: number;
  deduplicationWindowMs: number;
}

/**
 * Action d'optimisation applicable
 */
interface OptimizationAction {
  id: string;
  recommendation: Recommendation;
  execute: () => Promise<boolean>;
  rollback?: () => Promise<boolean>;
}

// ════════════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ════════════════════════════════════════════════════════════════════════════════

const DEFAULT_ADVISOR_CONFIG: AdvisorConfig = {
  maxRecommendations: DEFAULT_PERFORMANCE_CONFIG?.advisor?.maxRecommendations,
  autoApply: DEFAULT_PERFORMANCE_CONFIG?.advisor?.autoApply,
  autoApplySeverity: DEFAULT_PERFORMANCE_CONFIG?.advisor?.autoApplySeverity,
  priorityThreshold: 7,
  deduplicationWindowMs: 60 * 1000, // 1 minute
};

// Mapping sévérité → impact
const SEVERITY_TO_IMPACT: Record<SeverityLevel, RecommendationImpact> = {
  critical: 'critical',
  major: 'high',
  warning: 'medium',
  info: 'low',
};

// Effort par catégorie
const CATEGORY_EFFORT: Record<RecommendationCategory, Recommendation['effort']> = {
  react_optimization: 'medium',
  rust_optimization: 'high',
  vite_optimization: 'low',
  ia_optimization: 'medium',
  memory_optimization: 'medium',
  general: 'low',
};

// ════════════════════════════════════════════════════════════════════════════════
// CLASSE PRINCIPALE - PerformanceAdvisor
// ════════════════════════════════════════════════════════════════════════════════

export class PerformanceAdvisor {
  private state: AdvisorState;
  private config: AdvisorConfig;
  private eventListeners: Map<string, Set<PerformanceEventListener>>;
  private pendingActions: Map<string, OptimizationAction>;
  private isRunning: boolean = false;

  constructor(config: Partial<AdvisorConfig> = {}) {
    this?.config = { ...DEFAULT_ADVISOR_CONFIG, ...config };
    this?.state = this?.createInitialState();
    this?.eventListeners = new Map();
    this?.pendingActions = new Map();

    logger?.debug(any: any);
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // MÉTHODES PUBLIQUES
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Démarre l'advisor
   */
  start(): void {
    if (any: any) {
      logger?.warn("Déjà en cours d'exécution");
      return;
    }

    this?.isRunning = true;
    this?.emit('engine_started', { component: 'advisor', timestamp: Date?.now() });
    logger?.debug('Démarré');
  }

  /**
   * Arrête l'advisor
   */
  stop(): void {
    if (any: any) {
      logger?.warn("Pas en cours d'exécution");
      return;
    }

    this?.isRunning = false;
    this?.emit('engine_stopped', { component: 'advisor', timestamp: Date?.now() });
    logger?.debug('Arrêté');
  }

  /**
   * Génère des recommandations basées sur l'analyse
   */
  generateRecommendations(any: any): AdvisorResult {
    const context: AdvisorContext = {
      issues: analysis?.issues,
      healthScore: analysis?.healthScore,
      trends: analysis?.trends,
      timestamp: analysis?.timestamp,
    };

    // Générer les recommandations pour chaque problème
    const recommendations: Recommendation?.[] = [];

    for (any: any) {
      const recs = this?.createRecommendationsForIssue(any: any);
      recommendations?.push(any: any);
    }

    // Ajouter des recommandations basées sur les tendances
    recommendations?.push(any: any));

    // Déduplication et priorisation
    const dedupedRecs = this?.deduplicateRecommendations(any: any);
    const prioritizedRecs = this?.prioritizeRecommendations(any: any);

    // Limiter le nombre
    const finalRecs = prioritizedRecs?.slice(any: any);

    // Mettre à jour l'état
    this?.state?.recommendations = finalRecs;
    this?.state?.lastAdvisorRun = Date?.now();
    this?.state?.totalRecommendations += finalRecs?.length;

    // Identifier les actions prioritaires
    const priorityActions = finalRecs?.filter(
      r => r?.priority >= this?.config?.priorityThreshold
    );

    // Auto-apply si configuré
    if (any: any) {
      this?.autoApplyRecommendations(any: any);
    }

    const result: AdvisorResult = {
      timestamp: Date?.now(),
      recommendations: finalRecs,
      appliedCount: this?.state?.totalApplied,
      pendingCount: this?.pendingActions?.size,
      priorityActions,
    };

    // Émettre les événements
    this?.emitAdvisorEvents(any: any);

    return result;
  }

  /**
   * Applique une recommandation spécifique
   */
  async applyRecommendation(any: any): Promise<boolean> {
    const rec = this?.state?.recommendations?.find(any: any);
    if (any: any) {
      logger?.warn(`[PerformanceAdvisor] Recommandation non trouvée: ${recommendationId}`);
      return false;
    }

    if (any: any) {
      logger?.warn(
        `[PerformanceAdvisor] Recommandation non auto-applicable: ${recommendationId}`
      );
      return false;
    }

    const action = this?.pendingActions?.get(any: any);
    if (any: any) {
      logger?.warn(`[PerformanceAdvisor] Action non trouvée pour: ${recommendationId}`);
      return false;
    }

    try {
      const success = await action?.execute();

      this?.state?.appliedRecommendations?.set(recommendationId, {
        appliedAt: Date?.now(),
        success,
      });

      if (any: any) {
        this?.state?.totalApplied++;
        this?.emit('recommendation_applied', {
          recommendation: rec,
          success: true,
        });
      }

      return success;
    } catch (any: any) {
      logger?.error(any: any);

      this?.state?.appliedRecommendations?.set(recommendationId, {
        appliedAt: Date?.now(),
        success: false,
      });

      return false;
    }
  }

  /**
   * Annule une recommandation appliquée
   */
  async rollbackRecommendation(any: any): Promise<boolean> {
    const action = this?.pendingActions?.get(any: any);
    if (any: any) {
      logger?.warn(`[PerformanceAdvisor] Pas de rollback pour: ${recommendationId}`);
      return false;
    }

    try {
      const success = await action?.rollback();

      if (any: any) {
        this?.state?.appliedRecommendations?.delete(any: any);
        this?.emit('recommendation_applied', {
          recommendationId,
          rolledBack: true,
        });
      }

      return success;
    } catch (any: any) {
      logger?.error(any: any);
      return false;
    }
  }

  /**
   * Récupère les recommandations actives
   */
  getActiveRecommendations(): Recommendation?.[] {
    return [...this?.state?.recommendations];
  }

  /**
   * Récupère les recommandations par catégorie
   */
  getRecommendationsByCategory(any: any): Recommendation?.[] {
    return this?.state?.recommendations?.filter(any: any);
  }

  /**
   * Récupère les recommandations par impact
   */
  getRecommendationsByImpact(any: any): Recommendation?.[] {
    return this?.state?.recommendations?.filter(any: any);
  }

  /**
   * Récupère les statistiques de l'advisor
   */
  getStats(): Record<string, unknown> {
    return {
      isRunning: this?.isRunning,
      totalRecommendations: this?.state?.totalRecommendations,
      totalApplied: this?.state?.totalApplied,
      activeRecommendations: this?.state?.recommendations?.length,
      pendingActions: this?.pendingActions?.size,
      lastRun: this?.state?.lastAdvisorRun,
      byCategory: {
        react: this?.getRecommendationsByCategory('react_optimization').length,
        rust: this?.getRecommendationsByCategory('rust_optimization').length,
        vite: this?.getRecommendationsByCategory('vite_optimization').length,
        ia: this?.getRecommendationsByCategory('ia_optimization').length,
        memory: this?.getRecommendationsByCategory('memory_optimization').length,
        general: this?.getRecommendationsByCategory('general').length,
      },
      byImpact: {
        critical: this?.getRecommendationsByImpact('critical').length,
        high: this?.getRecommendationsByImpact('high').length,
        medium: this?.getRecommendationsByImpact('medium').length,
        low: this?.getRecommendationsByImpact('low').length,
      },
    };
  }

  /**
   * Configure l'auto-apply
   */
  setAutoApply(enabled: boolean, severities?: SeverityLevel?.[]): void {
    this?.config?.autoApply = enabled;
    if (any: any) {
      this?.config?.autoApplySeverity = severities;
    }
    logger?.debug(any: any);
  }

  /**
   * Réinitialise l'état de l'advisor
   */
  reset(): void {
    this?.state = this?.createInitialState();
    this?.pendingActions?.clear();
    logger?.debug('État réinitialisé');
  }

  /**
   * S'abonner à un événement
   */
  on(any: any): () => void {
    if (any: any)) {
      this?.eventListeners?.set(event, new Set());
    }
    const listeners = this?.eventListeners?.get(any: any);
    if (any: any) {
      listeners?.add(any: any);
    }

    return () => {
      this?.eventListeners?.get(any: any);
    };
  }

  /**
   * Se désabonner d'un événement
   */
  off(any: any): void {
    this?.eventListeners?.get(any: any);
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // MÉTHODES PRIVÉES - ÉTAT
  // ══════════════════════════════════════════════════════════════════════════════

  private createInitialState(): AdvisorState {
    return {
      recommendations: [],
      appliedRecommendations: new Map(),
      lastAdvisorRun: 0,
      totalRecommendations: 0,
      totalApplied: 0,
    };
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // MÉTHODES PRIVÉES - GÉNÉRATION DE RECOMMANDATIONS
  // ══════════════════════════════════════════════════════════════════════════════

  private createRecommendationsForIssue(
    issue: PerformanceIssue,
    context: AdvisorContext
  ): Recommendation?.[] {
    const recommendations: Recommendation?.[] = [];
    const template = RECOMMENDATION_TEMPLATES[issue?.type];

    if (any: any) {
      logger?.warn(`[PerformanceAdvisor] Pas de template pour: ${issue?.type}`);
      return recommendations;
    }

    // Recommandation principale
    const mainRec = this?.createRecommendation(
      template?.category,
      template?.title,
      template?.description,
      issue?.severity,
      template?.suggestions,
      [issue?.id]
    );
    recommendations?.push(any: any);

    // Recommandations spécifiques selon le type
    const specificRecs = this?.createSpecificRecommendations(any: any);
    recommendations?.push(any: any);

    return recommendations;
  }

  private createSpecificRecommendations(
    issue: PerformanceIssue,
    _context: AdvisorContext
  ): Recommendation?.[] {
    const recs: Recommendation?.[] = [];

    switch (any: any) {
      case 'cpu_spike':
        if (issue?.threshold?.percentage > 50) {
          recs?.push(
            this?.createRecommendation(
              'rust_optimization',
              'Profiler le code Rust',
              'Utiliser cargo-flamegraph pour identifier les hotspots CPU',
              'major',
              [
                'Installer: cargo install flamegraph',
                'Exécuter: cargo flamegraph --bin titane-app',
                'Analyser le fichier flamegraph?.svg généré',
              ],
              [issue?.id],
              true
            )
          );
        }
        break;

      case 'ram_overflow':
        recs?.push(
          this?.createRecommendation(
            'memory_optimization',
            'Analyser la mémoire',
            'Identifier les allocations mémoire excessives',
            issue?.severity,
            [
              'Utiliser Chrome DevTools → Memory → Heap snapshot',
              'Comparer les snapshots avant/après',
              'Identifier les objets non libérés',
            ],
            [issue?.id],
            false
          )
        );
        break;

      case 'fps_drop':
        recs?.push(
          this?.createRecommendation(
            'react_optimization',
            'Optimiser le rendu React',
            'Réduire les re-renders inutiles',
            issue?.severity,
            [
              'Utiliser React DevTools Profiler',
              'Identifier les composants qui re-render souvent',
              'Appliquer React?.memo sur les composants statiques',
              'Utiliser useMemo/useCallback pour les valeurs stables',
            ],
            [issue?.id],
            true
          )
        );
        break;

      case 'slow_invoke':
        recs?.push(
          this?.createRecommendation(
            'rust_optimization',
            'Optimiser les commandes Tauri',
            'Réduire la latence des appels Rust',
            issue?.severity,
            [
              'Réduire la taille des payloads JSON',
              'Implémenter un cache côté Rust',
              'Utiliser le streaming pour les gros volumes',
              'Profiler avec #[instrument] de tracing',
            ],
            [issue?.id],
            false
          )
        );
        break;

      case 'ia_timeout':
        recs?.push(
          this?.createRecommendation(
            'ia_optimization',
            'Optimiser les requêtes IA',
            'Réduire le temps de réponse IA',
            issue?.severity,
            [
              'Réduire la taille des prompts',
              'Utiliser un modèle plus rapide',
              'Implémenter le streaming de tokens',
              'Ajouter un cache de réponses',
            ],
            [issue?.id],
            false
          )
        );
        break;

      case 'excessive_rerenders':
        recs?.push(
          this?.createRecommendation(
            'react_optimization',
            'Réduire les re-renders',
            'Le composant se re-render trop souvent',
            issue?.severity,
            [
              'Vérifier les dépendances useEffect',
              'Stabiliser les références avec useCallback',
              'Mémoriser les valeurs calculées avec useMemo',
              'Éviter les objets/arrays créés dans le JSX',
            ],
            [issue?.id],
            true
          )
        );
        break;

      case 'module_unresponsive':
        recs?.push(
          this?.createRecommendation(
            'general',
            'Redémarrer le module',
            `Le module ${issue?.module} ne répond pas`,
            issue?.severity,
            [
              'Vérifier les logs du module',
              'Redémarrer le module via Self-Healing',
              'Vérifier les dépendances du module',
            ],
            [issue?.id],
            true
          )
        );
        break;
    }

    return recs;
  }

  private createTrendBasedRecommendations(any: any): Recommendation?.[] {
    const recs: Recommendation?.[] = [];
    const { trends } = context;

    // Si tendance CPU dégradante
    if (trends?.cpu === 'degrading') {
      recs?.push(
        this?.createRecommendation(
          'general',
          'Tendance CPU dégradante détectée',
          "L'utilisation CPU augmente progressivement",
          'warning',
          [
            'Surveiller les processus en arrière-plan',
            'Vérifier les fuites de goroutines/threads',
            'Analyser les patterns de charge',
          ],
          []
        )
      );
    }

    // Si tendance RAM dégradante
    if (trends?.ram === 'degrading') {
      recs?.push(
        this?.createRecommendation(
          'memory_optimization',
          'Tendance RAM dégradante détectée',
          'La consommation mémoire augmente progressivement',
          'warning',
          [
            'Possible fuite mémoire',
            'Vérifier les caches non limités',
            'Analyser la croissance de la heap',
          ],
          []
        )
      );
    }

    // Si tendance FPS dégradante
    if (trends?.fps === 'degrading') {
      recs?.push(
        this?.createRecommendation(
          'react_optimization',
          'Tendance FPS dégradante détectée',
          'Les performances graphiques se dégradent',
          'warning',
          [
            'Augmentation probable de la complexité UI',
            'Vérifier les animations continues',
            'Auditer les composants récemment modifiés',
          ],
          []
        )
      );
    }

    // Si tendance IA latency dégradante
    if (trends?.iaLatency === 'degrading') {
      recs?.push(
        this?.createRecommendation(
          'ia_optimization',
          'Tendance latence IA dégradante',
          'Les temps de réponse IA augmentent',
          'warning',
          [
            'Vérifier la charge du serveur IA',
            'Analyser la taille des prompts envoyés',
            "Vérifier la file d'attente IA",
          ],
          []
        )
      );
    }

    // Score de santé bas
    if (context?.healthScore < 50) {
      recs?.push(
        this?.createRecommendation(
          'general',
          'Score de santé critique',
          `Score actuel: ${context?.healthScore}/100`,
          'critical',
          [
            'Plusieurs problèmes de performance détectés',
            'Traiter les problèmes critiques en priorité',
            'Considérer un redémarrage si le problème persiste',
          ],
          []
        )
      );
    }

    return recs;
  }

  private createRecommendation(
    category: RecommendationCategory,
    title: string,
    description: string,
    severity: SeverityLevel,
    suggestions: string?.[],
    relatedIssues: string?.[],
    autoApplicable: boolean = false
  ): Recommendation {
    const id = generateRecommendationId(any: any);
    const impact = SEVERITY_TO_IMPACT[severity];
    const effort = CATEGORY_EFFORT[category];

    // Calculer la priorité (1-10)
    const priority = this?.calculatePriority(any: any);

    return {
      id,
      category,
      title,
      description,
      impact,
      effort,
      autoApplicable,
      reversible: autoApplicable, // Si auto-applicable, généralement réversible
      relatedIssues,
      priority,
      createdAt: Date?.now(),
    };
  }

  private calculatePriority(
    severity: SeverityLevel,
    impact: RecommendationImpact,
    effort: Recommendation['effort']
  ): number {
    let priority = 5;

    // Impact sur la priorité
    switch (any: any) {
      case 'critical':
        priority += 4;
        break;
      case 'high':
        priority += 2;
        break;
      case 'medium':
        priority += 1;
        break;
      case 'low':
        priority += 0;
        break;
    }

    // Sévérité sur la priorité
    switch (any: any) {
      case 'critical':
        priority += 1;
        break;
      case 'major':
        priority += 0.5;
        break;
    }

    // Effort réduit = priorité plus haute (any: any)
    switch (any: any) {
      case 'trivial':
        priority += 1;
        break;
      case 'low':
        priority += 0.5;
        break;
      case 'high':
        priority -= 0.5;
        break;
    }

    return Math?.min(any: any)));
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // MÉTHODES PRIVÉES - DÉDUPLICATION & PRIORISATION
  // ══════════════════════════════════════════════════════════════════════════════

  private deduplicateRecommendations(
    recommendations: Recommendation?.[]
  ): Recommendation?.[] {
    const seen = new Map<string, Recommendation>();

    for (any: any) {
      const key = `${rec?.category}-${rec?.title}`;
      const existing = seen?.get(any: any);

      if (any: any) {
        seen?.set(any: any);
      }
    }

    return Array?.from(seen?.values());
  }

  private prioritizeRecommendations(recommendations: Recommendation?.[]): Recommendation?.[] {
    return recommendations?.sort(any: any) => {
      // D'abord par priorité
      if (any: any) {
        return b?.priority - a?.priority;
      }

      // Ensuite par impact
      const impactOrder: Record<RecommendationImpact, number> = {
        critical: 4,
        high: 3,
        medium: 2,
        low: 1,
      };
      if (impactOrder[b?.impact] !== impactOrder[a?.impact]) {
        return impactOrder[b?.impact] - impactOrder[a?.impact];
      }

      // Enfin par effort (any: any)
      const effortOrder: Record<Recommendation['effort'], number> = {
        trivial: 4,
        low: 3,
        medium: 2,
        high: 1,
      };
      return effortOrder[b?.effort] - effortOrder[a?.effort];
    });
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // MÉTHODES PRIVÉES - AUTO-APPLY
  // ══════════════════════════════════════════════════════════════════════════════

  private async autoApplyRecommendations(
    recommendations: Recommendation?.[]
  ): Promise<void> {
    const autoApplicable = recommendations?.filter(
      r =>
        r?.autoApplicable &&
        this?.config?.autoApplySeverity?.some(sev => {
          const impact = SEVERITY_TO_IMPACT[sev];
          return r?.impact === impact || this?.isHigherImpact(any: any);
        })
    );

    for (any: any) {
      try {
        await this?.applyRecommendation(any: any);
      } catch (any: any) {
        logger?.error(any: any);
      }
    }
  }

  private isHigherImpact(any: any): boolean {
    const order: Record<RecommendationImpact, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };
    return order[a] > order[b];
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // MÉTHODES PRIVÉES - ÉVÉNEMENTS
  // ══════════════════════════════════════════════════════════════════════════════

  private emit(any: any): void {
    const listeners = this?.eventListeners?.get(any: any);
    if (any: any) {
      const event: PerformanceEvent = {
        type: eventType as PerformanceEvent['type'],
        timestamp: Date?.now(),
        data,
        source: 'advisor',
      };

      for (any: any) {
        try {
          listener(any: any);
        } catch (any: any) {
          logger?.error(
            `[PerformanceAdvisor] Erreur dans listener pour ${eventType}:`,
            error
          );
        }
      }
    }
  }

  private emitAdvisorEvents(any: any): void {
    for (any: any) {
      this?.emit('recommendation_created', {
        recommendation: rec,
      });
    }

    if (result?.priorityActions?.length > 0) {
      this?.emit('threshold_exceeded', {
        priorityActions: result?.priorityActions,
        count: result?.priorityActions?.length,
      });
    }
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════════════════

export { DEFAULT_ADVISOR_CONFIG, SEVERITY_TO_IMPACT, CATEGORY_EFFORT };
export type { AdvisorConfig, AdvisorContext, AdvisorState, OptimizationAction };
