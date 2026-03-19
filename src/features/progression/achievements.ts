/**
 * TITANE∞ v26.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * Achievement System - Système d'achievements pour TITANE∞
 * Gère les déblocages, affichage et progression des achievements
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
  category: 'conversation' | 'progression' | 'system' | 'exploration' | 'mastery';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  requirements?: {
    type: 'level' | 'xp' | 'messages' | 'modes' | 'custom';
    value: number;
  };
}

export const ACHIEVEMENTS: Achievement[] = [
  // Conversation
  {
    id: 'first_message',
    name: 'Premier Contact',
    description: 'Envoyer votre premier message à TITANE',
    icon: '💬',
    unlocked: false, // computed by resolveAchievements from real stats (messages not tracked yet)
    category: 'conversation',
    rarity: 'common',
    xpReward: 10,
    requirements: { type: 'messages', value: 1 },
  },
  {
    id: 'conversationalist',
    name: 'Communicateur',
    description: 'Envoyer 1000 messages',
    icon: '📨',
    unlocked: false, // computed by resolveAchievements (messages not tracked yet)
    category: 'conversation',
    rarity: 'rare',
    xpReward: 500,
    requirements: { type: 'messages', value: 1000 },
  },
  {
    id: 'polyglot',
    name: 'Polyglotte',
    description: 'Utiliser tous les modes de conversation',
    icon: '🎭',
    unlocked: false,
    category: 'conversation',
    rarity: 'epic',
    xpReward: 1000,
    requirements: { type: 'modes', value: 6 },
  },

  // Progression
  {
    id: 'apprentice',
    name: 'Apprenti',
    description: 'Atteindre le niveau 10',
    icon: '🎓',
    unlocked: false, // computed by resolveAchievements from real level
    category: 'progression',
    rarity: 'common',
    xpReward: 100,
    requirements: { type: 'level', value: 10 },
  },
  {
    id: 'expert',
    name: 'Expert',
    description: 'Atteindre le niveau 25',
    icon: '⚡',
    unlocked: false,
    category: 'progression',
    rarity: 'epic',
    xpReward: 2500,
    requirements: { type: 'level', value: 25 },
  },
  {
    id: 'master',
    name: 'Maître',
    description: 'Atteindre le niveau 50',
    icon: '👑',
    unlocked: false,
    category: 'progression',
    rarity: 'legendary',
    xpReward: 10000,
    requirements: { type: 'level', value: 50 },
  },

  // System
  {
    id: 'explorer',
    name: 'Explorateur',
    description: 'Visiter toutes les sections',
    icon: '🧭',
    unlocked: false,
    category: 'exploration',
    rarity: 'rare',
    xpReward: 250,
    requirements: { type: 'custom', value: 8 },
  },
  {
    id: 'customizer',
    name: 'Personnalisateur',
    description: 'Créer un mode personnalisé',
    icon: '🎨',
    unlocked: false,
    category: 'exploration',
    rarity: 'rare',
    xpReward: 300,
    requirements: { type: 'custom', value: 1 },
  },

  // Mastery
  {
    id: 'perfectionist',
    name: 'Perfectionniste',
    description: 'Débloquer tous les achievements',
    icon: '✨',
    unlocked: false,
    category: 'mastery',
    rarity: 'legendary',
    xpReward: 50000,
    requirements: { type: 'custom', value: 100 },
  },
  {
    id: 'omega',
    name: 'Omega',
    description: 'Atteindre 100 000 XP',
    icon: 'Ω',
    unlocked: false, // computed by resolveAchievements from real totalXP
    category: 'mastery',
    rarity: 'legendary',
    xpReward: 0,
    requirements: { type: 'xp', value: 100000 },
  },
];

/**
 * Dériver l'état unlocked depuis les stats réelles (XP/level).
 * Pour les achievements de type 'messages' ou 'modes', on n'a pas
 * de source canonique — ils restent à leur valeur statique initiale
 * mais marqués avec un label honnête.
 *
 * IMPORTANT: ne jamais présenter un achievement comme gagné
 * si son critère ne peut pas être vérifié à partir des stats réelles.
 */
export function resolveAchievements(
  achievements: Achievement[],
  stats: { level: number; totalXP: number; chatMessageCount?: number }
): Achievement[] {
  return achievements.map(a => {
    const req = a.requirements;
    if (!req) return a;
    let computedUnlocked = a.unlocked;
    if (req.type === 'level') {
      computedUnlocked = stats.level >= req.value;
    } else if (req.type === 'xp') {
      computedUnlocked = stats.totalXP >= req.value;
    } else if (req.type === 'messages') {
      // Use canonical chatMessageCount from xpEngine when available
      const count = stats.chatMessageCount ?? 0;
      computedUnlocked = count >= req.value;
    }
    // 'modes' and 'custom': no canonical event source — keep static value
    return { ...a, unlocked: computedUnlocked };
  });
}

/**
 * Talents débloqués calculés depuis le niveau réel.
 * Thresholds définis explicitement — jamais de constante statique présentée comme gagnée.
 */
export interface TalentStatus {
  label: string;
  variant: 'success' | 'info' | 'warning' | 'default';
  unlocked: boolean;
  requiredLevel: number;
}

export function resolveTalents(level: number): TalentStatus[] {
  return [
    { label: 'Architecte', variant: 'success', unlocked: level >= 1, requiredLevel: 1 },
    { label: 'Optimiseur', variant: 'info', unlocked: level >= 5, requiredLevel: 5 },
    {
      label: 'Évolutionniste',
      variant: 'info',
      unlocked: level >= 10,
      requiredLevel: 10,
    },
    { label: 'Pédagogue', variant: 'success', unlocked: level >= 15, requiredLevel: 15 },
  ];
}

export function calculateAchievementProgress(
  achievement: Achievement,
  currentStats: {
    level: number;
    totalXP: number;
    messageCount: number; // legacy param kept for compat — use chatMessageCount when available
    modesUsed: number;
    chatMessageCount?: number;
  }
): number {
  if (achievement.unlocked) return 100;

  const req = achievement.requirements;
  if (!req) return 0;

  switch (req.type) {
    case 'level':
      return Math.min(100, (currentStats.level / req.value) * 100);
    case 'xp':
      return Math.min(100, (currentStats.totalXP / req.value) * 100);
    case 'messages': {
      const count = currentStats.chatMessageCount ?? currentStats.messageCount;
      return Math.min(100, (count / req.value) * 100);
    }
    case 'modes':
      return Math.min(100, (currentStats.modesUsed / req.value) * 100);
    default:
      return 0;
  }
}

/**
 * Obtenir couleur selon rareté
 */
export function getRarityColor(rarity: Achievement['rarity']): string {
  switch (rarity) {
    case 'common':
      return '#94a3b8'; // gray
    case 'rare':
      return '#3b82f6'; // blue
    case 'epic':
      return '#a855f7'; // purple
    case 'legendary':
      return '#f59e0b'; // gold
    default:
      return '#94a3b8';
  }
}
