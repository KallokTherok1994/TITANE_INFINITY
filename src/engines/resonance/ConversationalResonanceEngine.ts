/**
 * TITANE∞ vΩ∞ — CONVERSATIONAL RESONANCE ENGINE
 * OPUS v∞.9: Synchronisation expressive et adaptabilité linguistique
 *
 * Ce moteur orchestre la résonance conversationnelle de TITANE∞ :
 * - Analyse du style linguistique de l'utilisateur
 * - Adaptation dynamique du ton et du rythme
 * - Synchronisation expressive
 * - Apprentissage des préférences
 *
 * La résonance conversationnelle, c'est l'art de parler
 * la même langue émotionnelle que l'autre.
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import type {
  ResonanceState,
  ResonanceEngineConfig,
  LinguisticStyle,
  EmotionalTone,
  ConversationalRhythm,
  ComplexityLevel,
  SyncType,
  LinguisticAnalysis,
  LinguisticAdaptation,
  ToneModulation,
  RhythmSynchronization,
  ResonanceScores,
  ResonanceHistoryEntry,
  UserMessageAnalysisResult,
  ResponseParametersResult,
  ResponseModulationResult,
} from '@/types/resonance';

import {
  getDefaultResonanceState,
  getDefaultResonanceEngineConfig,
  getDefaultLinguisticAnalysis,
  getDefaultLinguisticAdaptation,
  getDefaultToneModulation,
  getDefaultRhythmSynchronization,
  getDefaultResonanceScores,
  RESONANCE_CONSTANTS,
} from '@/types/resonance';

import type { MultimodalState } from '@/types/multimodalFusion';
import type { PresenceState } from '@/types/presence';

// ============================================================================
// TYPES INTERNES
// ============================================================================

interface StateUpdateCallback {
  (state: ResonanceState): void;
}

interface AdaptationCallback {
  (adaptation: LinguisticAdaptation): void;
}

// ============================================================================
// CONVERSATIONAL RESONANCE ENGINE
// ============================================================================

/**
 * Moteur de résonance conversationnelle singleton
 * Synchronise le style de TITANE∞ avec l'utilisateur
 */
class ConversationalResonanceEngine {
  private static instance: ConversationalResonanceEngine | null = null;

  // Configuration
  private config: ResonanceEngineConfig;

  // État
  private state: ResonanceState;
  private isRunning: boolean = false;

  // Callbacks
  private stateUpdateCallback: StateUpdateCallback | null = null;
  private adaptationCallback: AdaptationCallback | null = null;

  // Buffer de messages pour analyse contextuelle
  private messageBuffer: Array<{ text: string; isUser: boolean; timestamp: number }> = [];
  private readonly MAX_MESSAGE_BUFFER = 20;

  // ═══════════════════════════════════════════════════════════════════════
  // SINGLETON
  // ═══════════════════════════════════════════════════════════════════════

  private constructor() {
    this.config = getDefaultResonanceEngineConfig();
    this.state = getDefaultResonanceState();
  }

  public static getInstance(): ConversationalResonanceEngine {
    if (!ConversationalResonanceEngine.instance) {
      ConversationalResonanceEngine.instance = new ConversationalResonanceEngine();
    }
    return ConversationalResonanceEngine.instance;
  }

  public static resetInstance(): void {
    if (ConversationalResonanceEngine.instance) {
      ConversationalResonanceEngine.instance.stop();
    }
    ConversationalResonanceEngine.instance = null;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - CYCLE DE VIE
  // ═══════════════════════════════════════════════════════════════════════

  public start(): void {
    if (this.isRunning) {
      console.warn("[ResonanceEngine] Déjà en cours d'exécution");
      return;
    }

    console.log('[ResonanceEngine] Démarrage...');
    this.isRunning = true;
    this.state.isActive = true;
  }

  public stop(): void {
    if (!this.isRunning) return;

    console.log('[ResonanceEngine] Arrêt...');
    this.isRunning = false;
    this.state.isActive = false;
  }

  public reset(): void {
    this.state = getDefaultResonanceState();
    this.messageBuffer = [];
    console.log('[ResonanceEngine] État réinitialisé');
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════

  public setConfig(config: Partial<ResonanceEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public getConfig(): ResonanceEngineConfig {
    return { ...this.config };
  }

  public setStateUpdateCallback(callback: StateUpdateCallback): void {
    this.stateUpdateCallback = callback;
  }

  public setAdaptationCallback(callback: AdaptationCallback): void {
    this.adaptationCallback = callback;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - ANALYSE DE MESSAGE
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Analyse un message utilisateur et suggère une adaptation
   */
  public analyzeUserMessage(
    text: string,
    multimodalState?: MultimodalState,
    presenceState?: PresenceState
  ): UserMessageAnalysisResult {
    // Analyser le texte
    const analysis = this.analyzeLinguistics(text);

    // Ajouter au buffer
    this.addToMessageBuffer(text, true);

    // Mettre à jour l'état
    this.state.currentUserAnalysis = analysis;

    // Calculer l'adaptation suggérée
    const suggestedAdaptation = this.computeAdaptation(
      analysis,
      multimodalState,
      presenceState
    );

    // Calculer l'impact sur la résonance
    const resonanceImpact = this.computeResonanceScores(analysis, suggestedAdaptation);

    // Mettre à jour les préférences si apprentissage activé
    if (this.config.learningEnabled) {
      this.updatePreferences(analysis);
    }

    return { analysis, suggestedAdaptation, resonanceImpact };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - CALCUL DE RÉSONANCE
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Calcule les scores de résonance entre l'utilisateur et l'adaptation
   */
  public computeResonance(
    userAnalysis: LinguisticAnalysis,
    adaptation: LinguisticAdaptation
  ): ResonanceScores {
    return this.computeResonanceScores(userAnalysis, adaptation);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - ADAPTATION DU TON
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Adapte le ton en fonction du contexte
   */
  public adaptTone(
    baseTone: EmotionalTone,
    multimodalState?: MultimodalState,
    presenceState?: PresenceState
  ): ToneModulation {
    const modulation = getDefaultToneModulation();
    modulation.baseTone = baseTone;

    // Extraire les données multimodales
    const tension = multimodalState?.fusedScores?.globalTension?.value ?? 0.5;
    const energy = multimodalState?.fusedScores?.globalEnergy?.value ?? 0.5;

    // Ajuster selon la tension
    if (tension > 0.7) {
      modulation.baseTone = 'reassuring';
      modulation.undertones.push({ tone: 'calm', weight: 0.4 });
    } else if (tension > 0.5) {
      modulation.undertones.push({ tone: 'supportive', weight: 0.3 });
    }

    // Ajuster selon l'énergie
    if (energy < 0.3) {
      modulation.overallIntensity = 0.4;
      modulation.undertones.push({ tone: 'warm', weight: 0.3 });
    } else if (energy > 0.7) {
      modulation.overallIntensity = 0.7;
      if (tension < 0.4) {
        modulation.undertones.push({ tone: 'energetic', weight: 0.3 });
      }
    }

    // Ajuster selon la présence si disponible
    if (presenceState?.profile) {
      const presenceStyle = presenceState.profile.presenceStyle;
      if (presenceStyle === 'supportive') {
        modulation.baseTone = 'warm';
        modulation.undertones.push({ tone: 'supportive', weight: 0.5 });
      } else if (presenceStyle === 'directive') {
        modulation.baseTone = 'focused';
      }
    }

    // Définir les transitions préférées
    modulation.preferredTransitions = [
      { from: baseTone, to: modulation.baseTone, smoothness: 0.8 },
    ];

    // Mettre à jour l'état
    this.state.toneModulation = modulation;

    return modulation;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - SYNCHRONISATION DU RYTHME
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Synchronise le rythme conversationnel avec l'utilisateur
   */
  public synchronizeRhythm(
    userAnalysis: LinguisticAnalysis,
    multimodalState?: MultimodalState
  ): RhythmSynchronization {
    const sync = getDefaultRhythmSynchronization();

    // Adapter au rythme détecté
    sync.baseRhythm = userAnalysis.rhythm;
    sync.userRhythmMatch = 0.8; // Synchronisation élevée par défaut

    // Adapter la longueur des phrases
    sync.sentenceLength.target = Math.round(userAnalysis.averageSentenceLength);
    sync.sentenceLength.variance = Math.max(
      3,
      Math.round(userAnalysis.averageSentenceLength * 0.3)
    );

    // Ajuster selon l'énergie
    const energy = multimodalState?.fusedScores?.globalEnergy?.value ?? 0.5;
    if (energy < 0.4) {
      // Rythme plus lent pour basse énergie
      sync.baseRhythm = 'slow';
      sync.breathingPoints.frequency = 0.7;
      sync.sentenceLength.target = Math.min(sync.sentenceLength.target, 12);
    } else if (energy > 0.7) {
      // Rythme plus rapide pour haute énergie
      sync.baseRhythm = 'rapid';
      sync.breathingPoints.frequency = 0.3;
    }

    // Ajuster la latence de réponse
    if (userAnalysis.hesitationMarkers > 2) {
      sync.responseLatency = 'deliberate';
    } else if (userAnalysis.rhythm === 'rapid') {
      sync.responseLatency = 'immediate';
    }

    // Mettre à jour l'état
    this.state.rhythmSync = sync;

    return sync;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - GÉNÉRATION DES PARAMÈTRES DE RÉPONSE
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Génère les paramètres complets pour formuler une réponse
   */
  public generateResponseParameters(
    userMessage: string,
    multimodalState?: MultimodalState,
    presenceState?: PresenceState
  ): ResponseParametersResult {
    // Analyser le message
    const analysis =
      this.state.currentUserAnalysis ?? this.analyzeLinguistics(userMessage);

    // Calculer l'adaptation
    const adaptation = this.computeAdaptation(analysis, multimodalState, presenceState);

    // Adapter le ton
    const toneModulation = this.adaptTone(
      adaptation.targetTone,
      multimodalState,
      presenceState
    );

    // Synchroniser le rythme
    const rhythmSync = this.synchronizeRhythm(analysis, multimodalState);

    // Mettre à jour l'état
    this.state.currentAdaptation = adaptation;

    // Générer le résumé
    const styleSummary = this.generateStyleSummary(adaptation, toneModulation);

    // Notifier
    if (this.adaptationCallback) {
      this.adaptationCallback(adaptation);
    }

    return { adaptation, toneModulation, rhythmSync, styleSummary };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - MODULATION DE RÉPONSE
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Applique les modulations à une réponse textuelle
   */
  public modulateResponse(
    response: string,
    adaptation: LinguisticAdaptation,
    rhythmSync: RhythmSynchronization
  ): ResponseModulationResult {
    const originalLength = response.length;
    let modulated = response;
    const appliedModulations: string[] = [];

    // Ajouter des points de respiration si nécessaire
    if (rhythmSync.breathingPoints.frequency > 0.5) {
      modulated = this.addBreathingPoints(modulated);
      appliedModulations.push('breathing_points');
    }

    // Ajuster la verbosité si nécessaire
    if (adaptation.adjustments.verbosity < -0.3) {
      // Version plus concise (indication, pas de troncature)
      appliedModulations.push('reduced_verbosity');
    } else if (adaptation.adjustments.verbosity > 0.3) {
      appliedModulations.push('increased_verbosity');
    }

    // Ajouter au buffer
    this.addToMessageBuffer(modulated, false);

    // Calculer le score de résonance final
    const finalResonanceScore = this.state.currentResonance.overall;

    return {
      originalLength,
      modulatedLength: modulated.length,
      appliedModulations,
      finalResonanceScore,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - TRAITEMENT COMPLET
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Processus complet de mise à jour de la résonance
   */
  public process(
    userMessage: string,
    multimodalState?: MultimodalState,
    presenceState?: PresenceState
  ): {
    analysis: UserMessageAnalysisResult;
    parameters: ResponseParametersResult;
    resonance: ResonanceScores;
  } {
    // Analyser le message
    const analysis = this.analyzeUserMessage(userMessage, multimodalState, presenceState);

    // Générer les paramètres
    const parameters = this.generateResponseParameters(
      userMessage,
      multimodalState,
      presenceState
    );

    // Calculer la résonance
    const resonance = this.computeResonanceScores(
      analysis.analysis,
      parameters.adaptation
    );

    // Mettre à jour l'état
    this.state.currentResonance = resonance;
    this.state.lastUpdate = Date.now();

    // Enregistrer dans l'historique
    this.addToHistory(analysis.analysis, parameters.adaptation, resonance);

    // Notifier
    this.notifyStateUpdate();

    return { analysis, parameters, resonance };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API PUBLIQUE - ÉTAT
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Obtient l'état complet (lecture seule)
   */
  public getState(): ResonanceState {
    return { ...this.state };
  }

  /**
   * Obtient les préférences apprises de l'utilisateur
   */
  public getUserPreferences(): ResonanceState['profile']['preferences'] {
    return { ...this.state.profile.preferences };
  }

  /**
   * Génère un résumé de l'état de résonance
   */
  public generateStateSummary(): string {
    const { currentAdaptation, currentResonance, profile } = this.state;
    const lines: string[] = [];

    const styleLabel = RESONANCE_CONSTANTS.STYLE_LABELS[currentAdaptation.targetStyle];
    const toneLabel = RESONANCE_CONSTANTS.TONE_LABELS[currentAdaptation.targetTone];
    const rhythmLabel = RESONANCE_CONSTANTS.RHYTHM_LABELS[currentAdaptation.targetRhythm];

    lines.push(`Style: ${styleLabel}`);
    lines.push(`Ton: ${toneLabel}`);
    lines.push(`Rythme: ${rhythmLabel}`);
    lines.push(`Résonance: ${(currentResonance.overall * 100).toFixed(0)}%`);
    lines.push(`Interactions: ${profile.totalInteractions}`);

    return lines.join('\n');
  }

  // ═══════════════════════════════════════════════════════════════════════
  // LOGIQUE INTERNE - ANALYSE LINGUISTIQUE
  // ═══════════════════════════════════════════════════════════════════════

  private analyzeLinguistics(text: string): LinguisticAnalysis {
    const analysis = getDefaultLinguisticAnalysis();

    // Métriques de base
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

    analysis.wordCount = words.length;
    analysis.sentenceCount = Math.max(1, sentences.length);
    analysis.averageSentenceLength = analysis.wordCount / analysis.sentenceCount;
    analysis.averageWordLength =
      words.reduce((sum, w) => sum + w.length, 0) / Math.max(1, words.length);

    // Marqueurs
    analysis.questionCount = (text.match(/\?/g) || []).length;
    analysis.exclamationCount = (text.match(/!/g) || []).length;
    analysis.hesitationMarkers = this.countHesitationMarkers(text);
    analysis.emphasisMarkers = this.countEmphasisMarkers(text);

    // Complexité
    analysis.complexityScore = this.computeComplexityScore(text, words);
    analysis.vocabularyRichness = this.computeVocabularyRichness(words);
    analysis.readabilityScore = this.computeReadabilityScore(analysis);

    // Style détecté
    const styleResult = this.detectStyle(text, analysis);
    analysis.detectedStyle = styleResult.style;
    analysis.styleConfidence = styleResult.confidence;

    // Ton détecté
    const toneResult = this.detectTone(text, analysis);
    analysis.detectedTone = toneResult.tone;
    analysis.toneIntensity = toneResult.intensity;

    // Rythme
    analysis.rhythm = this.detectRhythm(analysis);
    analysis.pacingScore = this.computePacingScore(analysis);

    return analysis;
  }

  private countHesitationMarkers(text: string): number {
    const hesitations = [
      'euh',
      'hmm',
      'hum',
      'bof',
      'ben',
      'enfin',
      'bon',
      'genre',
      'voilà',
      '...',
    ];
    const lower = text.toLowerCase();
    return hesitations.filter(h => lower.includes(h)).length;
  }

  private countEmphasisMarkers(text: string): number {
    const emphases = [
      'vraiment',
      'absolument',
      'totalement',
      'complètement',
      'incroyable',
      'énorme',
    ];
    const lower = text.toLowerCase();
    return (
      emphases.filter(e => lower.includes(e)).length + (text.match(/!/g) || []).length
    );
  }

  private computeComplexityScore(text: string, words: string[]): number {
    // Facteurs de complexité
    const avgWordLength =
      words.reduce((s, w) => s + w.length, 0) / Math.max(1, words.length);
    const longWords = words.filter(w => w.length > 8).length / Math.max(1, words.length);
    const hasSubordinates = /qui|que|dont|où|lequel|laquelle/i.test(text);

    const score =
      (avgWordLength / 10) * 0.4 + longWords * 0.3 + (hasSubordinates ? 0.3 : 0);

    return Math.min(1, Math.max(0, score));
  }

  private computeVocabularyRichness(words: string[]): number {
    if (words.length === 0) return 0;
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    return uniqueWords.size / words.length;
  }

  private computeReadabilityScore(analysis: LinguisticAnalysis): number {
    // Score simplifié basé sur la longueur des phrases
    const idealLength = 15;
    const deviation = Math.abs(analysis.averageSentenceLength - idealLength);
    return Math.max(0, 1 - deviation / 20);
  }

  private detectStyle(
    text: string,
    analysis: LinguisticAnalysis
  ): { style: LinguisticStyle; confidence: number } {
    const _lower = text.toLowerCase();
    const scores: Partial<Record<LinguisticStyle, number>> = {
      formal: 0,
      casual: 0,
      technical: 0,
      direct: 0,
      empathetic: 0,
      neutral: 0.3,
    };

    // Formel
    if (/veuillez|cordialement|je vous prie/i.test(text))
      scores.formal = (scores.formal ?? 0) + 0.5;
    if (analysis.complexityScore > 0.6) scores.formal = (scores.formal ?? 0) + 0.2;

    // Casual
    if (/salut|coucou|cool|super|génial/i.test(text))
      scores.casual = (scores.casual ?? 0) + 0.4;
    if (analysis.hesitationMarkers > 1) scores.casual = (scores.casual ?? 0) + 0.2;

    // Technique
    if (/fonction|variable|algorithme|processus|système/i.test(text))
      scores.technical = (scores.technical ?? 0) + 0.4;

    // Direct
    if (analysis.averageSentenceLength < 10) scores.direct = (scores.direct ?? 0) + 0.3;
    if (analysis.questionCount === 0 && analysis.sentenceCount < 3)
      scores.direct = (scores.direct ?? 0) + 0.2;

    // Empathique
    if (/merci|s'il te plaît|j'apprécie|comprends/i.test(text))
      scores.empathetic = (scores.empathetic ?? 0) + 0.3;

    // Trouver le style dominant
    let maxScore = 0;
    let dominantStyle: LinguisticStyle = 'neutral';

    for (const [style, score] of Object.entries(scores)) {
      if ((score ?? 0) > maxScore) {
        maxScore = score ?? 0;
        dominantStyle = style as LinguisticStyle;
      }
    }

    return { style: dominantStyle, confidence: Math.min(1, maxScore) };
  }

  private detectTone(
    text: string,
    analysis: LinguisticAnalysis
  ): { tone: EmotionalTone; intensity: number } {
    const _lower = text.toLowerCase();
    const scores: Partial<Record<EmotionalTone, number>> = {
      neutral: 0.3,
    };

    // Chaleureux
    if (/merci|content|heureux|plaisir|super/i.test(text)) {
      scores.warm = (scores.warm ?? 0) + 0.4;
    }

    // Énergique
    if (analysis.exclamationCount > 0 || analysis.emphasisMarkers > 0) {
      scores.energetic = (scores.energetic ?? 0) + 0.3;
    }

    // Calme
    if (analysis.hesitationMarkers > 0 || analysis.averageSentenceLength > 15) {
      scores.calm = (scores.calm ?? 0) + 0.2;
    }

    // Sérieux
    if (analysis.complexityScore > 0.5 && analysis.exclamationCount === 0) {
      scores.serious = (scores.serious ?? 0) + 0.3;
    }

    // Trouver le ton dominant
    let maxScore = 0;
    let dominantTone: EmotionalTone = 'neutral';

    for (const [tone, score] of Object.entries(scores)) {
      if ((score ?? 0) > maxScore) {
        maxScore = score ?? 0;
        dominantTone = tone as EmotionalTone;
      }
    }

    return { tone: dominantTone, intensity: Math.min(1, maxScore + 0.3) };
  }

  private detectRhythm(analysis: LinguisticAnalysis): ConversationalRhythm {
    if (analysis.averageSentenceLength < 8) return 'rapid';
    if (analysis.averageSentenceLength > 20) return 'slow';
    return 'moderate';
  }

  private computePacingScore(analysis: LinguisticAnalysis): number {
    // Score de régularité du rythme
    return 0.5 + (analysis.readabilityScore - 0.5) * 0.5;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // LOGIQUE INTERNE - CALCUL D'ADAPTATION
  // ═══════════════════════════════════════════════════════════════════════

  private computeAdaptation(
    userAnalysis: LinguisticAnalysis,
    multimodalState?: MultimodalState,
    presenceState?: PresenceState
  ): LinguisticAdaptation {
    const adaptation = getDefaultLinguisticAdaptation();
    const prefs = this.state.profile.preferences;

    // Déterminer le type de synchronisation
    const syncType = this.determineSyncType(userAnalysis, multimodalState);
    adaptation.syncType = syncType;

    // Adapter le style
    if (syncType === 'mirroring') {
      adaptation.targetStyle = userAnalysis.detectedStyle;
      adaptation.syncStrength = 0.8;
    } else if (syncType === 'leading') {
      adaptation.targetStyle = prefs.preferredStyle;
      adaptation.syncStrength = 0.5;
    } else {
      // Compléter ou neutre
      adaptation.targetStyle = this.computeComplementaryStyle(userAnalysis.detectedStyle);
      adaptation.syncStrength = 0.6;
    }

    // Adapter le ton
    adaptation.targetTone = this.computeTargetTone(
      userAnalysis,
      multimodalState,
      presenceState
    );

    // Adapter la complexité
    adaptation.targetComplexity = this.computeTargetComplexity(userAnalysis);

    // Adapter le rythme
    adaptation.targetRhythm = userAnalysis.rhythm;

    // Calculer les ajustements fins
    adaptation.adjustments = this.computeDetailedAdjustments(
      userAnalysis,
      multimodalState
    );

    // Lisser avec l'adaptation précédente
    if (this.config.smoothingFactor > 0) {
      adaptation.toneIntensity = this.smoothValue(
        adaptation.toneIntensity,
        this.state.currentAdaptation.toneIntensity,
        this.config.smoothingFactor
      );
    }

    return adaptation;
  }

  private determineSyncType(
    userAnalysis: LinguisticAnalysis,
    multimodalState?: MultimodalState
  ): SyncType {
    const tension = multimodalState?.fusedScores?.globalTension?.value ?? 0.5;

    // Si tension élevée, compléter pour apaiser
    if (tension > 0.7) {
      return 'complementing';
    }

    // Si confiance élevée dans le style, miroir
    if (userAnalysis.styleConfidence > 0.6) {
      return 'mirroring';
    }

    // Si beaucoup d'interactions, guider
    if (
      this.state.profile.totalInteractions > 10 &&
      this.state.profile.preferences.confidence > 0.6
    ) {
      return 'leading';
    }

    return 'neutral';
  }

  private computeComplementaryStyle(userStyle: LinguisticStyle): LinguisticStyle {
    // Styles complémentaires
    const complements: Partial<Record<LinguisticStyle, LinguisticStyle>> = {
      formal: 'empathetic',
      casual: 'direct',
      technical: 'elaborated',
      direct: 'elaborated',
      elaborated: 'direct',
      empathetic: 'direct',
    };

    return complements[userStyle] ?? 'neutral';
  }

  private computeTargetTone(
    userAnalysis: LinguisticAnalysis,
    multimodalState?: MultimodalState,
    presenceState?: PresenceState
  ): EmotionalTone {
    const tension = multimodalState?.fusedScores?.globalTension?.value ?? 0.5;
    const energy = multimodalState?.fusedScores?.globalEnergy?.value ?? 0.5;

    // Haute tension → rassurant
    if (tension > 0.7) return 'reassuring';

    // Basse énergie → chaleureux
    if (energy < 0.3) return 'warm';

    // Style de présence
    if (presenceState?.profile?.presenceStyle === 'supportive') return 'supportive';
    if (presenceState?.profile?.presenceStyle === 'directive') return 'focused';

    // Miroir du ton utilisateur par défaut
    return userAnalysis.detectedTone;
  }

  private computeTargetComplexity(userAnalysis: LinguisticAnalysis): ComplexityLevel {
    if (userAnalysis.complexityScore < 0.3) return 'simple';
    if (userAnalysis.complexityScore < 0.5) return 'standard';
    if (userAnalysis.complexityScore < 0.7) return 'elevated';
    return 'expert';
  }

  private computeDetailedAdjustments(
    userAnalysis: LinguisticAnalysis,
    multimodalState?: MultimodalState
  ): LinguisticAdaptation['adjustments'] {
    const energy = multimodalState?.fusedScores?.globalEnergy?.value ?? 0.5;
    const tension = multimodalState?.fusedScores?.globalTension?.value ?? 0.5;

    return {
      verbosity: energy > 0.6 ? 0.2 : energy < 0.4 ? -0.3 : 0,
      formality:
        userAnalysis.detectedStyle === 'formal'
          ? 0.3
          : userAnalysis.detectedStyle === 'casual'
            ? -0.3
            : 0,
      warmth: tension > 0.5 ? 0.4 : 0.2,
      precision: userAnalysis.detectedStyle === 'technical' ? 0.6 : 0.3,
      creativity: userAnalysis.detectedStyle === 'poetic' ? 0.6 : 0.3,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // LOGIQUE INTERNE - CALCUL DE RÉSONANCE
  // ═══════════════════════════════════════════════════════════════════════

  private computeResonanceScores(
    userAnalysis: LinguisticAnalysis,
    adaptation: LinguisticAdaptation
  ): ResonanceScores {
    const scores = getDefaultResonanceScores();

    // Résonance lexicale (correspondance du vocabulaire)
    scores.lexical =
      adaptation.syncType === 'mirroring'
        ? 0.8
        : adaptation.syncType === 'complementing'
          ? 0.6
          : 0.5;

    // Résonance syntaxique (correspondance de la structure)
    const complexityMatch =
      1 -
      Math.abs(
        userAnalysis.complexityScore -
          (adaptation.targetComplexity === 'simple'
            ? 0.2
            : adaptation.targetComplexity === 'standard'
              ? 0.5
              : adaptation.targetComplexity === 'elevated'
                ? 0.7
                : 0.9)
      );
    scores.syntactic = complexityMatch;

    // Résonance sémantique (correspondance du sens)
    scores.semantic = userAnalysis.styleConfidence * adaptation.syncStrength;

    // Résonance prosodique (correspondance du rythme)
    scores.prosodic = userAnalysis.rhythm === adaptation.targetRhythm ? 0.9 : 0.6;

    // Résonance pragmatique (correspondance de l'intention)
    const toneMatch = userAnalysis.detectedTone === adaptation.targetTone ? 1 : 0.6;
    scores.pragmatic = toneMatch;

    // Score global pondéré
    const weights = RESONANCE_CONSTANTS.DIMENSION_WEIGHTS;
    scores.overall =
      scores.lexical * weights.lexical +
      scores.syntactic * weights.syntactic +
      scores.semantic * weights.semantic +
      scores.prosodic * weights.prosodic +
      scores.pragmatic * weights.pragmatic;

    return scores;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // LOGIQUE INTERNE - APPRENTISSAGE
  // ═══════════════════════════════════════════════════════════════════════

  private updatePreferences(analysis: LinguisticAnalysis): void {
    const prefs = this.state.profile.preferences;
    const lr = this.config.learningRate;

    // Mettre à jour le style préféré (moyenne mobile)
    if (analysis.styleConfidence > 0.5) {
      prefs.preferredStyle = analysis.detectedStyle;
    }

    // Mettre à jour le ton préféré
    if (analysis.toneIntensity > 0.5) {
      prefs.preferredTone = analysis.detectedTone;
    }

    // Mettre à jour la complexité préférée
    const newComplexity: ComplexityLevel =
      analysis.complexityScore < 0.3
        ? 'simple'
        : analysis.complexityScore < 0.5
          ? 'standard'
          : analysis.complexityScore < 0.7
            ? 'elevated'
            : 'expert';
    prefs.preferredComplexity = newComplexity;

    // Mettre à jour le rythme préféré
    prefs.preferredRhythm = analysis.rhythm;

    // Mettre à jour les sensibilités
    prefs.sensitivities.toFormality = this.smoothValue(
      analysis.detectedStyle === 'formal' ? 0.8 : 0.2,
      prefs.sensitivities.toFormality,
      1 - lr
    );

    prefs.sensitivities.toTechnicalLanguage = this.smoothValue(
      analysis.detectedStyle === 'technical' ? 0.8 : 0.3,
      prefs.sensitivities.toTechnicalLanguage,
      1 - lr
    );

    // Incrémenter le compteur
    prefs.sampleSize++;
    prefs.confidence = Math.min(1, prefs.sampleSize / 20);

    this.state.profile.preferences = prefs;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // LOGIQUE INTERNE - UTILITAIRES
  // ═══════════════════════════════════════════════════════════════════════

  private smoothValue(newValue: number, oldValue: number, smoothing: number): number {
    return oldValue * smoothing + newValue * (1 - smoothing);
  }

  private addToMessageBuffer(text: string, isUser: boolean): void {
    this.messageBuffer.push({
      text,
      isUser,
      timestamp: Date.now(),
    });

    if (this.messageBuffer.length > this.MAX_MESSAGE_BUFFER) {
      this.messageBuffer.shift();
    }
  }

  private addToHistory(
    analysis: LinguisticAnalysis,
    adaptation: LinguisticAdaptation,
    scores: ResonanceScores
  ): void {
    const entry: ResonanceHistoryEntry = {
      timestamp: Date.now(),
      userAnalysis: analysis,
      adaptation,
      resonanceScores: scores,
    };

    this.state.profile.history.push(entry);

    // Limiter la taille
    if (this.state.profile.history.length > this.config.maxHistoryEntries) {
      this.state.profile.history = this.state.profile.history.slice(
        -this.config.maxHistoryEntries
      );
    }

    // Mettre à jour les statistiques
    this.state.profile.totalInteractions++;
    this.state.profile.averageResonance =
      (this.state.profile.averageResonance * (this.state.profile.totalInteractions - 1) +
        scores.overall) /
      this.state.profile.totalInteractions;

    if (scores.overall > this.state.profile.bestResonanceScore) {
      this.state.profile.bestResonanceScore = scores.overall;
    }

    this.state.profile.lastUpdate = Date.now();
  }

  private addBreathingPoints(text: string): string {
    // Ajouter des pauses visuelles entre les phrases longues
    const sentences = text.split(/(?<=[.!?])\s+/);

    if (sentences.length <= 2) return text;

    const result: string[] = [];
    for (let i = 0; i < sentences.length; i++) {
      result.push(sentences[i]);
      if ((i + 1) % 2 === 0 && i < sentences.length - 1) {
        result.push('');
      }
    }

    return result.join('\n');
  }

  private generateStyleSummary(
    adaptation: LinguisticAdaptation,
    tone: ToneModulation
  ): string {
    const styleLabel = RESONANCE_CONSTANTS.STYLE_LABELS[adaptation.targetStyle];
    const toneLabel = RESONANCE_CONSTANTS.TONE_LABELS[tone.baseTone];
    const rhythmLabel = RESONANCE_CONSTANTS.RHYTHM_LABELS[adaptation.targetRhythm];

    return `Style ${styleLabel}, ton ${toneLabel}, rythme ${rhythmLabel}`;
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

export { ConversationalResonanceEngine };
export default ConversationalResonanceEngine.getInstance();
