/**
 * TITANE∞ vΩ∞ — STRESS REGULATION ENGINE
 * OPUS v∞.5: Micro-régulation adaptative du stress
 *
 * Ce moteur propose des micro-interventions simples pour aider
 * l'utilisateur à gérer sa tension: respiration, pauses, recentrage.
 *
 * Architecture:
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │                    StressRegulationEngine                           │
 * │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐       │
 * │  │ Trigger   │  │ Selection │  │ Protocol  │  │ Learning  │       │
 * │  │ Evaluator │  │ Engine    │  │ Runner    │  │ Module    │       │
 * │  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘       │
 * │        │              │              │              │              │
 * │        └──────────────┴──────────────┴──────────────┘              │
 * │                             │                                       │
 * │                             ▼                                       │
 * │                 StressRegulationState                               │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ⚠️ GARDE-FOUS ÉTHIQUES:
 * - Non-clinique, non-thérapeutique
 * - Propositions, jamais d'impositions
 * - Respect du refus utilisateur
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import type {
  StressRegulationState,
  StressRegulationConfig,
  StressLevel,
  StressTrend,
  InterventionType,
  InterventionResult,
  InterventionProtocol,
  InterventionHistoryEntry,
  TriggerConditions,
  TriggerEvaluation,
  InterventionSelectionContext,
  InterventionRecommendation,
} from '@/types/stressRegulation';

import {
  getDefaultStressRegulationState,
  getDefaultStressRegulationConfig,
  ALL_PROTOCOLS,
  STRESS_REGULATION_CONSTANTS,
} from '@/types/stressRegulation';

import type { MultimodalState } from '@/types/multimodalFusion';
import type { PredictiveState } from '@/types/predictiveState';
import type { BaselineFusionProfile } from '@/types/multimodalFusion';

// ============================================================================
// TYPES INTERNES
// ============================================================================

interface StateUpdateCallback {
  (state: StressRegulationState): void;
}

interface InterventionStartCallback {
  (protocol: InterventionProtocol): void;
}

// ============================================================================
// STRESS REGULATION ENGINE
// ============================================================================

/**
 * Moteur de régulation du stress singleton
 * Propose des micro-interventions adaptatives
 */
class StressRegulationEngine {
  private static instance: StressRegulationEngine | null = null;

  // Configuration
  private config: StressRegulationConfig;

  // État
  private state: StressRegulationState;
  private isRunning: boolean = false;

  // Callbacks
  private stateUpdateCallback: StateUpdateCallback | null = null;
  private interventionStartCallback: InterventionStartCallback | null = null;

  // Références externes
  private baseline: BaselineFusionProfile | null = null;

  // Compteur de refus consécutifs
  private consecutiveRejections: number = 0;

  // ═══════════════════════════════════════════════════════════════════════
  // SINGLETON
  // ═══════════════════════════════════════════════════════════════════════

  private constructor() {
    this.config = getDefaultStressRegulationConfig();
    this.state = getDefaultStressRegulationState();
  }

  public static getInstance(): StressRegulationEngine {
    if (!StressRegulationEngine.instance) {
      StressRegulationEngine.instance = new StressRegulationEngine();
    }
    return StressRegulationEngine.instance;
  }

  public static resetInstance(): void {
    if (StressRegulationEngine.instance) {
      StressRegulationEngine.instance.stop();
    }
    StressRegulationEngine.instance = null;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - CYCLE DE VIE
  // ═══════════════════════════════════════════════════════════════════════

  public start(): void {
    if (this.isRunning) {
      console.warn('[StressRegulationEngine] Déjà en cours d\'exécution');
      return;
    }

    console.log('[StressRegulationEngine] Démarrage...');
    this.isRunning = true;
  }

  public stop(): void {
    if (!this.isRunning) return;

    console.log('[StressRegulationEngine] Arrêt...');
    this.isRunning = false;
  }

  public reset(): void {
    this.state = getDefaultStressRegulationState();
    this.consecutiveRejections = 0;
    console.log('[StressRegulationEngine] État réinitialisé');
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════

  public setConfig(config: Partial<StressRegulationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public setBaseline(baseline: BaselineFusionProfile): void {
    this.baseline = baseline;
  }

  public setStateUpdateCallback(callback: StateUpdateCallback): void {
    this.stateUpdateCallback = callback;
  }

  public setInterventionStartCallback(callback: InterventionStartCallback): void {
    this.interventionStartCallback = callback;
  }

  public setAutoRegulationEnabled(enabled: boolean): void {
    this.state.autoRegulationEnabled = enabled;
    this.notifyStateUpdate();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - ÉVALUATION
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Évalue si une intervention devrait être déclenchée
   */
  public shouldTriggerIntervention(
    multimodalState: MultimodalState,
    predictiveState: PredictiveState,
    agendaLoad: number = 0.5,
    userDeclaredStress: boolean = false
  ): TriggerEvaluation {
    // Vérifier si auto-régulation activée
    if (!this.state.autoRegulationEnabled) {
      return {
        shouldTrigger: false,
        reason: 'Auto-régulation désactivée',
        priority: 'low',
        suggestedType: 'breath',
        conditions: this.buildEmptyConditions(),
      };
    }

    // Vérifier cooldown
    if (this.isCooldownActive()) {
      return {
        shouldTrigger: false,
        reason: 'Cooldown actif',
        priority: 'low',
        suggestedType: 'breath',
        conditions: this.buildEmptyConditions(),
      };
    }

    // Vérifier fréquence max
    if (this.hasReachedMaxFrequency()) {
      return {
        shouldTrigger: false,
        reason: 'Fréquence maximum atteinte',
        priority: 'low',
        suggestedType: 'breath',
        conditions: this.buildEmptyConditions(),
      };
    }

    // Vérifier refus consécutifs
    if (this.consecutiveRejections >= STRESS_REGULATION_CONSTANTS.MAX_REJECTIONS_BEFORE_DISABLE) {
      return {
        shouldTrigger: false,
        reason: 'Trop de refus consécutifs',
        priority: 'low',
        suggestedType: 'breath',
        conditions: this.buildEmptyConditions(),
      };
    }

    // Construire les conditions
    const conditions = this.buildTriggerConditions(
      multimodalState,
      predictiveState,
      agendaLoad,
      userDeclaredStress
    );

    // Évaluer les conditions
    return this.evaluateTriggerConditions(conditions);
  }

  /**
   * Sélectionne le type d'intervention approprié
   */
  public selectInterventionType(
    context?: Partial<InterventionSelectionContext>
  ): InterventionRecommendation {
    const fullContext: InterventionSelectionContext = {
      stressLevel: context?.stressLevel ?? this.state.currentLevel,
      stressTrend: context?.stressTrend ?? this.state.trend,
      hourOfDay: context?.hourOfDay ?? new Date().getHours(),
      agendaLoad: context?.agendaLoad ?? 0.5,
      recentRejections: context?.recentRejections ?? this.getRecentRejections(),
      weights: context?.weights ?? this.state.interventionWeights,
    };

    return this.computeInterventionRecommendation(fullContext);
  }

  /**
   * Obtient le protocole d'intervention
   */
  public getProtocol(type: InterventionType): InterventionProtocol {
    return ALL_PROTOCOLS[type];
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - EXÉCUTION
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Lance une intervention
   */
  public startIntervention(type: InterventionType): InterventionProtocol {
    const protocol = ALL_PROTOCOLS[type];
    const now = Date.now();

    // Mettre à jour l'état
    this.state.lastInterventionType = type;
    this.state.lastInterventionTimestamp = now;
    this.state.lastInterventionResult = 'unknown';
    this.state.totalInterventions++;

    // Activer le cooldown
    this.activateCooldown();

    // Notifier
    if (this.interventionStartCallback) {
      this.interventionStartCallback(protocol);
    }
    this.notifyStateUpdate();

    console.log(`[StressRegulationEngine] Intervention démarrée: ${type}`);

    return protocol;
  }

  /**
   * Enregistre le résultat d'une intervention
   */
  public recordInterventionResult(
    type: InterventionType,
    result: InterventionResult,
    tensionBefore: number,
    tensionAfter?: number
  ): void {
    const now = Date.now();

    // Créer l'entrée d'historique
    const entry: InterventionHistoryEntry = {
      timestamp: now,
      type,
      duration: ALL_PROTOCOLS[type].durationSeconds,
      completed: result !== 'rejected',
      perceivedEffect: result,
      tensionBefore,
      tensionAfter,
      context: {
        stressLevel: this.state.currentLevel,
        hourOfDay: new Date().getHours(),
        agendaLoad: 0.5, // TODO: obtenir de l'AgendaEngine
      },
    };

    // Ajouter à l'historique
    this.state.interventionHistory.push(entry);

    // Limiter la taille de l'historique
    if (this.state.interventionHistory.length > STRESS_REGULATION_CONSTANTS.MAX_HISTORY_SIZE) {
      this.state.interventionHistory = this.state.interventionHistory.slice(
        -STRESS_REGULATION_CONSTANTS.MAX_HISTORY_SIZE
      );
    }

    // Mettre à jour les statistiques
    this.state.lastInterventionResult = result;
    if (result === 'helpful') {
      this.state.helpfulInterventions++;
      this.consecutiveRejections = 0;
    } else if (result === 'rejected') {
      this.state.rejectedInterventions++;
      this.consecutiveRejections++;
    } else {
      this.consecutiveRejections = 0;
    }

    // Mettre à jour les poids
    this.updateInterventionWeights(type, result);

    // Notifier
    this.notifyStateUpdate();

    console.log(`[StressRegulationEngine] Résultat enregistré: ${type} → ${result}`);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - ÉTAT
  // ═══════════════════════════════════════════════════════════════════════

  public getState(): StressRegulationState {
    return { ...this.state };
  }

  /**
   * Met à jour le niveau de stress basé sur l'état multimodal
   */
  public updateStressLevel(multimodalState: MultimodalState, predictiveState: PredictiveState): void {
    const tension = multimodalState.fusedScores.correctedTension;

    // Déterminer le niveau
    let level: StressLevel = 'low';
    if (tension > 0.6) {
      level = 'high';
    } else if (tension > 0.35) {
      level = 'medium';
    }

    // Déterminer la tendance
    let trend: StressTrend = 'stable';
    if (predictiveState.tensionTrend === 'rising') {
      trend = 'rising';
    } else if (predictiveState.tensionTrend === 'falling') {
      trend = 'falling';
    }

    // Mettre à jour
    this.state.currentLevel = level;
    this.state.trend = trend;
    this.state.lastUpdate = Date.now();

    this.notifyStateUpdate();
  }

  /**
   * Génère un message de proposition d'intervention pour le Chat IA
   */
  public generateInterventionProposal(recommendation: InterventionRecommendation): string {
    const { type, reason: _reason } = recommendation;
    const protocol = ALL_PROTOCOLS[type];

    const parts: string[] = [];

    // Observation
    parts.push('Je perçois une montée de tension par rapport à ton niveau habituel.');

    // Prudence
    parts.push('Ce n\'est qu\'un indice basé sur ton corps, ta voix ou ton rythme, tu peux me corriger.');

    // Proposition
    const _interventionDesc = STRESS_REGULATION_CONSTANTS.INTERVENTION_LABELS[type];
    parts.push(`On peut prendre ${protocol.durationSeconds} secondes pour ${protocol.description.toLowerCase()}.`);

    // Choix
    parts.push('Qu\'est-ce que tu préfères ?');
    parts.push('(1) ' + STRESS_REGULATION_CONSTANTS.INTERVENTION_LABELS.breath);
    parts.push('(2) ' + STRESS_REGULATION_CONSTANTS.INTERVENTION_LABELS.pause);
    parts.push('(3) ' + STRESS_REGULATION_CONSTANTS.INTERVENTION_LABELS.focus);
    parts.push('(4) Continuer tel quel');

    return parts.join('\n');
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MÉTHODES PRIVÉES - CONDITIONS
  // ═══════════════════════════════════════════════════════════════════════

  private buildEmptyConditions(): TriggerConditions {
    return {
      tensionAboveBaseline: false,
      tensionRising: false,
      changeProbabilityHigh: false,
      requiresAttention: false,
      userDeclaredStress: false,
      agendaOverloaded: false,
    };
  }

  private buildTriggerConditions(
    multimodalState: MultimodalState,
    predictiveState: PredictiveState,
    agendaLoad: number,
    userDeclaredStress: boolean
  ): TriggerConditions {
    const tension = multimodalState.fusedScores.correctedTension;

    // Calculer le seuil baseline
    let baselineTension = 0.5;
    let baselineStd = 0.15;
    if (this.baseline) {
      baselineTension = this.baseline.globalTensionCurve.hourlyMeans[new Date().getHours()] ?? 0.5;
      baselineStd = this.baseline.globalTensionCurve.hourlyVariances[new Date().getHours()] ?? 0.15;
    }

    const threshold = baselineTension + baselineStd * this.config.tensionThresholdMultiplier;

    return {
      tensionAboveBaseline: tension > threshold,
      tensionRising: predictiveState.tensionTrend === 'rising',
      changeProbabilityHigh: predictiveState.changeProbability > this.config.changeProbabilityThreshold,
      requiresAttention: predictiveState.requiresAttention,
      userDeclaredStress,
      agendaOverloaded: agendaLoad > 0.8,
    };
  }

  private evaluateTriggerConditions(conditions: TriggerConditions): TriggerEvaluation {
    // Déclaration explicite de stress = toujours déclencher
    if (conditions.userDeclaredStress) {
      return {
        shouldTrigger: true,
        reason: 'Déclaration explicite de stress',
        priority: 'high',
        suggestedType: 'breath',
        conditions,
      };
    }

    // Attention requise par le Predictive Engine
    if (conditions.requiresAttention && conditions.tensionRising) {
      return {
        shouldTrigger: true,
        reason: 'Attention requise avec tension en hausse',
        priority: 'high',
        suggestedType: 'breath',
        conditions,
      };
    }

    // Tension au-dessus du baseline ET en hausse
    if (conditions.tensionAboveBaseline && conditions.tensionRising) {
      return {
        shouldTrigger: true,
        reason: 'Tension au-dessus de la baseline et en hausse',
        priority: 'medium',
        suggestedType: 'breath',
        conditions,
      };
    }

    // Probabilité de changement élevée avec tension haute
    if (conditions.changeProbabilityHigh && conditions.tensionAboveBaseline) {
      return {
        shouldTrigger: true,
        reason: 'Forte probabilité de changement avec tension élevée',
        priority: 'medium',
        suggestedType: 'pause',
        conditions,
      };
    }

    // Agenda surchargé avec tension en hausse
    if (conditions.agendaOverloaded && conditions.tensionRising) {
      return {
        shouldTrigger: true,
        reason: 'Agenda surchargé avec tension en hausse',
        priority: 'low',
        suggestedType: 'agenda',
        conditions,
      };
    }

    return {
      shouldTrigger: false,
      reason: 'Conditions non remplies',
      priority: 'low',
      suggestedType: 'breath',
      conditions,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MÉTHODES PRIVÉES - SÉLECTION
  // ═══════════════════════════════════════════════════════════════════════

  private computeInterventionRecommendation(
    context: InterventionSelectionContext
  ): InterventionRecommendation {
    const { stressLevel, weights, recentRejections } = context;

    // Filtrer les interventions activées et adaptées au niveau
    const candidates = this.config.enabledInterventions.filter(type => {
      const protocol = ALL_PROTOCOLS[type];
      return protocol.suitableFor.includes(stressLevel);
    });

    if (candidates.length === 0) {
      // Fallback: respiration toujours disponible
      return {
        type: 'breath',
        protocol: ALL_PROTOCOLS.breath,
        confidence: 0.5,
        reason: 'Respiration comme intervention par défaut',
        alternatives: [],
      };
    }

    // Calculer les scores pondérés
    const scores: { type: InterventionType; score: number }[] = candidates.map(type => {
      let score = weights[type];

      // Pénaliser les rejets récents
      if (recentRejections.includes(type)) {
        score *= 0.3;
      }

      // Bonus pour stress élevé → respiration/body
      if (stressLevel === 'high' && (type === 'breath' || type === 'body')) {
        score *= 1.3;
      }

      // Bonus pour stress moyen → pause/focus
      if (stressLevel === 'medium' && (type === 'pause' || type === 'focus')) {
        score *= 1.2;
      }

      return { type, score };
    });

    // Trier par score décroissant
    scores.sort((a, b) => b.score - a.score);

    const best = scores[0];
    const alternatives = scores.slice(1, 3).map(s => s.type);

    return {
      type: best.type,
      protocol: ALL_PROTOCOLS[best.type],
      confidence: Math.min(best.score, 1),
      reason: `Meilleure option basée sur le niveau de stress (${stressLevel}) et l'historique`,
      alternatives,
    };
  }

  private getRecentRejections(): InterventionType[] {
    const cutoff = Date.now() - 3600000; // 1 heure
    return this.state.interventionHistory
      .filter(h => h.timestamp > cutoff && h.perceivedEffect === 'rejected')
      .map(h => h.type);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MÉTHODES PRIVÉES - APPRENTISSAGE
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Met à jour les poids d'intervention basé sur le feedback
   */
  public updateInterventionWeights(type: InterventionType, result: InterventionResult): void {
    const { learningRate, minWeightValue, maxWeightValue } = this.config;
    let delta = 0;

    switch (result) {
      case 'helpful':
        delta = learningRate;
        break;
      case 'neutral':
        delta = 0;
        break;
      case 'rejected':
        delta = -learningRate * 2;
        break;
      default:
        delta = 0;
    }

    const newWeight = Math.max(
      minWeightValue,
      Math.min(maxWeightValue, this.state.interventionWeights[type] + delta)
    );

    this.state.interventionWeights[type] = newWeight;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MÉTHODES PRIVÉES - COOLDOWN
  // ═══════════════════════════════════════════════════════════════════════

  private isCooldownActive(): boolean {
    if (!this.state.cooldownActive || !this.state.cooldownEndsAt) {
      return false;
    }
    return Date.now() < this.state.cooldownEndsAt;
  }

  private activateCooldown(): void {
    this.state.cooldownActive = true;
    this.state.cooldownEndsAt = Date.now() + this.state.cooldownMs;
  }

  private hasReachedMaxFrequency(): boolean {
    const oneHourAgo = Date.now() - 3600000;
    const recentInterventions = this.state.interventionHistory.filter(
      h => h.timestamp > oneHourAgo
    ).length;
    return recentInterventions >= this.state.maxInterventionFrequency;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MÉTHODES PRIVÉES - NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════════════════

  private notifyStateUpdate(): void {
    if (this.stateUpdateCallback) {
      this.stateUpdateCallback({ ...this.state });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // UTILITAIRES PUBLICS
  // ═══════════════════════════════════════════════════════════════════════

  public getConfig(): StressRegulationConfig {
    return { ...this.config };
  }

  public getEffectiveWeight(type: InterventionType): number {
    return this.state.interventionWeights[type];
  }

  public getInterventionStats(): {
    total: number;
    helpful: number;
    rejected: number;
    effectivenessRate: number;
  } {
    const { totalInterventions, helpfulInterventions, rejectedInterventions } = this.state;
    const effectivenessRate = totalInterventions > 0 ? helpfulInterventions / totalInterventions : 0;

    return {
      total: totalInterventions,
      helpful: helpfulInterventions,
      rejected: rejectedInterventions,
      effectivenessRate,
    };
  }
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export { StressRegulationEngine };
export default StressRegulationEngine.getInstance();
