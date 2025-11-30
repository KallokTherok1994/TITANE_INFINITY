/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * TITANE∞ EVOLUTION ENGINE — Planner (Evolution Planner)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @file        planner.ts
 * @version     vΩ∞Ω∞
 *
 * Génère des suggestions d'amélioration à partir des patterns et insights
 * Toutes les suggestions sont minimales, sûres, ciblées et réversibles
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import type {
  EvolutionPattern,
  EvolutionInsight,
  EvolutionSuggestion,
  EvolutionAction,
  SuggestionCategory,
  EvolutionActionType,
  TitaneModule,
  RiskLevel,
  PlannerConfig,
  ActionWhitelistEntry,
} from './evolutionEngine.config';
import {
  createSuggestion,
  createAction,
  isActionWhitelisted,
  DEFAULT_PLANNER_CONFIG,
  DEFAULT_ACTION_WHITELIST,
} from './evolutionEngine.config';
import { getAnalyzer } from './analyzer';

// =============================================================================
// TYPES INTERNES
// =============================================================================

interface PlannerState {
  suggestions: EvolutionSuggestion[];
  lastPlanTime: number;
  isPlanning: boolean;
}

interface SuggestionTemplate {
  category: SuggestionCategory;
  title: string;
  description: string;
  rationale: string;
  actionTypes: EvolutionActionType[];
  targetModules: TitaneModule[];
  risk: RiskLevel;
  estimatedGain: number;
}

type SuggestionListener = (suggestion: EvolutionSuggestion) => void;

// =============================================================================
// PLANNER CLASS
// =============================================================================

/**
 * Planificateur d'évolutions
 * Génère des suggestions d'amélioration sûres et ciblées
 */
export class Planner {
  private config: PlannerConfig;
  private whitelist: ActionWhitelistEntry[];
  private state: PlannerState;
  private suggestionListeners: Set<SuggestionListener> = new Set();
  private planIntervalId: NodeJS.Timeout | null = null;

  constructor(config?: Partial<PlannerConfig>, whitelist?: ActionWhitelistEntry[]) {
    this.config = { ...DEFAULT_PLANNER_CONFIG, ...config };
    this.whitelist = whitelist || DEFAULT_ACTION_WHITELIST;
    this.state = this.createInitialState();
  }

  // ===========================================================================
  // INITIALISATION
  // ===========================================================================

  private createInitialState(): PlannerState {
    return {
      suggestions: [],
      lastPlanTime: 0,
      isPlanning: false,
    };
  }

  // ===========================================================================
  // DÉMARRAGE / ARRÊT
  // ===========================================================================

  start(): void {
    if (!this.config.enabled) return;
    if (this.planIntervalId) return;

    this.planIntervalId = setInterval(() => {
      this.planCycle();
    }, this.config.planInterval);
  }

  stop(): void {
    if (this.planIntervalId) {
      clearInterval(this.planIntervalId);
      this.planIntervalId = null;
    }
  }

  /**
   * Cycle de planification principal
   */
  async planCycle(): Promise<EvolutionSuggestion[]> {
    if (this.state.isPlanning) return [];
    this.state.isPlanning = true;

    try {
      const analyzer = getAnalyzer();
      const patterns = analyzer.getPatterns();
      const insights = analyzer.getActionableInsights();

      // Générer des suggestions basées sur les patterns et insights
      const newSuggestions: EvolutionSuggestion[] = [];

      // 1. Suggestions basées sur les patterns
      for (const pattern of patterns) {
        const suggestions = this.suggestFromPattern(pattern);
        newSuggestions.push(...suggestions);
      }

      // 2. Suggestions basées sur les insights
      for (const insight of insights) {
        const suggestions = this.suggestFromInsight(insight);
        newSuggestions.push(...suggestions);
      }

      // 3. Filtrer et limiter
      const validSuggestions = newSuggestions
        .filter((s) => this.validateSuggestion(s))
        .slice(0, this.config.maxSuggestionsPerCycle);

      // 4. Merger avec les suggestions existantes
      this.mergeSuggestions(validSuggestions);

      // 5. Nettoyer les suggestions expirées
      this.cleanExpiredSuggestions();

      this.state.lastPlanTime = Date.now();

      return validSuggestions;
    } catch (error) {
      console.error('[Planner] Erreur planification:', error);
      return [];
    } finally {
      this.state.isPlanning = false;
    }
  }

  // ===========================================================================
  // GÉNÉRATION DE SUGGESTIONS
  // ===========================================================================

  /**
   * Génère des suggestions à partir d'un pattern
   */
  private suggestFromPattern(pattern: EvolutionPattern): EvolutionSuggestion[] {
    const suggestions: EvolutionSuggestion[] = [];

    switch (pattern.type) {
      case 'INEFFICIENCY':
        suggestions.push(...this.suggestForInefficiency(pattern));
        break;
      case 'REPETITION':
        suggestions.push(...this.suggestForRepetition(pattern));
        break;
      case 'OVERLOAD':
        suggestions.push(...this.suggestForOverload(pattern));
        break;
      case 'LATENCY':
        suggestions.push(...this.suggestForLatency(pattern));
        break;
      case 'LEAK':
        suggestions.push(...this.suggestForLeak(pattern));
        break;
      default:
        break;
    }

    // Lier les suggestions au pattern
    for (const suggestion of suggestions) {
      suggestion.relatedPatterns.push(pattern.id);
    }

    return suggestions;
  }

  /**
   * Suggestions pour les inefficiences
   */
  private suggestForInefficiency(pattern: EvolutionPattern): EvolutionSuggestion[] {
    const suggestions: EvolutionSuggestion[] = [];

    // Suggestion: Ajuster les paramètres
    if (pattern.relatedMetrics.includes('avg_latency')) {
      const actions: EvolutionAction[] = [
        createAction(
          'ADJUST_PARAMETER',
          pattern.moduleId,
          'Augmenter le timeout pour réduire les erreurs',
          { parameter: 'timeout', increment: 1.5 },
          'LOW',
          true
        ),
      ];

      if (this.areActionsAllowed(actions)) {
        suggestions.push(
          createSuggestion(
            'PARAMETER_ADJUSTMENT',
            'Optimiser les timeouts',
            `Ajuster les timeouts du module ${pattern.moduleId} pour améliorer la stabilité`,
            pattern.description,
            [pattern.moduleId],
            'LOW',
            actions,
            this.config.suggestionValidityMs
          )
        );
      }
    }

    // Suggestion: Activer le cache
    if (pattern.relatedMetrics.includes('error_count')) {
      const actions: EvolutionAction[] = [
        createAction(
          'CLEAR_CACHE',
          pattern.moduleId,
          'Nettoyer le cache potentiellement corrompu',
          {},
          'LOW',
          true
        ),
      ];

      if (this.areActionsAllowed(actions)) {
        suggestions.push(
          createSuggestion(
            'CACHE_MANAGEMENT',
            'Nettoyer le cache',
            `Purger le cache du module ${pattern.moduleId} pour résoudre les erreurs`,
            `${pattern.occurrences} erreurs détectées`,
            [pattern.moduleId],
            'LOW',
            actions,
            this.config.suggestionValidityMs
          )
        );
      }
    }

    return suggestions;
  }

  /**
   * Suggestions pour les répétitions
   */
  private suggestForRepetition(pattern: EvolutionPattern): EvolutionSuggestion[] {
    const suggestions: EvolutionSuggestion[] = [];

    // Suggestion: Ajuster la fréquence
    const actions: EvolutionAction[] = [
      createAction(
        'UPDATE_THRESHOLD',
        pattern.moduleId,
        'Réduire la fréquence de polling',
        { parameter: 'pollingInterval', multiplier: 2 },
        'LOW',
        true
      ),
    ];

    if (this.areActionsAllowed(actions)) {
      suggestions.push(
        createSuggestion(
          'FREQUENCY_TUNING',
          'Optimiser la fréquence de polling',
          `Réduire les appels répétitifs du module ${pattern.moduleId}`,
          pattern.description,
          [pattern.moduleId],
          'LOW',
          actions,
          this.config.suggestionValidityMs
        )
      );
    }

    return suggestions;
  }

  /**
   * Suggestions pour les surcharges
   */
  private suggestForOverload(pattern: EvolutionPattern): EvolutionSuggestion[] {
    const suggestions: EvolutionSuggestion[] = [];

    // Suggestion: Mode performance
    if (pattern.relatedMetrics.includes('cpu') || pattern.relatedMetrics.includes('ram')) {
      const actions: EvolutionAction[] = [
        createAction(
          'TOGGLE_MODE',
          'performance',
          'Activer le mode performance',
          { mode: 'performance', enabled: true },
          'LOW',
          true
        ),
      ];

      if (this.areActionsAllowed(actions)) {
        suggestions.push(
          createSuggestion(
            'OPTIMIZATION',
            'Activer le mode performance',
            'Réduire la charge système en activant les optimisations',
            pattern.description,
            ['performance', pattern.moduleId],
            'MEDIUM',
            actions,
            this.config.suggestionValidityMs
          )
        );
      }
    }

    // Suggestion: Compression mémoire
    if (pattern.relatedMetrics.includes('ram')) {
      const actions: EvolutionAction[] = [
        createAction(
          'COMPRESS_MEMORY',
          'memory',
          'Compresser les données en mémoire',
          { aggressive: false },
          'LOW',
          true
        ),
      ];

      if (this.areActionsAllowed(actions)) {
        suggestions.push(
          createSuggestion(
            'OPTIMIZATION',
            'Compresser la mémoire',
            'Libérer de la RAM en compressant les données',
            pattern.description,
            ['memory'],
            'LOW',
            actions,
            this.config.suggestionValidityMs
          )
        );
      }
    }

    return suggestions;
  }

  /**
   * Suggestions pour les latences
   */
  private suggestForLatency(pattern: EvolutionPattern): EvolutionSuggestion[] {
    const suggestions: EvolutionSuggestion[] = [];

    // Suggestion: Recalibrer
    const actions: EvolutionAction[] = [
      createAction(
        'RECALIBRATE',
        pattern.moduleId,
        'Recalibrer le module pour optimiser les performances',
        {},
        'MEDIUM',
        true
      ),
    ];

    if (this.areActionsAllowed(actions)) {
      suggestions.push(
        createSuggestion(
          'OPTIMIZATION',
          'Recalibrer le module',
          `Recalibrer ${pattern.moduleId} pour réduire la latence`,
          pattern.description,
          [pattern.moduleId],
          'MEDIUM',
          actions,
          this.config.suggestionValidityMs
        )
      );
    }

    return suggestions;
  }

  /**
   * Suggestions pour les fuites
   */
  private suggestForLeak(pattern: EvolutionPattern): EvolutionSuggestion[] {
    const suggestions: EvolutionSuggestion[] = [];

    // Suggestion: Déclencher un playbook Self-Healing
    const actions: EvolutionAction[] = [
      createAction(
        'TRIGGER_PLAYBOOK',
        'selfHealing',
        'Déclencher le playbook de nettoyage mémoire',
        { playbook: 'memory_cleanup' },
        'MEDIUM',
        true
      ),
    ];

    if (this.areActionsAllowed(actions)) {
      suggestions.push(
        createSuggestion(
          'PLAYBOOK_ACTIVATION',
          'Activer le nettoyage mémoire',
          'Utiliser Self-Healing pour nettoyer les fuites détectées',
          pattern.description,
          ['selfHealing', pattern.moduleId],
          'MEDIUM',
          actions,
          this.config.suggestionValidityMs
        )
      );
    }

    return suggestions;
  }

  /**
   * Génère des suggestions à partir d'un insight
   */
  private suggestFromInsight(insight: EvolutionInsight): EvolutionSuggestion[] {
    const suggestions: EvolutionSuggestion[] = [];

    // Convertir les actions recommandées en suggestions
    for (const recommendedAction of insight.recommendedActions.slice(0, 2)) {
      const template = this.findTemplateForRecommendation(recommendedAction, insight);
      if (template) {
        const actions = this.createActionsFromTemplate(template);

        if (this.areActionsAllowed(actions)) {
          const suggestion = createSuggestion(
            template.category,
            template.title,
            template.description,
            template.rationale,
            template.targetModules,
            template.risk,
            actions,
            this.config.suggestionValidityMs
          );
          suggestion.relatedInsights.push(insight.id);
          suggestion.estimatedGain = template.estimatedGain;
          suggestions.push(suggestion);
        }
      }
    }

    return suggestions;
  }

  private findTemplateForRecommendation(
    recommendation: string,
    insight: EvolutionInsight
  ): SuggestionTemplate | null {
    const lowerRec = recommendation.toLowerCase();

    if (lowerRec.includes('optimiser') || lowerRec.includes('performance')) {
      return {
        category: 'OPTIMIZATION',
        title: 'Optimisation suggérée',
        description: recommendation,
        rationale: insight.description,
        actionTypes: ['TOGGLE_MODE', 'RECALIBRATE'],
        targetModules: insight.affectedModules,
        risk: 'MEDIUM',
        estimatedGain: 10,
      };
    }

    if (lowerRec.includes('cache')) {
      return {
        category: 'CACHE_MANAGEMENT',
        title: 'Gestion du cache',
        description: recommendation,
        rationale: insight.description,
        actionTypes: ['CLEAR_CACHE'],
        targetModules: insight.affectedModules,
        risk: 'LOW',
        estimatedGain: 5,
      };
    }

    if (lowerRec.includes('fréquence') || lowerRec.includes('polling')) {
      return {
        category: 'FREQUENCY_TUNING',
        title: 'Ajustement de fréquence',
        description: recommendation,
        rationale: insight.description,
        actionTypes: ['UPDATE_THRESHOLD'],
        targetModules: insight.affectedModules,
        risk: 'LOW',
        estimatedGain: 8,
      };
    }

    return null;
  }

  private createActionsFromTemplate(template: SuggestionTemplate): EvolutionAction[] {
    const actions: EvolutionAction[] = [];

    for (const actionType of template.actionTypes.slice(
      0,
      this.config.maxActionsPerSuggestion
    )) {
      for (const targetModule of template.targetModules.slice(0, 1)) {
        actions.push(
          createAction(
            actionType,
            targetModule,
            `${actionType} sur ${targetModule}`,
            {},
            template.risk,
            true
          )
        );
      }
    }

    return actions;
  }

  // ===========================================================================
  // VALIDATION
  // ===========================================================================

  /**
   * Vérifie si une suggestion est valide
   */
  private validateSuggestion(suggestion: EvolutionSuggestion): boolean {
    // Vérifier le niveau de risque
    const riskHierarchy: Record<RiskLevel, number> = {
      LOW: 0,
      MEDIUM: 1,
      HIGH: 2,
      CRITICAL: 3,
    };

    if (riskHierarchy[suggestion.risk] > riskHierarchy[this.config.riskTolerance]) {
      return false;
    }

    // Vérifier la catégorie
    if (
      this.config.preferredCategories.length > 0 &&
      !this.config.preferredCategories.includes(suggestion.category)
    ) {
      return false;
    }

    // Vérifier les actions
    for (const action of suggestion.actions) {
      if (this.config.excludedActionTypes.includes(action.type)) {
        return false;
      }
    }

    // Vérifier que les actions sont dans la whitelist
    return this.areActionsAllowed(suggestion.actions);
  }

  /**
   * Vérifie si toutes les actions sont autorisées
   */
  private areActionsAllowed(actions: EvolutionAction[]): boolean {
    for (const action of actions) {
      const result = isActionWhitelisted(
        action.type,
        action.targetModule,
        action.risk,
        this.whitelist
      );
      if (!result.allowed) {
        return false;
      }
    }
    return true;
  }

  // ===========================================================================
  // GESTION DES SUGGESTIONS
  // ===========================================================================

  private mergeSuggestions(newSuggestions: EvolutionSuggestion[]): void {
    for (const newSuggestion of newSuggestions) {
      const existing = this.state.suggestions.find(
        (s) =>
          s.title === newSuggestion.title &&
          s.category === newSuggestion.category &&
          s.status === 'PENDING'
      );

      if (!existing) {
        this.state.suggestions.push(newSuggestion);

        this.suggestionListeners.forEach((listener) => {
          try {
            listener(newSuggestion);
          } catch (e) {
            console.error('[Planner] Suggestion listener error:', e);
          }
        });
      }
    }
  }

  private cleanExpiredSuggestions(): void {
    const now = Date.now();
    this.state.suggestions = this.state.suggestions.filter((s) => {
      if (s.status !== 'PENDING') return true;
      if (s.validUntil < now) {
        s.status = 'EXPIRED';
        return false;
      }
      return true;
    });
  }

  // ===========================================================================
  // API PUBLIQUE
  // ===========================================================================

  /**
   * Récupère toutes les suggestions
   */
  getSuggestions(): EvolutionSuggestion[] {
    return [...this.state.suggestions];
  }

  /**
   * Récupère les suggestions en attente
   */
  getPendingSuggestions(): EvolutionSuggestion[] {
    return this.state.suggestions.filter((s) => s.status === 'PENDING');
  }

  /**
   * Récupère les suggestions par catégorie
   */
  getSuggestionsByCategory(category: SuggestionCategory): EvolutionSuggestion[] {
    return this.state.suggestions.filter((s) => s.category === category);
  }

  /**
   * Récupère une suggestion par ID
   */
  getSuggestionById(id: string): EvolutionSuggestion | null {
    return this.state.suggestions.find((s) => s.id === id) || null;
  }

  /**
   * Approuve une suggestion
   */
  approveSuggestion(id: string, approver: 'DEV' | 'ADMIN'): boolean {
    const suggestion = this.state.suggestions.find((s) => s.id === id);
    if (!suggestion || suggestion.status !== 'PENDING') {
      return false;
    }

    suggestion.status = 'APPROVED';
    suggestion.approvedBy = approver;
    suggestion.approvedAt = Date.now();
    return true;
  }

  /**
   * Rejette une suggestion
   */
  rejectSuggestion(id: string): boolean {
    const suggestion = this.state.suggestions.find((s) => s.id === id);
    if (!suggestion || suggestion.status !== 'PENDING') {
      return false;
    }

    suggestion.status = 'REJECTED';
    return true;
  }

  /**
   * Marque une suggestion comme exécutée
   */
  markExecuted(id: string): boolean {
    const suggestion = this.state.suggestions.find((s) => s.id === id);
    if (!suggestion || suggestion.status !== 'APPROVED') {
      return false;
    }

    suggestion.status = 'EXECUTED';
    suggestion.executedAt = Date.now();
    return true;
  }

  /**
   * Marque une suggestion comme rollback
   */
  markRolledBack(id: string): boolean {
    const suggestion = this.state.suggestions.find((s) => s.id === id);
    if (!suggestion || suggestion.status !== 'EXECUTED') {
      return false;
    }

    suggestion.status = 'ROLLED_BACK';
    return true;
  }

  // ===========================================================================
  // LISTENERS
  // ===========================================================================

  onSuggestion(listener: SuggestionListener): () => void {
    this.suggestionListeners.add(listener);
    return () => this.suggestionListeners.delete(listener);
  }

  // ===========================================================================
  // MAINTENANCE
  // ===========================================================================

  async plan(): Promise<EvolutionSuggestion[]> {
    return this.planCycle();
  }

  reset(): void {
    this.state = this.createInitialState();
  }

  dispose(): void {
    this.stop();
    this.suggestionListeners.clear();
    this.state.suggestions = [];
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let plannerInstance: Planner | null = null;

export function getPlanner(): Planner {
  if (!plannerInstance) {
    plannerInstance = new Planner();
  }
  return plannerInstance;
}

export function resetPlanner(): void {
  if (plannerInstance) {
    plannerInstance.dispose();
    plannerInstance = null;
  }
}

export default Planner;
