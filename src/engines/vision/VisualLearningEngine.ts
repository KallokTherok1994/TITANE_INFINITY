/**
 * TITANE∞ vΩ∞ — VISUAL LEARNING ENGINE
 * Super Prompt #9: Apprentissage baseline personnalisée
 *
 * Responsabilités:
 * - Calibration des seuils personnalisés
 * - Apprentissage à partir des marquages utilisateur
 * - Adaptation dynamique au profil visuel
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import type {
  VisualBaselineProfile,
  BaselineSignature,
  CalibrationCommand,
  CalibrationSession,
  BodyLanguageState,
  AffectHistoryEntry,
} from '@/types/visionAffect';

import { CALIBRATION_CONFIG } from '@/config/visionAffect.config';

// ============================================================================
// TYPES INTERNES
// ============================================================================

interface CalibrationSample {
  timestamp: number;
  postureScore: number;
  movementScore: number;
  gazeScore: number;
}

type BaselineUpdater = (baseline: VisualBaselineProfile) => void;
type CalibrationCallback = (session: CalibrationSession, progress: number) => void;

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_KEY_BASELINE = 'titane_vision_baseline';
const STORAGE_KEY_HISTORY = 'titane_vision_calibration_history';

// ============================================================================
// VISUAL LEARNING ENGINE CLASS
// ============================================================================

/**
 * VisualLearningEngine v∞
 *
 * Gère l'apprentissage de la baseline visuelle personnalisée.
 * Permet à TITANE de s'adapter aux spécificités de chaque utilisateur.
 */
export class VisualLearningEngine {
  private static instance: VisualLearningEngine | null = null;

  // Baseline courante
  private baseline: VisualBaselineProfile | null = null;

  // Session de calibration en cours
  private currentSession: CalibrationSession | null = null;
  private calibrationSamples: CalibrationSample[] = [];
  private calibrationInterval: ReturnType<typeof setInterval> | null = null;

  // Historique des sessions de calibration
  private calibrationHistory: CalibrationSession[] = [];

  // Callbacks
  private baselineUpdater: BaselineUpdater | null = null;
  private calibrationCallback: CalibrationCallback | null = null;

  private constructor() {
    this.loadFromStorage();
  }

  /**
   * Singleton pattern
   */
  static getInstance(): VisualLearningEngine {
    if (!VisualLearningEngine.instance) {
      VisualLearningEngine.instance = new VisualLearningEngine();
    }
    return VisualLearningEngine.instance;
  }

  /**
   * Réinitialise l'instance
   */
  static resetInstance(): void {
    VisualLearningEngine.instance = null;
  }

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  /**
   * Configure le callback de mise à jour baseline
   */
  setBaselineUpdater(updater: BaselineUpdater): void {
    this.baselineUpdater = updater;
  }

  /**
   * Configure le callback de progression calibration
   */
  setCalibrationCallback(callback: CalibrationCallback): void {
    this.calibrationCallback = callback;
  }

  // ============================================================================
  // BASELINE MANAGEMENT
  // ============================================================================

  /**
   * Retourne la baseline actuelle
   */
  getBaseline(): VisualBaselineProfile | null {
    return this.baseline ? { ...this.baseline } : null;
  }

  /**
   * Vérifie si une baseline est calibrée
   */
  isCalibrated(): boolean {
    return this.baseline !== null && this.baseline.isCalibrated;
  }

  /**
   * Réinitialise la baseline aux valeurs par défaut
   */
  resetBaseline(): void {
    this.baseline = null;
    this.saveToStorage();

    if (this.baselineUpdater) {
      this.baselineUpdater(this.createDefaultBaseline());
    }

    console.log('[VisualLearningEngine] Baseline réinitialisée');
  }

  /**
   * Crée une baseline par défaut (non calibrée)
   */
  private createDefaultBaseline(): VisualBaselineProfile {
    const now = Date.now();
    return {
      energySignature: this.createDefaultSignature(),
      tensionSignature: this.createDefaultSignature(),
      engagementSignature: this.createDefaultSignature(),
      createdAt: now,
      updatedAt: now,
      samplesCount: 0,
      isCalibrated: false,
    };
  }

  /**
   * Crée une signature par défaut
   */
  private createDefaultSignature(): BaselineSignature {
    return {
      lowThreshold: 0.35,
      highThreshold: 0.65,
      averageScore: 0.5,
      standardDeviation: 0.15,
    };
  }

  // ============================================================================
  // CALIBRATION SESSIONS
  // ============================================================================

  /**
   * Démarre une session de calibration
   *
   * @param command - Type de calibration à effectuer
   * @param bodyStateGetter - Fonction pour obtenir l'état actuel du body language
   */
  startCalibration(
    command: CalibrationCommand,
    bodyStateGetter: () => BodyLanguageState
  ): CalibrationSession {
    // Arrêter toute session en cours
    if (this.currentSession) {
      this.cancelCalibration();
    }

    // Créer la nouvelle session
    const session: CalibrationSession = {
      id: `cal_${Date.now()}`,
      command,
      startedAt: Date.now(),
      samplesCollected: 0,
      averageScores: {
        posture: 0,
        movement: 0,
        gaze: 0,
      },
    };

    this.currentSession = session;
    this.calibrationSamples = [];

    // Démarrer la collecte de samples
    const sampleIntervalMs = 500; // 2 samples par seconde
    const totalDuration = CALIBRATION_CONFIG.samplingDurationMs;

    this.calibrationInterval = setInterval(() => {
      if (!this.currentSession) return;

      const bodyState = bodyStateGetter();

      if (bodyState.landmarksDetected) {
        this.calibrationSamples.push({
          timestamp: Date.now(),
          postureScore: bodyState.postureScore,
          movementScore: bodyState.movementScore,
          gazeScore: bodyState.gazeStabilityScore,
        });

        this.currentSession.samplesCollected = this.calibrationSamples.length;
      }

      // Calculer la progression
      const elapsed = Date.now() - session.startedAt;
      const progress = Math.min(1, elapsed / totalDuration);

      // Notifier
      if (this.calibrationCallback) {
        this.calibrationCallback(this.currentSession, progress);
      }

      // Terminer si durée atteinte
      if (elapsed >= totalDuration) {
        this.finishCalibration();
      }
    }, sampleIntervalMs);

    console.log(`[VisualLearningEngine] Calibration démarrée: ${command}`);
    return session;
  }

  /**
   * Termine la calibration et met à jour la baseline
   */
  private finishCalibration(): void {
    if (
      !this.currentSession ||
      this.calibrationSamples.length < CALIBRATION_CONFIG.minSamplesRequired
    ) {
      console.warn('[VisualLearningEngine] Pas assez de samples pour calibration');
      this.cancelCalibration();
      return;
    }

    // Arrêter l'intervalle
    if (this.calibrationInterval) {
      clearInterval(this.calibrationInterval);
      this.calibrationInterval = null;
    }

    // Calculer les moyennes
    const avgPosture = this.average(this.calibrationSamples.map(s => s.postureScore));
    const avgMovement = this.average(this.calibrationSamples.map(s => s.movementScore));
    const avgGaze = this.average(this.calibrationSamples.map(s => s.gazeScore));

    this.currentSession.averageScores = {
      posture: avgPosture,
      movement: avgMovement,
      gaze: avgGaze,
    };
    this.currentSession.endedAt = Date.now();

    // Appliquer à la baseline selon la commande
    this.applyCalibrationToBaseline(this.currentSession);

    // Sauvegarder dans l'historique
    this.calibrationHistory.push(this.currentSession);

    console.log('[VisualLearningEngine] Calibration terminée:', this.currentSession);

    // Notifier progression 100%
    if (this.calibrationCallback) {
      this.calibrationCallback(this.currentSession, 1);
    }

    // Nettoyer
    this.currentSession = null;
    this.calibrationSamples = [];

    // Sauvegarder
    this.saveToStorage();
  }

  /**
   * Annule la calibration en cours
   */
  cancelCalibration(): void {
    if (this.calibrationInterval) {
      clearInterval(this.calibrationInterval);
      this.calibrationInterval = null;
    }

    if (this.currentSession) {
      console.log('[VisualLearningEngine] Calibration annulée');
      this.currentSession = null;
      this.calibrationSamples = [];
    }
  }

  /**
   * Retourne la session de calibration en cours
   */
  getCurrentCalibration(): CalibrationSession | null {
    return this.currentSession ? { ...this.currentSession } : null;
  }

  // ============================================================================
  // APPLICATION DE LA CALIBRATION
  // ============================================================================

  /**
   * Applique une session de calibration à la baseline
   */
  private applyCalibrationToBaseline(session: CalibrationSession): void {
    // Créer baseline si elle n'existe pas
    if (!this.baseline) {
      this.baseline = this.createDefaultBaseline();
    }

    const now = Date.now();
    const samples = this.calibrationSamples;

    switch (session.command) {
      case 'MARK_HIGH_ENERGY':
        this.updateEnergySignature(samples, 'high');
        break;

      case 'MARK_LOW_ENERGY':
        this.updateEnergySignature(samples, 'low');
        break;

      case 'MARK_RELAXED':
        this.updateTensionSignature(samples, 'low');
        break;

      case 'MARK_FOCUSED':
        this.updateEngagementSignature(samples, 'high');
        break;

      case 'RESET_BASELINE':
        this.resetBaseline();
        return;
    }

    // Mettre à jour les métadonnées
    this.baseline.updatedAt = now;
    this.baseline.samplesCount += samples.length;

    // Vérifier si suffisamment de calibrations pour être "calibré"
    if (this.calibrationHistory.length >= 2) {
      this.baseline.isCalibrated = true;
    }

    // Notifier
    if (this.baselineUpdater) {
      this.baselineUpdater(this.baseline);
    }
  }

  /**
   * Met à jour la signature d'énergie
   */
  private updateEnergySignature(
    samples: CalibrationSample[],
    level: 'high' | 'low'
  ): void {
    if (!this.baseline) return;

    // Score combiné pour l'énergie
    const scores = samples.map(
      s => s.postureScore * 0.5 + s.movementScore * 0.3 + s.gazeScore * 0.2
    );
    const avg = this.average(scores);
    const std = this.standardDeviation(scores);

    if (level === 'high') {
      // Cet état représente "haute énergie" pour l'utilisateur
      this.baseline.energySignature.highThreshold = Math.max(
        avg - std,
        this.baseline.energySignature.averageScore
      );
    } else {
      // Cet état représente "basse énergie"
      this.baseline.energySignature.lowThreshold = Math.min(
        avg + std,
        this.baseline.energySignature.averageScore
      );
    }

    // Mettre à jour la moyenne si première calibration
    if (this.calibrationHistory.length < 2) {
      this.baseline.energySignature.averageScore = avg;
      this.baseline.energySignature.standardDeviation = std;
    }
  }

  /**
   * Met à jour la signature de tension
   */
  private updateTensionSignature(
    samples: CalibrationSample[],
    level: 'high' | 'low'
  ): void {
    if (!this.baseline) return;

    // Score de tension (mouvement + posture inversée)
    const scores = samples.map(s => s.movementScore * 0.5 + (1 - s.postureScore) * 0.5);
    const avg = this.average(scores);
    const std = this.standardDeviation(scores);

    if (level === 'low') {
      // État détendu
      this.baseline.tensionSignature.lowThreshold = Math.min(
        avg + std,
        this.baseline.tensionSignature.averageScore
      );
    } else {
      this.baseline.tensionSignature.highThreshold = Math.max(
        avg - std,
        this.baseline.tensionSignature.averageScore
      );
    }

    if (this.calibrationHistory.length < 2) {
      this.baseline.tensionSignature.averageScore = avg;
      this.baseline.tensionSignature.standardDeviation = std;
    }
  }

  /**
   * Met à jour la signature d'engagement
   */
  private updateEngagementSignature(
    samples: CalibrationSample[],
    level: 'high' | 'low'
  ): void {
    if (!this.baseline) return;

    // Score d'engagement (stabilité regard + posture)
    const scores = samples.map(s => s.gazeScore * 0.6 + s.postureScore * 0.4);
    const avg = this.average(scores);
    const std = this.standardDeviation(scores);

    if (level === 'high') {
      this.baseline.engagementSignature.highThreshold = Math.max(
        avg - std,
        this.baseline.engagementSignature.averageScore
      );
    } else {
      this.baseline.engagementSignature.lowThreshold = Math.min(
        avg + std,
        this.baseline.engagementSignature.averageScore
      );
    }

    if (this.calibrationHistory.length < 2) {
      this.baseline.engagementSignature.averageScore = avg;
      this.baseline.engagementSignature.standardDeviation = std;
    }
  }

  // ============================================================================
  // APPRENTISSAGE CONTINU
  // ============================================================================

  /**
   * Met à jour la baseline avec l'historique d'affect (apprentissage passif)
   *
   * Appelé périodiquement avec l'historique récent pour affiner les seuils.
   */
  updateFromHistory(history: AffectHistoryEntry[]): void {
    if (!this.baseline || history.length < 50) {
      return; // Pas assez de données
    }

    // Analyser la distribution des niveaux
    const energyDist = this.analyzeDistribution(history.map(h => h.energy));
    const _tensionDist = this.analyzeDistribution(history.map(h => h.tension));
    const _engagementDist = this.analyzeDistribution(history.map(h => h.engagement));

    // Si les distributions sont déséquilibrées, ajuster légèrement les seuils
    // Ceci permet une adaptation graduelle au comportement de l'utilisateur

    // Par exemple, si 80% des estimations sont "low", peut-être que les seuils sont trop hauts
    // On ajuste très doucement (facteur 0.01) pour éviter les dérives

    const adjustmentFactor = 0.01;

    if (energyDist.low > 0.7) {
      this.baseline.energySignature.lowThreshold -= adjustmentFactor;
    } else if (energyDist.high > 0.7) {
      this.baseline.energySignature.highThreshold += adjustmentFactor;
    }

    // Idem pour tension et engagement...

    this.baseline.updatedAt = Date.now();
    this.saveToStorage();
  }

  /**
   * Analyse la distribution des niveaux
   */
  private analyzeDistribution(levels: string[]): {
    low: number;
    medium: number;
    high: number;
  } {
    const total = levels.length;
    if (total === 0) return { low: 0.33, medium: 0.34, high: 0.33 };

    return {
      low: levels.filter(l => l === 'low').length / total,
      medium: levels.filter(l => l === 'medium').length / total,
      high: levels.filter(l => l === 'high').length / total,
    };
  }

  // ============================================================================
  // PERSISTENCE
  // ============================================================================

  /**
   * Charge la baseline depuis le localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_BASELINE);
      if (stored) {
        this.baseline = JSON.parse(stored) as VisualBaselineProfile;
        console.log('[VisualLearningEngine] Baseline chargée depuis storage');
      }

      const historyStored = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (historyStored) {
        this.calibrationHistory = JSON.parse(historyStored) as CalibrationSession[];
      }
    } catch (error) {
      console.warn('[VisualLearningEngine] Erreur chargement storage:', error);
    }
  }

  /**
   * Sauvegarde la baseline dans le localStorage
   */
  private saveToStorage(): void {
    try {
      if (this.baseline) {
        localStorage.setItem(STORAGE_KEY_BASELINE, JSON.stringify(this.baseline));
      } else {
        localStorage.removeItem(STORAGE_KEY_BASELINE);
      }

      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(this.calibrationHistory));
    } catch (error) {
      console.warn('[VisualLearningEngine] Erreur sauvegarde storage:', error);
    }
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  /**
   * Calcule la moyenne
   */
  private average(arr: number[]): number {
    if (arr.length === 0) return 0.5;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  /**
   * Calcule l'écart-type
   */
  private standardDeviation(arr: number[]): number {
    if (arr.length < 2) return 0.1;
    const avg = this.average(arr);
    const variance = arr.reduce((sum, val) => sum + (val - avg) ** 2, 0) / arr.length;
    return Math.sqrt(variance);
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  /**
   * Réinitialise le moteur
   */
  reset(): void {
    this.cancelCalibration();
    this.baseline = null;
    this.calibrationHistory = [];
    this.baselineUpdater = null;
    this.calibrationCallback = null;
  }
}

// ============================================================================
// EXPORTS FONCTIONNELS
// ============================================================================

let engineInstance: VisualLearningEngine | null = null;

/**
 * Initialise le VisualLearningEngine
 */
export function initVisualLearningEngine(): VisualLearningEngine {
  engineInstance = VisualLearningEngine.getInstance();
  return engineInstance;
}

/**
 * Récupère l'instance
 */
export function getVisualLearningEngine(): VisualLearningEngine | null {
  return engineInstance;
}

/**
 * Démarre une calibration (raccourci)
 */
export function startCalibration(
  command: CalibrationCommand,
  bodyStateGetter: () => BodyLanguageState
): CalibrationSession | null {
  return engineInstance?.startCalibration(command, bodyStateGetter) ?? null;
}
