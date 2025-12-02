/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  TITANE INFINITY — Training-Affect Bridge v∞.2                            ║
 * ║  Pont entre Training Baseline Engine et Affect Estimation Engine          ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║  Intègre les signatures personnalisées dans l'estimation d'état           ║
 * ║  100% local • Éthique • Privé                                             ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import type {
  UserStateLabel,
  TrainingBaselineProfile,
  StatisticalSignature,
} from '@/types/trainingBaseline';
import type {
  VisualBaselineProfile,
  BaselineSignature,
  AffectEstimationState,
} from '@/types/visionAffect';

import { TrainingBaselineEngine } from '@/engines/training/TrainingBaselineEngine';
import { AffectEstimationEngine } from '@/engines/vision/AffectEstimationEngine';

// ============================================================================
// TYPES
// ============================================================================

export interface TrainingAffectSyncResult {
  success: boolean;
  appliedLabels: UserStateLabel[];
  message: string;
}

export interface StateMatchResult {
  matchedLabel: UserStateLabel | null;
  confidence: number;
  allMatches: Array<{
    label: UserStateLabel;
    similarity: number;
  }>;
}

export interface RecalibrationResult {
  previous: {
    energy: number;
    tension: number;
    engagement: number;
  };
  adjusted: {
    energy: number;
    tension: number;
    engagement: number;
  };
  adjustmentFactor: number;
}

// ============================================================================
// MAPPING ENTRE TRAINING LABELS ET AFFECT STATES
// ============================================================================

/**
 * Mapping des labels d'entraînement vers des profils d'affect attendus
 */
const LABEL_AFFECT_PROFILES: Record<UserStateLabel, {
  expectedEnergy: { min: number; max: number };
  expectedTension: { min: number; max: number };
  expectedEngagement: { min: number; max: number };
}> = {
  calm: {
    expectedEnergy: { min: 0.3, max: 0.6 },
    expectedTension: { min: 0.0, max: 0.3 },
    expectedEngagement: { min: 0.4, max: 0.7 },
  },
  stressed: {
    expectedEnergy: { min: 0.5, max: 0.9 },
    expectedTension: { min: 0.6, max: 1.0 },
    expectedEngagement: { min: 0.3, max: 0.7 },
  },
  focused: {
    expectedEnergy: { min: 0.4, max: 0.7 },
    expectedTension: { min: 0.2, max: 0.5 },
    expectedEngagement: { min: 0.7, max: 1.0 },
  },
  fatigued: {
    expectedEnergy: { min: 0.0, max: 0.4 },
    expectedTension: { min: 0.1, max: 0.4 },
    expectedEngagement: { min: 0.1, max: 0.5 },
  },
  motivated: {
    expectedEnergy: { min: 0.6, max: 1.0 },
    expectedTension: { min: 0.2, max: 0.5 },
    expectedEngagement: { min: 0.6, max: 1.0 },
  },
  neutral: {
    expectedEnergy: { min: 0.4, max: 0.6 },
    expectedTension: { min: 0.3, max: 0.5 },
    expectedEngagement: { min: 0.4, max: 0.6 },
  },
  energized: {
    expectedEnergy: { min: 0.7, max: 1.0 },
    expectedTension: { min: 0.2, max: 0.5 },
    expectedEngagement: { min: 0.5, max: 0.9 },
  },
  relaxed: {
    expectedEnergy: { min: 0.2, max: 0.5 },
    expectedTension: { min: 0.0, max: 0.3 },
    expectedEngagement: { min: 0.3, max: 0.6 },
  },
};

// ============================================================================
// TRAINING-AFFECT BRIDGE CLASS
// ============================================================================

/**
 * Pont bidirectionnel entre Training Baseline et Affect Estimation
 *
 * Responsabilités:
 * 1. Convertir TrainingBaselineProfile → VisualBaselineProfile
 * 2. Appliquer les signatures personnalisées à l'estimation
 * 3. Détecter quel état entraîné correspond à l'état actuel
 * 4. Recalibrer les seuils dynamiquement
 */
export class TrainingAffectBridge {
  private static instance: TrainingAffectBridge | null = null;

  private trainingEngine: TrainingBaselineEngine;
  private affectEngine: AffectEstimationEngine;

  private lastSyncTime = 0;
  private syncIntervalMs = 60000; // Sync toutes les 60s max

  private constructor() {
    this.trainingEngine = TrainingBaselineEngine.getInstance();
    this.affectEngine = AffectEstimationEngine.getInstance();
  }

  /**
   * Singleton pattern
   */
  static getInstance(): TrainingAffectBridge {
    if (!TrainingAffectBridge.instance) {
      TrainingAffectBridge.instance = new TrainingAffectBridge();
    }
    return TrainingAffectBridge.instance;
  }

  // ============================================================================
  // SYNCHRONISATION
  // ============================================================================

  /**
   * Synchronise le profil d'entraînement avec le moteur d'affect
   */
  syncTrainingToAffect(): TrainingAffectSyncResult {
    const trainingProfile = this.trainingEngine.getProfile();

    // Vérifier s'il y a des signatures à appliquer
    const trainedLabels = Object.keys(trainingProfile.stateSignatures) as UserStateLabel[];

    if (trainedLabels.length === 0) {
      return {
        success: false,
        appliedLabels: [],
        message: "Aucun profil d'entraînement disponible. Commencez une session d'entraînement.",
      };
    }

    // Convertir vers VisualBaselineProfile
    const visualBaseline = this.convertToVisualBaseline(trainingProfile);

    // Appliquer au moteur d'affect
    this.affectEngine.setBaseline(visualBaseline);

    this.lastSyncTime = Date.now();

    return {
      success: true,
      appliedLabels: trainedLabels,
      message: `Profil personnalisé appliqué avec ${trainedLabels.length} état(s) entraîné(s).`,
    };
  }

  /**
   * Convertit un TrainingBaselineProfile en VisualBaselineProfile
   */
  private convertToVisualBaseline(profile: TrainingBaselineProfile): VisualBaselineProfile {
    // Utiliser les signatures globales du profil
    const energySignature = this.convertSignature(profile.energySignature, profile.personalizedThresholds.energyLowThreshold, profile.personalizedThresholds.energyHighThreshold);
    const tensionSignature = this.convertSignature(profile.tensionSignature, profile.personalizedThresholds.tensionLowThreshold, profile.personalizedThresholds.tensionHighThreshold);
    const engagementSignature = this.convertSignature(profile.engagementSignature, profile.personalizedThresholds.engagementLowThreshold, profile.personalizedThresholds.engagementHighThreshold);

    return {
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      isCalibrated: profile.isCalibrated,
      samplesCount: profile.totalSamplesCount,
      energySignature,
      tensionSignature,
      engagementSignature,
    };
  }

  /**
   * Convertit une StatisticalSignature en BaselineSignature
   */
  private convertSignature(stat: StatisticalSignature, lowThreshold: number, highThreshold: number): BaselineSignature {
    return {
      lowThreshold,
      highThreshold,
      averageScore: stat.mean,
      standardDeviation: stat.standardDeviation,
    };
  }

  // ============================================================================
  // DÉTECTION D'ÉTAT
  // ============================================================================

  /**
   * Détecte quel état entraîné correspond le mieux à l'état actuel
   */
  matchCurrentState(currentAffect: AffectEstimationState): StateMatchResult {
    const profile = this.trainingEngine.getProfile();
    const trainedLabels = Object.keys(profile.stateSignatures) as UserStateLabel[];

    if (trainedLabels.length === 0) {
      return {
        matchedLabel: null,
        confidence: 0,
        allMatches: [],
      };
    }

    // Extraire les scores actuels (approximés depuis les niveaux)
    const currentScores = this.levelToScores(currentAffect);

    // Calculer la similarité avec chaque état entraîné
    const matches: Array<{ label: UserStateLabel; similarity: number }> = [];

    for (const label of trainedLabels) {
      const stateSignature = profile.stateSignatures[label];
      if (stateSignature) {
        const similarity = this.computeSimilarity(currentScores, stateSignature.energySignature, label);
        matches.push({ label, similarity });
      }
    }

    // Trier par similarité décroissante
    matches.sort((a, b) => b.similarity - a.similarity);

    const bestMatch = matches[0];
    const confidence = bestMatch ? bestMatch.similarity : 0;

    // Seuil de confiance pour considérer un match valide
    const MIN_MATCH_CONFIDENCE = 0.6;

    return {
      matchedLabel: confidence >= MIN_MATCH_CONFIDENCE ? bestMatch.label : null,
      confidence,
      allMatches: matches,
    };
  }

  /**
   * Convertit les niveaux d'affect en scores numériques
   */
  private levelToScores(affect: AffectEstimationState): {
    energy: number;
    tension: number;
    engagement: number;
  } {
    const levelToNumber = (level: string): number => {
      switch (level) {
        case 'low': return 0.25;
        case 'medium': return 0.5;
        case 'high': return 0.75;
        default: return 0.5;
      }
    };

    return {
      energy: levelToNumber(affect.visualEnergyLevel),
      tension: levelToNumber(affect.visualTensionLevel),
      engagement: levelToNumber(affect.visualEngagementLevel),
    };
  }

  /**
   * Calcule la similarité entre l'état actuel et une signature entraînée
   */
  private computeSimilarity(
    currentScores: { energy: number; tension: number; engagement: number },
    signature: StatisticalSignature,
    label: UserStateLabel
  ): number {
    const expectedProfile = LABEL_AFFECT_PROFILES[label];

    // Distance euclidienne normalisée par rapport aux attentes
    const energyDist = this.normalizedDistance(
      currentScores.energy,
      expectedProfile.expectedEnergy.min,
      expectedProfile.expectedEnergy.max
    );

    const tensionDist = this.normalizedDistance(
      currentScores.tension,
      expectedProfile.expectedTension.min,
      expectedProfile.expectedTension.max
    );

    const engagementDist = this.normalizedDistance(
      currentScores.engagement,
      expectedProfile.expectedEngagement.min,
      expectedProfile.expectedEngagement.max
    );

    // Pondérer par la variance de la signature (moins de variance = plus de confiance)
    const varianceWeight = 1 / (1 + signature.variance * 2);

    // Combiner les distances
    const avgDist = (energyDist + tensionDist + engagementDist) / 3;

    // Convertir en similarité (0 = pas similaire, 1 = très similaire)
    const similarity = (1 - avgDist) * varianceWeight * (signature.samplesCount > 5 ? 1 : 0.7);

    return Math.max(0, Math.min(1, similarity));
  }

  /**
   * Calcule une distance normalisée par rapport à une plage attendue
   */
  private normalizedDistance(value: number, min: number, max: number): number {
    if (value >= min && value <= max) {
      return 0; // Dans la plage attendue
    }

    const range = max - min;

    // Distance au bord de la plage le plus proche
    const distToMin = value < min ? min - value : 0;
    const distToMax = value > max ? value - max : 0;

    // Normaliser par la largeur de la plage
    return Math.min(1, (distToMin + distToMax) / (range || 0.1));
  }

  // ============================================================================
  // RECALIBRATION
  // ============================================================================

  /**
   * Recalibre les estimations en fonction du profil d'entraînement
   */
  recalibrateEstimation(
    rawScores: { energy: number; tension: number; engagement: number }
  ): RecalibrationResult {
    const profile = this.trainingEngine.getProfile();

    // Si pas assez de données, pas de recalibration
    if (profile.totalSamplesCount < 10 || profile.profileConfidence < 0.5) {
      return {
        previous: rawScores,
        adjusted: rawScores,
        adjustmentFactor: 1.0,
      };
    }

    // Calculer le facteur d'ajustement basé sur les seuils personnalisés
    const thresholds = this.trainingEngine.getPersonalizedThresholds();

    // Ajuster chaque score selon les seuils personnalisés
    const adjusted = {
      energy: this.applyThreshold(rawScores.energy, {
        low: thresholds.energyLowThreshold,
        high: thresholds.energyHighThreshold,
      }),
      tension: this.applyThreshold(rawScores.tension, {
        low: thresholds.tensionLowThreshold,
        high: thresholds.tensionHighThreshold,
      }),
      engagement: this.applyThreshold(rawScores.engagement, {
        low: thresholds.engagementLowThreshold,
        high: thresholds.engagementHighThreshold,
      }),
    };

    // Facteur d'ajustement moyen
    const adjustmentFactor =
      (Math.abs(adjusted.energy - rawScores.energy) +
       Math.abs(adjusted.tension - rawScores.tension) +
       Math.abs(adjusted.engagement - rawScores.engagement)) / 3;

    return {
      previous: rawScores,
      adjusted,
      adjustmentFactor: 1 - adjustmentFactor,
    };
  }

  /**
   * Applique un seuil personnalisé à un score
   */
  private applyThreshold(
    score: number,
    threshold: { low: number; high: number }
  ): number {
    // Normaliser le score par rapport aux seuils personnalisés
    const range = threshold.high - threshold.low;

    if (range <= 0.1) {
      return score; // Seuils trop proches, pas d'ajustement
    }

    // Mapper le score sur la plage [low, high] vers [0, 1]
    if (score <= threshold.low) {
      return score / (threshold.low * 2 || 1) * 0.33; // Bas
    } else if (score >= threshold.high) {
      return 0.67 + (score - threshold.high) / ((1 - threshold.high) * 2 || 1) * 0.33; // Haut
    } else {
      // Medium
      return 0.33 + ((score - threshold.low) / range) * 0.34;
    }
  }

  // ============================================================================
  // UTILITAIRES
  // ============================================================================

  /**
   * Vérifie si une synchronisation est nécessaire
   */
  needsSync(): boolean {
    return Date.now() - this.lastSyncTime > this.syncIntervalMs;
  }

  /**
   * Obtient le temps depuis la dernière sync
   */
  getTimeSinceLastSync(): number {
    return Date.now() - this.lastSyncTime;
  }

  /**
   * Force une synchronisation
   */
  forceSync(): TrainingAffectSyncResult {
    this.lastSyncTime = 0; // Reset pour forcer
    return this.syncTrainingToAffect();
  }
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export const trainingAffectBridge = TrainingAffectBridge.getInstance();
