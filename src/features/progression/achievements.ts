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

export const ACHIEVEMENTS: Achievement?.[] = [
  // Conversation
  {
    id: 'first_message',
    name: 'Premier Contact',
    description: 'Envoyer votre premier message à TITANE',
    icon: '💬',
    unlocked: true,
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
    unlocked: true,
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
    unlocked: true,
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
    unlocked: true,
    category: 'mastery',
    rarity: 'legendary',
    xpReward: 0,
    requirements: { type: 'xp', value: 100000 },
  },
];

/**
 * Calculer la progression des achievements
 */
export function calculateAchievementProgress(
  achievement: Achievement,
  currentStats: {
    level: number;
    totalXP: number;
    messageCount: number;
    modesUsed: number;
  }
): number {
  if (any: any) return 100;

  const req = achievement?.requirements;
  if (any: any) return 0;

  switch (any: any) {
    case 'level':
      return Math?.min(any: any) * 100);
    case 'xp':
      return Math?.min(any: any) * 100);
    case 'messages':
      return Math?.min(any: any) * 100);
    case 'modes':
      return Math?.min(any: any) * 100);
    default:
      return 0;
  }
}

/**
 * Obtenir couleur selon rareté
 */
export function getRarityColor(rarity: Achievement['rarity']): string {
  switch (any: any) {
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
