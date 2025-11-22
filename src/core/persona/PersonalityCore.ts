/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v24 — PERSONALITY CORE
 *   Phase 10: Définition du caractère fondamental du système
 * ═══════════════════════════════════════════════════════════════
 */

import type { PersonalityCore as PersonalityCoreType } from '../ARCHITECTURE_TYPES_v24-v∞';

/**
 * Créer un PersonalityCore par défaut (stable, calme, précis)
 */
export function createDefaultPersonalityCore(): PersonalityCoreType {
  return {
    traits: {
      calm: 0.75,            // Calme et stable
      precise: 0.90,         // Précis dans les réponses
      analytical: 0.85,      // Très analytique
      stable: 0.80,          // Stable dans le comportement
      responsive: 0.80,      // Réactif au contexte
    },
    temperament: 'serene',   // Tempérament de base
    evolution: 0.0,          // Pas encore d'évolution
  };
}

/**
 * Calculer l'évolution de la personnalité basée sur l'usage
 */
export function evolvePersonality(
  core: PersonalityCoreType,
  usage: {
    successRate: number;
    errorRate: number;
    userSpeed: number;
  }
): PersonalityCoreType {
  const evolutionDelta = (usage.successRate - usage.errorRate) * 0.01;

  return {
    ...core,
    evolution: Math.max(0, Math.min(1, core.evolution + evolutionDelta)),
    traits: {
      ...core.traits,
      responsive: Math.min(1, core.traits.responsive + usage.userSpeed * 0.05),
    },
  };
}

/**
 * Détermine le temperament basé sur l'état système
 */
export function determineTemperament(
  cognitiveLoad: number,
  stability: number
): PersonalityCoreType['temperament'] {
  if (cognitiveLoad > 0.8 || stability < 0.3) return 'alert';
  if (cognitiveLoad > 0.6 || stability < 0.5) return 'focused';
  if (stability > 0.7 && cognitiveLoad < 0.4) return 'serene';
  return 'dormant';
}

/**
 * Obtenir une description textuelle du tempérament (optionnel)
 */
export function getTemperamentDescription(temperament: PersonalityCoreType['temperament']): string {
  const descriptions: Record<PersonalityCoreType['temperament'], string> = {
    serene: 'État calme et stable, système en équilibre',
    focused: 'Attention concentrée, traitement actif',
    alert: 'Vigilance accrue, charge détectée',
    dormant: 'Repos minimal, activité réduite',
  };
  return descriptions[temperament];
}
