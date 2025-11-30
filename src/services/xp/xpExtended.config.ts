/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.2Ω — SYSTÈME XP ÉTENDU
 *   XP par mode, par action, multiplicateurs, intégration évolution
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   🎯 Ce module étend le système XP existant avec:
 *   - XP par mode de chat
 *   - XP par type d'action
 *   - Multiplicateurs dynamiques
 *   - Intégration avec système d'évolution
 *   - Achievements et milestones
 */

import type { ChatModeId } from '../ai/chatModes.config';
import type { AutomationId, AutomationCategory } from '../automation/automations.config';
import type { EvolutionPhaseId, CapabilityCategory } from '../evolution/evolutionIA.config';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES FONDAMENTAUX
// ─────────────────────────────────────────────────────────────────────────────

/** Sources d'XP */
export type XPSource =
  | 'chat_message'        // Message utilisateur traité
  | 'chat_response'       // Réponse IA générée
  | 'mode_usage'          // Utilisation d'un mode
  | 'automation_run'      // Exécution d'automation
  | 'automation_success'  // Automation réussie
  | 'capability_unlock'   // Déblocage capability
  | 'capability_use'      // Utilisation capability
  | 'phase_transition'    // Transition de phase
  | 'achievement'         // Achievement débloqué
  | 'milestone'           // Milestone atteint
  | 'daily_login'         // Connexion quotidienne
  | 'streak_bonus'        // Bonus de série
  | 'project_import'      // Import de projet
  | 'file_analysis'       // Analyse de fichier
  | 'code_generation'     // Génération de code
  | 'documentation'       // Génération doc
  | 'memory_operation'    // Opération mémoire
  | 'system_operation'    // Opération système
  | 'bonus_event';        // Événement bonus

/** Catégories d'XP (alignées avec exp_engine.rs) */
export type XPCategory =
  | 'chat_ia'
  | 'voice'
  | 'code'
  | 'projects'
  | 'system'
  | 'learning'
  | 'automation'
  | 'evolution';

/** Type d'achievement */
export type AchievementType =
  | 'milestone'      // Basé sur quantité
  | 'streak'         // Basé sur série
  | 'discovery'      // Première fois
  | 'mastery'        // Maîtrise
  | 'challenge'      // Défi spécial
  | 'secret';        // Secret

/** Rareté d'achievement */
export type AchievementRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary';

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACES: ÉVÉNEMENTS XP
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Événement XP complet
 */
export interface XPEvent {
  /** ID unique de l'événement */
  id: string;

  /** Source de l'XP */
  source: XPSource;

  /** Catégorie d'XP */
  category: XPCategory;

  /** Montant de base */
  baseAmount: number;

  /** Multiplicateurs appliqués */
  multipliers: XPMultiplier[];

  /** Montant final (après multiplicateurs) */
  finalAmount: number;

  /** Timestamp */
  timestamp: number;

  /** Description */
  description: string;

  /** Métadonnées additionnelles */
  metadata?: Record<string, unknown>;

  /** Mode actif lors du gain */
  activeMode?: ChatModeId;

  /** Phase d'évolution lors du gain */
  evolutionPhase?: EvolutionPhaseId;
}

/**
 * Multiplicateur XP
 */
export interface XPMultiplier {
  type: 'mode' | 'phase' | 'capability' | 'streak' | 'event' | 'achievement';
  source: string;  // ID du mode, phase, capability, etc.
  value: number;   // Multiplicateur (1.0 = pas de changement)
  description: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACES: ACHIEVEMENTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Définition d'un achievement
 */
export interface Achievement {
  /** ID unique */
  id: string;

  /** Nom */
  name: string;

  /** Description */
  description: string;

  /** Icône */
  icon: string;

  /** Type */
  type: AchievementType;

  /** Rareté */
  rarity: AchievementRarity;

  /** XP accordé */
  xpReward: number;

  /** Condition de déblocage */
  condition: AchievementCondition;

  /** Secret (non visible avant déblocage) */
  secret: boolean;

  /** Tags */
  tags: string[];
}

/**
 * Condition d'achievement
 */
export interface AchievementCondition {
  type: 'count' | 'streak' | 'threshold' | 'combination' | 'time_limited' | 'custom';
  target: string;  // Ce qui est compté/mesuré
  value: number;   // Valeur cible
  timeLimit?: number;  // Limite de temps (ms) pour time_limited
  subConditions?: AchievementCondition[];  // Pour combination
}

/**
 * État d'un achievement pour l'utilisateur
 */
export interface AchievementState {
  achievementId: string;
  unlocked: boolean;
  unlockedAt?: number;
  progress: number;  // 0-100
  currentValue: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACES: PROFIL XP ÉTENDU
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Profil XP étendu (complète XPState existant)
 */
export interface ExtendedXPProfile {
  /** XP total */
  totalXP: number;

  /** Niveau global */
  level: number;

  /** XP vers prochain niveau */
  xpToNextLevel: number;

  /** XP par catégorie */
  categoryXP: Record<XPCategory, CategoryXPData>;

  /** XP par mode de chat */
  modeXP: Partial<Record<ChatModeId, number>>;

  /** Multiplicateurs actifs */
  activeMultipliers: XPMultiplier[];

  /** Streak actuel (jours consécutifs) */
  currentStreak: number;

  /** Meilleur streak */
  bestStreak: number;

  /** Dernière activité */
  lastActivity: number;

  /** Achievements */
  achievements: Record<string, AchievementState>;

  /** Statistiques */
  stats: XPStats;
}

/**
 * Données XP par catégorie
 */
export interface CategoryXPData {
  totalXP: number;
  level: number;
  contributions: number;
  lastGain: number;
}

/**
 * Statistiques XP
 */
export interface XPStats {
  totalXPEarned: number;
  totalEventsCount: number;
  averageXPPerDay: number;
  bestDayXP: number;
  bestDayDate: number;
  totalDaysActive: number;
  achievementsUnlocked: number;
  totalMultiplierBonus: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION XP PAR SOURCE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * XP de base par source
 */
export const BASE_XP_BY_SOURCE: Record<XPSource, { amount: number; category: XPCategory }> = {
  chat_message: { amount: 5, category: 'chat_ia' },
  chat_response: { amount: 10, category: 'chat_ia' },
  mode_usage: { amount: 3, category: 'chat_ia' },
  automation_run: { amount: 15, category: 'automation' },
  automation_success: { amount: 25, category: 'automation' },
  capability_unlock: { amount: 100, category: 'evolution' },
  capability_use: { amount: 5, category: 'evolution' },
  phase_transition: { amount: 500, category: 'evolution' },
  achievement: { amount: 50, category: 'learning' },
  milestone: { amount: 200, category: 'learning' },
  daily_login: { amount: 20, category: 'system' },
  streak_bonus: { amount: 10, category: 'system' },  // Par jour de streak
  project_import: { amount: 50, category: 'projects' },
  file_analysis: { amount: 15, category: 'code' },
  code_generation: { amount: 30, category: 'code' },
  documentation: { amount: 25, category: 'code' },
  memory_operation: { amount: 10, category: 'system' },
  system_operation: { amount: 5, category: 'system' },
  bonus_event: { amount: 100, category: 'learning' },
};

// ─────────────────────────────────────────────────────────────────────────────
// MULTIPLICATEURS PAR MODE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Multiplicateurs XP par mode de chat
 */
export const MODE_XP_MULTIPLIERS: Record<ChatModeId, Partial<Record<XPCategory, number>>> = {
  default: {},  // Pas de bonus
  brainstorming: {
    chat_ia: 1.3,
    learning: 1.2,
  },
  synthesis: {
    chat_ia: 1.4,
    code: 1.2,
  },
  planning: {
    projects: 1.5,
    automation: 1.2,
  },
  journal: {
    learning: 1.5,
    chat_ia: 1.3,
  },
  debug_cognitive: {
    learning: 1.4,
    evolution: 1.3,
  },
  coach: {
    learning: 1.5,
    evolution: 1.2,
  },
  dev: {
    code: 1.5,
    automation: 1.3,
    projects: 1.2,
  },
  admin: {
    system: 1.5,
    automation: 1.4,
    code: 1.2,
  },
  strategy: {
    projects: 1.4,
    learning: 1.3,
  },
  audit: {
    code: 1.4,
    system: 1.3,
    automation: 1.2,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// MULTIPLICATEURS PAR PHASE D'ÉVOLUTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Multiplicateurs XP par phase d'évolution
 */
export const PHASE_XP_MULTIPLIERS: Record<EvolutionPhaseId, number> = {
  phase_1_nascent: 1.0,
  phase_2_learning: 1.1,
  phase_3_assistant: 1.2,
  phase_4_partner: 1.35,
  phase_5_expert: 1.5,
  phase_6_master: 1.75,
  phase_7_transcendent: 2.0,
  phase_omega: 2.5,
};

// ─────────────────────────────────────────────────────────────────────────────
// MULTIPLICATEURS STREAK
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Multiplicateur selon la série de jours consécutifs
 */
export function getStreakMultiplier(streak: number): number {
  if (streak < 3) return 1.0;
  if (streak < 7) return 1.1;
  if (streak < 14) return 1.2;
  if (streak < 30) return 1.3;
  if (streak < 60) return 1.4;
  if (streak < 90) return 1.5;
  return 1.6;  // 90+ jours
}

/**
 * Bonus XP pour streak (accordé quotidiennement)
 */
export function getStreakBonusXP(streak: number): number {
  return Math.min(streak * 10, 500);  // Max 500 XP/jour
}

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRE DES ACHIEVEMENTS
// ─────────────────────────────────────────────────────────────────────────────

export const ACHIEVEMENT_REGISTRY: Record<string, Achievement> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // DÉCOUVERTE (Premier fois)
  // ═══════════════════════════════════════════════════════════════════════════

  first_message: {
    id: 'first_message',
    name: 'Premier Contact',
    description: 'Envoyez votre premier message',
    icon: '👋',
    type: 'discovery',
    rarity: 'common',
    xpReward: 50,
    condition: { type: 'count', target: 'messages_sent', value: 1 },
    secret: false,
    tags: ['chat', 'first'],
  },

  first_mode_change: {
    id: 'first_mode_change',
    name: 'Explorateur de Modes',
    description: 'Changez de mode de chat pour la première fois',
    icon: '🔀',
    type: 'discovery',
    rarity: 'common',
    xpReward: 50,
    condition: { type: 'count', target: 'mode_changes', value: 1 },
    secret: false,
    tags: ['mode', 'first'],
  },

  first_automation: {
    id: 'first_automation',
    name: 'Automaticien Débutant',
    description: 'Exécutez votre première automation',
    icon: '⚙️',
    type: 'discovery',
    rarity: 'common',
    xpReward: 75,
    condition: { type: 'count', target: 'automations_run', value: 1 },
    secret: false,
    tags: ['automation', 'first'],
  },

  first_capability: {
    id: 'first_capability',
    name: 'Évolution Initiée',
    description: 'Débloquez votre première capability',
    icon: '🌱',
    type: 'discovery',
    rarity: 'uncommon',
    xpReward: 100,
    condition: { type: 'count', target: 'capabilities_unlocked', value: 1 },
    secret: false,
    tags: ['evolution', 'capability', 'first'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MILESTONES (Quantité)
  // ═══════════════════════════════════════════════════════════════════════════

  messages_100: {
    id: 'messages_100',
    name: 'Conversationnel',
    description: 'Envoyez 100 messages',
    icon: '💬',
    type: 'milestone',
    rarity: 'common',
    xpReward: 100,
    condition: { type: 'count', target: 'messages_sent', value: 100 },
    secret: false,
    tags: ['chat', 'milestone'],
  },

  messages_1000: {
    id: 'messages_1000',
    name: 'Grand Communicant',
    description: 'Envoyez 1000 messages',
    icon: '🗣️',
    type: 'milestone',
    rarity: 'uncommon',
    xpReward: 300,
    condition: { type: 'count', target: 'messages_sent', value: 1000 },
    secret: false,
    tags: ['chat', 'milestone'],
  },

  messages_10000: {
    id: 'messages_10000',
    name: 'Maître de la Conversation',
    description: 'Envoyez 10 000 messages',
    icon: '👑',
    type: 'milestone',
    rarity: 'epic',
    xpReward: 1000,
    condition: { type: 'count', target: 'messages_sent', value: 10000 },
    secret: false,
    tags: ['chat', 'milestone'],
  },

  automations_10: {
    id: 'automations_10',
    name: 'Automaticien Amateur',
    description: 'Exécutez 10 automations',
    icon: '🔧',
    type: 'milestone',
    rarity: 'common',
    xpReward: 100,
    condition: { type: 'count', target: 'automations_run', value: 10 },
    secret: false,
    tags: ['automation', 'milestone'],
  },

  automations_100: {
    id: 'automations_100',
    name: 'Automaticien Expert',
    description: 'Exécutez 100 automations',
    icon: '🤖',
    type: 'milestone',
    rarity: 'rare',
    xpReward: 500,
    condition: { type: 'count', target: 'automations_run', value: 100 },
    secret: false,
    tags: ['automation', 'milestone'],
  },

  level_10: {
    id: 'level_10',
    name: 'Débutant Confirmé',
    description: 'Atteignez le niveau 10',
    icon: '📈',
    type: 'milestone',
    rarity: 'common',
    xpReward: 200,
    condition: { type: 'threshold', target: 'level', value: 10 },
    secret: false,
    tags: ['level', 'milestone'],
  },

  level_25: {
    id: 'level_25',
    name: 'Intermédiaire',
    description: 'Atteignez le niveau 25',
    icon: '🌟',
    type: 'milestone',
    rarity: 'uncommon',
    xpReward: 500,
    condition: { type: 'threshold', target: 'level', value: 25 },
    secret: false,
    tags: ['level', 'milestone'],
  },

  level_50: {
    id: 'level_50',
    name: 'Maître TITANE',
    description: 'Atteignez le niveau 50',
    icon: '💎',
    type: 'milestone',
    rarity: 'legendary',
    xpReward: 2500,
    condition: { type: 'threshold', target: 'level', value: 50 },
    secret: false,
    tags: ['level', 'milestone'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STREAKS (Série)
  // ═══════════════════════════════════════════════════════════════════════════

  streak_7: {
    id: 'streak_7',
    name: 'Semaine Active',
    description: 'Maintenez une série de 7 jours',
    icon: '🔥',
    type: 'streak',
    rarity: 'common',
    xpReward: 150,
    condition: { type: 'streak', target: 'daily_streak', value: 7 },
    secret: false,
    tags: ['streak', 'daily'],
  },

  streak_30: {
    id: 'streak_30',
    name: 'Mois Engagé',
    description: 'Maintenez une série de 30 jours',
    icon: '🌟',
    type: 'streak',
    rarity: 'rare',
    xpReward: 500,
    condition: { type: 'streak', target: 'daily_streak', value: 30 },
    secret: false,
    tags: ['streak', 'daily'],
  },

  streak_100: {
    id: 'streak_100',
    name: 'Centurion',
    description: 'Maintenez une série de 100 jours',
    icon: '💯',
    type: 'streak',
    rarity: 'epic',
    xpReward: 2000,
    condition: { type: 'streak', target: 'daily_streak', value: 100 },
    secret: false,
    tags: ['streak', 'daily'],
  },

  streak_365: {
    id: 'streak_365',
    name: 'Année Parfaite',
    description: 'Maintenez une série de 365 jours',
    icon: '🏆',
    type: 'streak',
    rarity: 'legendary',
    xpReward: 10000,
    condition: { type: 'streak', target: 'daily_streak', value: 365 },
    secret: false,
    tags: ['streak', 'daily'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MAÎTRISE (Mastery)
  // ═══════════════════════════════════════════════════════════════════════════

  all_modes_used: {
    id: 'all_modes_used',
    name: 'Polyvalent',
    description: 'Utilisez tous les modes de chat',
    icon: '🎭',
    type: 'mastery',
    rarity: 'rare',
    xpReward: 500,
    condition: { type: 'count', target: 'unique_modes_used', value: 11 },
    secret: false,
    tags: ['mode', 'mastery'],
  },

  all_automations_run: {
    id: 'all_automations_run',
    name: 'Automatisation Complète',
    description: 'Exécutez toutes les types d\'automations',
    icon: '🤖',
    type: 'mastery',
    rarity: 'epic',
    xpReward: 1000,
    condition: { type: 'count', target: 'unique_automations_run', value: 16 },
    secret: false,
    tags: ['automation', 'mastery'],
  },

  phase_master: {
    id: 'phase_master',
    name: 'Évolution Maîtrisée',
    description: 'Atteignez la phase Maître',
    icon: '👑',
    type: 'mastery',
    rarity: 'epic',
    xpReward: 2000,
    condition: { type: 'threshold', target: 'evolution_phase', value: 6 },
    secret: false,
    tags: ['evolution', 'mastery'],
  },

  phase_omega: {
    id: 'phase_omega',
    name: 'OMEGA Atteint',
    description: 'Atteignez la phase OMEGA',
    icon: 'Ω',
    type: 'mastery',
    rarity: 'legendary',
    xpReward: 10000,
    condition: { type: 'threshold', target: 'evolution_phase', value: 8 },
    secret: false,
    tags: ['evolution', 'mastery', 'omega'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECRETS
  // ═══════════════════════════════════════════════════════════════════════════

  night_owl: {
    id: 'night_owl',
    name: 'Oiseau de Nuit',
    description: '???',
    icon: '🦉',
    type: 'secret',
    rarity: 'rare',
    xpReward: 250,
    condition: { type: 'custom', target: 'activity_between_2am_5am', value: 10 },
    secret: true,
    tags: ['secret', 'time'],
  },

  speedrunner: {
    id: 'speedrunner',
    name: 'Speedrunner',
    description: '???',
    icon: '⚡',
    type: 'secret',
    rarity: 'epic',
    xpReward: 500,
    condition: { type: 'time_limited', target: 'messages_in_hour', value: 100, timeLimit: 3600000 },
    secret: true,
    tags: ['secret', 'speed'],
  },

  perfectionist: {
    id: 'perfectionist',
    name: 'Perfectionniste',
    description: '???',
    icon: '✨',
    type: 'secret',
    rarity: 'legendary',
    xpReward: 1000,
    condition: { type: 'count', target: 'automation_success_streak', value: 50 },
    secret: true,
    tags: ['secret', 'automation'],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// FORMULES XP
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculer le niveau à partir de l'XP total
 * Formule: Level = 1 + floor(totalXP / 500)
 * Compatible avec XP_ENGINE.ts existant
 */
export function calculateLevel(totalXP: number): number {
  return Math.floor(1 + totalXP / 500);
}

/**
 * Calculer l'XP nécessaire pour un niveau donné
 */
export function xpForLevel(level: number): number {
  return (level - 1) * 500;
}

/**
 * Calculer l'XP restant pour le prochain niveau
 */
export function xpToNextLevel(totalXP: number): number {
  return 500 - (totalXP % 500);
}

/**
 * Calculer le pourcentage de progression vers le prochain niveau
 */
export function levelProgress(totalXP: number): number {
  return ((totalXP % 500) / 500) * 100;
}

/**
 * Calculer le niveau d'une catégorie (formule différente)
 * Formule: Level = floor(sqrt(categoryXP / 100)) + 1
 * Compatible avec exp_engine.rs
 */
export function calculateCategoryLevel(categoryXP: number): number {
  return Math.floor(Math.sqrt(categoryXP / 100)) + 1;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculer l'XP final avec tous les multiplicateurs
 */
export function calculateFinalXP(
  baseAmount: number,
  category: XPCategory,
  activeMode: ChatModeId | null,
  evolutionPhase: EvolutionPhaseId,
  streak: number,
  additionalMultipliers: XPMultiplier[] = []
): { finalAmount: number; multipliers: XPMultiplier[] } {
  const multipliers: XPMultiplier[] = [];
  let total = baseAmount;

  // Multiplicateur de phase d'évolution
  const phaseMultiplier = PHASE_XP_MULTIPLIERS[evolutionPhase];
  if (phaseMultiplier !== 1.0) {
    multipliers.push({
      type: 'phase',
      source: evolutionPhase,
      value: phaseMultiplier,
      description: `Phase ${evolutionPhase}: x${phaseMultiplier}`,
    });
    total *= phaseMultiplier;
  }

  // Multiplicateur de mode
  if (activeMode) {
    const modeMultipliers = MODE_XP_MULTIPLIERS[activeMode];
    const categoryMultiplier = modeMultipliers[category];
    if (categoryMultiplier && categoryMultiplier !== 1.0) {
      multipliers.push({
        type: 'mode',
        source: activeMode,
        value: categoryMultiplier,
        description: `Mode ${activeMode} (${category}): x${categoryMultiplier}`,
      });
      total *= categoryMultiplier;
    }
  }

  // Multiplicateur de streak
  const streakMultiplier = getStreakMultiplier(streak);
  if (streakMultiplier !== 1.0) {
    multipliers.push({
      type: 'streak',
      source: `streak_${streak}`,
      value: streakMultiplier,
      description: `Streak ${streak} jours: x${streakMultiplier}`,
    });
    total *= streakMultiplier;
  }

  // Multiplicateurs additionnels
  for (const mult of additionalMultipliers) {
    multipliers.push(mult);
    total *= mult.value;
  }

  return {
    finalAmount: Math.floor(total),
    multipliers,
  };
}

/**
 * Créer un événement XP
 */
export function createXPEvent(
  source: XPSource,
  description: string,
  activeMode: ChatModeId | null,
  evolutionPhase: EvolutionPhaseId,
  streak: number,
  additionalMultipliers: XPMultiplier[] = [],
  customAmount?: number,
  metadata?: Record<string, unknown>
): XPEvent {
  const baseConfig = BASE_XP_BY_SOURCE[source];
  const baseAmount = customAmount ?? baseConfig.amount;
  const category = baseConfig.category;

  const { finalAmount, multipliers } = calculateFinalXP(
    baseAmount,
    category,
    activeMode,
    evolutionPhase,
    streak,
    additionalMultipliers
  );

  return {
    id: `xp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    source,
    category,
    baseAmount,
    multipliers,
    finalAmount,
    timestamp: Date.now(),
    description,
    metadata,
    activeMode: activeMode ?? undefined,
    evolutionPhase,
  };
}

/**
 * Obtenir un achievement par ID
 */
export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENT_REGISTRY[id];
}

/**
 * Obtenir les achievements visibles (non secrets ou débloqués)
 */
export function getVisibleAchievements(
  unlockedIds: string[]
): Achievement[] {
  return Object.values(ACHIEVEMENT_REGISTRY).filter(
    a => !a.secret || unlockedIds.includes(a.id)
  );
}

/**
 * Obtenir les achievements par type
 */
export function getAchievementsByType(type: AchievementType): Achievement[] {
  return Object.values(ACHIEVEMENT_REGISTRY).filter(a => a.type === type);
}

/**
 * Obtenir les achievements par rareté
 */
export function getAchievementsByRarity(rarity: AchievementRarity): Achievement[] {
  return Object.values(ACHIEVEMENT_REGISTRY).filter(a => a.rarity === rarity);
}

/**
 * Créer un profil XP initial
 */
export function createInitialXPProfile(): ExtendedXPProfile {
  const now = Date.now();

  const categoryXP: Record<XPCategory, CategoryXPData> = {
    chat_ia: { totalXP: 0, level: 1, contributions: 0, lastGain: now },
    voice: { totalXP: 0, level: 1, contributions: 0, lastGain: now },
    code: { totalXP: 0, level: 1, contributions: 0, lastGain: now },
    projects: { totalXP: 0, level: 1, contributions: 0, lastGain: now },
    system: { totalXP: 0, level: 1, contributions: 0, lastGain: now },
    learning: { totalXP: 0, level: 1, contributions: 0, lastGain: now },
    automation: { totalXP: 0, level: 1, contributions: 0, lastGain: now },
    evolution: { totalXP: 0, level: 1, contributions: 0, lastGain: now },
  };

  return {
    totalXP: 0,
    level: 1,
    xpToNextLevel: 500,
    categoryXP,
    modeXP: {},
    activeMultipliers: [],
    currentStreak: 0,
    bestStreak: 0,
    lastActivity: now,
    achievements: {},
    stats: {
      totalXPEarned: 0,
      totalEventsCount: 0,
      averageXPPerDay: 0,
      bestDayXP: 0,
      bestDayDate: now,
      totalDaysActive: 0,
      achievementsUnlocked: 0,
      totalMultiplierBonus: 0,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────

/** XP par niveau (constant) */
export const XP_PER_LEVEL = 500;

/** Niveau maximum */
export const MAX_LEVEL = 100;

/** Streak maximum pour multiplicateur */
export const MAX_STREAK_MULTIPLIER = 1.6;

/** Nombre total d'achievements */
export const TOTAL_ACHIEVEMENTS = Object.keys(ACHIEVEMENT_REGISTRY).length;

/** Version du système XP étendu */
export const XP_EXTENDED_VERSION = '1.0.0';

/** Labels des catégories */
export const CATEGORY_LABELS: Record<XPCategory, { label: string; icon: string }> = {
  chat_ia: { label: 'Chat IA', icon: '💬' },
  voice: { label: 'Voix', icon: '🎤' },
  code: { label: 'Code', icon: '💻' },
  projects: { label: 'Projets', icon: '📁' },
  system: { label: 'Système', icon: '⚙️' },
  learning: { label: 'Apprentissage', icon: '📚' },
  automation: { label: 'Automation', icon: '🤖' },
  evolution: { label: 'Évolution', icon: '🌟' },
};

/** Couleurs des raretés */
export const RARITY_COLORS: Record<AchievementRarity, string> = {
  common: '#9ca3af',      // Gris
  uncommon: '#22c55e',    // Vert
  rare: '#3b82f6',        // Bleu
  epic: '#a855f7',        // Violet
  legendary: '#f59e0b',   // Or
};
