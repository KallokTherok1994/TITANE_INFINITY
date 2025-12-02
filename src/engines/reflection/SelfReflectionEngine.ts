/**
 * TITANE∞ vΩ∞ — SELF-REFLECTION ENGINE
 * OPUS v∞.10: Méta-analyse interne et auto-correction
 *
 * Ce moteur observe le système TITANE∞ lui-même :
 * - Évalue la qualité des réponses
 * - Détecte les incohérences
 * - Applique des auto-corrections
 * - Maintient la stabilité comportementale
 *
 * Ce n'est pas une conscience.
 * C'est un système analytique technique pour la cohérence.
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import type {
  SelfReflectionState,
  SelfReflectionEngineConfig,
  SelfReflectionProfile,
  MetaScores,
  ResponseEvaluation,
  DetectedIncoherence,
  InternalAdjustment,
  ReflectionHistoryEntry,
  EvaluationInput,
  EvaluationOutput,
  SeverityLevel,
  EvaluationStatus,
} from '@/types/selfReflection';

import {
  getDefaultSelfReflectionState,
  getDefaultSelfReflectionEngineConfig,
  getDefaultSelfReflectionProfile,
  getDefaultMetaScores,
  SELF_REFLECTION_CONSTANTS,
} from '@/types/selfReflection';

// ============================================================================
// TYPES INTERNES
// ============================================================================

interface StateUpdateCallback {
  (state: SelfReflectionState): void;
}

interface AdjustmentCallback {
  (adjustments: InternalAdjustment[]): void;
}

// ============================================================================
// SELF-REFLECTION ENGINE
// ============================================================================

/**
 * Moteur de self-réflexion singleton
 * Observe, évalue et ajuste le comportement du système
 */
class SelfReflectionEngine {
  private static instance: SelfReflectionEngine | null = null;

  // Configuration
  private config: SelfReflectionEngineConfig;

  // État
  private state: SelfReflectionState;
  private isRunning: boolean = false;

  // Callbacks
  private stateUpdateCallback: StateUpdateCallback | null = null;
  private adjustmentCallback: AdjustmentCallback | null = null;

  // Buffer de réponses récentes pour analyse
  private responseBuffer: Array<{
    response: string;
    evaluation?: ResponseEvaluation;
    timestamp: number;
  }> = [];
  private readonly MAX_RESPONSE_BUFFER = 10;

  // ═══════════════════════════════════════════════════════════════════════
  // SINGLETON
  // ═══════════════════════════════════════════════════════════════════════

  private constructor() {
    this.config = getDefaultSelfReflectionEngineConfig();
    this.state = getDefaultSelfReflectionState();
  }

  public static getInstance(): SelfReflectionEngine {
    if (!SelfReflectionEngine.instance) {
      SelfReflectionEngine.instance = new SelfReflectionEngine();
    }
    return SelfReflectionEngine.instance;
  }

  public static resetInstance(): void {
    if (SelfReflectionEngine.instance) {
      SelfReflectionEngine.instance.stop();
      SelfReflectionEngine.instance = null;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ═══════════════════════════════════════════════════════════════════════

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.state.isActive = true;
    this.state.lastUpdate = Date.now();
    this.notifyStateUpdate();
  }

  public stop(): void {
    if (!this.isRunning) return;
    this.isRunning = false;
    this.state.isActive = false;
    this.state.lastUpdate = Date.now();
    this.notifyStateUpdate();
  }

  public reset(): void {
    this.state = getDefaultSelfReflectionState();
    this.responseBuffer = [];
    this.notifyStateUpdate();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════

  public getConfig(): SelfReflectionEngineConfig {
    return { ...this.config };
  }

  public updateConfig(partial: Partial<SelfReflectionEngineConfig>): void {
    this.config = { ...this.config, ...partial };
  }

  public getState(): SelfReflectionState {
    return { ...this.state };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // CALLBACKS
  // ═══════════════════════════════════════════════════════════════════════

  public onStateUpdate(callback: StateUpdateCallback): () => void {
    this.stateUpdateCallback = callback;
    return () => {
      this.stateUpdateCallback = null;
    };
  }

  public onAdjustment(callback: AdjustmentCallback): () => void {
    this.adjustmentCallback = callback;
    return () => {
      this.adjustmentCallback = null;
    };
  }

  private notifyStateUpdate(): void {
    if (this.stateUpdateCallback) {
      this.stateUpdateCallback(this.getState());
    }
  }

  private notifyAdjustments(adjustments: InternalAdjustment[]): void {
    if (this.adjustmentCallback && adjustments.length > 0) {
      this.adjustmentCallback(adjustments);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - ÉVALUATION DE RÉPONSE
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Évalue la qualité d'une réponse
   */
  public evaluateResponseQuality(input: EvaluationInput): EvaluationOutput {
    const responseId = input.responseId || `resp_${Date.now()}`;
    const now = Date.now();

    // Calculer les scores méta
    const scores = this.computeMetaScores(input);

    // Détecter les incohérences
    const incoherences = this.detectIncoherences(input, scores);

    // Générer les ajustements recommandés
    const allAdjustments = this.computeInternalAdjustments(incoherences, scores, input);

    // Séparer les ajustements immédiats et différés
    const immediateAdjustments = allAdjustments.filter(a => a.priority >= 7);
    const deferredAdjustments = allAdjustments.filter(a => a.priority < 7);

    // Déterminer le statut
    const status = this.determineEvaluationStatus(scores);

    // Créer l'évaluation
    const evaluation: ResponseEvaluation = {
      responseId,
      evaluatedAt: now,
      scores,
      status,
      incoherences,
      recommendedAdjustments: allAdjustments,
      context: {
        multimodalTension: input.multimodalState?.tension ?? 0.5,
        multimodalEnergy: input.multimodalState?.energy ?? 0.5,
        flowActive: input.flowState?.isActive ?? false,
        flowIntensity: input.flowState?.intensity ?? 0,
        presenceStyle: input.presenceState?.style ?? 'neutral',
        resonanceMode: input.resonanceState?.mode ?? 'neutral',
      },
      originalResponseLength: input.response.length,
      summary: this.generateEvaluationSummary(scores, incoherences),
    };

    // Mettre à jour l'état
    this.state.lastEvaluation = evaluation;
    this.state.activeAdjustments = immediateAdjustments;
    this.state.lastUpdate = now;

    // Ajouter à l'historique
    this.addToHistory(evaluation, immediateAdjustments);

    // Mettre à jour le profil
    this.updateProfile(evaluation);

    // Ajouter au buffer
    this.addToResponseBuffer(input.response, evaluation);

    // Notifier
    this.notifyStateUpdate();
    this.notifyAdjustments(immediateAdjustments);

    // Déterminer la recommandation d'action
    const actionRecommendation = this.determineActionRecommendation(scores, incoherences);

    return {
      evaluation,
      immediateAdjustments,
      deferredAdjustments,
      executiveSummary: evaluation.summary,
      actionRecommendation,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - CALCUL DES SCORES MÉTA
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Calcule les scores méta-analytiques
   */
  public computeMetaScores(input: EvaluationInput): MetaScores {
    const response = input.response;
    const scores = getDefaultMetaScores();

    // ─────────────────────────────────────────────────────────────────
    // 1. Score de cohérence
    // ─────────────────────────────────────────────────────────────────
    scores.coherenceScore = this.evaluateCoherence(response);

    // ─────────────────────────────────────────────────────────────────
    // 2. Score d'alignement avec l'état multimodal
    // ─────────────────────────────────────────────────────────────────
    if (input.multimodalState) {
      scores.alignmentScore = this.evaluateAlignment(response, input.multimodalState);
    }

    // ─────────────────────────────────────────────────────────────────
    // 3. Score de clarté
    // ─────────────────────────────────────────────────────────────────
    scores.clarityScore = this.evaluateClarity(response);

    // ─────────────────────────────────────────────────────────────────
    // 4. Score de densité (charge cognitive)
    // ─────────────────────────────────────────────────────────────────
    scores.densityScore = this.evaluateDensity(response);

    // ─────────────────────────────────────────────────────────────────
    // 5. Score de correspondance présence
    // ─────────────────────────────────────────────────────────────────
    if (input.presenceState) {
      scores.presenceMatchScore = this.evaluatePresenceMatch(response, input.presenceState);
    }

    // ─────────────────────────────────────────────────────────────────
    // 6. Score de correspondance résonance
    // ─────────────────────────────────────────────────────────────────
    if (input.resonanceState) {
      scores.resonanceMatchScore = this.evaluateResonanceMatch(response, input.resonanceState);
    }

    // ─────────────────────────────────────────────────────────────────
    // 7. Risque d'impact sur le flow
    // ─────────────────────────────────────────────────────────────────
    if (input.flowState?.isActive) {
      scores.flowImpactRisk = this.evaluateFlowImpactRisk(response, input.flowState);
    }

    // ─────────────────────────────────────────────────────────────────
    // 8. Stabilité du ton
    // ─────────────────────────────────────────────────────────────────
    scores.toneStabilityScore = this.evaluateToneStability(response);

    // ─────────────────────────────────────────────────────────────────
    // 9. Continuité narrative
    // ─────────────────────────────────────────────────────────────────
    if (input.userMessage) {
      scores.narrativeContinuityScore = this.evaluateNarrativeContinuity(
        response,
        input.userMessage
      );
    }

    // ─────────────────────────────────────────────────────────────────
    // 10. Score global composite
    // ─────────────────────────────────────────────────────────────────
    scores.overallScore = this.computeOverallScore(scores);

    // ─────────────────────────────────────────────────────────────────
    // 11. Confiance dans l'évaluation
    // ─────────────────────────────────────────────────────────────────
    scores.evaluationConfidence = this.computeEvaluationConfidence(input);

    return scores;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - AJUSTEMENTS INTERNES
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Calcule les ajustements internes à appliquer
   */
  public computeInternalAdjustments(
    incoherences: DetectedIncoherence[],
    scores: MetaScores,
    input: EvaluationInput
  ): InternalAdjustment[] {
    const adjustments: InternalAdjustment[] = [];
    const now = Date.now();

    // Pour chaque incohérence, générer un ajustement
    for (const incoherence of incoherences) {
      const adjustment = this.createAdjustmentForIncoherence(incoherence, scores, input);
      if (adjustment) {
        adjustments.push({ ...adjustment, createdAt: now, applied: false });
      }
    }

    // Ajustements proactifs basés sur les scores
    const proactiveAdjustments = this.generateProactiveAdjustments(scores, input);
    adjustments.push(...proactiveAdjustments.map(a => ({ ...a, createdAt: now, applied: false })));

    // Limiter le nombre d'ajustements
    const maxAdjustments = this.config.adjustments.maxSimultaneousAdjustments;
    const sortedAdjustments = adjustments
      .sort((a, b) => b.priority - a.priority)
      .slice(0, maxAdjustments);

    return sortedAdjustments;
  }

  /**
   * Applique les ajustements à la prochaine réponse
   */
  public applyMetaAdjustmentsToNextResponse(response: string): string {
    if (this.state.activeAdjustments.length === 0) {
      return response;
    }

    let modifiedResponse = response;

    for (const adjustment of this.state.activeAdjustments) {
      modifiedResponse = this.applyAdjustment(modifiedResponse, adjustment);
      adjustment.applied = true;
    }

    // Vider les ajustements actifs après application
    this.state.activeAdjustments = [];
    this.state.lastUpdate = Date.now();
    this.notifyStateUpdate();

    return modifiedResponse;
  }

  /**
   * Récupère les ajustements actifs
   */
  public getActiveAdjustments(): InternalAdjustment[] {
    return [...this.state.activeAdjustments];
  }

  /**
   * Annule tous les ajustements actifs
   */
  public clearActiveAdjustments(): void {
    this.state.activeAdjustments = [];
    this.state.lastUpdate = Date.now();
    this.notifyStateUpdate();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - HISTORIQUE
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Enregistre dans l'historique de self-réflexion
   */
  public recordSelfReflectionHistory(
    evaluation: ResponseEvaluation,
    appliedAdjustments: InternalAdjustment[],
    effectiveness?: number
  ): void {
    const entry: ReflectionHistoryEntry = {
      id: `hist_${Date.now()}`,
      timestamp: Date.now(),
      evaluation,
      appliedAdjustments,
      adjustmentEffectiveness: effectiveness,
    };

    this.state.history.unshift(entry);

    // Limiter la taille de l'historique
    if (this.state.history.length > this.config.maxHistoryEntries) {
      this.state.history = this.state.history.slice(0, this.config.maxHistoryEntries);
    }

    this.state.lastUpdate = Date.now();
    this.notifyStateUpdate();
  }

  /**
   * Récupère l'historique récent
   */
  public getRecentHistory(limit: number = 10): ReflectionHistoryEntry[] {
    return this.state.history.slice(0, limit);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - PROFIL
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Récupère le profil de self-réflexion
   */
  public getProfile(): SelfReflectionProfile {
    return { ...this.state.profile };
  }

  /**
   * Réinitialise le profil
   */
  public resetProfile(): void {
    this.state.profile = getDefaultSelfReflectionProfile();
    this.state.lastUpdate = Date.now();
    this.notifyStateUpdate();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - MODE
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Change le mode de réflexion
   */
  public setMode(mode: 'passive' | 'active' | 'intensive'): void {
    this.state.mode = mode;
    this.state.lastUpdate = Date.now();
    this.notifyStateUpdate();
  }

  /**
   * Récupère le mode actuel
   */
  public getMode(): 'passive' | 'active' | 'intensive' {
    return this.state.mode;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - MÉTHODE PROCESS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Méthode de traitement principale (pour intégration pipeline)
   */
  public process(input: EvaluationInput): EvaluationOutput {
    return this.evaluateResponseQuality(input);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MÉTHODES PRIVÉES - ÉVALUATION
  // ═══════════════════════════════════════════════════════════════════════

  private evaluateCoherence(response: string): number {
    // Analyse de la cohérence structurelle
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length === 0) return 0.5;

    // Vérifier la longueur uniforme des phrases
    const lengths = sentences.map(s => s.trim().split(/\s+/).length);
    const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((a, b) => a + Math.pow(b - avgLength, 2), 0) / lengths.length;
    const lengthCoherence = Math.max(0, 1 - variance / 100);

    // Vérifier la présence de connecteurs logiques
    const connectors = /\b(donc|ainsi|cependant|toutefois|en effet|par conséquent|de plus|également|aussi|ensuite)\b/gi;
    const connectorCount = (response.match(connectors) || []).length;
    const connectorScore = Math.min(1, connectorCount / Math.max(1, sentences.length - 1));

    // Score composite
    return 0.6 * lengthCoherence + 0.4 * connectorScore;
  }

  private evaluateAlignment(
    response: string,
    multimodal: { tension: number; energy: number; engagement: number; stability: number }
  ): number {
    const responseLength = response.length;
    const _sentenceCount = response.split(/[.!?]+/).filter(s => s.trim()).length;

    // Si tension haute, la réponse devrait être courte et stable
    if (multimodal.tension > 0.7) {
      const expectedMaxLength = 300;
      const lengthAlignment = responseLength <= expectedMaxLength ? 1 : Math.max(0, 1 - (responseLength - expectedMaxLength) / 500);
      return lengthAlignment;
    }

    // Si énergie haute, la réponse peut être plus longue
    if (multimodal.energy > 0.7 && multimodal.tension < 0.5) {
      const expectedMinLength = 100;
      const lengthAlignment = responseLength >= expectedMinLength ? 1 : responseLength / expectedMinLength;
      return lengthAlignment;
    }

    // Si énergie basse, la réponse devrait être concise
    if (multimodal.energy < 0.3) {
      const expectedMaxLength = 200;
      const lengthAlignment = responseLength <= expectedMaxLength ? 1 : Math.max(0, 1 - (responseLength - expectedMaxLength) / 300);
      return lengthAlignment;
    }

    // État équilibré
    return 0.8;
  }

  private evaluateClarity(response: string): number {
    // Longueur moyenne des mots
    const words = response.split(/\s+/).filter(w => w.length > 0);
    if (words.length === 0) return 0.5;

    const avgWordLength = words.reduce((a, w) => a + w.length, 0) / words.length;
    const wordLengthScore = avgWordLength <= 6 ? 1 : Math.max(0, 1 - (avgWordLength - 6) / 4);

    // Longueur des phrases
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.length > 0
      ? sentences.reduce((a, s) => a + s.trim().split(/\s+/).length, 0) / sentences.length
      : 0;
    const sentenceLengthScore = avgSentenceLength <= 20 ? 1 : Math.max(0, 1 - (avgSentenceLength - 20) / 20);

    // Absence de jargon excessif
    const technicalTerms = /\b(implementation|paradigm|synergy|leverage|optimize|iterate|scalable)\b/gi;
    const techCount = (response.match(technicalTerms) || []).length;
    const techScore = Math.max(0, 1 - techCount / 5);

    return 0.4 * wordLengthScore + 0.4 * sentenceLengthScore + 0.2 * techScore;
  }

  private evaluateDensity(response: string): number {
    // Densité informationnelle (mots par phrase)
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length === 0) return 0.5;

    const totalWords = response.split(/\s+/).filter(w => w.length > 0).length;
    const density = totalWords / sentences.length;

    // Densité idéale entre 10 et 20 mots par phrase
    if (density >= 10 && density <= 20) {
      return 0.5; // Score idéal
    } else if (density < 10) {
      return 0.3; // Trop peu dense
    } else {
      return Math.min(1, 0.5 + (density - 20) / 40); // Plus dense = score plus élevé (attention)
    }
  }

  private evaluatePresenceMatch(
    response: string,
    presenceState: { style: string; alignmentScore: number }
  ): number {
    const style = presenceState.style.toLowerCase();
    const responseLength = response.length;

    // Adapter selon le style de présence
    switch (style) {
      case 'concise':
        return responseLength <= 200 ? 1 : Math.max(0, 1 - (responseLength - 200) / 300);
      case 'spacious':
        return responseLength >= 100 ? 1 : responseLength / 100;
      case 'structured': {
        const hasList = /[-•*]\s/.test(response) || /\d+\.\s/.test(response);
        return hasList ? 1 : 0.6;
      }
      case 'supportive': {
        const warmWords = /\b(bien|excellent|parfait|compris|ensemble|aidons)\b/gi;
        const warmCount = (response.match(warmWords) || []).length;
        return Math.min(1, 0.5 + warmCount * 0.15);
      }
      case 'directive': {
        const actionWords = /\b(faites|commencez|suivez|appliquez|implémentez)\b/gi;
        const actionCount = (response.match(actionWords) || []).length;
        return Math.min(1, 0.5 + actionCount * 0.2);
      }
      default:
        return 0.7;
    }
  }

  private evaluateResonanceMatch(
    response: string,
    resonanceState: { mode: string; resonanceScore: number }
  ): number {
    // Utiliser le score de résonance existant comme base
    return Math.max(0.5, resonanceState.resonanceScore);
  }

  private evaluateFlowImpactRisk(
    response: string,
    flowState: { isActive: boolean; intensity: number; zone: string }
  ): number {
    if (!flowState.isActive) return 0;

    const responseLength = response.length;
    const questionCount = (response.match(/\?/g) || []).length;

    // En flow profond, éviter les réponses longues et les questions multiples
    if (flowState.intensity > 0.7) {
      let risk = 0;

      // Réponse trop longue = risque
      if (responseLength > 150) {
        risk += Math.min(0.5, (responseLength - 150) / 300);
      }

      // Trop de questions = risque de distraction
      if (questionCount > 1) {
        risk += 0.3;
      }

      return Math.min(1, risk);
    }

    // Flow modéré
    if (flowState.intensity > 0.4) {
      return responseLength > 300 ? 0.3 : 0.1;
    }

    return 0;
  }

  private evaluateToneStability(response: string): number {
    // Vérifier que le ton est stable tout au long de la réponse
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length <= 1) return 1;

    // Détecter les changements brusques de ton
    const exclamations = sentences.filter(s => s.trim().endsWith('!')).length;
    const questions = sentences.filter(s => s.trim().endsWith('?')).length;
    const normal = sentences.length - exclamations - questions;

    // Score basé sur la distribution
    const maxType = Math.max(exclamations, questions, normal);
    const dominance = maxType / sentences.length;

    return dominance > 0.6 ? 1 : 0.5 + dominance * 0.5;
  }

  private evaluateNarrativeContinuity(response: string, userMessage: string): number {
    // Vérifier si la réponse fait référence au contexte
    const userKeywords = userMessage
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 3);

    if (userKeywords.length === 0) return 0.7;

    const responseLower = response.toLowerCase();
    const keywordsInResponse = userKeywords.filter(kw => responseLower.includes(kw)).length;
    const continuityScore = keywordsInResponse / userKeywords.length;

    return Math.max(0.5, Math.min(1, 0.5 + continuityScore * 0.5));
  }

  private computeOverallScore(scores: MetaScores): number {
    const weights = SELF_REFLECTION_CONSTANTS.SCORE_WEIGHTS;

    // Inverser flowImpactRisk (moins = mieux)
    const invertedFlowRisk = 1 - scores.flowImpactRisk;

    // Normaliser densityScore vers un score (0.5 est idéal)
    const normalizedDensity = 1 - Math.abs(scores.densityScore - 0.5) * 2;

    return (
      weights.coherence * scores.coherenceScore +
      weights.alignment * scores.alignmentScore +
      weights.clarity * scores.clarityScore +
      weights.density * normalizedDensity +
      weights.presenceMatch * scores.presenceMatchScore +
      weights.resonanceMatch * scores.resonanceMatchScore +
      weights.flowImpact * invertedFlowRisk +
      weights.toneStability * scores.toneStabilityScore +
      weights.narrativeContinuity * scores.narrativeContinuityScore
    );
  }

  private computeEvaluationConfidence(input: EvaluationInput): number {
    let confidence = 0.5;

    // Plus de contexte = plus de confiance
    if (input.multimodalState) confidence += 0.15;
    if (input.presenceState) confidence += 0.1;
    if (input.resonanceState) confidence += 0.1;
    if (input.flowState) confidence += 0.1;
    if (input.userMessage) confidence += 0.05;

    return Math.min(1, confidence);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MÉTHODES PRIVÉES - DÉTECTION D'INCOHÉRENCES
  // ═══════════════════════════════════════════════════════════════════════

  private detectIncoherences(
    input: EvaluationInput,
    scores: MetaScores
  ): DetectedIncoherence[] {
    const incoherences: DetectedIncoherence[] = [];
    const now = Date.now();

    // Vérifier chaque dimension
    if (scores.coherenceScore < 0.6) {
      incoherences.push({
        type: 'style_mismatch',
        severity: this.scoresToSeverity(scores.coherenceScore),
        description: 'Structure de réponse incohérente',
        source: 'coherence_analysis',
        impactScore: 1 - scores.coherenceScore,
        suggestedCorrection: 'stabilize',
        detectedAt: now,
      });
    }

    if (scores.alignmentScore < 0.6) {
      incoherences.push({
        type: 'alignment_drift',
        severity: this.scoresToSeverity(scores.alignmentScore),
        description: 'Réponse non alignée avec l\'état utilisateur',
        source: 'alignment_analysis',
        impactScore: 1 - scores.alignmentScore,
        suggestedCorrection: 'realign',
        detectedAt: now,
      });
    }

    if (scores.clarityScore < 0.6) {
      incoherences.push({
        type: 'clarity_issue',
        severity: this.scoresToSeverity(scores.clarityScore),
        description: 'Manque de clarté dans la réponse',
        source: 'clarity_analysis',
        impactScore: 1 - scores.clarityScore,
        suggestedCorrection: 'clarify',
        detectedAt: now,
      });
    }

    if (scores.densityScore > 0.7) {
      incoherences.push({
        type: 'density_excessive',
        severity: this.scoresToSeverity(1 - scores.densityScore),
        description: 'Réponse trop dense cognitivement',
        source: 'density_analysis',
        impactScore: scores.densityScore - 0.5,
        suggestedCorrection: 'reduce_density',
        detectedAt: now,
      });
    }

    if (scores.densityScore < 0.3) {
      incoherences.push({
        type: 'density_insufficient',
        severity: 'low',
        description: 'Réponse trop légère en contenu',
        source: 'density_analysis',
        impactScore: 0.5 - scores.densityScore,
        suggestedCorrection: 'expand',
        detectedAt: now,
      });
    }

    if (scores.flowImpactRisk > this.config.thresholds.maxFlowImpactRisk) {
      incoherences.push({
        type: 'flow_disruption',
        severity: this.scoresToSeverity(1 - scores.flowImpactRisk),
        description: 'Risque de perturbation de l\'état de flow',
        source: 'flow_analysis',
        impactScore: scores.flowImpactRisk,
        suggestedCorrection: 'protect_flow',
        detectedAt: now,
      });
    }

    if (scores.toneStabilityScore < 0.6) {
      incoherences.push({
        type: 'tone_rupture',
        severity: this.scoresToSeverity(scores.toneStabilityScore),
        description: 'Instabilité du ton dans la réponse',
        source: 'tone_analysis',
        impactScore: 1 - scores.toneStabilityScore,
        suggestedCorrection: 'stabilize',
        detectedAt: now,
      });
    }

    // Limiter le nombre d'incohérences
    return incoherences
      .sort((a, b) => b.impactScore - a.impactScore)
      .slice(0, SELF_REFLECTION_CONSTANTS.MAX_INCOHERENCES_PER_EVALUATION);
  }

  private scoresToSeverity(score: number): SeverityLevel {
    const thresholds = SELF_REFLECTION_CONSTANTS.SEVERITY_THRESHOLDS;
    if (score >= thresholds.critical) return 'critical';
    if (score >= thresholds.high) return 'high';
    if (score >= thresholds.moderate) return 'moderate';
    return 'low';
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MÉTHODES PRIVÉES - AJUSTEMENTS
  // ═══════════════════════════════════════════════════════════════════════

  private createAdjustmentForIncoherence(
    incoherence: DetectedIncoherence,
    scores: MetaScores,
    input: EvaluationInput
  ): InternalAdjustment | null {
    const baseAdjustment: Partial<InternalAdjustment> = {
      triggeredBy: incoherence.type,
      reason: incoherence.description,
      parameters: {},
    };

    switch (incoherence.suggestedCorrection) {
      case 'simplify':
        return {
          ...baseAdjustment,
          type: 'simplify',
          priority: incoherence.severity === 'critical' ? 9 : 7,
          strength: incoherence.impactScore,
          parameters: {
            densityModifier: -0.3,
            lengthModifier: -0.2,
            targetComplexity: 'simple',
          },
        } as InternalAdjustment;

      case 'expand':
        return {
          ...baseAdjustment,
          type: 'expand',
          priority: 5,
          strength: incoherence.impactScore * 0.7,
          parameters: {
            densityModifier: 0.2,
            lengthModifier: 0.3,
          },
        } as InternalAdjustment;

      case 'stabilize':
        return {
          ...baseAdjustment,
          type: 'stabilize',
          priority: 8,
          strength: incoherence.impactScore,
          parameters: {
            rhythmModifier: 0,
          },
        } as InternalAdjustment;

      case 'realign':
        return {
          ...baseAdjustment,
          type: 'realign',
          priority: incoherence.severity === 'critical' ? 10 : 8,
          strength: incoherence.impactScore,
          parameters: {
            // Adapter selon l'état multimodal
            densityModifier: input.multimodalState?.tension && input.multimodalState.tension > 0.6 ? -0.3 : 0,
            lengthModifier: input.multimodalState?.energy && input.multimodalState.energy < 0.4 ? -0.2 : 0,
          },
        } as InternalAdjustment;

      case 'clarify':
        return {
          ...baseAdjustment,
          type: 'clarify',
          priority: 7,
          strength: incoherence.impactScore,
          parameters: {
            targetComplexity: 'simple',
          },
        } as InternalAdjustment;

      case 'protect_flow':
        return {
          ...baseAdjustment,
          type: 'protect_flow',
          priority: 10,
          strength: 0.9,
          parameters: {
            densityModifier: -0.4,
            lengthModifier: -0.5,
          },
        } as InternalAdjustment;

      case 'reduce_density':
        return {
          ...baseAdjustment,
          type: 'reduce_density',
          priority: 7,
          strength: incoherence.impactScore,
          parameters: {
            densityModifier: -0.3,
          },
        } as InternalAdjustment;

      default:
        return null;
    }
  }

  private generateProactiveAdjustments(
    scores: MetaScores,
    input: EvaluationInput
  ): InternalAdjustment[] {
    const adjustments: InternalAdjustment[] = [];

    // Ajustement proactif si tension haute détectée
    if (input.multimodalState?.tension && input.multimodalState.tension > 0.7) {
      adjustments.push({
        type: 'slow_down',
        priority: 6,
        strength: input.multimodalState.tension - 0.5,
        reason: 'Tension élevée détectée',
        triggeredBy: 'proactive',
        parameters: {
          rhythmModifier: -0.2,
          warmthModifier: 0.2,
        },
        createdAt: Date.now(),
        applied: false,
      });
    }

    // Ajustement proactif si énergie très basse
    if (input.multimodalState?.energy && input.multimodalState.energy < 0.3) {
      adjustments.push({
        type: 'simplify',
        priority: 5,
        strength: 0.5 - input.multimodalState.energy,
        reason: 'Énergie basse détectée',
        triggeredBy: 'proactive',
        parameters: {
          lengthModifier: -0.3,
          densityModifier: -0.2,
        },
        createdAt: Date.now(),
        applied: false,
      });
    }

    return adjustments;
  }

  private applyAdjustment(response: string, _adjustment: InternalAdjustment): string {
    // Pour l'instant, retourner la réponse telle quelle
    // Dans une implémentation complète, cela pourrait modifier la réponse
    // Ici, on enregistre l'ajustement pour la génération de la prochaine réponse
    return response;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MÉTHODES PRIVÉES - HELPERS
  // ═══════════════════════════════════════════════════════════════════════

  private determineEvaluationStatus(scores: MetaScores): EvaluationStatus {
    if (scores.overallScore >= this.config.thresholds.optimalThreshold) {
      return 'optimal';
    }
    if (scores.overallScore >= this.config.thresholds.acceptableThreshold) {
      return 'acceptable';
    }
    if (scores.overallScore >= this.config.thresholds.problematicThreshold) {
      return 'suboptimal';
    }
    return 'problematic';
  }

  private generateEvaluationSummary(
    scores: MetaScores,
    incoherences: DetectedIncoherence[]
  ): string {
    const status = this.determineEvaluationStatus(scores);
    const issueCount = incoherences.length;

    if (status === 'optimal') {
      return 'Réponse optimale, alignée et cohérente.';
    }

    if (status === 'acceptable') {
      return `Réponse acceptable avec ${issueCount} ajustement(s) mineur(s) suggéré(s).`;
    }

    const mainIssues = incoherences
      .slice(0, 2)
      .map(i => i.description.toLowerCase())
      .join(', ');

    return `Réponse sub-optimale: ${mainIssues}. ${issueCount} ajustement(s) recommandé(s).`;
  }

  private determineActionRecommendation(
    scores: MetaScores,
    incoherences: DetectedIncoherence[]
  ): 'proceed' | 'adjust' | 'regenerate' {
    if (scores.overallScore >= this.config.thresholds.optimalThreshold) {
      return 'proceed';
    }

    const criticalIncoherences = incoherences.filter(i => i.severity === 'critical');
    if (criticalIncoherences.length > 0 || scores.overallScore < this.config.thresholds.problematicThreshold) {
      return 'regenerate';
    }

    return 'adjust';
  }

  private addToHistory(
    evaluation: ResponseEvaluation,
    appliedAdjustments: InternalAdjustment[]
  ): void {
    const entry: ReflectionHistoryEntry = {
      id: `hist_${Date.now()}`,
      timestamp: Date.now(),
      evaluation,
      appliedAdjustments,
    };

    this.state.history.unshift(entry);

    if (this.state.history.length > this.config.maxHistoryEntries) {
      this.state.history = this.state.history.slice(0, this.config.maxHistoryEntries);
    }
  }

  private updateProfile(evaluation: ResponseEvaluation): void {
    const profile = this.state.profile;

    // Mettre à jour les scores moyens avec un decay
    const decay = SELF_REFLECTION_CONSTANTS.TREND_DECAY_FACTOR;
    const newWeight = 1 - decay;

    profile.averageScores = {
      ...profile.averageScores,
      overallScore: profile.averageScores.overallScore * decay + evaluation.scores.overallScore * newWeight,
      coherenceScore: profile.averageScores.coherenceScore * decay + evaluation.scores.coherenceScore * newWeight,
      alignmentScore: profile.averageScores.alignmentScore * decay + evaluation.scores.alignmentScore * newWeight,
      clarityScore: profile.averageScores.clarityScore * decay + evaluation.scores.clarityScore * newWeight,
    };

    // Mettre à jour les tendances d'incohérence
    for (const incoherence of evaluation.incoherences) {
      const existing = profile.incoherenceTrends.find(t => t.type === incoherence.type);
      if (existing) {
        existing.frequency = existing.frequency * decay + newWeight;
        existing.averageSeverity = existing.averageSeverity * decay +
          (incoherence.severity === 'critical' ? 1 : incoherence.severity === 'high' ? 0.7 : incoherence.severity === 'moderate' ? 0.4 : 0.2) * newWeight;
      } else {
        profile.incoherenceTrends.push({
          type: incoherence.type,
          frequency: newWeight,
          averageSeverity: incoherence.severity === 'critical' ? 1 : incoherence.severity === 'high' ? 0.7 : 0.4,
        });
      }
    }

    // Calculer le score de stabilité globale
    profile.globalStabilityScore = evaluation.scores.overallScore >= this.config.thresholds.acceptableThreshold
      ? Math.min(1, profile.globalStabilityScore + 0.05)
      : Math.max(0, profile.globalStabilityScore - 0.1);

    profile.totalEvaluations++;
    profile.lastUpdate = Date.now();

    // Mettre à jour les métriques temps réel
    if (evaluation.status === 'optimal') {
      this.state.realtimeMetrics.consecutiveOptimalResponses++;
    } else {
      this.state.realtimeMetrics.consecutiveOptimalResponses = 0;
    }

    this.state.realtimeMetrics.recentAdjustmentCount = evaluation.recommendedAdjustments.length;
    this.state.realtimeMetrics.currentDriftRisk = 1 - evaluation.scores.alignmentScore;
  }

  private addToResponseBuffer(response: string, evaluation: ResponseEvaluation): void {
    this.responseBuffer.push({
      response,
      evaluation,
      timestamp: Date.now(),
    });

    if (this.responseBuffer.length > this.MAX_RESPONSE_BUFFER) {
      this.responseBuffer.shift();
    }
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export { SelfReflectionEngine };
export default SelfReflectionEngine;
