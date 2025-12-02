/**
 * TITANE∞ vΩ∞ — CONFIGURATION SYSTÈME AUTOMATIONS + XP
 * Super Prompt #2: Automations + XP + Évolution
 * Source de vérité pour le système de progression
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import type {
  XPAction,
  XPActionId,
  LevelConfig,
  UserLevel,
  Achievement,
  AchievementCategory,
  DailyReward,
  Automation,
  UserXPState,
  AutomationSystemState,
  RewardsState,
} from '@/types/automationXP';

// ═══════════════════════════════════════════════════════════════════════════
// A. CONFIGURATION XP ACTIONS
// ═══════════════════════════════════════════════════════════════════════════

export const XP_ACTIONS: Record<XPActionId, XPAction> = {
  chat_message: {
    id: 'chat_message',
    label: 'Message Chat',
    description: 'Envoyer un message dans le chat IA',
    base_xp: 5,
    category: 'interaction',
    multiplier_eligible: true,
    cooldown_ms: 1000,
    max_daily: 200,
  },
  chat_mode_change: {
    id: 'chat_mode_change',
    label: 'Changement de Mode',
    description: 'Changer de mode IA',
    base_xp: 10,
    category: 'interaction',
    multiplier_eligible: true,
    cooldown_ms: 5000,
    max_daily: 50,
  },
  automation_trigger: {
    id: 'automation_trigger',
    label: 'Déclenchement Automation',
    description: 'Déclencher une automation',
    base_xp: 15,
    category: 'automation',
    multiplier_eligible: true,
    cooldown_ms: 0,
    max_daily: 100,
  },
  automation_complete: {
    id: 'automation_complete',
    label: 'Automation Terminée',
    description: 'Compléter une automation avec succès',
    base_xp: 25,
    category: 'automation',
    multiplier_eligible: true,
    cooldown_ms: 0,
    max_daily: 100,
  },
  memory_interaction: {
    id: 'memory_interaction',
    label: 'Interaction Mémoire',
    description: 'Interagir avec le système de mémoire',
    base_xp: 8,
    category: 'interaction',
    multiplier_eligible: true,
    cooldown_ms: 2000,
    max_daily: 100,
  },
  file_import: {
    id: 'file_import',
    label: 'Import Fichier',
    description: 'Importer un fichier dans le système',
    base_xp: 20,
    category: 'interaction',
    multiplier_eligible: true,
    cooldown_ms: 5000,
    max_daily: 50,
  },
  voice_interaction: {
    id: 'voice_interaction',
    label: 'Interaction Vocale',
    description: 'Utiliser la voix pour interagir',
    base_xp: 12,
    category: 'interaction',
    multiplier_eligible: true,
    cooldown_ms: 1000,
    max_daily: 150,
  },
  avatar_customization: {
    id: 'avatar_customization',
    label: 'Personnalisation Avatar',
    description: 'Personnaliser l\'avatar TITANE',
    base_xp: 30,
    category: 'interaction',
    multiplier_eligible: false,
    cooldown_ms: 10000,
    max_daily: 20,
  },
  tool_usage: {
    id: 'tool_usage',
    label: 'Utilisation Outil',
    description: 'Utiliser un outil IA',
    base_xp: 10,
    category: 'interaction',
    multiplier_eligible: true,
    cooldown_ms: 2000,
    max_daily: 100,
  },
  feedback_positive: {
    id: 'feedback_positive',
    label: 'Feedback Positif',
    description: 'Donner un feedback positif',
    base_xp: 15,
    category: 'interaction',
    multiplier_eligible: true,
    cooldown_ms: 5000,
    max_daily: 50,
  },
  feedback_negative: {
    id: 'feedback_negative',
    label: 'Feedback Négatif',
    description: 'Donner un feedback négatif (aide l\'IA)',
    base_xp: 20,
    category: 'interaction',
    multiplier_eligible: true,
    cooldown_ms: 5000,
    max_daily: 50,
  },
  session_complete: {
    id: 'session_complete',
    label: 'Session Terminée',
    description: 'Terminer une session de travail',
    base_xp: 50,
    category: 'achievement',
    multiplier_eligible: true,
    cooldown_ms: 0,
    max_daily: 10,
  },
  streak_daily: {
    id: 'streak_daily',
    label: 'Streak Quotidien',
    description: 'Maintenir un streak quotidien',
    base_xp: 100,
    category: 'streak',
    multiplier_eligible: true,
    cooldown_ms: 0,
    max_daily: 1,
  },
  streak_weekly: {
    id: 'streak_weekly',
    label: 'Streak Hebdomadaire',
    description: 'Atteindre 7 jours consécutifs',
    base_xp: 500,
    category: 'streak',
    multiplier_eligible: true,
    cooldown_ms: 0,
    max_daily: 1,
  },
  achievement_unlock: {
    id: 'achievement_unlock',
    label: 'Achievement Débloqué',
    description: 'Débloquer un achievement',
    base_xp: 0, // XP défini par l'achievement
    category: 'achievement',
    multiplier_eligible: false,
    cooldown_ms: 0,
  },
  milestone_reach: {
    id: 'milestone_reach',
    label: 'Milestone Atteint',
    description: 'Atteindre un milestone',
    base_xp: 200,
    category: 'achievement',
    multiplier_eligible: true,
    cooldown_ms: 0,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// B. CONFIGURATION NIVEAUX
// ═══════════════════════════════════════════════════════════════════════════

export const LEVEL_CONFIGS: Record<UserLevel, LevelConfig> = {
  novice: {
    level: 'novice',
    min_xp: 0,
    max_xp: 500,
    label: 'Novice',
    color: '#9CA3AF', // Gris
    icon: '🌱',
    perks: ['Accès chat basique', 'Mode Coach'],
    unlocks: ['coach_mode'],
  },
  apprentice: {
    level: 'apprentice',
    min_xp: 500,
    max_xp: 2000,
    label: 'Apprenti',
    color: '#10B981', // Vert
    icon: '📚',
    perks: ['Mode Dev', 'Automations basiques', 'Historique 7j'],
    unlocks: ['dev_mode', 'basic_automations'],
  },
  intermediate: {
    level: 'intermediate',
    min_xp: 2000,
    max_xp: 5000,
    label: 'Intermédiaire',
    color: '#3B82F6', // Bleu
    icon: '⚡',
    perks: ['Mode Stratégie', 'Automations avancées', 'Mémoire étendue'],
    unlocks: ['strategy_mode', 'advanced_automations', 'extended_memory'],
  },
  advanced: {
    level: 'advanced',
    min_xp: 5000,
    max_xp: 12000,
    label: 'Avancé',
    color: '#8B5CF6', // Violet
    icon: '🔮',
    perks: ['Mode Audit', 'Mode Auteur', 'Tous les outils'],
    unlocks: ['audit_mode', 'auteur_mode', 'all_tools'],
  },
  expert: {
    level: 'expert',
    min_xp: 12000,
    max_xp: 30000,
    label: 'Expert',
    color: '#EC4899', // Rose
    icon: '💎',
    perks: ['Mode Analyse', 'Automations illimitées', 'API accès'],
    unlocks: ['analyse_mode', 'unlimited_automations', 'api_access'],
  },
  master: {
    level: 'master',
    min_xp: 30000,
    max_xp: 100000,
    label: 'Maître',
    color: '#F59E0B', // Ambre
    icon: '👑',
    perks: ['Mode Omniscient', 'Évolution IA', 'Statistiques avancées'],
    unlocks: ['omniscient_mode', 'ia_evolution', 'advanced_stats'],
  },
  singularity: {
    level: 'singularity',
    min_xp: 100000,
    max_xp: Infinity,
    label: 'Singularité',
    color: '#EF4444', // Rouge
    icon: '∞',
    perks: ['Mode Debug', 'Contrôle total', 'Accès illimité'],
    unlocks: ['debug_mode', 'full_control', 'unlimited_access'],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// C. ACHIEVEMENTS PRÉDÉFINIS
// ═══════════════════════════════════════════════════════════════════════════

export const ACHIEVEMENTS: Record<string, Achievement> = {
  // Beginner
  first_message: {
    id: 'first_message',
    name: 'Premier Pas',
    description: 'Envoyer votre premier message',
    category: 'beginner',
    rarity: 'common',
    icon: '💬',
    color: '#10B981',
    criteria: { type: 'chat_messages', target: 1 },
    xp_reward: 50,
    hidden: false,
    unlocked: false,
    progress: 0,
  },
  ten_messages: {
    id: 'ten_messages',
    name: 'Bavard',
    description: 'Envoyer 10 messages',
    category: 'beginner',
    rarity: 'common',
    icon: '🗣️',
    color: '#10B981',
    criteria: { type: 'chat_messages', target: 10 },
    xp_reward: 100,
    hidden: false,
    unlocked: false,
    progress: 0,
  },
  first_automation: {
    id: 'first_automation',
    name: 'Automaticien',
    description: 'Créer votre première automation',
    category: 'automator',
    rarity: 'uncommon',
    icon: '⚙️',
    color: '#3B82F6',
    criteria: { type: 'automations_created', target: 1 },
    xp_reward: 200,
    hidden: false,
    unlocked: false,
    progress: 0,
  },
  streak_7: {
    id: 'streak_7',
    name: 'Semaine Parfaite',
    description: 'Maintenir un streak de 7 jours',
    category: 'streaker',
    rarity: 'rare',
    icon: '🔥',
    color: '#F59E0B',
    criteria: { type: 'streak_days', target: 7 },
    xp_reward: 500,
    hidden: false,
    unlocked: false,
    progress: 0,
  },
  streak_30: {
    id: 'streak_30',
    name: 'Mois Légendaire',
    description: 'Maintenir un streak de 30 jours',
    category: 'streaker',
    rarity: 'epic',
    icon: '🌟',
    color: '#8B5CF6',
    criteria: { type: 'streak_days', target: 30 },
    xp_reward: 2000,
    hidden: false,
    unlocked: false,
    progress: 0,
  },
  voice_master: {
    id: 'voice_master',
    name: 'Maître de la Voix',
    description: 'Utiliser la voix 100 fois',
    category: 'explorer',
    rarity: 'rare',
    icon: '🎤',
    color: '#EC4899',
    criteria: { type: 'voice_interactions', target: 100 },
    xp_reward: 300,
    hidden: false,
    unlocked: false,
    progress: 0,
  },
  all_modes: {
    id: 'all_modes',
    name: 'Explorateur',
    description: 'Essayer tous les modes IA',
    category: 'explorer',
    rarity: 'epic',
    icon: '🧭',
    color: '#8B5CF6',
    criteria: { type: 'modes_tried', target: 10 },
    xp_reward: 1000,
    hidden: false,
    unlocked: false,
    progress: 0,
  },
  singularity_reach: {
    id: 'singularity_reach',
    name: 'Transcendance',
    description: 'Atteindre le niveau Singularité',
    category: 'legendary',
    rarity: 'mythic',
    icon: '∞',
    color: '#EF4444',
    criteria: { type: 'level_reach', target: 7 }, // singularity = level 7
    xp_reward: 10000,
    hidden: true,
    unlocked: false,
    progress: 0,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// D. RÉCOMPENSES QUOTIDIENNES
// ═══════════════════════════════════════════════════════════════════════════

export const DAILY_REWARDS: DailyReward[] = [
  {
    day: 1,
    claimed: false,
    reward: { type: 'xp', value: 50, description: '+50 XP' },
  },
  {
    day: 2,
    claimed: false,
    reward: { type: 'xp', value: 75, description: '+75 XP' },
  },
  {
    day: 3,
    claimed: false,
    reward: { type: 'multiplier', value: 1.5, description: 'Multiplicateur x1.5 (24h)' },
  },
  {
    day: 4,
    claimed: false,
    reward: { type: 'xp', value: 100, description: '+100 XP' },
  },
  {
    day: 5,
    claimed: false,
    reward: { type: 'xp', value: 150, description: '+150 XP' },
  },
  {
    day: 6,
    claimed: false,
    reward: { type: 'multiplier', value: 2.0, description: 'Multiplicateur x2 (24h)' },
  },
  {
    day: 7,
    claimed: false,
    reward: { type: 'xp', value: 500, description: '+500 XP + Badge Semaine Parfaite' },
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// E. AUTOMATIONS PRÉDÉFINIES
// ═══════════════════════════════════════════════════════════════════════════

export const DEFAULT_AUTOMATIONS: Record<string, Automation> = {
  morning_brief: {
    id: 'morning_brief',
    name: 'Brief Matinal',
    description: 'Résumé quotidien des tâches et rappels',
    enabled: true,
    category: 'productivity',
    icon: '☀️',
    color: '#F59E0B',
    trigger: {
      type: 'scheduled',
      config: { cron: '0 8 * * *' }, // 8h chaque jour
      conditions: [],
    },
    actions: [
      {
        type: 'chat_send',
        config: {
          message: 'Bonjour ! Voici votre brief matinal...',
          mode: 'coach',
        },
      },
      {
        type: 'memory_recall',
        config: {
          query: 'tâches en cours',
          limit: 5,
        },
      },
    ],
    created_at: Date.now(),
    updated_at: Date.now(),
    run_count: 0,
    success_count: 0,
    failure_count: 0,
    requires_level: 'apprentice',
    xp_reward: 25,
    tags: ['quotidien', 'productivité'],
  },
  save_important: {
    id: 'save_important',
    name: 'Sauvegarder Important',
    description: 'Sauvegarder automatiquement les informations importantes',
    enabled: true,
    category: 'workflow',
    icon: '💾',
    color: '#3B82F6',
    trigger: {
      type: 'voice_command',
      config: { phrases: ['sauvegarde ça', 'retiens ça', 'important'] },
    },
    actions: [
      {
        type: 'memory_save',
        config: {
          category: 'important',
          auto_tag: true,
        },
      },
      {
        type: 'notification',
        config: {
          title: 'Sauvegardé',
          message: 'Information importante sauvegardée',
        },
      },
    ],
    created_at: Date.now(),
    updated_at: Date.now(),
    run_count: 0,
    success_count: 0,
    failure_count: 0,
    requires_level: 'novice',
    xp_reward: 15,
    tags: ['mémoire', 'voix'],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// F. ÉTATS INITIAUX
// ═══════════════════════════════════════════════════════════════════════════

export const INITIAL_USER_XP_STATE: UserXPState = {
  total_xp: 0,
  level: 'novice',
  level_progress: 0,
  xp_to_next_level: 500,
  current_streak: 0,
  longest_streak: 0,
  last_activity: Date.now(),
  daily_xp_earned: 0,
  daily_limit_reached: false,
  multiplier: 1.0,
  achievements_unlocked: [],
};

export const INITIAL_AUTOMATION_STATE: AutomationSystemState = {
  automations: new Map(Object.entries(DEFAULT_AUTOMATIONS)),
  running_automations: new Set(),
  queued_automations: [],
  last_run_results: [],
  total_runs: 0,
  total_successes: 0,
  total_failures: 0,
  is_paused: false,
};

export const INITIAL_REWARDS_STATE: RewardsState = {
  achievements: new Map(Object.entries(ACHIEVEMENTS)),
  daily_rewards: [...DAILY_REWARDS],
  current_day_streak: 0,
  total_achievements_unlocked: 0,
  total_xp_from_achievements: 0,
  next_daily_reset: getNextDailyReset(),
  premium_unlocks: [],
};

// ═══════════════════════════════════════════════════════════════════════════
// G. FONCTIONS UTILITAIRES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculer le niveau à partir de l'XP
 */
export function getLevelFromXP(xp: number): UserLevel {
  for (const [level, config] of Object.entries(LEVEL_CONFIGS)) {
    if (xp >= config.min_xp && xp < config.max_xp) {
      return level as UserLevel;
    }
  }
  return 'singularity';
}

/**
 * Calculer la progression dans le niveau actuel
 */
export function getLevelProgress(xp: number): number {
  const level = getLevelFromXP(xp);
  const config = LEVEL_CONFIGS[level];

  if (config.max_xp === Infinity) return 100;

  const xpInLevel = xp - config.min_xp;
  const xpForLevel = config.max_xp - config.min_xp;

  return Math.min(100, Math.round((xpInLevel / xpForLevel) * 100));
}

/**
 * Calculer l'XP restant pour le prochain niveau
 */
export function getXPToNextLevel(xp: number): number {
  const level = getLevelFromXP(xp);
  const config = LEVEL_CONFIGS[level];

  if (config.max_xp === Infinity) return 0;

  return config.max_xp - xp;
}

/**
 * Obtenir la configuration du niveau suivant
 */
export function getNextLevel(currentLevel: UserLevel): LevelConfig | null {
  const levels = Object.keys(LEVEL_CONFIGS) as UserLevel[];
  const currentIndex = levels.indexOf(currentLevel);

  if (currentIndex === -1 || currentIndex >= levels.length - 1) {
    return null;
  }

  return LEVEL_CONFIGS[levels[currentIndex + 1]];
}

/**
 * Calculer l'XP avec multiplicateur
 */
export function calculateXP(
  actionId: XPActionId,
  multiplier: number = 1.0,
  streakMultiplier: number = 1.0
): number {
  const action = XP_ACTIONS[actionId];
  if (!action) return 0;

  let xp = action.base_xp;

  if (action.multiplier_eligible) {
    xp *= multiplier * streakMultiplier;
  }

  return Math.round(xp);
}

/**
 * Obtenir le prochain reset quotidien
 */
export function getNextDailyReset(): number {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime();
}

/**
 * Vérifier si un streak est actif
 */
export function isStreakActive(lastActivity: number): boolean {
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  return (now - lastActivity) < (oneDayMs * 2); // 48h de grâce
}

/**
 * Calculer le multiplicateur de streak
 */
export function getStreakMultiplier(streakDays: number): number {
  if (streakDays < 3) return 1.0;
  if (streakDays < 7) return 1.1;
  if (streakDays < 14) return 1.25;
  if (streakDays < 30) return 1.5;
  return 2.0;
}
