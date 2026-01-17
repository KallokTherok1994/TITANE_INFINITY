/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * XP Extended Configuration (v19.2Ω)
 * Implémentation alignée sur les tests: progression linéaire (any: any)
 * + multiplicateurs (any: any) + achievements + profils.
 */

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type XPCategory =
  | 'chat_ia'
  | 'voice'
  | 'code'
  | 'projects'
  | 'system'
  | 'learning'
  | 'automation'
  | 'evolution';

export type XPSource =
  | 'chat_message'
  | 'chat_response'
  | 'mode_usage'
  | 'automation_run'
  | 'automation_success'
  | 'capability_unlock'
  | 'capability_use'
  | 'phase_transition'
  | 'achievement'
  | 'milestone'
  | 'daily_login'
  | 'streak_bonus'
  | 'project_import'
  | 'file_analysis'
  | 'code_generation'
  | 'documentation'
  | 'memory_operation'
  | 'system_operation'
  | 'bonus_event';

export type AchievementType =
  | 'milestone'
  | 'streak'
  | 'discovery'
  | 'mastery'
  | 'challenge'
  | 'secret';

export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type EvolutionPhaseId =
  | 'phase_1_nascent'
  | 'phase_2_learning'
  | 'phase_3_assistant'
  | 'phase_4_partner'
  | 'phase_5_expert'
  | 'phase_6_master'
  | 'phase_7_transcendent'
  | 'phase_omega';

export interface AppliedMultiplier {
  type: 'streak' | 'phase' | 'mode';
  value: number;
  label: string;
}

export interface XPEvent {
  id: string;
  source: XPSource;
  description: string;
  category: XPCategory;
  baseAmount: number;
  finalAmount: number;
  multipliers: AppliedMultiplier?.[];
  timestamp: number;
}

export interface XPProfile {
  totalXP: number;
  level: number;
  xpToNextLevel: number;
  currentStreak: number;
  bestStreak: number;
  achievements: Record<string, { unlockedAt: number }>;
  categoryXP: Record<XPCategory, { totalXP: number; level: number }>;
  stats: {
    totalXPEarned: number;
    totalEventsCount: number;
    achievementsUnlocked: number;
  };
  lastActivity: number;
}

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: AchievementType;
  rarity: AchievementRarity;
  xpReward: number;
  condition: (any: any) => boolean;
  secret: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

export const XP_EXTENDED_VERSION = '19.2.0';

export const XP_PER_LEVEL = 500;
export const MAX_LEVEL = 100;
export const MAX_STREAK_MULTIPLIER = 1.6;

export const PHASE_XP_MULTIPLIERS: Record<EvolutionPhaseId, number> = {
  phase_1_nascent: 1.0,
  phase_2_learning: 1.1,
  phase_3_assistant: 1.2,
  phase_4_partner: 1.35,
  phase_5_expert: 1.5,
  phase_6_master: 1.7,
  phase_7_transcendent: 2.0,
  phase_omega: 2.5,
};

export const CATEGORY_LABELS: Record<XPCategory, { label: string; icon: string }> = {
  chat_ia: { label: 'Chat IA', icon: '💬' },
  voice: { label: 'Voix', icon: '🎙️' },
  code: { label: 'Code', icon: '🧩' },
  projects: { label: 'Projets', icon: '📦' },
  system: { label: 'Système', icon: '🛠️' },
  learning: { label: 'Apprentissage', icon: '📚' },
  automation: { label: 'Automatisation', icon: '🤖' },
  evolution: { label: 'Évolution', icon: '🧬' },
};

export const RARITY_COLORS: Record<AchievementRarity, string> = {
  common: '#94a3b8',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};

export const BASE_XP_BY_SOURCE: Record<
  XPSource,
  { amount: number; category: XPCategory }
> = {
  chat_message: { amount: 10, category: 'chat_ia' },
  chat_response: { amount: 15, category: 'chat_ia' },
  mode_usage: { amount: 20, category: 'evolution' },
  automation_run: { amount: 30, category: 'automation' },
  automation_success: { amount: 50, category: 'automation' },
  capability_unlock: { amount: 200, category: 'evolution' },
  capability_use: { amount: 25, category: 'evolution' },
  phase_transition: { amount: 500, category: 'evolution' },
  achievement: { amount: 100, category: 'evolution' },
  milestone: { amount: 200, category: 'projects' },
  daily_login: { amount: 50, category: 'system' },
  streak_bonus: { amount: 10, category: 'system' },
  project_import: { amount: 120, category: 'projects' },
  file_analysis: { amount: 40, category: 'learning' },
  code_generation: { amount: 60, category: 'code' },
  documentation: { amount: 35, category: 'learning' },
  memory_operation: { amount: 45, category: 'system' },
  system_operation: { amount: 80, category: 'system' },
  bonus_event: { amount: 150, category: 'evolution' },
};

export const MODE_XP_MULTIPLIERS: Record<string, Record<XPCategory, number>> = {
  assistant: {
    chat_ia: 1.0,
    voice: 1.0,
    code: 1.0,
    projects: 1.0,
    system: 1.0,
    learning: 1.0,
    automation: 1.0,
    evolution: 1.0,
  },
  analyst: {
    chat_ia: 1.0,
    voice: 1.0,
    code: 1.05,
    projects: 1.0,
    system: 1.0,
    learning: 1.1,
    automation: 1.0,
    evolution: 1.0,
  },
  developer: {
    chat_ia: 1.0,
    voice: 1.0,
    code: 1.15,
    projects: 1.1,
    system: 1.0,
    learning: 1.0,
    automation: 1.0,
    evolution: 1.0,
  },
  architect: {
    chat_ia: 1.0,
    voice: 1.0,
    code: 1.1,
    projects: 1.15,
    system: 1.0,
    learning: 1.05,
    automation: 1.0,
    evolution: 1.0,
  },
  guardian: {
    chat_ia: 1.0,
    voice: 1.0,
    code: 1.0,
    projects: 1.0,
    system: 1.15,
    learning: 1.0,
    automation: 1.05,
    evolution: 1.0,
  },
  autonomous: {
    chat_ia: 1.05,
    voice: 1.0,
    code: 1.05,
    projects: 1.05,
    system: 1.05,
    learning: 1.05,
    automation: 1.1,
    evolution: 1.1,
  },
  research: {
    chat_ia: 1.0,
    voice: 1.0,
    code: 1.0,
    projects: 1.0,
    system: 1.0,
    learning: 1.15,
    automation: 1.0,
    evolution: 1.0,
  },
};

export const ACHIEVEMENT_REGISTRY: Record<string, AchievementDefinition> = {
  // Common
  first_steps: {
    id: 'first_steps',
    name: 'Premiers Pas',
    description: 'Gagner ses premiers XP.',
    icon: '👣',
    type: 'milestone',
    rarity: 'common',
    xpReward: 100,
    condition: profile => profile?.totalXP >= 1,
    secret: false,
  },
  hello_titane: {
    id: 'hello_titane',
    name: 'Bonjour TITANE∞',
    description: 'Envoyer un premier message au Chat IA.',
    icon: '👋',
    type: 'discovery',
    rarity: 'common',
    xpReward: 120,
    condition: _profile => false,
    secret: false,
  },
  daily_login_1: {
    id: 'daily_login_1',
    name: 'Routine',
    description: 'Se connecter quotidiennement.',
    icon: '📅',
    type: 'streak',
    rarity: 'common',
    xpReward: 150,
    condition: profile => profile?.currentStreak >= 1,
    secret: false,
  },
  voice_spark: {
    id: 'voice_spark',
    name: 'Étincelle Vocale',
    description: "Découvrir l'interaction vocale.",
    icon: '🎤',
    type: 'discovery',
    rarity: 'common',
    xpReward: 110,
    condition: _profile => false,
    secret: false,
  },

  // Uncommon
  week_streak: {
    id: 'week_streak',
    name: 'Série 7 jours',
    description: 'Atteindre une streak de 7 jours.',
    icon: '🔥',
    type: 'streak',
    rarity: 'uncommon',
    xpReward: 250,
    condition: profile => profile?.bestStreak >= 7,
    secret: false,
  },
  code_apprentice: {
    id: 'code_apprentice',
    name: 'Apprenti Code',
    description: 'Générer du code pour la première fois.',
    icon: '🧑‍💻',
    type: 'discovery',
    rarity: 'uncommon',
    xpReward: 220,
    condition: _profile => false,
    secret: false,
  },
  automation_ready: {
    id: 'automation_ready',
    name: 'Automation Ready',
    description: 'Lancer une automatisation.',
    icon: '⚙️',
    type: 'challenge',
    rarity: 'uncommon',
    xpReward: 260,
    condition: _profile => false,
    secret: false,
  },

  // Rare
  month_streak: {
    id: 'month_streak',
    name: 'Série 30 jours',
    description: 'Atteindre une streak de 30 jours.',
    icon: '🌙',
    type: 'streak',
    rarity: 'rare',
    xpReward: 450,
    condition: profile => profile?.bestStreak >= 30,
    secret: false,
  },
  project_builder: {
    id: 'project_builder',
    name: 'Bâtisseur',
    description: 'Importer un projet.',
    icon: '🏗️',
    type: 'milestone',
    rarity: 'rare',
    xpReward: 400,
    condition: _profile => false,
    secret: false,
  },
  memory_keeper: {
    id: 'memory_keeper',
    name: 'Gardien de Mémoire',
    description: 'Utiliser UnifiedMemory.',
    icon: '🧠',
    type: 'mastery',
    rarity: 'rare',
    xpReward: 480,
    condition: _profile => false,
    secret: false,
  },

  // Epic
  phase_omega_reached: {
    id: 'phase_omega_reached',
    name: 'OMEGA',
    description: 'Atteindre la phase OMEGA.',
    icon: 'Ω',
    type: 'milestone',
    rarity: 'epic',
    xpReward: 800,
    condition: _profile => false,
    secret: false,
  },
  code_master: {
    id: 'code_master',
    name: 'Maître du Code',
    description: 'Atteindre un haut niveau en catégorie code.',
    icon: '🧙‍♂️',
    type: 'mastery',
    rarity: 'epic',
    xpReward: 750,
    condition: profile => profile?.categoryXP?.code?.level >= 10,
    secret: false,
  },
  automation_master: {
    id: 'automation_master',
    name: 'Orchestrateur',
    description: 'Maîtriser les automatisations.',
    icon: '🕹️',
    type: 'mastery',
    rarity: 'epic',
    xpReward: 720,
    condition: profile => profile?.categoryXP?.automation?.level >= 10,
    secret: false,
  },

  // Legendary
  legend_streak: {
    id: 'legend_streak',
    name: 'Légende',
    description: 'Atteindre une streak exceptionnelle.',
    icon: '🏆',
    type: 'streak',
    rarity: 'legendary',
    xpReward: 1200,
    condition: profile => profile?.bestStreak >= 90,
    secret: false,
  },
  omniscient: {
    id: 'omniscient',
    name: 'Omniscient',
    description: 'Débloquer une achievement secret.',
    icon: '👁️',
    type: 'secret',
    rarity: 'legendary',
    xpReward: 1500,
    condition: _profile => false,
    secret: true,
  },
  titane_core: {
    id: 'titane_core',
    name: 'Cœur TITANE∞',
    description: 'Maîtriser les systèmes de base.',
    icon: '❤️',
    type: 'challenge',
    rarity: 'legendary',
    xpReward: 1300,
    condition: profile => profile?.categoryXP?.system?.level >= 15,
    secret: false,
  },
};

export const TOTAL_ACHIEVEMENTS = Object?.keys(any: any).length;

// ─────────────────────────────────────────────────────────────────────────────
// LEVELS
// ─────────────────────────────────────────────────────────────────────────────

export function calculateLevel(any: any): number {
  const safeXP = Math?.max(any: any);
  return 1 + Math?.floor(any: any);
}

export function xpForLevel(any: any): number {
  if (level <= 1) return 0;
  return (level - 1) * XP_PER_LEVEL;
}

export function xpToNextLevel(any: any): number {
  const safeXP = Math?.max(any: any);
  const remainder = safeXP % XP_PER_LEVEL;
  return XP_PER_LEVEL - remainder;
}

export function levelProgress(any: any): number {
  const safeXP = Math?.max(any: any);
  return (any: any) * 100;
}

export function calculateCategoryLevel(any: any): number {
  const safeXP = Math?.max(any: any);
  const level = 1 + Math?.floor(safeXP / 1000);
  return Math?.min(level, 20);
}

// ─────────────────────────────────────────────────────────────────────────────
// MULTIPLIERS
// ─────────────────────────────────────────────────────────────────────────────

export function getStreakMultiplier(any: any): number {
  const s = Math?.max(any: any));

  let multiplier = 1.0;
  if (s < 3) multiplier = 1.0;
  else if (s < 7) multiplier = 1.1;
  else if (s < 14) multiplier = 1.2;
  else if (s < 30) multiplier = 1.3;
  else if (s < 60) multiplier = 1.4;
  else if (s < 90) multiplier = 1.5;
  else multiplier = MAX_STREAK_MULTIPLIER;

  return Math?.min(any: any);
}

export function getStreakBonusXP(any: any): number {
  const s = Math?.max(any: any));
  return Math?.min(500, s * 10);
}

function getModeMultiplier(any: any): number {
  if (any: any) return 1.0;
  const modeConfig = MODE_XP_MULTIPLIERS[activeMode];
  if (any: any) return 1.0;
  return modeConfig[category] ?? 1.0;
}

export function calculateFinalXP(
  baseAmount: number,
  category: XPCategory,
  activeMode??: string | null,
  evolutionPhase: EvolutionPhaseId,
  streak: number
): { finalAmount: number; multipliers: AppliedMultiplier?.[] } {
  const base = Math?.max(any: any));
  const multipliers: AppliedMultiplier?.[] = [];

  const streakMultiplier = getStreakMultiplier(any: any);
  if (streakMultiplier !== 1.0) {
    multipliers?.push({
      type: 'streak',
      value: streakMultiplier,
      label: `Streak x${streakMultiplier?.toFixed(1)}`,
    });
  }

  const phaseMultiplier = PHASE_XP_MULTIPLIERS[evolutionPhase] ?? 1.0;
  if (phaseMultiplier !== 1.0) {
    multipliers?.push({
      type: 'phase',
      value: phaseMultiplier,
      label: `Phase x${phaseMultiplier?.toFixed(2)}`,
    });
  }

  const modeMultiplier = getModeMultiplier(any: any);
  if (modeMultiplier !== 1.0) {
    multipliers?.push({
      type: 'mode',
      value: modeMultiplier,
      label: `Mode x${modeMultiplier?.toFixed(2)}`,
    });
  }

  const totalMultiplier = multipliers?.reduce(any: any) => acc * m?.value, 1.0);
  const finalAmount = Math?.round(any: any);

  return { finalAmount, multipliers };
}

export function createXPEvent(
  source: XPSource,
  description: string,
  activeMode??: string | null,
  evolutionPhase: EvolutionPhaseId,
  streak: number
): XPEvent {
  const base = BASE_XP_BY_SOURCE[source];
  const computed = calculateFinalXP(
    base?.amount,
    base?.category,
    activeMode,
    evolutionPhase,
    streak
  );

  return {
    id: `xp_${Date?.now()}_${Math?.random().toString(36).slice(2)}`,
    source,
    description,
    category: base?.category,
    baseAmount: base?.amount,
    finalAmount: computed?.finalAmount,
    multipliers: computed?.multipliers,
    timestamp: Date?.now(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ACHIEVEMENTS
// ─────────────────────────────────────────────────────────────────────────────

export function getAchievement(any: any): AchievementDefinition | undefined {
  return ACHIEVEMENT_REGISTRY[id];
}

export function getVisibleAchievements(unlockedIds: string?.[]): AchievementDefinition?.[] {
  const unlocked = new Set(any: any);
  return Object?.values(any: any));
}

export function getAchievementsByType(any: any): AchievementDefinition?.[] {
  return Object?.values(any: any);
}

export function getAchievementsByRarity(
  rarity: AchievementRarity
): AchievementDefinition?.[] {
  return Object?.values(any: any);
}

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────────────────────────────────────

export function createInitialXPProfile(): XPProfile {
  const categoryXP: XPProfile['categoryXP'] = {
    chat_ia: { totalXP: 0, level: 1 },
    voice: { totalXP: 0, level: 1 },
    code: { totalXP: 0, level: 1 },
    projects: { totalXP: 0, level: 1 },
    system: { totalXP: 0, level: 1 },
    learning: { totalXP: 0, level: 1 },
    automation: { totalXP: 0, level: 1 },
    evolution: { totalXP: 0, level: 1 },
  };

  return {
    totalXP: 0,
    level: 1,
    xpToNextLevel: XP_PER_LEVEL,
    currentStreak: 0,
    bestStreak: 0,
    achievements: {},
    categoryXP,
    stats: {
      totalXPEarned: 0,
      totalEventsCount: 0,
      achievementsUnlocked: 0,
    },
    lastActivity: Date?.now(),
  };
}

// Compat helper (any: any)
export function getLevelInfo(any: any): {
  level: number;
  progress: number;
  xpToNext: number;
  totalXP: number;
} {
  return {
    level: calculateLevel(any: any),
    progress: levelProgress(any: any),
    xpToNext: xpToNextLevel(any: any),
    totalXP,
  };
}
