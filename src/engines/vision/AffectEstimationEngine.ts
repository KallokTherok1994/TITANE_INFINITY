/**
 * TITANE∞ vΩ∞ — AFFECT ESTIMATION ENGINE
 * Super Prompt #9: Conversion scores → indices d'état non-cliniques
 *
 * Responsabilités:
 * - Transformer scores langage corporel en indices (energy, tension, engagement)
 * - Gérer la confiance des estimations
 * - Maintenir l'historique
 * - Appliquer la baseline personnalisée
 *
 * ⚠️ GARDE-FOUS ÉTHIQUES (NON NÉGOCIABLES):
 * - Ces estimations sont APPROXIMATIVES et potentiellement BIAISÉES
 * - Biais connus : couleur de peau, genre, âge, culture, éclairage
 * - Ne JAMAIS utiliser pour diagnostic clinique
 * - Toujours formuler avec prudence et nuance
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import type {
  AffectEstimationState,
  BodyLanguageState,
  VisualLevel,
  AffectHistoryEntry,
  ConfidenceFactors,
  VisualBaselineProfile,
  BaselineSignature,
} from '@/types/visionAffect';

import { getDefaultAffectEstimationState } from '@/types/visionAffect';

import {
  DEFAULT_THRESHOLDS,
  SCORE_WEIGHTS,
  CONFIDENCE_CONFIG,
  PERFORMANCE_BUDGETS,
} from '@/config/visionAffect.config';

// ============================================================================
// TYPES INTERNES
// ============================================================================

interface TimeContext {
  hourOfDay: number;        // 0-23
  dayOfWeek: number;        // 0-6
  sessionDurationMs: number;
}

type AffectStateUpdater = (state: Partial<AffectEstimationState>) => void;

// ============================================================================
// AFFECT ESTIMATION ENGINE CLASS
// ============================================================================

/**
 * AffectEstimationEngine v∞
 *
 * Convertit les scores de langage corporel en indices d'état non-cliniques.
 *
 * ⚠️ AVERTISSEMENT CRITIQUE:
 * Les estimations produites sont des APPROXIMATIONS basées sur des heuristiques.
 * Elles NE représentent PAS l'état émotionnel réel de l'utilisateur.
 * Elles sont potentiellement BIAISÉES (couleur de peau, genre, âge, culture).
 * Ne JAMAIS les utiliser pour des décisions critiques ou médicales.
 */
export class AffectEstimationEngine {
  private static instance: AffectEstimationEngine | null = null;

  // État
  private state: AffectEstimationState;

  // Baseline personnalisée
  private baseline: VisualBaselineProfile | null = null;

  // Callbacks
  private stateUpdater: AffectStateUpdater | null = null;

  // Buffer de scores récents pour stabilité
  private recentScores: {
    energy: number[];
    tension: number[];
    engagement: number[];
  } = {
    energy: [],
    tension: [],
    engagement: [],
  };

  private readonly scoreBufferSize = 10;

  private constructor() {
    this.state = getDefaultAffectEstimationState();
  }

  /**
   * Singleton pattern
   */
  static getInstance(): AffectEstimationEngine {
    if (!AffectEstimationEngine.instance) {
      AffectEstimationEngine.instance = new AffectEstimationEngine();
    }
    return AffectEstimationEngine.instance;
  }

  /**
   * Réinitialise l'instance
   */
  static resetInstance(): void {
    AffectEstimationEngine.instance = null;
  }

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  /**
   * Configure le callback de mise à jour d'état
   */
  setStateUpdater(updater: AffectStateUpdater): void {
    this.stateUpdater = updater;
  }

  /**
   * Définit la baseline personnalisée
   */
  setBaseline(baseline: VisualBaselineProfile): void {
    this.baseline = baseline;
    this.updateState({ baselineProfile: baseline });
    console.log('[AffectEstimationEngine] Baseline personnalisée appliquée');
  }

  /**
   * Réinitialise la baseline
   */
  clearBaseline(): void {
    this.baseline = null;
    this.updateState({ baselineProfile: undefined });
    console.log('[AffectEstimationEngine] Baseline réinitialisée aux valeurs par défaut');
  }

  // ============================================================================
  // ESTIMATION PRINCIPALE
  // ============================================================================

  /**
   * Estime l'état visuel à partir du langage corporel
   *
   * @param bodyState - État du langage corporel (scores)
   * @param timeContext - Contexte temporel (heure, durée session)
   * @returns Nouvel état d'affect estimé
   *
   * ⚠️ RAPPEL: Ces estimations sont APPROXIMATIVES et potentiellement BIAISÉES
   */
  estimateVisualState(
    bodyState: BodyLanguageState,
    timeContext?: TimeContext
  ): AffectEstimationState {
    const timestamp = Date.now();

    // Si pas de landmarks détectés, retourner état par défaut avec faible confiance
    if (!bodyState.landmarksDetected || bodyState.confidence < CONFIDENCE_CONFIG.minAcceptableConfidence) {
      return this.createLowConfidenceState(timestamp);
    }

    // Calculer les scores bruts combinés
    const rawEnergyScore = this.computeRawEnergyScore(bodyState);
    const rawTensionScore = this.computeRawTensionScore(bodyState);
    const rawEngagementScore = this.computeRawEngagementScore(bodyState);

    // Appliquer la baseline si disponible
    const adjustedScores = this.applyBaseline({
      energy: rawEnergyScore,
      tension: rawTensionScore,
      engagement: rawEngagementScore,
    });

    // Appliquer le contexte temporel
    const contextAdjustedScores = this.applyTimeContext(adjustedScores, timeContext);

    // Lisser les scores pour stabilité
    const smoothedScores = this.smoothScores(contextAdjustedScores);

    // Convertir en niveaux discrets
    const energyLevel = this.scoreToLevel(smoothedScores.energy, 'energy');
    const tensionLevel = this.scoreToLevel(smoothedScores.tension, 'tension');
    const engagementLevel = this.scoreToLevel(smoothedScores.engagement, 'engagement');

    // Calculer les facteurs de confiance
    const confidenceFactors = this.computeConfidenceFactors(bodyState);
    const overallConfidence = this.computeOverallConfidence(confidenceFactors, bodyState);

    // Créer l'entrée historique
    const historyEntry: AffectHistoryEntry = {
      timestamp,
      energy: energyLevel,
      tension: tensionLevel,
      engagement: engagementLevel,
      confidence: overallConfidence,
    };

    // Mettre à jour l'historique (limité)
    const newHistory = [...this.state.history, historyEntry]
      .slice(-PERFORMANCE_BUDGETS.maxHistoryEntries);

    // Créer le nouvel état
    const newState: AffectEstimationState = {
      visualEnergyLevel: energyLevel,
      visualTensionLevel: tensionLevel,
      visualEngagementLevel: engagementLevel,
      confidence: overallConfidence,
      confidenceFactors,
      history: newHistory,
      baselineProfile: this.baseline ?? undefined,
      lastEstimationTimestamp: timestamp,
      estimationCount: this.state.estimationCount + 1,
    };

    this.updateState(newState);
    return newState;
  }

  // ============================================================================
  // CALCUL DES SCORES BRUTS
  // ============================================================================

  /**
   * Calcule le score d'énergie brut
   *
   * Combinaison pondérée : posture + mouvement + stabilité regard
   */
  private computeRawEnergyScore(bodyState: BodyLanguageState): number {
    const weights = SCORE_WEIGHTS.energy;

    return (
      bodyState.postureScore * weights.posture +
      bodyState.movementScore * weights.movement +
      bodyState.gazeStabilityScore * weights.gazeStability
    );
  }

  /**
   * Calcule le score de tension brut
   *
   * Basé sur : mouvement agité + posture fermée + asymétrie
   */
  private computeRawTensionScore(bodyState: BodyLanguageState): number {
    const weights = SCORE_WEIGHTS.tension;

    // Pour la tension, on inverse certains scores
    // Mouvement élevé = tension
    // Posture basse = tension (inversée)
    // Asymétrie = tension (inversée)
    const tensionFromMovement = bodyState.movementScore;
    const tensionFromPosture = 1 - bodyState.postureScore;
    const tensionFromAsymmetry = 1 - bodyState.shoulderSymmetry;
    const tensionFromHeadTilt = Math.abs(bodyState.headTilt);

    return (
      tensionFromMovement * weights.movement +
      tensionFromPosture * weights.posture +
      tensionFromAsymmetry * weights.shoulderSymmetry +
      tensionFromHeadTilt * weights.headTilt
    );
  }

  /**
   * Calcule le score d'engagement brut
   *
   * Basé sur : stabilité regard + posture ouverte + activité faciale
   */
  private computeRawEngagementScore(bodyState: BodyLanguageState): number {
    const weights = SCORE_WEIGHTS.engagement;

    return (
      bodyState.gazeStabilityScore * weights.gazeStability +
      bodyState.postureScore * weights.posture +
      bodyState.facialActivity * weights.facialActivity
    );
  }

  // ============================================================================
  // AJUSTEMENTS
  // ============================================================================

  /**
   * Applique la baseline personnalisée aux scores
   */
  private applyBaseline(scores: {
    energy: number;
    tension: number;
    engagement: number;
  }): typeof scores {
    if (!this.baseline || !this.baseline.isCalibrated) {
      return scores;
    }

    return {
      energy: this.applySignatureToScore(scores.energy, this.baseline.energySignature),
      tension: this.applySignatureToScore(scores.tension, this.baseline.tensionSignature),
      engagement: this.applySignatureToScore(scores.engagement, this.baseline.engagementSignature),
    };
  }

  /**
   * Applique une signature baseline à un score
   */
  private applySignatureToScore(score: number, signature: BaselineSignature): number {
    // Normaliser par rapport à la moyenne de l'utilisateur
    const deviation = score - signature.averageScore;
    const normalizedDeviation = deviation / (signature.standardDeviation || 0.1);

    // Re-mapper sur 0-1 centré sur 0.5
    return Math.max(0, Math.min(1, 0.5 + normalizedDeviation * 0.25));
  }

  /**
   * Applique le contexte temporel
   *
   * Ajuste légèrement les scores selon l'heure et la durée de session
   */
  private applyTimeContext(
    scores: { energy: number; tension: number; engagement: number },
    timeContext?: TimeContext
  ): typeof scores {
    if (!timeContext) {
      return scores;
    }

    let energyAdjustment = 0;
    let tensionAdjustment = 0;

    // Ajustement selon l'heure (simplifié)
    const hour = timeContext.hourOfDay;

    // Énergie naturellement plus basse en début d'après-midi
    if (hour >= 13 && hour <= 15) {
      energyAdjustment -= 0.05;
    }

    // Énergie plus basse tard le soir
    if (hour >= 22 || hour <= 5) {
      energyAdjustment -= 0.1;
    }

    // Session longue = fatigue potentielle
    const sessionHours = timeContext.sessionDurationMs / (1000 * 60 * 60);
    if (sessionHours > 2) {
      energyAdjustment -= 0.05 * Math.min(sessionHours - 2, 2);
      tensionAdjustment += 0.03 * Math.min(sessionHours - 2, 2);
    }

    return {
      energy: Math.max(0, Math.min(1, scores.energy + energyAdjustment)),
      tension: Math.max(0, Math.min(1, scores.tension + tensionAdjustment)),
      engagement: scores.engagement, // Pas d'ajustement temporel pour l'engagement
    };
  }

  /**
   * Lisse les scores pour réduire le jitter
   */
  private smoothScores(scores: {
    energy: number;
    tension: number;
    engagement: number;
  }): typeof scores {
    // Ajouter au buffer
    this.recentScores.energy.push(scores.energy);
    this.recentScores.tension.push(scores.tension);
    this.recentScores.engagement.push(scores.engagement);

    // Limiter la taille
    if (this.recentScores.energy.length > this.scoreBufferSize) {
      this.recentScores.energy.shift();
      this.recentScores.tension.shift();
      this.recentScores.engagement.shift();
    }

    // Calculer la moyenne mobile
    return {
      energy: this.average(this.recentScores.energy),
      tension: this.average(this.recentScores.tension),
      engagement: this.average(this.recentScores.engagement),
    };
  }

  /**
   * Calcule la moyenne d'un tableau
   */
  private average(arr: number[]): number {
    if (arr.length === 0) return 0.5;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  // ============================================================================
  // CONVERSION SCORE → NIVEAU
  // ============================================================================

  /**
   * Convertit un score (0-1) en niveau discret (low/medium/high)
   */
  private scoreToLevel(
    score: number,
    type: 'energy' | 'tension' | 'engagement'
  ): VisualLevel {
    const thresholds = this.getThresholds(type);

    if (score < thresholds.low) {
      return 'low';
    } else if (score > thresholds.high) {
      return 'high';
    } else {
      return 'medium';
    }
  }

  /**
   * Récupère les seuils (baseline ou défaut)
   */
  private getThresholds(type: 'energy' | 'tension' | 'engagement'): {
    low: number;
    high: number;
  } {
    // Si baseline calibrée, utiliser ses seuils
    if (this.baseline && this.baseline.isCalibrated) {
      const signature = this.baseline[`${type}Signature`];
      return {
        low: signature.lowThreshold,
        high: signature.highThreshold,
      };
    }

    // Sinon, utiliser les seuils par défaut
    return DEFAULT_THRESHOLDS[type];
  }

  // ============================================================================
  // CONFIANCE
  // ============================================================================

  /**
   * Calcule les facteurs de confiance détaillés
   */
  private computeConfidenceFactors(bodyState: BodyLanguageState): ConfidenceFactors {
    return {
      landmarkQuality: bodyState.confidence,
      temporalStability: this.computeTemporalStability(),
      lightingConditions: this.estimateLightingQuality(bodyState),
      faceVisibility: bodyState.landmarksDetected ? 0.8 : 0.2,
    };
  }

  /**
   * Calcule la stabilité temporelle des scores
   */
  private computeTemporalStability(): number {
    if (this.recentScores.energy.length < 3) {
      return 0.5;
    }

    // Calculer la variance des scores récents
    const energyVariance = this.variance(this.recentScores.energy);
    const tensionVariance = this.variance(this.recentScores.tension);
    const engagementVariance = this.variance(this.recentScores.engagement);

    const avgVariance = (energyVariance + tensionVariance + engagementVariance) / 3;

    // Faible variance = haute stabilité
    return Math.max(0, 1 - avgVariance * 10);
  }

  /**
   * Estime la qualité de l'éclairage (approximatif)
   */
  private estimateLightingQuality(bodyState: BodyLanguageState): number {
    // Utiliser la confiance des landmarks comme proxy
    // Une bonne lumière = meilleure détection
    return Math.min(1, bodyState.confidence * 1.2);
  }

  /**
   * Calcule la confiance globale
   */
  private computeOverallConfidence(
    factors: ConfidenceFactors,
    bodyState: BodyLanguageState
  ): number {
    const weights = CONFIDENCE_CONFIG.weights;

    let confidence =
      factors.landmarkQuality * weights.landmarkQuality +
      factors.temporalStability * weights.temporalStability +
      factors.lightingConditions * weights.lightingConditions +
      factors.faceVisibility * weights.faceVisibility;

    // Pénaliser si trop peu de frames
    if (this.state.estimationCount < 30) {
      confidence *= 0.7;
    }

    return Math.min(1, Math.max(0, confidence));
  }

  /**
   * Calcule la variance d'un tableau
   */
  private variance(arr: number[]): number {
    if (arr.length < 2) return 0;
    const avg = this.average(arr);
    return arr.reduce((sum, val) => sum + (val - avg) ** 2, 0) / arr.length;
  }

  // ============================================================================
  // ÉTAT BASSE CONFIANCE
  // ============================================================================

  /**
   * Crée un état avec faible confiance (pas de landmarks fiables)
   */
  private createLowConfidenceState(timestamp: number): AffectEstimationState {
    return {
      ...this.state,
      confidence: 0.1,
      confidenceFactors: {
        landmarkQuality: 0,
        temporalStability: 0.5,
        lightingConditions: 0.5,
        faceVisibility: 0,
      },
      lastEstimationTimestamp: timestamp,
    };
  }

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  /**
   * Met à jour l'état et notifie
   */
  private updateState(newState: Partial<AffectEstimationState>): void {
    this.state = { ...this.state, ...newState };

    if (this.stateUpdater) {
      this.stateUpdater(newState);
    }
  }

  /**
   * Retourne l'état actuel
   */
  getState(): AffectEstimationState {
    return { ...this.state };
  }

  /**
   * Retourne l'historique
   */
  getHistory(): AffectHistoryEntry[] {
    return [...this.state.history];
  }

  /**
   * Vide l'historique
   */
  clearHistory(): void {
    this.updateState({ history: [] });
    this.recentScores = { energy: [], tension: [], engagement: [] };
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  /**
   * Réinitialise le moteur
   */
  reset(): void {
    this.state = getDefaultAffectEstimationState();
    this.baseline = null;
    this.recentScores = { energy: [], tension: [], engagement: [] };
    this.stateUpdater = null;
  }
}

// ============================================================================
// EXPORTS FONCTIONNELS
// ============================================================================

let engineInstance: AffectEstimationEngine | null = null;

/**
 * Initialise le AffectEstimationEngine
 */
export function initAffectEstimationEngine(): AffectEstimationEngine {
  engineInstance = AffectEstimationEngine.getInstance();
  return engineInstance;
}

/**
 * Récupère l'instance
 */
export function getAffectEstimationEngine(): AffectEstimationEngine | null {
  return engineInstance;
}

/**
 * Estime l'état visuel (raccourci)
 */
export function estimateAffect(
  bodyState: BodyLanguageState,
  timeContext?: TimeContext
): AffectEstimationState | null {
  return engineInstance?.estimateVisualState(bodyState, timeContext) ?? null;
}
