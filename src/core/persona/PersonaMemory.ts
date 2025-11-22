/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v24 — PERSONA MEMORY
 *   Phase 10: Mémoire adaptative et profil utilisateur
 * ═══════════════════════════════════════════════════════════════
 */

import type { PersonaMemory, UserSpeed, ArchetypeType } from '../ARCHITECTURE_TYPES_v24-v∞';

/**
 * Créer une mémoire persona par défaut
 */
export function createDefaultPersonaMemory(): PersonaMemory {
  return {
    userPreferences: {
      typicalRhythm: 'medium',
      preferredDensity: 0.6,
      visualSensitivity: 0.7,
      soundTolerance: 0.8,
    },
    interactionHistory: {
      totalSessions: 0,
      avgSessionDuration: 0,
      mostUsedArchetype: 'helios',
      errorTolerance: 0.6,
    },
    adaptiveProfile: {
      needsSimplification: false,
      prefersSpeed: false,
      sensitiveToMotion: false,
    },
  };
}

/**
 * Mettre à jour les préférences utilisateur basées sur l'usage
 */
export function updateUserPreferences(
  memory: PersonaMemory,
  sessionData: {
    duration: number;
    clickSpeed: number;
    scrollSpeed: number;
    errors: number;
  }
): PersonaMemory {
  // Déterminer le rythme typique
  const avgSpeed = (sessionData.clickSpeed + sessionData.scrollSpeed) / 2;
  let rhythm: UserSpeed = 'medium';
  if (avgSpeed > 0.7) rhythm = 'fast';
  else if (avgSpeed < 0.3) rhythm = 'slow';

  // Mettre à jour l'historique
  const newTotalSessions = memory.interactionHistory.totalSessions + 1;
  const newAvgDuration =
    (memory.interactionHistory.avgSessionDuration * memory.interactionHistory.totalSessions + sessionData.duration) /
    newTotalSessions;

  // Calculer la tolérance aux erreurs
  const errorRate = sessionData.errors / Math.max(1, sessionData.duration / 1000);
  const newErrorTolerance =
    (memory.interactionHistory.errorTolerance * memory.interactionHistory.totalSessions + (1 - errorRate)) /
    newTotalSessions;

  return {
    userPreferences: {
      ...memory.userPreferences,
      typicalRhythm: rhythm,
    },
    interactionHistory: {
      ...memory.interactionHistory,
      totalSessions: newTotalSessions,
      avgSessionDuration: newAvgDuration,
      errorTolerance: Math.max(0, Math.min(1, newErrorTolerance)),
    },
    adaptiveProfile: {
      needsSimplification: errorRate > 0.3,
      prefersSpeed: rhythm === 'fast',
      sensitiveToMotion: avgSpeed < 0.3,
    },
  };
}

/**
 * Déterminer l'archétype le plus utilisé
 */
export function determinePreferredArchetype(
  usageStats: Record<ArchetypeType, number>
): ArchetypeType {
  let maxUsage = 0;
  let preferred: ArchetypeType = 'helios';

  for (const [archetype, usage] of Object.entries(usageStats) as [ArchetypeType, number][]) {
    if (usage > maxUsage) {
      maxUsage = usage;
      preferred = archetype;
    }
  }

  return preferred;
}

/**
 * Calculer la densité préférée basée sur le comportement
 */
export function calculatePreferredDensity(
  scrollSpeed: number,
  clickFrequency: number
): number {
  // Vitesse élevée = densité basse (moins d'infos à la fois)
  // Vitesse faible = densité haute (peut lire plus)
  const densityFromSpeed = 1 - (scrollSpeed * 0.5);
  const densityFromClicks = 1 - (clickFrequency * 0.3);

  return Math.max(0, Math.min(1, (densityFromSpeed + densityFromClicks) / 2));
}

/**
 * Ajuster la sensibilité visuelle basée sur l'heure et l'usage
 */
export function adjustVisualSensitivity(
  currentSensitivity: number,
  timeOfDay: number, // 0-23
  motionUsage: number // 0-1
): number {
  // Réduire la sensibilité la nuit (moins de mouvement)
  const nightFactor = (timeOfDay >= 22 || timeOfDay <= 6) ? 0.7 : 1.0;

  // Adapter selon l'usage du mouvement
  const motionFactor = 1 - (motionUsage * 0.2);

  return Math.max(0.3, Math.min(1, currentSensitivity * nightFactor * motionFactor));
}

/**
 * Obtenir des recommandations basées sur la mémoire
 */
export function getPersonaRecommendations(memory: PersonaMemory): {
  suggestedDensity: number;
  suggestedMotionLevel: number;
  suggestedSoundLevel: number;
} {
  const { adaptiveProfile, userPreferences } = memory;

  return {
    suggestedDensity: adaptiveProfile.needsSimplification ? 0.4 : userPreferences.preferredDensity,
    suggestedMotionLevel: adaptiveProfile.sensitiveToMotion ? 0.3 : 0.7,
    suggestedSoundLevel: userPreferences.soundTolerance,
  };
}
