/**
 * TITANE∞ vΩ∞ — PRESENCE ENGINE
 * OPUS v∞.7: Continuité consciente et alignement adaptatif
 *
 * Ce moteur orchestre la présence intelligente de TITANE∞ :
 * - Perception continue des signaux multimodaux
 * - Compréhension de l'intention présente
 * - Ajustement du style et du rythme
 * - Maintien de la continuité temporelle
 *
 * La présence n'est pas une émotion. C'est :
 * attention + cohérence + continuité + alignement
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import type {
  PresenceProfile,
  PresenceState,
  PresenceEngineConfig,
  EmergentIntent,
  IntentConfidence,
  PresenceStyle,
  PresenceDrift,
  PresenceHistoryEntry,
  IntentSignals,
  IntentDetectionResult,
  StyleComputationContext,
  StyleComputationResult,
  AlignmentMetrics,
  ResponseModulationParams,
} from '@/types/presence';

import {
  getDefaultPresenceProfile,
  getDefaultPresenceState,
  getDefaultPresenceEngineConfig,
  getDefaultResponseModulation,
  PRESENCE_CONSTANTS,
} from '@/types/presence';

import type { MultimodalState } from '@/types/multimodalFusion';
import type { PredictiveState } from '@/types/predictiveState';
import type { HumanRhythmState } from '@/types/humanRhythm';
import type { StressRegulationState } from '@/types/stressRegulation';

// ============================================================================
// TYPES INTERNES
// ============================================================================

interface StateUpdateCallback {
  (state: PresenceState): void;
}

interface StyleChangeCallback {
  (oldStyle: PresenceStyle, newStyle: PresenceStyle, reason: string): void;
}

// ============================================================================
// PRESENCE ENGINE
// ============================================================================

/**
 * Moteur de présence singleton
 * Orchestre la continuité consciente de TITANE∞
 */
class PresenceEngine {
  private static instance: PresenceEngine | null = null;

  // Configuration
  private config: PresenceEngineConfig;

  // État
  private state: PresenceState;
  private isRunning: boolean = false;

  // Callbacks
  private stateUpdateCallback: StateUpdateCallback | null = null;
  private styleChangeCallback: StyleChangeCallback | null = null;

  // Buffer de texte pour analyse
  private textBuffer: string[] = [];
  private readonly MAX_TEXT_BUFFER = 10;

  // ═══════════════════════════════════════════════════════════════════════
  // SINGLETON
  // ═══════════════════════════════════════════════════════════════════════

  private constructor() {
    this.config = getDefaultPresenceEngineConfig();
    this.state = getDefaultPresenceState();
  }

  public static getInstance(): PresenceEngine {
    if (!PresenceEngine.instance) {
      PresenceEngine.instance = new PresenceEngine();
    }
    return PresenceEngine.instance;
  }

  public static resetInstance(): void {
    if (PresenceEngine.instance) {
      PresenceEngine.instance.stop();
    }
    PresenceEngine.instance = null;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - CYCLE DE VIE
  // ═══════════════════════════════════════════════════════════════════════

  public start(): void {
    if (this.isRunning) {
      console.warn('[PresenceEngine] Déjà en cours d\'exécution');
      return;
    }

    console.log('[PresenceEngine] Démarrage...');
    this.isRunning = true;
    this.state.isActive = true;
    this.state.profile.sessionStartTime = Date.now();
  }

  public stop(): void {
    if (!this.isRunning) return;

    console.log('[PresenceEngine] Arrêt...');
    this.isRunning = false;
    this.state.isActive = false;
  }

  public reset(): void {
    this.state = getDefaultPresenceState();
    this.textBuffer = [];
    console.log('[PresenceEngine] État réinitialisé');
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════

  public setConfig(config: Partial<PresenceEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public getConfig(): PresenceEngineConfig {
    return { ...this.config };
  }

  public setStateUpdateCallback(callback: StateUpdateCallback): void {
    this.stateUpdateCallback = callback;
  }

  public setStyleChangeCallback(callback: StyleChangeCallback): void {
    this.styleChangeCallback = callback;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - DÉTECTION D'INTENTION
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Infère l'intention émergente de l'utilisateur
   */
  public inferEmergentIntent(
    multimodalState: MultimodalState,
    text: string,
    predictiveState?: PredictiveState,
    rhythmState?: HumanRhythmState
  ): IntentDetectionResult {
    // Collecter les signaux
    const signals = this.collectIntentSignals(
      multimodalState,
      text,
      predictiveState,
      rhythmState
    );

    // Calculer les scores par intention
    const scores = this.computeIntentScores(signals);

    // Trouver l'intention dominante
    let maxScore = 0;
    let dominantIntent: EmergentIntent = 'unknown';

    for (const [intent, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        dominantIntent = intent as EmergentIntent;
      }
    }

    // Déterminer la confiance
    const confidence = this.computeIntentConfidence(maxScore, scores);

    // Générer le raisonnement
    const reasoning = this.generateIntentReasoning(dominantIntent, signals);

    // Mettre à jour le profil
    this.state.profile.emergentIntent = dominantIntent;
    this.state.profile.intentConfidence = confidence;

    return {
      intent: dominantIntent,
      confidence,
      scores: scores as Record<EmergentIntent, number>,
      reasoning,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - CALCUL DU STYLE
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Calcule le style de présence approprié
   */
  public computePresenceStyle(
    intent: EmergentIntent,
    tension: number,
    energy: number,
    engagement?: number,
    cognitiveLoad?: number
  ): StyleComputationResult {
    const context: StyleComputationContext = {
      intent,
      tension,
      energy,
      engagement: engagement ?? 0.5,
      cognitiveLoad: cognitiveLoad ?? 0.5,
      timeOfDay: new Date().getHours(),
      sessionPhase: this.determineSessionPhase(),
    };

    // Déterminer le style de base selon l'intention
    let baseStyle = this.getBaseStyleForIntent(intent);

    // Ajuster selon la tension
    if (tension > PRESENCE_CONSTANTS.TENSION_THRESHOLDS.high) {
      baseStyle = 'supportive';
    } else if (tension > PRESENCE_CONSTANTS.TENSION_THRESHOLDS.medium && intent !== 'advance') {
      baseStyle = 'spacious';
    }

    // Ajuster selon l'énergie
    if (energy < PRESENCE_CONSTANTS.ENERGY_THRESHOLDS.low) {
      baseStyle = 'concise';
    } else if (energy > PRESENCE_CONSTANTS.ENERGY_THRESHOLDS.high && intent === 'advance') {
      baseStyle = 'directive';
    }

    // Calculer les ajustements fins
    const adjustments = this.computeStyleAdjustments(context, baseStyle);

    // Vérifier la stabilité du style
    const shouldChange = this.shouldChangeStyle(baseStyle);

    const finalStyle = shouldChange ? baseStyle : this.state.profile.presenceStyle;

    // Mettre à jour si changement
    if (finalStyle !== this.state.profile.presenceStyle && shouldChange) {
      this.updatePresenceStyle(finalStyle, `Adaptation: intent=${intent}, tension=${tension.toFixed(2)}`);
    }

    return {
      style: finalStyle,
      confidence: shouldChange ? 0.8 : 0.6,
      adjustments,
      reasoning: this.generateStyleReasoning(context, finalStyle),
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - ALIGNEMENT
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Calcule le score d'alignement
   */
  public computeAlignmentScore(
    multimodalState: MultimodalState,
    presenceStyle: PresenceStyle
  ): AlignmentMetrics {
    const energy = multimodalState.fusedScores?.globalEnergy?.value ?? 0.5;
    const tension = multimodalState.fusedScores?.globalTension?.value ?? 0.5;
    const engagement = multimodalState.fusedScores?.globalEngagement?.value ?? 0.5;

    // Alignement avec l'intention
    const intentAlignment = this.computeIntentAlignmentScore(
      this.state.profile.emergentIntent,
      presenceStyle
    );

    // Alignement avec l'énergie
    const energyAlignment = this.computeEnergyAlignmentScore(energy, presenceStyle);

    // Alignement avec le rythme
    const rhythmAlignment = this.computeRhythmAlignmentScore(engagement, presenceStyle);

    // Alignement du style
    const styleAlignment = this.computeStyleAlignmentScore(tension, presenceStyle);

    // Score global pondéré
    const overallScore = (
      intentAlignment * 0.3 +
      energyAlignment * 0.25 +
      rhythmAlignment * 0.25 +
      styleAlignment * 0.2
    );

    // Mettre à jour le profil
    this.state.profile.alignmentScore = overallScore;
    this.state.profile.resonanceLevel = (intentAlignment + energyAlignment) / 2;

    return {
      intentAlignment,
      energyAlignment,
      rhythmAlignment,
      styleAlignment,
      overallScore,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - MODULATION DE RÉPONSE
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Calcule les paramètres de modulation pour une réponse
   */
  public computeResponseModulation(
    multimodalState: MultimodalState,
    predictiveState?: PredictiveState,
    stressState?: StressRegulationState
  ): ResponseModulationParams {
    const params = getDefaultResponseModulation();

    const energy = multimodalState.fusedScores?.globalEnergy?.value ?? 0.5;
    const tension = multimodalState.fusedScores?.globalTension?.value ?? 0.5;
    const style = this.state.profile.presenceStyle;
    const intent = this.state.profile.emergentIntent;

    // Longueur cible basée sur l'énergie
    if (energy < 0.3) {
      params.targetLength = 'very_short';
    } else if (energy < 0.5) {
      params.targetLength = 'short';
    } else if (energy > 0.8) {
      params.targetLength = 'detailed';
    } else if (energy > 0.6) {
      params.targetLength = 'long';
    }

    // Ton basé sur le style
    switch (style) {
      case 'supportive':
        params.tone = 'warm';
        break;
      case 'directive':
        params.tone = 'focused';
        break;
      case 'spacious':
        params.tone = 'calm';
        break;
      default:
        params.tone = 'neutral';
    }

    // Densité basée sur la tension
    if (tension > 0.7) {
      params.density = 'minimal';
      params.addBreathing = true;
    } else if (tension > 0.5) {
      params.density = 'light';
    } else if (tension < 0.3 && energy > 0.6) {
      params.density = 'rich';
    }

    // Structure basée sur l'intention
    if (intent === 'organize') {
      params.useStructure = true;
      params.useLists = true;
      params.useSteps = true;
    } else if (intent === 'advance') {
      params.useSteps = true;
    }

    // Ajustement du rythme
    if (predictiveState?.tensionTrend === 'rising') {
      params.paceAdjustment = -0.3; // Ralentir
    } else if (predictiveState?.energyTrend === 'rising') {
      params.paceAdjustment = 0.2; // Accélérer légèrement
    }

    // Stress élevé → simplification maximale
    if (stressState?.currentLevel === 'high') {
      params.targetLength = 'short';
      params.density = 'minimal';
      params.addBreathing = true;
    }

    return params;
  }

  /**
   * Applique la modulation à une réponse textuelle
   */
  public applyPresenceModulation(
    response: string,
    modulation: ResponseModulationParams
  ): string {
    let modulated = response;

    // Ajouter de la respiration textuelle si nécessaire
    if (modulation.addBreathing) {
      modulated = this.addTextualBreathing(modulated);
    }

    // Ajuster la longueur (indication pour le LLM, pas de troncature brutale)
    // Cette méthode retourne le texte avec des métadonnées implicites

    return modulated;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - MISE À JOUR DU PROFIL
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Met à jour le profil de présence avec une nouvelle entrée
   */
  public updatePresenceProfile(
    multimodalState: MultimodalState,
    text?: string
  ): void {
    const now = Date.now();

    // Ajouter le texte au buffer
    if (text) {
      this.textBuffer.push(text);
      if (this.textBuffer.length > this.MAX_TEXT_BUFFER) {
        this.textBuffer.shift();
      }
    }

    // Créer l'entrée d'historique
    const entry: PresenceHistoryEntry = {
      timestamp: now,
      style: this.state.profile.presenceStyle,
      intent: this.state.profile.emergentIntent,
      alignmentScore: this.state.profile.alignmentScore,
      resonanceLevel: this.state.profile.resonanceLevel,
      contextSnapshot: {
        energy: multimodalState.fusedScores?.globalEnergy?.value ?? 0.5,
        tension: multimodalState.fusedScores?.globalTension?.value ?? 0.5,
        engagement: multimodalState.fusedScores?.globalEngagement?.value ?? 0.5,
      },
    };

    // Ajouter à l'historique
    this.state.profile.history.push(entry);

    // Limiter la taille
    if (this.state.profile.history.length > this.config.maxHistoryEntries) {
      this.state.profile.history = this.state.profile.history.slice(
        -this.config.maxHistoryEntries
      );
    }

    // Mettre à jour les métriques
    this.state.profile.totalInteractions++;
    this.state.profile.lastUpdate = now;

    // Calculer la continuité
    this.updateContinuityLevel();

    // Détecter les dérives
    this.detectPresenceDrift();

    // Notifier
    this.notifyStateUpdate();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - TRAITEMENT COMPLET
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Processus complet de mise à jour de présence
   */
  public process(
    multimodalState: MultimodalState,
    text: string,
    predictiveState?: PredictiveState,
    rhythmState?: HumanRhythmState,
    stressState?: StressRegulationState
  ): {
    intent: IntentDetectionResult;
    style: StyleComputationResult;
    alignment: AlignmentMetrics;
    modulation: ResponseModulationParams;
  } {
    // 1. Détecter l'intention
    const intent = this.inferEmergentIntent(
      multimodalState,
      text,
      predictiveState,
      rhythmState
    );

    // 2. Calculer le style
    const energy = multimodalState.fusedScores?.globalEnergy?.value ?? 0.5;
    const tension = multimodalState.fusedScores?.globalTension?.value ?? 0.5;
    const engagement = multimodalState.fusedScores?.globalEngagement?.value ?? 0.5;

    const style = this.computePresenceStyle(
      intent.intent,
      tension,
      energy,
      engagement
    );

    // 3. Calculer l'alignement
    const alignment = this.computeAlignmentScore(multimodalState, style.style);

    // 4. Calculer la modulation
    const modulation = this.computeResponseModulation(
      multimodalState,
      predictiveState,
      stressState
    );

    // 5. Mettre à jour le profil
    this.updatePresenceProfile(multimodalState, text);

    return { intent, style, alignment, modulation };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - RÉSUMÉ
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Génère un résumé de l'état de présence
   */
  public generatePresenceSummary(): string {
    const { profile } = this.state;
    const lines: string[] = [];

    // Intention
    const intentLabel = PRESENCE_CONSTANTS.INTENT_LABELS[profile.emergentIntent];
    lines.push(`Intention: ${intentLabel} (${profile.intentConfidence})`);

    // Style
    const styleLabel = PRESENCE_CONSTANTS.STYLE_LABELS[profile.presenceStyle];
    lines.push(`Style: ${styleLabel}`);

    // Alignement
    lines.push(`Alignement: ${(profile.alignmentScore * 100).toFixed(0)}%`);

    // Continuité
    lines.push(`Continuité: ${(profile.continuityLevel * 100).toFixed(0)}%`);

    // Dérive
    if (profile.presenceDrift !== 'none') {
      const driftLabel = PRESENCE_CONSTANTS.DRIFT_LABELS[profile.presenceDrift];
      lines.push(`Dérive: ${driftLabel}`);
    }

    return lines.join('\n');
  }

  /**
   * Obtient l'état complet (lecture seule)
   */
  public getState(): PresenceState {
    return { ...this.state };
  }

  /**
   * Obtient le profil de présence
   */
  public getProfile(): PresenceProfile {
    return { ...this.state.profile };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // LOGIQUE INTERNE - COLLECTE DES SIGNAUX
  // ═══════════════════════════════════════════════════════════════════════

  private collectIntentSignals(
    multimodalState: MultimodalState,
    text: string,
    predictiveState?: PredictiveState,
    rhythmState?: HumanRhythmState
  ): IntentSignals {
    // Analyser le texte
    const textualCues = this.analyzeTextForIntent(text);

    // Extraire les signaux multimodaux
    const multimodalCues = {
      energy: multimodalState.fusedScores?.globalEnergy?.value ?? 0.5,
      tension: multimodalState.fusedScores?.globalTension?.value ?? 0.5,
      engagement: multimodalState.fusedScores?.globalEngagement?.value ?? 0.5,
      stability: multimodalState.fusedScores?.globalStability?.value ?? 0.5,
      speechRate: 0.5, // À connecter avec le VoiceAnalysisEngine
    };

    // Contexte
    const recentIntents = this.state.profile.history
      .slice(-5)
      .map(h => h.intent);

    const contextCues = {
      timeOfDay: new Date().getHours(),
      sessionDuration: Date.now() - this.state.profile.sessionStartTime,
      recentIntents,
      agendaLoad: 0.5, // À connecter avec l'AgendaEngine
    };

    return { textualCues, multimodalCues, contextCues };
  }

  private analyzeTextForIntent(text: string): IntentSignals['textualCues'] {
    const lower = text.toLowerCase();

    return {
      questionMarkers: (text.match(/\?/g) || []).length,
      actionVerbs: this.countActionVerbs(lower),
      hesitationMarkers: this.countHesitationMarkers(lower),
      organizationWords: this.countOrganizationWords(lower),
      emotionalMarkers: this.countEmotionalMarkers(lower),
    };
  }

  private countActionVerbs(text: string): number {
    const actionWords = ['faire', 'avancer', 'commencer', 'terminer', 'créer', 'lancer', 'go', 'let\'s'];
    return actionWords.filter(w => text.includes(w)).length;
  }

  private countHesitationMarkers(text: string): number {
    const hesitationWords = ['peut-être', 'je sais pas', 'pas sûr', 'hmm', 'euh', 'bof'];
    return hesitationWords.filter(w => text.includes(w)).length;
  }

  private countOrganizationWords(text: string): number {
    const orgWords = ['plan', 'liste', 'étape', 'organiser', 'structurer', 'agenda', 'priorité'];
    return orgWords.filter(w => text.includes(w)).length;
  }

  private countEmotionalMarkers(text: string): number {
    const emotionalWords = ['stressé', 'fatigué', 'content', 'anxieux', 'calme', 'bien', 'mal'];
    return emotionalWords.filter(w => text.includes(w)).length;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // LOGIQUE INTERNE - CALCUL DES SCORES D'INTENTION
  // ═══════════════════════════════════════════════════════════════════════

  private computeIntentScores(signals: IntentSignals): Record<string, number> {
    const scores: Record<string, number> = {
      advance: 0,
      organize: 0,
      express: 0,
      slow: 0,
      anchor: 0,
      understand: 0,
      unknown: 0.1,
    };

    const { textualCues, multimodalCues, contextCues } = signals;

    // ADVANCE - Veut progresser
    scores.advance += textualCues.actionVerbs * 0.3;
    scores.advance += multimodalCues.energy > 0.6 ? 0.3 : 0;
    scores.advance += multimodalCues.engagement > 0.6 ? 0.2 : 0;

    // ORGANIZE - Veut structurer
    scores.organize += textualCues.organizationWords * 0.4;
    scores.organize += textualCues.questionMarkers > 0 ? 0.1 : 0;

    // EXPRESS - Veut s'exprimer
    scores.express += textualCues.emotionalMarkers * 0.3;
    scores.express += multimodalCues.tension > 0.5 ? 0.2 : 0;

    // SLOW - Besoin de lenteur
    scores.slow += multimodalCues.energy < 0.4 ? 0.4 : 0;
    scores.slow += textualCues.hesitationMarkers * 0.3;

    // ANCHOR - Besoin d'ancrage
    scores.anchor += multimodalCues.tension > 0.7 ? 0.4 : 0;
    scores.anchor += multimodalCues.stability < 0.4 ? 0.3 : 0;

    // UNDERSTAND - Veut comprendre
    scores.understand += textualCues.questionMarkers * 0.3;
    scores.understand += multimodalCues.engagement > 0.5 ? 0.2 : 0;

    // Contexte temporel
    const hour = contextCues.timeOfDay;
    if (hour < 9 || hour > 20) {
      scores.slow += 0.1;
      scores.anchor += 0.1;
    }

    // Normaliser
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    if (total > 0) {
      for (const key of Object.keys(scores)) {
        scores[key] /= total;
      }
    }

    return scores;
  }

  private computeIntentConfidence(maxScore: number, scores: Record<string, number>): IntentConfidence {
    const values = Object.values(scores);
    const secondMax = values.sort((a, b) => b - a)[1] || 0;
    const gap = maxScore - secondMax;

    if (maxScore > 0.5 && gap > 0.2) return 'high';
    if (maxScore > 0.3 && gap > 0.1) return 'medium';
    return 'low';
  }

  private generateIntentReasoning(intent: EmergentIntent, signals: IntentSignals): string {
    const reasons: string[] = [];

    switch (intent) {
      case 'advance':
        reasons.push('Verbes d\'action détectés');
        if (signals.multimodalCues.energy > 0.6) reasons.push('Énergie élevée');
        break;
      case 'organize':
        reasons.push('Mots d\'organisation détectés');
        break;
      case 'slow':
        reasons.push('Énergie basse détectée');
        break;
      case 'anchor':
        reasons.push('Tension élevée détectée');
        break;
      default:
        reasons.push('Signaux mixtes');
    }

    return reasons.join(', ');
  }

  // ═══════════════════════════════════════════════════════════════════════
  // LOGIQUE INTERNE - CALCUL DU STYLE
  // ═══════════════════════════════════════════════════════════════════════

  private getBaseStyleForIntent(intent: EmergentIntent): PresenceStyle {
    switch (intent) {
      case 'advance':
        return 'directive';
      case 'organize':
        return 'structured';
      case 'express':
        return 'spacious';
      case 'slow':
        return 'spacious';
      case 'anchor':
        return 'supportive';
      case 'understand':
        return 'structured';
      default:
        return 'concise';
    }
  }

  private computeStyleAdjustments(
    context: StyleComputationContext,
    _style: PresenceStyle
  ): StyleComputationResult['adjustments'] {
    return {
      verbosity: context.energy > 0.6 ? 0.3 : -0.3,
      warmth: context.tension > 0.5 ? 0.4 : 0,
      structure: context.cognitiveLoad > 0.6 ? 0.5 : 0,
      pace: context.energy > 0.7 ? 0.2 : context.energy < 0.4 ? -0.3 : 0,
    };
  }

  private shouldChangeStyle(newStyle: PresenceStyle): boolean {
    const now = Date.now();
    const timeSinceLastChange = now - this.state.lastStyleChange;

    // Respecter la durée minimum
    if (timeSinceLastChange < this.config.minStyleDurationMs) {
      return false;
    }

    // Vérifier si le style est différent
    return newStyle !== this.state.profile.presenceStyle;
  }

  private updatePresenceStyle(newStyle: PresenceStyle, reason: string): void {
    const oldStyle = this.state.profile.presenceStyle;

    this.state.profile.presenceStyle = newStyle;
    this.state.lastStyleChange = Date.now();

    if (this.styleChangeCallback) {
      this.styleChangeCallback(oldStyle, newStyle, reason);
    }

    console.log(`[PresenceEngine] Style changé: ${oldStyle} → ${newStyle} (${reason})`);
  }

  private generateStyleReasoning(context: StyleComputationContext, style: PresenceStyle): string {
    const parts: string[] = [];

    parts.push(`Intent: ${context.intent}`);
    parts.push(`Tension: ${(context.tension * 100).toFixed(0)}%`);
    parts.push(`Énergie: ${(context.energy * 100).toFixed(0)}%`);
    parts.push(`→ Style: ${style}`);

    return parts.join(' | ');
  }

  private determineSessionPhase(): 'beginning' | 'middle' | 'ending' {
    const duration = Date.now() - this.state.profile.sessionStartTime;
    const minutes = duration / 60000;

    if (minutes < 5) return 'beginning';
    if (minutes > 45) return 'ending';
    return 'middle';
  }

  // ═══════════════════════════════════════════════════════════════════════
  // LOGIQUE INTERNE - ALIGNEMENT
  // ═══════════════════════════════════════════════════════════════════════

  private computeIntentAlignmentScore(intent: EmergentIntent, style: PresenceStyle): number {
    const idealStyle = this.getBaseStyleForIntent(intent);
    return style === idealStyle ? 1.0 : 0.6;
  }

  private computeEnergyAlignmentScore(energy: number, style: PresenceStyle): number {
    // Style concis approprié pour basse énergie
    if (energy < 0.4 && style === 'concise') return 1.0;
    // Style directive approprié pour haute énergie
    if (energy > 0.7 && style === 'directive') return 1.0;
    // Style spacieux approprié pour énergie moyenne
    if (energy >= 0.4 && energy <= 0.7 && style === 'spacious') return 0.9;
    return 0.6;
  }

  private computeRhythmAlignmentScore(engagement: number, style: PresenceStyle): number {
    // Haut engagement + style structuré = bon alignement
    if (engagement > 0.6 && (style === 'structured' || style === 'directive')) return 1.0;
    // Bas engagement + style supportive = bon alignement
    if (engagement < 0.4 && style === 'supportive') return 0.9;
    return 0.7;
  }

  private computeStyleAlignmentScore(tension: number, style: PresenceStyle): number {
    // Haute tension + style supportive = excellent
    if (tension > 0.7 && style === 'supportive') return 1.0;
    // Haute tension + style directive = mauvais
    if (tension > 0.7 && style === 'directive') return 0.3;
    return 0.7;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // LOGIQUE INTERNE - CONTINUITÉ ET DÉRIVE
  // ═══════════════════════════════════════════════════════════════════════

  private updateContinuityLevel(): void {
    const history = this.state.profile.history;
    if (history.length < 2) {
      this.state.profile.continuityLevel = 1.0;
      return;
    }

    // Calculer la cohérence des styles récents
    const recentStyles = history.slice(-5).map(h => h.style);
    const uniqueStyles = new Set(recentStyles).size;
    const styleContinuity = 1 - (uniqueStyles - 1) / 4;

    // Calculer la cohérence des intentions récentes
    const recentIntents = history.slice(-5).map(h => h.intent);
    const uniqueIntents = new Set(recentIntents).size;
    const intentContinuity = 1 - (uniqueIntents - 1) / 6;

    this.state.profile.continuityLevel = (styleContinuity + intentContinuity) / 2;
  }

  private detectPresenceDrift(): void {
    const history = this.state.profile.history;
    if (history.length < 3) {
      this.state.profile.presenceDrift = 'none';
      return;
    }

    const recent = history.slice(-3);
    const alignments = recent.map(h => h.alignmentScore);

    // Vérifier la tendance
    const trend = alignments[2] - alignments[0];

    if (trend < -0.2) {
      this.state.profile.presenceDrift = 'fast';
    } else if (trend < -0.1) {
      this.state.profile.presenceDrift = 'slow';
    } else if (Math.abs(trend) > 0.3) {
      this.state.profile.presenceDrift = 'uncertain';
    } else {
      this.state.profile.presenceDrift = 'none';
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // LOGIQUE INTERNE - MODULATION TEXTUELLE
  // ═══════════════════════════════════════════════════════════════════════

  private addTextualBreathing(text: string): string {
    // Ajouter des pauses visuelles (sauts de ligne) entre les phrases longues
    const sentences = text.split(/(?<=[.!?])\s+/);

    if (sentences.length <= 2) return text;

    const result: string[] = [];
    for (let i = 0; i < sentences.length; i++) {
      result.push(sentences[i]);
      // Ajouter un espace supplémentaire tous les 2-3 phrases
      if ((i + 1) % 2 === 0 && i < sentences.length - 1) {
        result.push('');
      }
    }

    return result.join('\n');
  }

  // ═══════════════════════════════════════════════════════════════════════
  // LOGIQUE INTERNE - NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════════════════

  private notifyStateUpdate(): void {
    if (this.stateUpdateCallback) {
      this.stateUpdateCallback({ ...this.state });
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { PresenceEngine };
export default PresenceEngine.getInstance();
