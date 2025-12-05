/**
 * TITANE∞ vΩ∞ — TRAINING BASELINE ENGINE
 * Super Prompt OPUS v∞.2: Apprentissage visuel-personnel adaptatif
 *
 * Ce moteur apprend le comportement naturel et unique de l'utilisateur
 * à partir de son langage corporel, sa posture, ses mouvements,
 * son énergie visuelle, sa tension et son engagement.
 *
 * ⚠️ GARDE-FOUS ÉTHIQUES (NON NÉGOCIABLES):
 * - Données abstraites uniquement (pas d'images stockées)
 * - Indices et probabilités, jamais de certitudes
 * - 100% local, aucune donnée vers le cloud
 * - Apprentissage supervisé (l'utilisateur valide)
 * - Pas de diagnostic clinique
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import type {
  TrainingBaselineProfile,
  TrainingSession,
  TrainingSnapshot,
  TrainingResult,
  StatisticalSignature,
  StateSignature,
  UserStateLabel,
  PersonalizedThresholds,
} from '@/types/trainingBaseline';

import {
  getDefaultTrainingBaselineProfile,
  getDefaultTrainingSession,
  getDefaultStatisticalSignature,
} from '@/types/trainingBaseline';

import type { BodyLanguageState, AffectEstimationState } from '@/types/visionAffect';

// ============================================================================
// CONFIGURATION
// ============================================================================

export const TRAINING_CONFIG = {
  /** Durée par défaut d'une capture (ms) */
  defaultCaptureDuration: 5000,

  /** Durée minimale (ms) */
  minCaptureDuration: 2000,

  /** Durée maximale (ms) */
  maxCaptureDuration: 15000,

  /** Frames minimum pour un snapshot valide */
  minFramesForValidSnapshot: 10,

  /** Frames maximum à stocker par snapshot */
  maxFramesPerSnapshot: 150,

  /** Échantillons max par signature */
  maxSamplesPerSignature: 300,

  /** Facteur EMA (Exponential Moving Average) */
  emaAlpha: 0.2,

  /** Seuil de confiance minimum pour inclure une frame */
  minConfidenceThreshold: 0.3,

  /** Nombre de sessions pour considérer calibré */
  sessionsForCalibration: 5,

  /** Intervalle entre les frames (ms) - ~15 FPS */
  frameIntervalMs: 66,
} as const;

// ============================================================================
// TYPES INTERNES
// ============================================================================

interface FrameData {
  timestamp: number;
  posture: number;
  movement: number;
  gaze: number;
  energy: number;
  tension: number;
  engagement: number;
  confidence: number;
}

type ProfileUpdater = (profile: TrainingBaselineProfile) => void;
type SessionUpdater = (session: TrainingSession | null) => void;

// ============================================================================
// TRAINING BASELINE ENGINE CLASS
// ============================================================================

/**
 * TrainingBaselineEngine v∞.2
 *
 * Moteur d'apprentissage du comportement naturel de l'utilisateur.
 * Construit un profil baseline personnalisé qui s'affine avec le temps.
 *
 * ⚠️ Ne produit que des indices et probabilités, jamais de certitudes.
 */
export class TrainingBaselineEngine {
  private static instance: TrainingBaselineEngine | null = null;

  // État
  private profile: TrainingBaselineProfile;
  private currentSession: TrainingSession | null = null;
  private isCapturing: boolean = false;
  private captureIntervalId: number | null = null;

  // Callbacks
  private profileUpdater: ProfileUpdater | null = null;
  private sessionUpdater: SessionUpdater | null = null;

  // Historique des snapshots (en mémoire, non persisté)
  private recentSnapshots: TrainingSnapshot[] = [];
  private maxRecentSnapshots: number = 20;

  private constructor() {
    this.profile = getDefaultTrainingBaselineProfile();
    this.profile.profileId = this.generateProfileId();
    this.profile.createdAt = Date.now();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SINGLETON
  // ═══════════════════════════════════════════════════════════════════════════

  static getInstance(): TrainingBaselineEngine {
    if (!TrainingBaselineEngine.instance) {
      TrainingBaselineEngine.instance = new TrainingBaselineEngine();
    }
    return TrainingBaselineEngine.instance;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALISATION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Initialise le moteur avec un profil existant (si disponible)
   */
  initialize(existingProfile?: TrainingBaselineProfile): void {
    if (existingProfile) {
      this.profile = { ...existingProfile };
      console.log('[TrainingBaselineEngine] Loaded existing profile:', this.profile.profileId);
    } else {
      console.log('[TrainingBaselineEngine] Created new profile:', this.profile.profileId);
    }
  }

  /**
   * Définit le callback pour les mises à jour du profil
   */
  setProfileUpdater(updater: ProfileUpdater): void {
    this.profileUpdater = updater;
  }

  /**
   * Définit le callback pour les mises à jour de session
   */
  setSessionUpdater(updater: SessionUpdater): void {
    this.sessionUpdater = updater;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CAPTURE D'ENTRAÎNEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Démarre une session d'entraînement pour un état donné
   *
   * @param label - L'état déclaré par l'utilisateur (calm, stressed, etc.)
   * @param durationMs - Durée de capture en ms (défaut: 5000)
   * @returns TrainingSession créée
   */
  startTrainingCapture(
    label: UserStateLabel,
    durationMs: number = TRAINING_CONFIG.defaultCaptureDuration
  ): TrainingSession {
    // Validation durée
    const clampedDuration = Math.max(
      TRAINING_CONFIG.minCaptureDuration,
      Math.min(TRAINING_CONFIG.maxCaptureDuration, durationMs)
    );

    // Annuler toute capture en cours
    if (this.isCapturing) {
      this.cancelCapture();
    }

    // Créer la session
    this.currentSession = getDefaultTrainingSession(label, clampedDuration);
    this.currentSession.status = 'capturing';
    this.currentSession.userMessage = `J'observe ton état "${label}" pendant quelques secondes...`;

    this.isCapturing = true;
    this.notifySessionUpdate();

    console.log(`[TrainingBaselineEngine] Started capture for "${label}" (${clampedDuration}ms)`);

    return this.currentSession;
  }

  /**
   * Ajoute une frame de données pendant la capture
   * Appelé par le VisionEngine à chaque frame
   */
  addFrameData(
    bodyLanguage: BodyLanguageState,
    affect: AffectEstimationState
  ): void {
    if (!this.isCapturing || !this.currentSession) {
      return;
    }

    // Vérifier confiance minimum
    if (bodyLanguage.confidence < TRAINING_CONFIG.minConfidenceThreshold) {
      return;
    }

    // Extraire les données
    const frame: FrameData = {
      timestamp: Date.now(),
      posture: bodyLanguage.postureScore,
      movement: bodyLanguage.movementScore,
      gaze: bodyLanguage.gazeStabilityScore,
      energy: this.levelToScore(affect.visualEnergyLevel),
      tension: this.levelToScore(affect.visualTensionLevel),
      engagement: this.levelToScore(affect.visualEngagementLevel),
      confidence: affect.confidence,
    };

    // Ajouter aux scores en cours
    const scores = this.currentSession.collectingScores;
    scores.posture.push(frame.posture);
    scores.movement.push(frame.movement);
    scores.gaze.push(frame.gaze);
    scores.energy.push(frame.energy);
    scores.tension.push(frame.tension);
    scores.engagement.push(frame.engagement);
    scores.confidence.push(frame.confidence);

    this.currentSession.framesCollected++;

    // Calculer progression
    const elapsed = Date.now() - this.currentSession.startedAt;
    this.currentSession.progress = Math.min(
      100,
      Math.round((elapsed / this.currentSession.targetDurationMs) * 100)
    );

    // Limiter le nombre de frames
    if (this.currentSession.framesCollected >= TRAINING_CONFIG.maxFramesPerSnapshot) {
      // Trop de frames, on finalise
      this.finalizeCapture();
    }
  }

  /**
   * Finalise la capture et crée le snapshot
   */
  async finalizeCapture(): Promise<TrainingResult> {
    if (!this.isCapturing || !this.currentSession) {
      return {
        success: false,
        sessionId: '',
        label: 'neutral',
        snapshot: null,
        summary: { postureScore: 0, movementScore: 0, gazeScore: 0, description: '' },
        baselineChanges: { thresholdsAdjusted: false, newSamplesAdded: 0, confidenceChange: 0 },
        userMessage: "Aucune session d'entraînement en cours.",
      };
    }

    this.isCapturing = false;
    this.currentSession.status = 'processing';
    this.notifySessionUpdate();

    const session = this.currentSession;
    // const scores = session.collectingScores; // Used by createSnapshot internally

    // Vérifier assez de frames
    if (session.framesCollected < TRAINING_CONFIG.minFramesForValidSnapshot) {
      this.currentSession.status = 'cancelled';
      this.currentSession.userMessage = `Pas assez de données collectées (${session.framesCollected} frames). Réessaie en restant visible.`;
      this.notifySessionUpdate();

      const result: TrainingResult = {
        success: false,
        sessionId: session.sessionId,
        label: session.targetLabel,
        snapshot: null,
        summary: { postureScore: 0, movementScore: 0, gazeScore: 0, description: '' },
        baselineChanges: { thresholdsAdjusted: false, newSamplesAdded: 0, confidenceChange: 0 },
        userMessage: this.currentSession.userMessage,
      };

      this.currentSession = null;
      return result;
    }

    // Créer le snapshot
    const snapshot = this.createSnapshot(session);

    // Mettre à jour le baseline
    const baselineChanges = this.updateBaselineProfile(snapshot);

    // Créer le résultat
    const result: TrainingResult = {
      success: true,
      sessionId: session.sessionId,
      label: session.targetLabel,
      snapshot,
      summary: {
        postureScore: snapshot.scores.posture.mean,
        movementScore: snapshot.scores.movement.mean,
        gazeScore: snapshot.scores.gaze.mean,
        description: this.generateSummaryDescription(snapshot),
      },
      baselineChanges,
      userMessage: this.generateResultMessage(snapshot, baselineChanges),
    };

    // Sauvegarder le snapshot
    this.addRecentSnapshot(snapshot);

    // Finaliser la session
    this.currentSession.status = 'completed';
    this.currentSession.userMessage = result.userMessage;
    this.notifySessionUpdate();
    this.notifyProfileUpdate();

    console.log(`[TrainingBaselineEngine] Capture completed for "${session.targetLabel}"`);

    // Reset session après un délai
    setTimeout(() => {
      this.currentSession = null;
      this.notifySessionUpdate();
    }, 500);

    return result;
  }

  /**
   * Annule la capture en cours
   */
  cancelCapture(): void {
    if (!this.isCapturing) return;

    this.isCapturing = false;
    if (this.currentSession) {
      this.currentSession.status = 'cancelled';
      this.currentSession.userMessage = 'Capture annulée.';
      this.notifySessionUpdate();
    }

    console.log('[TrainingBaselineEngine] Capture cancelled');

    setTimeout(() => {
      this.currentSession = null;
      this.notifySessionUpdate();
    }, 300);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CRÉATION DE SNAPSHOT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Crée un snapshot à partir des données collectées
   */
  private createSnapshot(session: TrainingSession): TrainingSnapshot {
    const scores = session.collectingScores;
    const now = Date.now();

    return {
      id: `snapshot-${now}-${Math.random().toString(36).substr(2, 9)}`,
      label: session.targetLabel,
      startedAt: session.startedAt,
      endedAt: now,
      durationMs: now - session.startedAt,
      framesCollected: session.framesCollected,
      scores: {
        posture: this.computeScoreStats(scores.posture),
        movement: this.computeScoreStats(scores.movement),
        gaze: this.computeScoreStats(scores.gaze),
        energy: this.computeScoreStats(scores.energy),
        tension: this.computeScoreStats(scores.tension),
        engagement: this.computeScoreStats(scores.engagement),
      },
      averageConfidence: this.computeMean(scores.confidence),
      context: {
        hourOfDay: new Date().getHours(),
        dayOfWeek: new Date().getDay(),
      },
      userValidated: true, // Par défaut validé
    };
  }

  /**
   * Calcule les statistiques pour un ensemble de scores
   */
  private computeScoreStats(
    values: number[]
  ): { values: number[]; mean: number; variance: number } {
    if (values.length === 0) {
      return { values: [], mean: 0.5, variance: 0 };
    }

    const mean = this.computeMean(values);
    const variance = this.computeVariance(values, mean);

    return {
      values: values.slice(-50), // Garder les 50 dernières
      mean,
      variance,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MISE À JOUR DU BASELINE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Met à jour le profil baseline avec un nouveau snapshot
   */
  private updateBaselineProfile(
    snapshot: TrainingSnapshot
  ): { thresholdsAdjusted: boolean; newSamplesAdded: number; confidenceChange: number } {
    const prevConfidence = this.profile.profileConfidence;
    let samplesAdded = 0;

    // ─────────────────────────────────────────────────────────────────────────
    // 1. Mettre à jour la signature de l'état spécifique
    // ─────────────────────────────────────────────────────────────────────────

    const stateSignature = this.getOrCreateStateSignature(snapshot.label);

    // Mettre à jour les signatures de l'état
    this.updateSignature(stateSignature.energySignature, snapshot.scores.energy.values);
    this.updateSignature(stateSignature.tensionSignature, snapshot.scores.tension.values);
    this.updateSignature(stateSignature.engagementSignature, snapshot.scores.engagement.values);
    this.updateSignature(stateSignature.postureSignature, snapshot.scores.posture.values);
    this.updateSignature(stateSignature.movementSignature, snapshot.scores.movement.values);
    this.updateSignature(stateSignature.gazeSignature, snapshot.scores.gaze.values);

    stateSignature.samplesCount += snapshot.framesCollected;
    stateSignature.lastTrainingAt = Date.now();
    stateSignature.confidence = Math.min(1, stateSignature.samplesCount / 100);

    this.profile.stateSignatures[snapshot.label] = stateSignature;
    samplesAdded += snapshot.framesCollected;

    // ─────────────────────────────────────────────────────────────────────────
    // 2. Mettre à jour les signatures globales
    // ─────────────────────────────────────────────────────────────────────────

    this.updateSignature(this.profile.energySignature, snapshot.scores.energy.values);
    this.updateSignature(this.profile.tensionSignature, snapshot.scores.tension.values);
    this.updateSignature(this.profile.engagementSignature, snapshot.scores.engagement.values);
    this.updateSignature(this.profile.movementPattern.signature, snapshot.scores.movement.values);
    this.updateSignature(this.profile.posturePattern.signature, snapshot.scores.posture.values);
    this.updateSignature(this.profile.gazePattern.signature, snapshot.scores.gaze.values);

    // ─────────────────────────────────────────────────────────────────────────
    // 3. Mettre à jour les patterns
    // ─────────────────────────────────────────────────────────────────────────

    this.updateMovementPattern(snapshot.scores.movement);
    this.updatePosturePattern(snapshot.scores.posture);
    this.updateGazePattern(snapshot.scores.gaze);

    // ─────────────────────────────────────────────────────────────────────────
    // 4. Mettre à jour les liens contextuels
    // ─────────────────────────────────────────────────────────────────────────

    this.updateContextLinks(snapshot);

    // ─────────────────────────────────────────────────────────────────────────
    // 5. Recalibrer les seuils personnalisés
    // ─────────────────────────────────────────────────────────────────────────

    const thresholdsAdjusted = this.adjustThresholds();

    // ─────────────────────────────────────────────────────────────────────────
    // 6. Mettre à jour les métadonnées
    // ─────────────────────────────────────────────────────────────────────────

    this.profile.updatedAt = Date.now();
    this.profile.totalSamplesCount += samplesAdded;
    this.profile.trainingSessionsCount++;

    // Calculer la confiance globale
    this.profile.profileConfidence = this.computeProfileConfidence();
    this.profile.isCalibrated =
      this.profile.trainingSessionsCount >= TRAINING_CONFIG.sessionsForCalibration &&
      this.profile.profileConfidence > 0.5;

    return {
      thresholdsAdjusted,
      newSamplesAdded: samplesAdded,
      confidenceChange: this.profile.profileConfidence - prevConfidence,
    };
  }

  /**
   * Récupère ou crée une signature d'état
   */
  private getOrCreateStateSignature(label: UserStateLabel): StateSignature {
    const existing = this.profile.stateSignatures[label];
    if (existing) return existing;

    return {
      label,
      energySignature: getDefaultStatisticalSignature(),
      tensionSignature: getDefaultStatisticalSignature(),
      engagementSignature: getDefaultStatisticalSignature(),
      postureSignature: getDefaultStatisticalSignature(),
      movementSignature: getDefaultStatisticalSignature(),
      gazeSignature: getDefaultStatisticalSignature(),
      samplesCount: 0,
      lastTrainingAt: 0,
      confidence: 0,
    };
  }

  /**
   * Met à jour une signature statistique avec de nouvelles valeurs
   */
  private updateSignature(signature: StatisticalSignature, newValues: number[]): void {
    if (newValues.length === 0) return;

    // Ajouter les nouvelles valeurs
    for (const value of newValues) {
      // Mise à jour EMA
      signature.ema = signature.emaAlpha * value + (1 - signature.emaAlpha) * signature.ema;

      // Ajouter à l'échantillon
      signature.samples.push(value);
      signature.samplesCount++;

      // Limiter la taille des échantillons (FIFO)
      if (signature.samples.length > signature.maxSamples) {
        signature.samples.shift();
      }
    }

    // Recalculer les statistiques
    if (signature.samples.length > 0) {
      signature.mean = this.computeMean(signature.samples);
      signature.median = this.computeMedian(signature.samples);
      signature.variance = this.computeVariance(signature.samples, signature.mean);
      signature.standardDeviation = Math.sqrt(signature.variance);
    }

    signature.lastSampleAt = Date.now();
    if (signature.firstSampleAt === 0) {
      signature.firstSampleAt = Date.now();
    }
  }

  /**
   * Met à jour le pattern de mouvement
   */
  private updateMovementPattern(
    movementStats: { values: number[]; mean: number; variance: number }
  ): void {
    const pattern = this.profile.movementPattern;

    // Mettre à jour la moyenne avec EMA
    pattern.avgMovementScore =
      TRAINING_CONFIG.emaAlpha * movementStats.mean +
      (1 - TRAINING_CONFIG.emaAlpha) * pattern.avgMovementScore;

    // Mettre à jour la distribution
    let low = 0,
      medium = 0,
      high = 0;
    for (const v of movementStats.values) {
      if (v < 0.33) low++;
      else if (v < 0.66) medium++;
      else high++;
    }
    const total = movementStats.values.length || 1;

    pattern.movementDistribution = {
      low: (pattern.movementDistribution.low + low / total) / 2,
      medium: (pattern.movementDistribution.medium + medium / total) / 2,
      high: (pattern.movementDistribution.high + high / total) / 2,
    };

    // Mettre à jour le range
    const min = Math.min(...movementStats.values, pattern.typicalRange.min);
    const max = Math.max(...movementStats.values, pattern.typicalRange.max);
    pattern.typicalRange = {
      min: (pattern.typicalRange.min + min) / 2,
      max: (pattern.typicalRange.max + max) / 2,
    };
  }

  /**
   * Met à jour le pattern de posture
   */
  private updatePosturePattern(
    postureStats: { values: number[]; mean: number; variance: number }
  ): void {
    const pattern = this.profile.posturePattern;

    pattern.avgPostureScore =
      TRAINING_CONFIG.emaAlpha * postureStats.mean +
      (1 - TRAINING_CONFIG.emaAlpha) * pattern.avgPostureScore;

    // Distribution
    let slouched = 0,
      neutral = 0,
      upright = 0;
    for (const v of postureStats.values) {
      if (v < 0.4) slouched++;
      else if (v < 0.6) neutral++;
      else upright++;
    }
    const total = postureStats.values.length || 1;

    pattern.postureDistribution = {
      slouched: (pattern.postureDistribution.slouched + slouched / total) / 2,
      neutral: (pattern.postureDistribution.neutral + neutral / total) / 2,
      upright: (pattern.postureDistribution.upright + upright / total) / 2,
    };
  }

  /**
   * Met à jour le pattern de regard
   */
  private updateGazePattern(gazeStats: { values: number[]; mean: number; variance: number }): void {
    const pattern = this.profile.gazePattern;

    pattern.stabilityMean =
      TRAINING_CONFIG.emaAlpha * gazeStats.mean +
      (1 - TRAINING_CONFIG.emaAlpha) * pattern.stabilityMean;

    pattern.stabilityVariance =
      TRAINING_CONFIG.emaAlpha * gazeStats.variance +
      (1 - TRAINING_CONFIG.emaAlpha) * pattern.stabilityVariance;
  }

  /**
   * Met à jour les liens contextuels
   */
  private updateContextLinks(snapshot: TrainingSnapshot): void {
    const hour = snapshot.context.hourOfDay;
    const day = snapshot.context.dayOfWeek;

    // Courbe énergie par heure
    const curve = this.profile.contextLinks.timeOfDayEnergyCurve;
    curve.hourlyMeans[hour] =
      (curve.hourlyMeans[hour] * curve.samplesPerHour[hour] + snapshot.scores.energy.mean) /
      (curve.samplesPerHour[hour] + 1);
    curve.samplesPerHour[hour]++;

    // Patterns par jour
    const weekday = this.profile.contextLinks.weekdayPatterns;
    weekday.dailyEnergyMeans[day] =
      (weekday.dailyEnergyMeans[day] + snapshot.scores.energy.mean) / 2;
    weekday.dailyTensionMeans[day] =
      (weekday.dailyTensionMeans[day] + snapshot.scores.tension.mean) / 2;
    weekday.dailyEngagementMeans[day] =
      (weekday.dailyEngagementMeans[day] + snapshot.scores.engagement.mean) / 2;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // AJUSTEMENT DES SEUILS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Ajuste les seuils personnalisés basés sur le profil appris
   */
  adjustThresholds(): boolean {
    const thresholds = this.profile.personalizedThresholds;
    const energy = this.profile.energySignature;
    const tension = this.profile.tensionSignature;
    const engagement = this.profile.engagementSignature;

    // Besoin d'assez d'échantillons
    if (energy.samplesCount < 30) {
      return false;
    }

    // Calculer les seuils basés sur mean ± standardDeviation
    const energyMean = energy.mean;
    const energyStd = energy.standardDeviation || 0.15;
    thresholds.energyLowThreshold = Math.max(0.1, energyMean - energyStd);
    thresholds.energyHighThreshold = Math.min(0.9, energyMean + energyStd);

    const tensionMean = tension.mean;
    const tensionStd = tension.standardDeviation || 0.15;
    thresholds.tensionLowThreshold = Math.max(0.1, tensionMean - tensionStd);
    thresholds.tensionHighThreshold = Math.min(0.9, tensionMean + tensionStd);

    const engagementMean = engagement.mean;
    const engagementStd = engagement.standardDeviation || 0.15;
    thresholds.engagementLowThreshold = Math.max(0.1, engagementMean - engagementStd);
    thresholds.engagementHighThreshold = Math.min(0.9, engagementMean + engagementStd);

    // Ajuster la tolérance tension
    thresholds.tensionTolerance = Math.min(0.9, tensionMean + 2 * tensionStd);

    // Sensibilité fatigue basée sur variance
    thresholds.fatigueDetectionSensitivity = 0.5 + (1 - energyStd) * 0.3;

    thresholds.lastRecalibrationAt = Date.now();

    console.log('[TrainingBaselineEngine] Thresholds adjusted:', thresholds);

    return true;
  }

  /**
   * Récupère les seuils personnalisés pour l'AffectEstimationEngine
   */
  getPersonalizedThresholds(): PersonalizedThresholds {
    return { ...this.profile.personalizedThresholds };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPERS MATHÉMATIQUES
  // ═══════════════════════════════════════════════════════════════════════════

  private computeMean(values: number[]): number {
    if (values.length === 0) return 0.5;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }

  private computeMedian(values: number[]): number {
    if (values.length === 0) return 0.5;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  private computeVariance(values: number[], mean: number): number {
    if (values.length < 2) return 0;
    return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  }

  private levelToScore(level: 'low' | 'medium' | 'high'): number {
    switch (level) {
      case 'low':
        return 0.25;
      case 'medium':
        return 0.5;
      case 'high':
        return 0.75;
    }
  }

  private computeProfileConfidence(): number {
    const statesCount = Object.keys(this.profile.stateSignatures).length;
    const samplesScore = Math.min(1, this.profile.totalSamplesCount / 500);
    const sessionsScore = Math.min(1, this.profile.trainingSessionsCount / 10);
    const diversityScore = Math.min(1, statesCount / 4);

    return (samplesScore * 0.4 + sessionsScore * 0.3 + diversityScore * 0.3);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GÉNÉRATION DE MESSAGES
  // ═══════════════════════════════════════════════════════════════════════════

  private generateSummaryDescription(snapshot: TrainingSnapshot): string {
    const { posture, movement, gaze } = snapshot.scores;

    const postureDesc =
      posture.mean > 0.6 ? 'ouverte' : posture.mean < 0.4 ? 'fermée' : 'neutre';
    const movementDesc =
      movement.mean > 0.5 ? 'agité' : movement.mean < 0.2 ? 'calme' : 'modéré';
    const gazeDesc =
      gaze.mean > 0.7 ? 'stable' : gaze.mean < 0.4 ? 'dispersé' : 'variable';

    return `Posture ${postureDesc}, mouvement ${movementDesc}, regard ${gazeDesc}`;
  }

  private generateResultMessage(
    snapshot: TrainingSnapshot,
    changes: { thresholdsAdjusted: boolean; newSamplesAdded: number; confidenceChange: number }
  ): string {
    const { posture, movement, gaze } = snapshot.scores;

    let msg = `J'ai enregistré ce que tu appelles "${snapshot.label}" :\n`;
    msg += `• Posture moyenne : ${(posture.mean * 100).toFixed(0)}%\n`;
    msg += `• Mouvement : ${(movement.mean * 100).toFixed(0)}%\n`;
    msg += `• Regard stable : ${(gaze.mean * 100).toFixed(0)}%\n\n`;

    msg += `📊 ${changes.newSamplesAdded} échantillons ajoutés à ton profil.\n`;

    if (changes.thresholdsAdjusted) {
      msg += `🎯 J'ai ajusté mes seuils pour mieux te comprendre.\n`;
    }

    msg += `\n✅ Confiance du profil : ${(this.profile.profileConfidence * 100).toFixed(0)}%`;

    if (this.profile.isCalibrated) {
      msg += ` (Calibré)`;
    }

    return msg;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITAIRES
  // ═══════════════════════════════════════════════════════════════════════════

  private generateProfileId(): string {
    return `baseline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private addRecentSnapshot(snapshot: TrainingSnapshot): void {
    this.recentSnapshots.push(snapshot);
    if (this.recentSnapshots.length > this.maxRecentSnapshots) {
      this.recentSnapshots.shift();
    }
  }

  private notifyProfileUpdate(): void {
    if (this.profileUpdater) {
      this.profileUpdater(this.profile);
    }
  }

  private notifySessionUpdate(): void {
    if (this.sessionUpdater) {
      this.sessionUpdater(this.currentSession);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GETTERS
  // ═══════════════════════════════════════════════════════════════════════════

  getProfile(): TrainingBaselineProfile {
    return { ...this.profile };
  }

  getCurrentSession(): TrainingSession | null {
    return this.currentSession ? { ...this.currentSession } : null;
  }

  isCurrentlyCapturing(): boolean {
    return this.isCapturing;
  }

  getRecentSnapshots(): TrainingSnapshot[] {
    return [...this.recentSnapshots];
  }

  /**
   * Vérifie si le profil est suffisamment calibré
   */
  isCalibrated(): boolean {
    return this.profile.isCalibrated;
  }

  /**
   * Obtient la signature d'un état spécifique
   */
  getStateSignature(label: UserStateLabel): StateSignature | undefined {
    return this.profile.stateSignatures[label];
  }

  /**
   * Réinitialise le profil baseline
   */
  resetProfile(): void {
    this.profile = getDefaultTrainingBaselineProfile();
    this.profile.profileId = this.generateProfileId();
    this.profile.createdAt = Date.now();
    this.recentSnapshots = [];
    this.notifyProfileUpdate();
    console.log('[TrainingBaselineEngine] Profile reset');
  }

  /**
   * Exporte le profil en JSON (pour sauvegarde)
   */
  exportProfile(): string {
    return JSON.stringify(this.profile, null, 2);
  }

  /**
   * Importe un profil depuis JSON
   */
  importProfile(json: string): boolean {
    try {
      const imported = JSON.parse(json) as TrainingBaselineProfile;
      if (imported.schemaVersion && imported.profileId) {
        this.profile = imported;
        this.notifyProfileUpdate();
        console.log('[TrainingBaselineEngine] Profile imported:', imported.profileId);
        return true;
      }
      return false;
    } catch {
      console.error('[TrainingBaselineEngine] Failed to import profile');
      return false;
    }
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

let trainingEngine: TrainingBaselineEngine | null = null;

/**
 * Initialise le Training Baseline Engine
 */
export function initTrainingBaselineEngine(
  existingProfile?: TrainingBaselineProfile
): TrainingBaselineEngine {
  trainingEngine = TrainingBaselineEngine.getInstance();
  trainingEngine.initialize(existingProfile);
  return trainingEngine;
}

/**
 * Récupère l'instance du Training Baseline Engine
 */
export function getTrainingBaselineEngine(): TrainingBaselineEngine {
  if (!trainingEngine) {
    trainingEngine = TrainingBaselineEngine.getInstance();
  }
  return trainingEngine;
}

/**
 * Démarre une capture d'entraînement
 */
export function startTrainingCapture(
  label: UserStateLabel,
  durationMs?: number
): TrainingSession {
  return getTrainingBaselineEngine().startTrainingCapture(label, durationMs);
}

/**
 * Finalise la capture en cours
 */
export async function finalizeTrainingCapture(): Promise<TrainingResult> {
  return getTrainingBaselineEngine().finalizeCapture();
}

/**
 * Annule la capture en cours
 */
export function cancelTrainingCapture(): void {
  getTrainingBaselineEngine().cancelCapture();
}

export default TrainingBaselineEngine;
