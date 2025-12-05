/**
 * TITANE∞ vΩ∞ — FLOW ENGINE
 * OPUS v∞.8: Focus & Flow Engine
 *
 * Ce moteur guide l'utilisateur vers et à travers l'état de flow :
 * - Évaluation des conditions de préparation au focus
 * - Facilitation de l'entrée en flow
 * - Maintien des conditions optimales
 * - Détection et correction des dérives
 * - Sortie gracieuse avec récupération
 *
 * Le flow est cet état où l'action et la conscience fusionnent,
 * où le temps s'écoule différemment, où la performance atteint son apogée.
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import type {
  FlowState,
  FlowEngineConfig,
  FlowZone,
  FlowPhase,
  FlowTransition,
  FlowConditions,
  FlowMetrics,
  FlowDriftIndicators,
  FlowDisruptor,
  FlowSuggestion,
  FlowHistoryEntry,
  FlowExitState,
  FocusReadiness,
  FocusReadinessResult,
  FlowEntryResult,
  FlowMaintenanceResult,
  FlowExitResult,
} from '@/types/flow';

import {
  getDefaultFlowState,
  getDefaultFlowEngineConfig,
  getDefaultFlowConditions,
  getDefaultFlowMetrics,
  getDefaultFlowDriftIndicators,
  FLOW_CONSTANTS,
} from '@/types/flow';

import type { MultimodalState } from '@/types/multimodalFusion';
import type { PredictiveState } from '@/types/predictiveState';
import type { HumanRhythmState } from '@/types/humanRhythm';
import type { StressRegulationState } from '@/types/stressRegulation';

// ============================================================================
// TYPES INTERNES
// ============================================================================

interface StateUpdateCallback {
  (state: FlowState): void;
}

interface FlowEventCallback {
  (event: 'entry' | 'exit' | 'drift' | 'peak', data: unknown): void;
}

// ============================================================================
// FLOW ENGINE
// ============================================================================

/**
 * Moteur de Flow singleton
 * Guide l'utilisateur vers et à travers l'état de flow
 */
class FlowEngine {
  private static instance: FlowEngine | null = null;

  // Configuration
  private config: FlowEngineConfig;

  // État
  private state: FlowState;
  private isRunning: boolean = false;

  // Callbacks
  private stateUpdateCallback: StateUpdateCallback | null = null;
  private flowEventCallback: FlowEventCallback | null = null;

  // Tracking interne
  private lastConditionsCheck: number = 0;
  private peakIntensityReached: number = 0;
  private consecutiveGoodConditions: number = 0;

  // ═══════════════════════════════════════════════════════════════════════
  // SINGLETON
  // ═══════════════════════════════════════════════════════════════════════

  private constructor() {
    this.config = getDefaultFlowEngineConfig();
    this.state = getDefaultFlowState();
  }

  public static getInstance(): FlowEngine {
    if (!FlowEngine.instance) {
      FlowEngine.instance = new FlowEngine();
    }
    return FlowEngine.instance;
  }

  public static resetInstance(): void {
    if (FlowEngine.instance) {
      FlowEngine.instance.stop();
    }
    FlowEngine.instance = null;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - CYCLE DE VIE
  // ═══════════════════════════════════════════════════════════════════════

  public start(): void {
    if (this.isRunning) {
      console.warn('[FlowEngine] Déjà en cours d\'exécution');
      return;
    }

    console.log('[FlowEngine] Démarrage...');
    this.isRunning = true;
    this.state.isActive = true;
  }

  public stop(): void {
    if (!this.isRunning) return;

    // Sortie du flow si nécessaire
    if (this.state.currentPhase === 'flow') {
      this.exitFlow('interrupted');
    }

    console.log('[FlowEngine] Arrêt...');
    this.isRunning = false;
    this.state.isActive = false;
  }

  public reset(): void {
    this.state = getDefaultFlowState();
    this.peakIntensityReached = 0;
    this.consecutiveGoodConditions = 0;
    console.log('[FlowEngine] État réinitialisé');
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════

  public setConfig(config: Partial<FlowEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public getConfig(): FlowEngineConfig {
    return { ...this.config };
  }

  public setStateUpdateCallback(callback: StateUpdateCallback): void {
    this.stateUpdateCallback = callback;
  }

  public setFlowEventCallback(callback: FlowEventCallback): void {
    this.flowEventCallback = callback;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - ÉVALUATION DE PRÉPARATION
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Évalue la préparation au focus/flow
   */
  public computeFocusReadiness(
    multimodalState: MultimodalState,
    rhythmState?: HumanRhythmState,
    stressState?: StressRegulationState,
    contextualFactors?: {
      hasDeadline?: boolean;
      taskComplexity?: number;
      interruptionRisk?: number;
    }
  ): FocusReadinessResult {
    // Évaluer les conditions
    const conditions = this.evaluateFlowConditions(
      multimodalState,
      rhythmState,
      stressState,
      contextualFactors
    );

    // Déterminer le niveau de préparation
    const readiness = this.determineReadinessLevel(conditions);

    // Identifier les bloqueurs
    const blockers = this.identifyBlockers(conditions);

    // Générer les recommandations
    const recommendations = this.generateReadinessRecommendations(
      conditions,
      blockers
    );

    // Estimer le temps pour être prêt
    const estimatedTimeToReady = this.estimateTimeToReady(conditions, blockers);

    // Mettre à jour l'état
    this.state.conditions = conditions;

    return {
      readiness,
      score: conditions.overallReadiness,
      conditions,
      blockers,
      recommendations,
      estimatedTimeToReady,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - ENTRÉE EN FLOW
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Tente d'initier l'entrée en flow
   */
  public enterFlow(
    multimodalState: MultimodalState,
    taskContext?: {
      taskType?: string;
      estimatedDuration?: number;
      challengeLevel?: number;
    }
  ): FlowEntryResult {
    const conditions = this.state.conditions;

    // Vérifier si les conditions sont suffisantes
    if (conditions.overallReadiness < this.config.flowEntryThreshold) {
      return {
        success: false,
        zone: this.determineCurrentZone(multimodalState),
        phase: 'preparation',
        initialIntensity: 0,
        reason: 'Conditions insuffisantes pour le flow',
        suggestions: this.generateEntryAssistance(conditions),
      };
    }

    // Vérifier si on n'est pas en récupération
    const timeSinceLastFlow = Date.now() - this.state.profile.lastFlowSession;
    if (
      this.state.profile.lastFlowSession > 0 &&
      timeSinceLastFlow < this.config.recoveryPeriod
    ) {
      const remainingRecovery = this.config.recoveryPeriod - timeSinceLastFlow;
      return {
        success: false,
        zone: 'control',
        phase: 'recovery',
        initialIntensity: 0,
        reason: `Période de récupération en cours (${Math.ceil(remainingRecovery / 60000)} min restantes)`,
        suggestions: [
          {
            type: 'break',
            description: 'Prenez une courte pause avant de retenter',
            priority: 1,
            estimatedImpact: 0.8,
          },
        ],
      };
    }

    // Initier l'entrée en flow
    const zone = this.determineCurrentZone(multimodalState);
    const initialIntensity = this.calculateInitialIntensity(conditions);

    // Transition vers la phase de préparation/lutte
    this.state.currentPhase = 'preparation';
    this.state.currentTransition = 'entering';
    this.state.flowStartTime = Date.now();
    this.state.currentZone = zone;
    this.peakIntensityReached = initialIntensity;

    // Mettre à jour les métriques
    this.state.metrics.flowIntensity = initialIntensity;
    this.state.metrics.flowDepth = 0.1;

    // Notifier
    this.notifyFlowEvent('entry', { zone, initialIntensity });
    this.notifyStateUpdate();

    return {
      success: true,
      zone,
      phase: 'preparation',
      initialIntensity,
      reason: 'Entrée en flow initiée',
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - MAINTIEN DU FLOW
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Met à jour et maintient le flow
   */
  public maintainFlow(
    multimodalState: MultimodalState,
    predictiveState?: PredictiveState,
    stressState?: StressRegulationState
  ): FlowMaintenanceResult {
    const now = Date.now();

    // Si pas en flow actif, retourner un état par défaut
    if (!this.state.flowStartTime || this.state.currentPhase === 'idle') {
      return {
        maintained: false,
        metrics: getDefaultFlowMetrics(),
        drift: getDefaultFlowDriftIndicators(),
        adjustments: [],
      };
    }

    // Calculer le temps dans le flow
    const timeInFlow = now - this.state.flowStartTime;

    // Mettre à jour les métriques
    const metrics = this.updateFlowMetrics(
      multimodalState,
      timeInFlow,
      predictiveState
    );

    // Détecter les dérives
    const drift = this.detectFlowDrift(
      multimodalState,
      metrics,
      stressState
    );

    // Progresser dans les phases si nécessaire
    this.updateFlowPhase(timeInFlow, metrics);

    // Générer les ajustements
    const adjustments = this.generateMaintenanceAdjustments(metrics, drift);

    // Vérifier si le flow est maintenu
    const maintained = this.isFlowMaintained(metrics, drift);

    // Vérifier la durée maximale
    if (timeInFlow > this.config.maxFlowDuration) {
      adjustments.unshift({
        type: 'break',
        description: 'Durée maximale atteinte, pause recommandée',
        priority: 1,
        estimatedImpact: 0.9,
      });
    }

    // Mettre à jour l'état
    this.state.metrics = metrics;
    this.state.driftIndicators = drift;
    this.state.lastUpdate = now;

    // Notifier sur les dérives critiques
    if (drift.urgencyLevel === 'critical') {
      this.notifyFlowEvent('drift', drift);
    }

    // Notifier sur les pics
    if (metrics.flowIntensity > this.peakIntensityReached) {
      this.peakIntensityReached = metrics.flowIntensity;
      this.notifyFlowEvent('peak', { intensity: metrics.flowIntensity });
    }

    this.notifyStateUpdate();

    return { maintained, metrics, drift, adjustments };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - DÉTECTION DE DÉRIVE
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Détecte les dérives du flow
   */
  public detectFlowDrift(
    multimodalState: MultimodalState,
    metrics?: FlowMetrics,
    stressState?: StressRegulationState
  ): FlowDriftIndicators {
    const currentMetrics = metrics || this.state.metrics;
    const indicators = getDefaultFlowDriftIndicators();

    // Collecter les perturbateurs
    const disruptors = this.detectDisruptors(
      multimodalState,
      currentMetrics,
      stressState
    );

    indicators.detectedDisruptors = disruptors;
    indicators.primaryDisruptor = disruptors[0] || 'none';

    // Déterminer le type de dérive
    if (disruptors.includes('anxiety_spike') || disruptors.includes('complexity_overflow')) {
      indicators.driftType = 'toward_anxiety';
    } else if (disruptors.includes('boredom_drift') || disruptors.includes('motivation_loss')) {
      indicators.driftType = 'toward_boredom';
    } else if (
      disruptors.includes('fatigue') ||
      disruptors.includes('external_interruption')
    ) {
      indicators.driftType = 'toward_exit';
    } else {
      indicators.driftType = 'none';
    }

    // Calculer la vitesse et probabilité de dérive
    if (indicators.driftType !== 'none') {
      const disruptorCount = disruptors.length;
      indicators.driftProbability = Math.min(1, disruptorCount * 0.3);
      indicators.driftSpeed =
        disruptorCount >= 3 ? 'fast' : disruptorCount >= 2 ? 'moderate' : 'slow';
    }

    // Déterminer l'urgence
    if (indicators.driftProbability > 0.7) {
      indicators.urgencyLevel = 'critical';
    } else if (indicators.driftProbability > 0.5) {
      indicators.urgencyLevel = 'high';
    } else if (indicators.driftProbability > 0.3) {
      indicators.urgencyLevel = 'medium';
    }

    // Générer les suggestions
    indicators.suggestedActions = this.generateDriftCorrections(indicators);

    return indicators;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - SORTIE DU FLOW
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Sort du flow de manière contrôlée
   */
  public exitFlow(
    exitType: FlowExitState['exitType'] = 'graceful'
  ): FlowExitResult {
    const now = Date.now();
    const flowDuration = this.state.flowStartTime
      ? now - this.state.flowStartTime
      : 0;

    // Créer l'état de sortie
    const exitState: FlowExitState = {
      exitType,
      totalFlowTime: flowDuration,
      peakIntensity: this.peakIntensityReached,
      accomplishmentSense: this.calculateAccomplishmentSense(exitType, flowDuration),
      recoveryNeeded: this.determineRecoveryNeeded(flowDuration, exitType),
      nextFlowEstimate: this.estimateNextFlowTime(flowDuration, exitType),
    };

    // Enregistrer dans l'historique
    const historyEntry: FlowHistoryEntry = {
      timestamp: now,
      zone: this.state.currentZone,
      phase: 'flow',
      intensity: this.peakIntensityReached,
      depth: this.state.metrics.flowDepth,
      duration: flowDuration,
      conditions: { ...this.state.conditions },
      exitState,
    };

    this.state.profile.history.push(historyEntry);
    this.state.profile.totalFlowSessions++;
    this.state.profile.totalFlowTime += flowDuration;
    this.state.profile.lastFlowSession = now;

    // Mettre à jour le record
    if (flowDuration > this.state.profile.longestFlowStreak) {
      this.state.profile.longestFlowStreak = flowDuration;
    }

    // Réinitialiser l'état de flow
    this.state.currentPhase = 'recovery';
    this.state.currentTransition = 'exiting';
    this.state.flowStartTime = null;
    this.state.metrics = getDefaultFlowMetrics();
    this.peakIntensityReached = 0;

    // Générer le résumé
    const summary = this.generateFlowSummary(exitState);
    const nextSteps = this.generatePostFlowSuggestions(exitState);

    // Notifier
    this.notifyFlowEvent('exit', exitState);
    this.notifyStateUpdate();

    return { exitState, summary, nextSteps };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - TRAITEMENT COMPLET
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Processus complet de mise à jour du flow
   */
  public process(
    multimodalState: MultimodalState,
    predictiveState?: PredictiveState,
    rhythmState?: HumanRhythmState,
    stressState?: StressRegulationState
  ): {
    readiness: FocusReadinessResult;
    maintenance?: FlowMaintenanceResult;
    shouldExit: boolean;
    phase: FlowPhase;
  } {
    // Évaluer la préparation
    const readiness = this.computeFocusReadiness(
      multimodalState,
      rhythmState,
      stressState
    );

    let maintenance: FlowMaintenanceResult | undefined;
    let shouldExit = false;

    // Si en flow, maintenir
    if (this.state.currentPhase === 'flow' || this.state.currentPhase === 'preparation') {
      maintenance = this.maintainFlow(multimodalState, predictiveState, stressState);

      // Vérifier si on doit sortir
      if (!maintenance.maintained && maintenance.drift.urgencyLevel === 'critical') {
        shouldExit = true;
      }
    }

    return {
      readiness,
      maintenance,
      shouldExit,
      phase: this.state.currentPhase,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - ÉTAT
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Obtient l'état complet (lecture seule)
   */
  public getState(): FlowState {
    return { ...this.state };
  }

  /**
   * Vérifie si l'utilisateur est en flow
   */
  public isInFlow(): boolean {
    return this.state.currentPhase === 'flow';
  }

  /**
   * Obtient la zone actuelle
   */
  public getCurrentZone(): FlowZone {
    return this.state.currentZone;
  }

  /**
   * Génère un résumé de l'état de flow
   */
  public generateStateSummary(): string {
    const lines: string[] = [];

    lines.push(`Zone: ${FLOW_CONSTANTS.ZONE_LABELS[this.state.currentZone]}`);
    lines.push(`Phase: ${FLOW_CONSTANTS.PHASE_LABELS[this.state.currentPhase]}`);

    if (this.state.currentPhase === 'flow') {
      lines.push(`Intensité: ${(this.state.metrics.flowIntensity * 100).toFixed(0)}%`);
      lines.push(`Profondeur: ${(this.state.metrics.flowDepth * 100).toFixed(0)}%`);
      lines.push(`Durée: ${Math.floor(this.state.metrics.timeInFlow / 60000)} min`);
    } else {
      lines.push(`Préparation: ${(this.state.conditions.overallReadiness * 100).toFixed(0)}%`);
    }

    return lines.join('\n');
  }

  // ═══════════════════════════════════════════════════════════════════════
  // LOGIQUE INTERNE - ÉVALUATION DES CONDITIONS
  // ═══════════════════════════════════════════════════════════════════════

  private evaluateFlowConditions(
    multimodalState: MultimodalState,
    rhythmState?: HumanRhythmState,
    stressState?: StressRegulationState,
    contextualFactors?: {
      hasDeadline?: boolean;
      taskComplexity?: number;
      interruptionRisk?: number;
    }
  ): FlowConditions {
    const conditions = getDefaultFlowConditions();

    // Extraire les métriques multimodales
    const energy = multimodalState.fusedScores?.globalEnergy?.value ?? 0.5;
    const tension = multimodalState.fusedScores?.globalTension?.value ?? 0.5;
    const engagement = multimodalState.fusedScores?.globalEngagement?.value ?? 0.5;

    // Énergie → plusieurs conditions
    conditions.energyLevel = energy;
    conditions.confidenceLevel = Math.max(0.3, energy - tension * 0.3);

    // Engagement → feedback et motivation
    conditions.immediateFeedback = engagement;
    conditions.intrinsicMotivation = engagement;

    // Tension → contrôle (inverse)
    conditions.senseOfControl = Math.max(0, 1 - tension);

    // Stress
    if (stressState) {
      const stressImpact = stressState.currentLevel === 'high' ? 0.5 :
                          stressState.currentLevel === 'medium' ? 0.25 : 0;
      conditions.distractionLevel = Math.min(1, conditions.distractionLevel + stressImpact);
      conditions.senseOfControl = Math.max(0, conditions.senseOfControl - stressImpact);
    }

    // Rythme circadien
    if (rhythmState) {
      // Ajuster selon le moment optimal de la journée
      const hour = new Date().getHours();
      const isOptimalTime = this.state.profile.bestPerformanceWindows.some(
        w => hour >= w.start && hour <= w.end
      );
      if (isOptimalTime) {
        conditions.energyLevel = Math.min(1, conditions.energyLevel + 0.1);
        conditions.intrinsicMotivation = Math.min(1, conditions.intrinsicMotivation + 0.1);
      }
    }

    // Facteurs contextuels
    if (contextualFactors) {
      if (contextualFactors.hasDeadline) {
        conditions.clearGoals = Math.min(1, conditions.clearGoals + 0.2);
      }
      if (contextualFactors.taskComplexity !== undefined) {
        conditions.challengeSkillBalance = 1 - Math.abs(contextualFactors.taskComplexity - 0.6);
      }
      if (contextualFactors.interruptionRisk !== undefined) {
        conditions.distractionLevel = contextualFactors.interruptionRisk;
      }
    }

    // Temps disponible (estimation basée sur le moment)
    const hourOfDay = new Date().getHours();
    conditions.timeAvailable = hourOfDay < 18 ? 0.7 : 0.4;

    // Calculer le score global
    conditions.overallReadiness = this.calculateOverallReadiness(conditions);

    return conditions;
  }

  private calculateOverallReadiness(conditions: FlowConditions): number {
    // Pondération des conditions
    const weights = {
      clearGoals: 0.12,
      immediateFeedback: 0.10,
      challengeSkillBalance: 0.15,
      distractionLevel: 0.15, // Inverse
      timeAvailable: 0.08,
      energyLevel: 0.12,
      senseOfControl: 0.10,
      intrinsicMotivation: 0.10,
      confidenceLevel: 0.08,
    };

    let score = 0;
    score += conditions.clearGoals * weights.clearGoals;
    score += conditions.immediateFeedback * weights.immediateFeedback;
    score += conditions.challengeSkillBalance * weights.challengeSkillBalance;
    score += (1 - conditions.distractionLevel) * weights.distractionLevel;
    score += conditions.timeAvailable * weights.timeAvailable;
    score += conditions.energyLevel * weights.energyLevel;
    score += conditions.senseOfControl * weights.senseOfControl;
    score += conditions.intrinsicMotivation * weights.intrinsicMotivation;
    score += conditions.confidenceLevel * weights.confidenceLevel;

    return Math.max(0, Math.min(1, score));
  }

  private determineReadinessLevel(conditions: FlowConditions): FocusReadiness {
    const score = conditions.overallReadiness;

    if (score >= FLOW_CONSTANTS.CONDITION_THRESHOLDS.excellent) return 'optimal';
    if (score >= FLOW_CONSTANTS.CONDITION_THRESHOLDS.good) return 'good';
    if (score >= FLOW_CONSTANTS.CONDITION_THRESHOLDS.moderate) return 'moderate';
    if (score >= FLOW_CONSTANTS.CONDITION_THRESHOLDS.poor) return 'poor';
    return 'blocked';
  }

  private identifyBlockers(conditions: FlowConditions): string[] {
    const blockers: string[] = [];
    const threshold = FLOW_CONSTANTS.CONDITION_THRESHOLDS.poor;

    if (conditions.energyLevel < threshold) {
      blockers.push('Niveau d\'énergie insuffisant');
    }
    if (conditions.distractionLevel > 1 - threshold) {
      blockers.push('Niveau de distraction trop élevé');
    }
    if (conditions.senseOfControl < threshold) {
      blockers.push('Sentiment de contrôle faible');
    }
    if (conditions.clearGoals < threshold) {
      blockers.push('Objectifs peu clairs');
    }
    if (conditions.challengeSkillBalance < threshold) {
      blockers.push('Déséquilibre défi/compétences');
    }

    return blockers;
  }

  private generateReadinessRecommendations(
    conditions: FlowConditions,
    blockers: string[]
  ): FlowSuggestion[] {
    const suggestions: FlowSuggestion[] = [];

    if (conditions.energyLevel < 0.4) {
      suggestions.push({
        type: 'energy_boost',
        description: 'Prenez une pause active de 5 minutes',
        priority: 0.9,
        estimatedImpact: 0.3,
      });
    }

    if (conditions.distractionLevel > 0.6) {
      suggestions.push({
        type: 'environment',
        description: 'Réduisez les distractions (notifications, espace calme)',
        priority: 0.8,
        estimatedImpact: 0.4,
      });
    }

    if (conditions.clearGoals < 0.5) {
      suggestions.push({
        type: 'goal_clarification',
        description: 'Définissez un objectif clair pour la prochaine heure',
        priority: 0.85,
        estimatedImpact: 0.35,
      });
    }

    if (conditions.challengeSkillBalance < 0.5) {
      suggestions.push({
        type: 'challenge_adjustment',
        description: 'Ajustez la difficulté de la tâche',
        priority: 0.7,
        estimatedImpact: 0.25,
      });
    }

    // Trier par priorité
    return suggestions.sort((a, b) => b.priority - a.priority);
  }

  private estimateTimeToReady(conditions: FlowConditions, blockers: string[]): number {
    if (blockers.length === 0) return 0;

    // Estimation basique : 5 min par bloqueur
    const baseTime = blockers.length * 5 * 60 * 1000;

    // Ajuster selon le score
    const adjustment = (1 - conditions.overallReadiness) * 10 * 60 * 1000;

    return Math.min(baseTime + adjustment, 30 * 60 * 1000); // Max 30 min
  }

  // ═══════════════════════════════════════════════════════════════════════
  // LOGIQUE INTERNE - ZONE ET PHASE
  // ═══════════════════════════════════════════════════════════════════════

  private determineCurrentZone(multimodalState: MultimodalState): FlowZone {
    const challenge = this.state.conditions.challengeSkillBalance;
    const skill = this.state.conditions.confidenceLevel;
    const thresholds = FLOW_CONSTANTS.ZONE_THRESHOLDS;

    // Logique simplifiée basée sur le modèle de Csikszentmihalyi
    if (challenge >= thresholds.flow.challengeMin &&
        challenge <= thresholds.flow.challengeMax &&
        skill >= thresholds.flow.skillMin) {
      return 'flow';
    }

    if (challenge >= thresholds.anxiety.challengeMin && skill <= thresholds.anxiety.skillMax) {
      return 'anxiety';
    }

    if (challenge <= thresholds.boredom.challengeMax && skill >= thresholds.boredom.skillMin) {
      return 'boredom';
    }

    if (challenge <= thresholds.apathy.challengeMax && skill <= thresholds.apathy.skillMax) {
      return 'apathy';
    }

    // Zones intermédiaires
    if (skill > challenge) {
      return skill > 0.7 ? 'control' : 'relaxation';
    }

    return challenge > skill ? 'arousal' : 'worry';
  }

  private updateFlowPhase(timeInFlow: number, metrics: FlowMetrics): void {
    const phases = FLOW_CONSTANTS.PHASE_DURATIONS;

    if (this.state.currentPhase === 'idle') return;

    // Progression naturelle des phases
    if (this.state.currentPhase === 'preparation' && timeInFlow > phases.preparation) {
      this.state.currentPhase = 'struggle';
      this.state.currentTransition = 'entering';
    } else if (this.state.currentPhase === 'struggle' && timeInFlow > phases.preparation + phases.struggle) {
      if (metrics.flowIntensity > 0.5) {
        this.state.currentPhase = 'release';
        this.state.currentTransition = 'entering';
      }
    } else if (this.state.currentPhase === 'release' && metrics.flowIntensity > 0.6) {
      this.state.currentPhase = 'flow';
      this.state.currentTransition = 'deepening';
    } else if (this.state.currentPhase === 'flow') {
      if (metrics.intensityTrend === 'falling' && metrics.flowIntensity < 0.4) {
        this.state.currentTransition = 'surfacing';
      } else if (metrics.flowIntensity > 0.7) {
        this.state.currentTransition = 'deepening';
      } else {
        this.state.currentTransition = 'maintaining';
      }
    }

    this.state.currentZone = metrics.flowIntensity > 0.5 ? 'flow' :
                             metrics.flowIntensity > 0.3 ? 'arousal' : 'control';
  }

  // ═══════════════════════════════════════════════════════════════════════
  // LOGIQUE INTERNE - MÉTRIQUES
  // ═══════════════════════════════════════════════════════════════════════

  private calculateInitialIntensity(conditions: FlowConditions): number {
    // L'intensité initiale dépend des conditions
    return Math.min(0.4, conditions.overallReadiness * 0.5);
  }

  private updateFlowMetrics(
    multimodalState: MultimodalState,
    timeInFlow: number,
    predictiveState?: PredictiveState
  ): FlowMetrics {
    const metrics = { ...this.state.metrics };
    const prevIntensity = metrics.flowIntensity;

    // Extraire les données multimodales
    const energy = multimodalState.fusedScores?.globalEnergy?.value ?? 0.5;
    const engagement = multimodalState.fusedScores?.globalEngagement?.value ?? 0.5;
    const tension = multimodalState.fusedScores?.globalTension?.value ?? 0.5;

    // Calculer l'intensité
    const baseIntensity = (energy * 0.3 + engagement * 0.4 + (1 - tension) * 0.3);
    metrics.flowIntensity = baseIntensity * 0.3 + prevIntensity * 0.7; // Lissage

    // Calculer la profondeur (augmente avec le temps)
    const timeFactor = Math.min(1, timeInFlow / (45 * 60 * 1000)); // Plateau à 45 min
    metrics.flowDepth = Math.min(1, metrics.flowIntensity * (0.5 + timeFactor * 0.5));

    // Immersion
    metrics.immersionLevel = (metrics.flowIntensity + metrics.flowDepth) / 2;

    // Temporel
    metrics.timeInFlow = timeInFlow;
    if (metrics.flowIntensity > this.peakIntensityReached) {
      metrics.timeSinceLastPeak = 0;
    } else {
      metrics.timeSinceLastPeak += this.config.updateIntervalMs;
    }

    // Estimation du temps restant
    const avgDuration = this.state.profile.averageFlowDuration;
    metrics.estimatedTimeRemaining = Math.max(0, avgDuration - timeInFlow);

    // Qualité et stabilité
    metrics.qualityScore = metrics.flowIntensity * (1 - tension * 0.5);
    metrics.stabilityScore = 1 - Math.abs(metrics.flowIntensity - prevIntensity) * 5;

    // Productivité
    metrics.productivityEstimate = metrics.qualityScore * metrics.immersionLevel;

    // Tendances
    const intensityDiff = metrics.flowIntensity - prevIntensity;
    metrics.intensityTrend = intensityDiff > 0.02 ? 'rising' :
                            intensityDiff < -0.02 ? 'falling' : 'stable';

    const depthDiff = metrics.flowDepth - this.state.metrics.flowDepth;
    metrics.depthTrend = depthDiff > 0.01 ? 'deepening' :
                        depthDiff < -0.01 ? 'surfacing' : 'stable';

    return metrics;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // LOGIQUE INTERNE - DÉTECTION DES PERTURBATEURS
  // ═══════════════════════════════════════════════════════════════════════

  private detectDisruptors(
    multimodalState: MultimodalState,
    metrics: FlowMetrics,
    stressState?: StressRegulationState
  ): FlowDisruptor[] {
    const disruptors: FlowDisruptor[] = [];

    const tension = multimodalState.fusedScores?.globalTension?.value ?? 0.5;
    const energy = multimodalState.fusedScores?.globalEnergy?.value ?? 0.5;
    const engagement = multimodalState.fusedScores?.globalEngagement?.value ?? 0.5;

    // Fatigue
    if (energy < 0.3) {
      disruptors.push('fatigue');
    }

    // Pic d'anxiété
    if (tension > 0.7) {
      disruptors.push('anxiety_spike');
    }

    // Ennui
    if (engagement < 0.3 && tension < 0.3) {
      disruptors.push('boredom_drift');
    }

    // Perte de motivation
    if (metrics.intensityTrend === 'falling' && metrics.timeSinceLastPeak > 10 * 60 * 1000) {
      disruptors.push('motivation_loss');
    }

    // Stress
    if (stressState?.currentLevel === 'high') {
      disruptors.push('anxiety_spike');
    }

    // Surcharge de complexité
    if (tension > 0.6 && this.state.conditions.challengeSkillBalance < 0.4) {
      disruptors.push('complexity_overflow');
    }

    return [...new Set(disruptors)]; // Dédupliquer
  }

  private isFlowMaintained(metrics: FlowMetrics, drift: FlowDriftIndicators): boolean {
    // Le flow est maintenu si :
    // 1. L'intensité est au-dessus du seuil
    // 2. La dérive n'est pas critique
    return (
      metrics.flowIntensity >= this.config.flowExitThreshold &&
      drift.urgencyLevel !== 'critical'
    );
  }

  private generateMaintenanceAdjustments(
    metrics: FlowMetrics,
    drift: FlowDriftIndicators
  ): FlowSuggestion[] {
    const suggestions: FlowSuggestion[] = [];

    // Ajustements basés sur la dérive
    if (drift.driftType === 'toward_anxiety') {
      suggestions.push({
        type: 'challenge_adjustment',
        description: 'Simplifiez légèrement la tâche en cours',
        priority: 0.8,
        estimatedImpact: 0.4,
      });
    } else if (drift.driftType === 'toward_boredom') {
      suggestions.push({
        type: 'challenge_adjustment',
        description: 'Augmentez le niveau de défi',
        priority: 0.7,
        estimatedImpact: 0.35,
      });
    }

    // Ajustements basés sur les métriques
    if (metrics.stabilityScore < 0.5) {
      suggestions.push({
        type: 'environment',
        description: 'Stabilisez votre environnement',
        priority: 0.6,
        estimatedImpact: 0.25,
      });
    }

    return suggestions;
  }

  private generateDriftCorrections(drift: FlowDriftIndicators): FlowSuggestion[] {
    const suggestions: FlowSuggestion[] = [];

    for (const disruptor of drift.detectedDisruptors.slice(0, 3)) {
      switch (disruptor) {
        case 'fatigue':
          suggestions.push({
            type: 'break',
            description: 'Pause de 5 minutes recommandée',
            priority: 0.9,
            estimatedImpact: 0.5,
          });
          break;
        case 'anxiety_spike':
          suggestions.push({
            type: 'challenge_adjustment',
            description: 'Réduisez la complexité de la tâche',
            priority: 0.85,
            estimatedImpact: 0.4,
          });
          break;
        case 'boredom_drift':
          suggestions.push({
            type: 'challenge_adjustment',
            description: 'Ajoutez un élément de défi',
            priority: 0.7,
            estimatedImpact: 0.35,
          });
          break;
        case 'motivation_loss':
          suggestions.push({
            type: 'goal_clarification',
            description: 'Reconnectez-vous à votre objectif',
            priority: 0.75,
            estimatedImpact: 0.3,
          });
          break;
      }
    }

    return suggestions.sort((a, b) => b.priority - a.priority);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // LOGIQUE INTERNE - ENTRÉE EN FLOW
  // ═══════════════════════════════════════════════════════════════════════

  private generateEntryAssistance(conditions: FlowConditions): FlowSuggestion[] {
    return this.generateReadinessRecommendations(
      conditions,
      this.identifyBlockers(conditions)
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // LOGIQUE INTERNE - SORTIE DU FLOW
  // ═══════════════════════════════════════════════════════════════════════

  private calculateAccomplishmentSense(
    exitType: FlowExitState['exitType'],
    duration: number
  ): number {
    let base = 0.5;

    // Type de sortie
    if (exitType === 'graceful') base += 0.2;
    else if (exitType === 'exhausted') base += 0.1;
    else if (exitType === 'interrupted') base -= 0.2;
    else if (exitType === 'distracted') base -= 0.1;

    // Durée
    if (duration > 30 * 60 * 1000) base += 0.1;
    if (duration > 45 * 60 * 1000) base += 0.1;

    return Math.max(0, Math.min(1, base));
  }

  private determineRecoveryNeeded(
    duration: number,
    exitType: FlowExitState['exitType']
  ): FlowExitState['recoveryNeeded'] {
    if (exitType === 'exhausted' || duration > 60 * 60 * 1000) {
      return 'significant';
    }
    if (duration > 30 * 60 * 1000 || exitType === 'interrupted') {
      return 'moderate';
    }
    return 'minimal';
  }

  private estimateNextFlowTime(
    duration: number,
    exitType: FlowExitState['exitType']
  ): number {
    const baseRecovery = this.config.recoveryPeriod;

    if (exitType === 'exhausted') {
      return baseRecovery * 2;
    }
    if (duration > 60 * 60 * 1000) {
      return baseRecovery * 1.5;
    }
    return baseRecovery;
  }

  private generateFlowSummary(exitState: FlowExitState): string {
    const minutes = Math.floor(exitState.totalFlowTime / 60000);
    const exitLabel = {
      graceful: 'sortie maîtrisée',
      interrupted: 'interrompu',
      exhausted: 'épuisé',
      distracted: 'distrait',
    }[exitState.exitType];

    return `Session de flow de ${minutes} minutes (${exitLabel}). ` +
           `Intensité maximale: ${(exitState.peakIntensity * 100).toFixed(0)}%. ` +
           `Récupération ${exitState.recoveryNeeded === 'minimal' ? 'légère' :
                          exitState.recoveryNeeded === 'moderate' ? 'modérée' : 'importante'} recommandée.`;
  }

  private generatePostFlowSuggestions(exitState: FlowExitState): FlowSuggestion[] {
    const suggestions: FlowSuggestion[] = [];

    if (exitState.recoveryNeeded !== 'minimal') {
      suggestions.push({
        type: 'break',
        description: `Pause de ${exitState.recoveryNeeded === 'significant' ? 15 : 10} minutes recommandée`,
        priority: 0.9,
        estimatedImpact: 0.5,
      });
    }

    if (exitState.accomplishmentSense > 0.6) {
      suggestions.push({
        type: 'goal_clarification',
        description: 'Notez vos accomplissements',
        priority: 0.6,
        estimatedImpact: 0.3,
      });
    }

    return suggestions;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // LOGIQUE INTERNE - NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════════════════

  private notifyStateUpdate(): void {
    if (this.stateUpdateCallback) {
      this.stateUpdateCallback({ ...this.state });
    }
  }

  private notifyFlowEvent(event: 'entry' | 'exit' | 'drift' | 'peak', data: unknown): void {
    if (this.flowEventCallback) {
      this.flowEventCallback(event, data);
    }
    console.log(`[FlowEngine] Événement: ${event}`, data);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { FlowEngine };
export default FlowEngine.getInstance();
