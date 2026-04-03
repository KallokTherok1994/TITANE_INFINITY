/**
 * TITANE∞ — Canonical XP Level Calculation
 * 
 * Single source of truth for all XP/level calculations across the codebase.
 * Formula: level = floor(sqrt(xp / 100))
 * 
 * This quadratic formula provides diminishing returns at higher levels,
 * encouraging sustained engagement without runaway progression.
 */

/** Maximum level cap */
export const MAX_LEVEL = 100;

/**
 * Calculate level from total XP (canonical formula)
 * Level 0: 0-99 XP
 * Level 1: 100-399 XP
 * Level 2: 400-899 XP
 * Level N: N² × 100 XP required
 */
export function calculateLevel(totalXP: number): number {
  if (totalXP <= 0) return 0;
  return Math.min(Math.floor(Math.sqrt(totalXP / 100)), MAX_LEVEL);
}

/**
 * Calculate XP required to reach a specific level
 */
export function xpForLevel(level: number): number {
  return level * level * 100;
}

/**
 * Calculate XP required for the next level
 */
export function xpForNextLevel(currentLevel: number): number {
  return xpForLevel(currentLevel + 1);
}

/**
 * Calculate XP accumulated in the current level
 */
export function xpInCurrentLevel(totalXP: number, currentLevel: number): number {
  const levelStartXP = xpForLevel(currentLevel);
  return totalXP - levelStartXP;
}

/**
 * Calculate XP needed to reach the next level from current XP
 */
export function xpToNextLevel(totalXP: number, currentLevel: number): number {
  const nextLevelXP = xpForNextLevel(currentLevel);
  return nextLevelXP - totalXP;
}

/**
 * Calculate progress toward next level (0-1)
 */
export function calculateProgress(totalXP: number, currentLevel: number): number {
  const levelStartXP = xpForLevel(currentLevel);
  const nextLevelXP = xpForNextLevel(currentLevel);
  const xpInLevel = totalXP - levelStartXP;
  const xpNeeded = nextLevelXP - levelStartXP;
  return xpNeeded > 0 ? xpInLevel / xpNeeded : 0;
}

/**
 * Full level info from total XP
 */
export interface LevelInfo {
  level: number;
  xpInCurrentLevel: number;
  xpToNextLevel: number;
  progress: number;
}

/**
 * Get complete level info from total XP
 */
export function getLevelInfo(totalXP: number): LevelInfo {
  const level = calculateLevel(totalXP);
  return {
    level,
    xpInCurrentLevel: xpInCurrentLevel(totalXP, level),
    xpToNextLevel: xpToNextLevel(totalXP, level),
    progress: calculateProgress(totalXP, level),
  };
}