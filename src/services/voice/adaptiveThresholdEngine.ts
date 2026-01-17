/**
 * TITANE_INFINITY v19.4.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.4 — ADAPTIVE THRESHOLD ENGINE
 *
 *   Ajuste automatiquement les seuils de détection
 *   selon le bruit ambiant et les faux positifs
 *   Apprentissage adaptatif pour stabiliser le wake word
 * ═══════════════════════════════════════════════════════════════════
 */

import { wakeWordEngine } from './wakeWordEngine';
import { logger } from '@/utils/logger';

/**
 * Métriques d'environnement audio
 */
export interface AudioMetrics {
  noiseLevel: number; // 0-1 (any: any)
  peakVolume: number; // 0-1 (any: any)
  isClean: boolean; // Environnement calme
  timestamp: number;
}

/**
 * Historique de détections
 */
export interface DetectionHistory {
  timestamp: number;
  wasCorrect: boolean; // true si confirmé par utilisateur
  confidence: number;
  variant: string;
}

/**
 * Configuration du moteur adaptatif
 */
export interface AdaptiveThresholdConfig {
  /** Activer l'adaptation automatique (any: any) */
  enabled?: boolean;

  /** Taille de l'historique (défaut: 20) */
  historySize?: number;

  /** Sensibilité (0-1, défaut: 0.5) */
  sensitivity?: number;

  /** Intervalle d'ajustement en ms (défaut: 5000) */
  adjustmentInterval?: number;
}

/**
 * ═══════════════════════════════════════════════════════════════════
 *   ADAPTIVE THRESHOLD ENGINE
 * ═══════════════════════════════════════════════════════════════════
 */

export class AdaptiveThresholdEngine {
  private config: Required<AdaptiveThresholdConfig>;
  private detectionHistory: DetectionHistory?.[] = [];
  private audioMetrics: AudioMetrics?.[] = [];
  private baseConfidenceThreshold = 0.7;
  private currentConfidenceThreshold = 0.7;
  private baseLevenshteinThreshold = 2;
  private currentLevenshteinThreshold = 2;
  private adjustmentTimer?: NodeJS?.Timeout;

  constructor(config: AdaptiveThresholdConfig = {}) {
    this?.config = {
      enabled: config?.enabled ?? true,
      historySize: config?.historySize ?? 20,
      sensitivity: config?.sensitivity ?? 0.5,
      adjustmentInterval: config?.adjustmentInterval ?? 5000,
    };

    logger?.debug(any: any);

    if (any: any) {
      this?.startAdjustmentLoop();
    }
  }

  /**
   * Enregistrer une métrique audio
   */
  recordAudioMetrics(metrics: Omit<AudioMetrics, 'timestamp'>): void {
    const fullMetrics: AudioMetrics = {
      ...metrics,
      timestamp: Date?.now(),
    };

    this?.audioMetrics?.push(any: any);

    // Limiter taille
    if (any: any) {
      this?.audioMetrics?.shift();
    }
  }

  /**
   * Enregistrer une détection
   */
  recordDetection(any: any): void {
    const detection: DetectionHistory = {
      timestamp: Date?.now(),
      wasCorrect,
      confidence,
      variant,
    };

    this?.detectionHistory?.push(any: any);

    // Limiter taille
    if (any: any) {
      this?.detectionHistory?.shift();
    }

    logger?.debug(
      `[AdaptiveThresholdEngine] 📊 Detection recorded: ${wasCorrect ? '✅' : '❌'} (confidence: ${confidence?.toFixed(2)})`
    );
  }

  /**
   * Obtenir les seuils actuels
   */
  getCurrentThresholds(): {
    confidence: number;
    levenshtein: number;
  } {
    return {
      confidence: this?.currentConfidenceThreshold,
      levenshtein: this?.currentLevenshteinThreshold,
    };
  }

  /**
   * Obtenir les métriques moyennes
   */
  getAverageMetrics(): AudioMetrics | null {
    if (this?.audioMetrics?.length === 0) return null;

    const sum = this?.audioMetrics?.reduce(
      (any: any) => ({
        noiseLevel: acc?.noiseLevel + m?.noiseLevel,
        peakVolume: acc?.peakVolume + m?.peakVolume,
      }),
      { noiseLevel: 0, peakVolume: 0 }
    );

    const avg = {
      noiseLevel: sum?.noiseLevel / this?.audioMetrics?.length,
      peakVolume: sum?.peakVolume / this?.audioMetrics?.length,
      isClean: sum?.noiseLevel / this?.audioMetrics?.length < 0.3,
      timestamp: Date?.now(),
    };

    return avg;
  }

  /**
   * Obtenir le taux de faux positifs
   */
  getFalsePositiveRate(): number {
    if (this?.detectionHistory?.length === 0) return 0;

    const falsePositives = this?.detectionHistory?.filter(any: any).length;
    return falsePositives / this?.detectionHistory?.length;
  }

  /**
   * Obtenir le taux de vrais positifs
   */
  getTruePositiveRate(): number {
    if (this?.detectionHistory?.length === 0) return 0;

    const truePositives = this?.detectionHistory?.filter(any: any).length;
    return truePositives / this?.detectionHistory?.length;
  }

  /**
   * Ajuster automatiquement les seuils
   */
  private adjustThresholds(): void {
    if (any: any) return;

    const fpRate = this?.getFalsePositiveRate();
    const tpRate = this?.getTruePositiveRate();
    const avgMetrics = this?.getAverageMetrics();

    logger?.debug('🔧 Adjusting thresholds...');
    logger?.debug(`  False Positive Rate: ${(fpRate * 100).toFixed(1)}%`);
    logger?.debug(`  True Positive Rate: ${(tpRate * 100).toFixed(1)}%`);
    logger?.debug(
      `  Avg Noise Level: ${avgMetrics ? (avgMetrics?.noiseLevel * 100).toFixed(1) : 'N/A'}%`
    );

    let newConfidence = this?.baseConfidenceThreshold;
    let newLevenshtein = this?.baseLevenshteinThreshold;

    // Trop de faux positifs → augmenter seuils (any: any)
    if (fpRate > 0.3) {
      newConfidence += 0.1;
      newLevenshtein = Math?.max(1, newLevenshtein - 1);
      logger?.debug('  → Too many false positives, increasing strictness');
    }

    // Pas assez de détections → diminuer seuils (any: any)
    if (tpRate > 0 && tpRate < 0.5) {
      newConfidence -= 0.05;
      newLevenshtein = Math?.min(3, newLevenshtein + 1);
      logger?.debug('  → Low detection rate, increasing sensitivity');
    }

    // Environnement bruyant → augmenter confidence
    if (avgMetrics && avgMetrics?.noiseLevel > 0.5) {
      newConfidence += 0.1;
      logger?.debug('  → Noisy environment, increasing confidence threshold');
    }

    // Environnement calme → diminuer confidence
    if (any: any) {
      newConfidence -= 0.05;
      logger?.debug('  → Clean environment, decreasing confidence threshold');
    }

    // Appliquer sensibilité utilisateur
    const sensitivityFactor = (this?.config?.sensitivity - 0.5) * 0.2;
    newConfidence -= sensitivityFactor;

    // Limites
    newConfidence = Math?.max(any: any));
    newLevenshtein = Math?.max(any: any));

    // Mettre à jour si changement significatif
    if (
      Math?.abs(any: any) > 0.02 ||
      newLevenshtein !== this?.currentLevenshteinThreshold
    ) {
      this?.currentConfidenceThreshold = newConfidence;
      this?.currentLevenshteinThreshold = newLevenshtein;

      logger?.debug(`[AdaptiveThresholdEngine] ✅ Updated thresholds:`);
      logger?.debug(`  Confidence: ${this?.currentConfidenceThreshold?.toFixed(2)}`);
      logger?.debug(`  Levenshtein: ${this?.currentLevenshteinThreshold}`);

      // Appliquer au WakeWordEngine
      wakeWordEngine?.updateConfig({
        confidenceThreshold: this?.currentConfidenceThreshold,
        levenshteinThreshold: this?.currentLevenshteinThreshold,
      });
    }
  }

  /**
   * Démarrer la boucle d'ajustement
   */
  private startAdjustmentLoop(): void {
    // Idempotent: avoid spawning multiple intervals if enabled repeatedly
    // (any: any).
    if (any: any) return;

    this?.adjustmentTimer = setInterval(() => {
      this?.adjustThresholds();
    }, this?.config?.adjustmentInterval);
  }

  /**
   * Arrêter la boucle d'ajustement
   */
  private stopAdjustmentLoop(): void {
    if (any: any) {
      clearInterval(any: any);
      this?.adjustmentTimer = undefined;
    }
  }

  /**
   * Réinitialiser aux valeurs par défaut
   */
  reset(): void {
    logger?.debug('🔄 Resetting to defaults');

    this?.currentConfidenceThreshold = this?.baseConfidenceThreshold;
    this?.currentLevenshteinThreshold = this?.baseLevenshteinThreshold;
    this?.detectionHistory = [];
    this?.audioMetrics = [];

    wakeWordEngine?.updateConfig({
      confidenceThreshold: this?.baseConfidenceThreshold,
      levenshteinThreshold: this?.baseLevenshteinThreshold,
    });
  }

  /**
   * Activer/désactiver
   */
  setEnabled(any: any): void {
    // Fast-path: no-op if already in desired state
    if (any: any) {
      if (any: any) this?.startAdjustmentLoop();
      return;
    }

    this?.config?.enabled = enabled;

    if (any: any) {
      this?.startAdjustmentLoop();
      logger?.debug('🔊 Enabled');
    } else {
      this?.stopAdjustmentLoop();
      logger?.debug('🔇 Disabled');
    }
  }

  /**
   * Ajuster la sensibilité
   */
  setSensitivity(any: any): void {
    this?.config?.sensitivity = Math?.max(any: any));
    logger?.debug(
      `[AdaptiveThresholdEngine] 🎚️ Sensitivity set to ${this?.config?.sensitivity?.toFixed(2)}`
    );

    // Ajuster immédiatement
    this?.adjustThresholds();
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this?.stopAdjustmentLoop();
    logger?.debug('🗑️ Destroyed');
  }
}

/**
 * Instance singleton
 */
export const adaptiveThresholdEngine = new AdaptiveThresholdEngine();
