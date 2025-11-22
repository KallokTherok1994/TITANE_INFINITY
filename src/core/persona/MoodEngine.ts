/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v24 — MOOD ENGINE
 *   Phase 10: Gestion dynamique de l'humeur système
 * ═══════════════════════════════════════════════════════════════
 */

import type { MoodState, MoodType, SystemState } from '../ARCHITECTURE_TYPES_v24-v∞';

/**
 * Créer un état de mood par défaut
 */
export function createDefaultMoodState(): MoodState {
  return {
    current: 'neutre',
    intensity: 0.5,
    duration: 0,
    trigger: 'internal',
    visualEffect: {
      glowShift: 0,
      motionSpeed: 1.0,
      depthIntensity: 0.5,
    },
  };
}

/**
 * Déterminer le mood basé sur l'état système
 */
export function determineMood(
  systemState: SystemState,
  cognitiveLoad: number,
  errorRate: number
): MoodType {
  // Danger ou surcharge critique
  if (systemState === 'danger' || cognitiveLoad > 0.9 || errorRate > 0.3) {
    return 'alerte';
  }

  // Warning ou charge élevée
  if (systemState === 'warning' || cognitiveLoad > 0.7) {
    return 'attentif';
  }

  // Système actif et stable
  if (systemState === 'processing' && cognitiveLoad > 0.4 && cognitiveLoad < 0.7) {
    return 'vibrant';
  }

  // Système stable et optimal
  if (systemState === 'stable' && cognitiveLoad < 0.5 && errorRate < 0.1) {
    return 'clair';
  }

  // Système inactif
  if (systemState === 'offline' || systemState === 'null' || cognitiveLoad < 0.1) {
    return 'dormant';
  }

  // Par défaut
  return 'neutre';
}

/**
 * Calculer l'intensité du mood (0-1)
 */
export function calculateMoodIntensity(
  moodType: MoodType,
  cognitiveLoad: number
): number {
  const baseIntensities: Record<MoodType, number> = {
    clair: 0.7,
    vibrant: 0.85,
    attentif: 0.75,
    alerte: 1.0,
    neutre: 0.5,
    dormant: 0.2,
  };

  const baseIntensity = baseIntensities[moodType];
  return Math.min(1, baseIntensity * (0.5 + cognitiveLoad * 0.5));
}

/**
 * Calculer les effets visuels du mood
 */
export function calculateVisualEffect(
  moodType: MoodType,
  intensity: number
): MoodState['visualEffect'] {
  const moodVisuals: Record<MoodType, { glowShift: number; motionSpeed: number }> = {
    clair: { glowShift: 0.1, motionSpeed: 0.9 },
    vibrant: { glowShift: 0.15, motionSpeed: 1.3 },
    attentif: { glowShift: 0.05, motionSpeed: 1.1 },
    alerte: { glowShift: -0.1, motionSpeed: 1.5 },
    neutre: { glowShift: 0, motionSpeed: 1.0 },
    dormant: { glowShift: -0.2, motionSpeed: 0.5 },
  };

  const visual = moodVisuals[moodType];

  return {
    glowShift: visual.glowShift,
    motionSpeed: visual.motionSpeed,
    depthIntensity: intensity,
  };
}

/**
 * Mettre à jour le mood (avec transition)
 */
export function updateMoodState(
  currentMood: MoodState,
  newMoodType: MoodType,
  trigger: MoodState['trigger'],
  deltaTime: number
): MoodState {
  const isMoodChange = currentMood.current !== newMoodType;

  if (isMoodChange) {
    const newIntensity = calculateMoodIntensity(newMoodType, 0.5);
    return {
      current: newMoodType,
      intensity: newIntensity,
      duration: 0,
      trigger,
      visualEffect: calculateVisualEffect(newMoodType, newIntensity),
    };
  }

  // Mood reste le même, augmente la durée
  return {
    ...currentMood,
    duration: currentMood.duration + deltaTime,
  };
}

/**
 * Obtenir une description textuelle du mood (optionnel)
 */
export function getMoodDescription(mood: MoodType): string {
  const descriptions: Record<MoodType, string> = {
    clair: 'État optimal, système lumineux et performant',
    vibrant: 'Activité élevée, système dynamique',
    attentif: 'Vigilance accrue, traitement actif',
    alerte: 'Attention maximale, situation critique',
    neutre: 'État standard, fonctionnement normal',
    dormant: 'Repos minimal, activité réduite',
  };
  return descriptions[mood];
}
