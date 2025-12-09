/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * XP Extended Configuration
 * Système de calcul d'expérience et de niveaux
 */

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

/** XP nécessaire pour le premier niveau */
const BASE_XP = 100;

/** Facteur de croissance exponentielle */
const GROWTH_FACTOR = 1.5;

/** Niveau maximum */
export const MAX_LEVEL = 100;

// ─────────────────────────────────────────────────────────────────────────────
// FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calcule l'XP requise pour atteindre un niveau donné
 */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(BASE_XP * Math.pow(GROWTH_FACTOR, level - 1));
}

/**
 * Calcule le niveau actuel basé sur l'XP total
 */
export function calculateLevel(totalXP: number): number {
  let level = 1;
  let xpRequired = 0;

  while (level < MAX_LEVEL) {
    const nextLevelXP = xpForLevel(level + 1);
    if (totalXP < xpRequired + nextLevelXP) {
      break;
    }
    xpRequired += nextLevelXP;
    level++;
  }

  return level;
}

/**
 * Calcule l'XP nécessaire pour passer au niveau suivant
 */
export function xpToNextLevel(totalXP: number): number {
  const currentLevel = calculateLevel(totalXP);
  if (currentLevel >= MAX_LEVEL) return 0;

  const currentLevelTotalXP = xpForLevelTotal(currentLevel);
  const nextLevelTotalXP = xpForLevelTotal(currentLevel + 1);

  return nextLevelTotalXP - totalXP;
}

/**
 * Calcule l'XP total nécessaire pour atteindre un niveau
 */
export function xpForLevelTotal(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += xpForLevel(i + 1);
  }
  return total;
}

/**
 * Calcule la progression vers le niveau suivant (0-1)
 */
export function levelProgress(totalXP: number): number {
  const currentLevel = calculateLevel(totalXP);
  if (currentLevel >= MAX_LEVEL) return 1;

  const currentLevelTotalXP = xpForLevelTotal(currentLevel);
  const nextLevelXP = xpForLevel(currentLevel + 1);
  const xpInCurrentLevel = totalXP - currentLevelTotalXP;

  return Math.min(1, Math.max(0, xpInCurrentLevel / nextLevelXP));
}

/**
 * Retourne les informations complètes sur le niveau
 */
export function getLevelInfo(totalXP: number) {
  const level = calculateLevel(totalXP);
  const progress = levelProgress(totalXP);
  const toNext = xpToNextLevel(totalXP);
  const currentLevelXP = xpForLevelTotal(level);
  const nextLevelXP = xpForLevel(level + 1);

  return {
    level,
    progress,
    xpToNext: toNext,
    currentLevelXP,
    nextLevelXP,
    totalXP,
    isMaxLevel: level >= MAX_LEVEL,
  };
}
