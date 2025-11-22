/**
 * TITANE∞ — BEHAVIORAL LAYER v24
 * 
 * Définit comment le système réagit aux différents contextes :
 * - Erreurs → réaction ferme mais non anxiogène
 * - Succès → feedback calme et précis
 * - Warnings → attention mesurée
 * - Surcharge → posture attentive
 * - Idle → posture minimale
 */

import type {
  BehavioralLayer,
  BehaviorResponse,
  SystemState,
  MotionType,
} from '../ARCHITECTURE_TYPES_v24-v∞';
import { DS_CONSTANTS } from '../visual/DS_CONSTANTS';

/**
 * Réponses comportementales par défaut
 */
const DEFAULT_BEHAVIORS: BehavioralLayer['reactions'] = {
  onError: {
    glowIntensity: 0.9,
    motionType: 'vibrate',
    soundFeedback: 'error',
    narrativePhrase: 'Anomalie détectée',
    durationMs: 2000,
  },
  onSuccess: {
    glowIntensity: 0.7,
    motionType: 'pulse',
    soundFeedback: 'success',
    narrativePhrase: 'Opération réussie',
    durationMs: 1500,
  },
  onWarning: {
    glowIntensity: 0.8,
    motionType: 'sway',
    soundFeedback: 'warning',
    narrativePhrase: 'Attention requise',
    durationMs: 3000,
  },
  onOverload: {
    glowIntensity: 0.95,
    motionType: 'shimmer',
    soundFeedback: 'alert',
    narrativePhrase: 'Charge système élevée',
    durationMs: 5000,
  },
  onIdle: {
    glowIntensity: 0.3,
    motionType: 'breathe',
    soundFeedback: undefined,
    narrativePhrase: undefined,
    durationMs: 0, // Continu
  },
};

/**
 * Behavioral Layer Manager
 * 
 * Gère les réactions comportementales du système
 */
export class BehavioralLayerManager {
  private layer: BehavioralLayer;
  private activeReactions: Map<string, { response: BehaviorResponse; startTime: number }> = new Map();

  constructor() {
    this.layer = {
      reactions: { ...DEFAULT_BEHAVIORS },
      posture: 'relaxed',
      adaptationSpeed: 0.6, // Modéré
    };
  }

  /**
   * Obtient la couche comportementale
   */
  getLayer(): BehavioralLayer {
    return { ...this.layer };
  }

  /**
   * Trigger une réaction comportementale
   */
  triggerReaction(
    type: keyof BehavioralLayer['reactions'],
    context?: Partial<BehaviorResponse>
  ): BehaviorResponse {
    const baseReaction = this.layer.reactions[type];
    const reaction: BehaviorResponse = {
      ...baseReaction,
      ...context,
    };

    // Enregistre réaction active
    const id = `${type}-${Date.now()}`;
    this.activeReactions.set(id, {
      response: reaction,
      startTime: Date.now(),
    });

    // Nettoie réactions expirées
    this.cleanExpiredReactions();

    // Ajuste posture selon réaction
    this.adjustPosture(type);

    return reaction;
  }

  /**
   * Ajuste la posture selon le type de réaction
   */
  private adjustPosture(reactionType: keyof BehavioralLayer['reactions']): void {
    switch (reactionType) {
      case 'onError':
      case 'onWarning':
      case 'onOverload':
        this.layer.posture = 'vigilant';
        break;
      case 'onSuccess':
        this.layer.posture = 'relaxed';
        break;
      case 'onIdle':
        this.layer.posture = 'minimal';
        break;
    }
  }

  /**
   * Nettoie les réactions expirées
   */
  private cleanExpiredReactions(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    this.activeReactions.forEach((value, key) => {
      const elapsed = now - value.startTime;
      if (value.response.durationMs > 0 && elapsed > value.response.durationMs) {
        toDelete.push(key);
      }
    });

    toDelete.forEach((key) => this.activeReactions.delete(key));
  }

  /**
   * Obtient toutes les réactions actives
   */
  getActiveReactions(): BehaviorResponse[] {
    this.cleanExpiredReactions();
    return Array.from(this.activeReactions.values()).map((v) => v.response);
  }

  /**
   * Détermine la posture optimale selon état système
   */
  determineOptimalPosture(
    systemState: SystemState,
    errorCount: number,
    cpuLoad: number
  ): BehavioralLayer['posture'] {
    // Vigilant si danger ou beaucoup d'erreurs
    if (systemState === 'danger' || errorCount > 5) {
      return 'vigilant';
    }

    // Attentive si warning ou charge élevée
    if (systemState === 'warning' || cpuLoad > 0.7) {
      return 'attentive';
    }

    // Minimal si offline ou null
    if (systemState === 'offline' || systemState === 'null') {
      return 'minimal';
    }

    // Relaxed par défaut (état optimal)
    return 'relaxed';
  }

  /**
   * Définit la vitesse d'adaptation
   */
  setAdaptationSpeed(speed: number): void {
    this.layer.adaptationSpeed = Math.max(0, Math.min(1, speed));
  }

  /**
   * Personnalise une réaction
   */
  customizeReaction(
    type: keyof BehavioralLayer['reactions'],
    response: Partial<BehaviorResponse>
  ): void {
    this.layer.reactions[type] = {
      ...this.layer.reactions[type],
      ...response,
    };
  }

  /**
   * Obtient la réaction recommandée pour un état donné
   */
  getRecommendedReaction(
    systemState: SystemState
  ): keyof BehavioralLayer['reactions'] | null {
    switch (systemState) {
      case 'danger':
        return 'onError';
      case 'warning':
        return 'onWarning';
      case 'stable':
      case 'processing':
        return 'onSuccess';
      case 'null':
      case 'offline':
        return 'onIdle';
      default:
        return null;
    }
  }

  /**
   * Génère les effets visuels selon posture
   */
  getPostureVisualEffects(): {
    glowMultiplier: number;
    motionSpeed: number;
    focusLevel: number;
  } {
    const multipliers = {
      attentive: { glow: 1.2, motion: 1.1, focus: 0.9 },
      relaxed: { glow: 1.0, motion: 1.0, focus: 0.7 },
      vigilant: { glow: 1.4, motion: 1.3, focus: 1.0 },
      minimal: { glow: 0.5, motion: 0.4, focus: 0.3 },
    };

    const values = multipliers[this.layer.posture];
    return {
      glowMultiplier: values.glow,
      motionSpeed: values.motion,
      focusLevel: values.focus,
    };
  }

  /**
   * Reset à comportements par défaut
   */
  reset(): void {
    this.layer = {
      reactions: { ...DEFAULT_BEHAVIORS },
      posture: 'relaxed',
      adaptationSpeed: 0.6,
    };
    this.activeReactions.clear();
  }
}

/**
 * Instance singleton globale
 */
export const behavioralLayerManager = new BehavioralLayerManager();

/**
 * Helper : trigger une réaction depuis n'importe où
 */
export function triggerBehaviorReaction(
  type: keyof BehavioralLayer['reactions'],
  context?: Partial<BehaviorResponse>
): BehaviorResponse {
  return behavioralLayerManager.triggerReaction(type, context);
}

/**
 * Helper : obtient la posture actuelle
 */
export function getCurrentPosture(): BehavioralLayer['posture'] {
  return behavioralLayerManager.getLayer().posture;
}
