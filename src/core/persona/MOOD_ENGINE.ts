/**
 * TITANE∞ — MOOD ENGINE v24
 * 
 * Gère l'humeur opérationnelle du système (non-anthropomorphique).
 * L'humeur reflète l'état système de manière perceptible visuellement.
 * 
 * Humeurs disponibles :
 * - clair    : stable, tout va bien
 * - vibrant  : haute activité, énergie élevée
 * - attentif : warning détecté, vigilance
 * - alerte   : danger, réaction forte
 * - neutre   : inactif, baseline
 * - dormant  : offline ou minimal
 */

import type { MoodState, MoodType, SystemState } from '../ARCHITECTURE_TYPES_v24-v∞';
import type { MotionType } from '../visual/MOTION_ENGINE';
import { DS_CONSTANTS } from '../visual/DS_CONSTANTS';

/**
 * Mapping état système → humeur
 */
const STATE_TO_MOOD: Record<SystemState, MoodType> = {
  stable: 'clair',
  processing: 'vibrant',
  warning: 'attentif',
  danger: 'alerte',
  null: 'neutre',
  offline: 'dormant',
};

/**
 * Caractéristiques visuelles par humeur
 */
const MOOD_VISUALS: Record<MoodType, MoodState['visualEffect']> = {
  clair: {
    glowShift: 0,
    motionSpeed: 1.0,
    depthIntensity: 0.6,
  },
  vibrant: {
    glowShift: +0.15,
    motionSpeed: 1.3,
    depthIntensity: 0.8,
  },
  attentif: {
    glowShift: +0.1,
    motionSpeed: 1.1,
    depthIntensity: 0.7,
  },
  alerte: {
    glowShift: +0.2,
    motionSpeed: 1.5,
    depthIntensity: 0.9,
  },
  neutre: {
    glowShift: 0,
    motionSpeed: 0.8,
    depthIntensity: 0.4,
  },
  dormant: {
    glowShift: -0.2,
    motionSpeed: 0.3,
    depthIntensity: 0.2,
  },
};

/**
 * Intensité par humeur (baseline)
 */
const MOOD_INTENSITY: Record<MoodType, number> = {
  clair: 0.6,
  vibrant: 0.85,
  attentif: 0.75,
  alerte: 1.0,
  neutre: 0.4,
  dormant: 0.2,
};

/**
 * Mood Engine
 * 
 * Détermine et gère l'humeur actuelle du système
 */
export class MoodEngine {
  private currentMood: MoodState;
  private moodHistory: Array<{ mood: MoodType; timestamp: number }> = [];
  private transitionDuration: number = DS_CONSTANTS.timing.systemic; // 220ms

  constructor() {
    this.currentMood = {
      current: 'clair',
      intensity: 0.6,
      duration: 0,
      trigger: 'stable',
      visualEffect: MOOD_VISUALS.clair,
    };
  }

  /**
   * Met à jour l'humeur selon état système
   */
  updateFromSystemState(state: SystemState): void {
    const newMood = STATE_TO_MOOD[state];
    
    if (newMood !== this.currentMood.current) {
      this.transitionToMood(newMood, state);
    } else {
      // Même humeur : augmente durée
      this.currentMood.duration = Date.now() - (this.moodHistory[this.moodHistory.length - 1]?.timestamp || Date.now());
    }
  }

  /**
   * Force un changement d'humeur
   */
  setMood(mood: MoodType, trigger: MoodState['trigger'], intensity?: number): void {
    this.transitionToMood(mood, trigger, intensity);
  }

  /**
   * Transition vers nouvelle humeur
   */
  private transitionToMood(
    mood: MoodType,
    trigger: MoodState['trigger'],
    intensity?: number
  ): void {
    // Enregistre dans historique
    this.moodHistory.push({
      mood: this.currentMood.current,
      timestamp: Date.now(),
    });

    // Limite historique à 20 entrées
    if (this.moodHistory.length > 20) {
      this.moodHistory.shift();
    }

    // Nouvelle humeur
    this.currentMood = {
      current: mood,
      intensity: intensity ?? MOOD_INTENSITY[mood],
      duration: 0,
      trigger,
      visualEffect: MOOD_VISUALS[mood],
    };
  }

  /**
   * Obtient l'état d'humeur actuel
   */
  getMoodState(): MoodState {
    return { ...this.currentMood };
  }

  /**
   * Obtient l'humeur dominante récente (10 dernières secondes)
   */
  getDominantRecentMood(): MoodType {
    const recentThreshold = Date.now() - 10000; // 10s
    const recentMoods = this.moodHistory.filter(
      (entry) => entry.timestamp > recentThreshold
    );

    if (recentMoods.length === 0) {
      return this.currentMood.current;
    }

    // Compte occurrences
    const counts: Partial<Record<MoodType, number>> = {};
    recentMoods.forEach((entry) => {
      counts[entry.mood] = (counts[entry.mood] || 0) + 1;
    });

    // Retourne le plus fréquent
    return Object.entries(counts).sort(([, a], [, b]) => b - a)[0][0] as MoodType;
  }

  /**
   * Calcule l'effet visuel combiné (humeur + intensité)
   */
  getComputedVisualEffect(): {
    glowMultiplier: number;
    motionMultiplier: number;
    depthMultiplier: number;
  } {
    const effect = this.currentMood.visualEffect;
    const intensity = this.currentMood.intensity;

    return {
      glowMultiplier: 1 + effect.glowShift * intensity,
      motionMultiplier: effect.motionSpeed,
      depthMultiplier: effect.depthIntensity,
    };
  }

  /**
   * Retourne une description textuelle de l'humeur
   */
  getMoodDescription(): string {
    const { current, intensity, duration } = this.currentMood;
    const durationSec = Math.floor(duration / 1000);
    
    return `${current} (${Math.round(intensity * 100)}%) depuis ${durationSec}s`;
  }

  /**
   * Détermine si l'humeur nécessite attention utilisateur
   */
  requiresAttention(): boolean {
    return this.currentMood.current === 'alerte' || this.currentMood.current === 'attentif';
  }

  /**
   * Génère les CSS variables pour l'humeur actuelle
   */
  generateCSSVariables(): Record<string, string> {
    const effect = this.getComputedVisualEffect();
    
    return {
      '--mood-glow': effect.glowMultiplier.toFixed(3),
      '--mood-motion': effect.motionMultiplier.toFixed(3),
      '--mood-depth': effect.depthMultiplier.toFixed(3),
      '--mood-intensity': this.currentMood.intensity.toFixed(3),
    };
  }

  /**
   * Reset à humeur par défaut
   */
  reset(): void {
    this.currentMood = {
      current: 'clair',
      intensity: 0.6,
      duration: 0,
      trigger: 'stable',
      visualEffect: MOOD_VISUALS.clair,
    };
    this.moodHistory = [];
  }
}

/**
 * Instance singleton globale
 */
export const moodEngine = new MoodEngine();

/**
 * Hook-compatible : retourne état mood actuel
 */
export function getCurrentMood(): MoodState {
  return moodEngine.getMoodState();
}

/**
 * Helper : applique l'humeur aux styles
 */
export function applyMoodToElement(element: HTMLElement): void {
  const vars = moodEngine.generateCSSVariables();
  Object.entries(vars).forEach(([key, value]) => {
    element.style.setProperty(key, value);
  });
}
