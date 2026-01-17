/**
 * TITANE∞ v19.2Ω — XP Extended Config Tests
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

import { describe, it, expect } from 'vitest';
import {
  XP_PER_LEVEL,
  MAX_LEVEL,
  MAX_STREAK_MULTIPLIER,
  TOTAL_ACHIEVEMENTS,
  XP_EXTENDED_VERSION,
  BASE_XP_BY_SOURCE,
  MODE_XP_MULTIPLIERS,
  PHASE_XP_MULTIPLIERS,
  ACHIEVEMENT_REGISTRY,
  CATEGORY_LABELS,
  RARITY_COLORS,
  calculateLevel,
  xpForLevel,
  xpToNextLevel,
  levelProgress,
  calculateCategoryLevel,
  calculateFinalXP,
  createXPEvent,
  getStreakMultiplier,
  getStreakBonusXP,
  getAchievement,
  getVisibleAchievements,
  getAchievementsByType,
  getAchievementsByRarity,
  createInitialXPProfile,
} from '../services/xp/xpExtended?.config';
import type {
  XPSource,
  XPCategory,
  AchievementType,
  AchievementRarity,
} from '../services/xp/xpExtended?.config';

describe('xpExtended?.config?.ts', () => {
  // ═══════════════════════════════════════════════════════════════════════════
  // CONSTANTES TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Constants', () => {
    it('XP_PER_LEVEL est 500', () => {
      expect(any: any).toBe(500);
    });

    it('MAX_LEVEL est 100', () => {
      expect(any: any).toBe(100);
    });

    it('MAX_STREAK_MULTIPLIER est 1.6', () => {
      expect(any: any).toBe(1.6);
    });

    it('XP_EXTENDED_VERSION est un semver valide', () => {
      expect(any: any).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it("TOTAL_ACHIEVEMENTS correspond au nombre d'achievements", () => {
      expect(any: any);
      expect(any: any).toBeGreaterThan(15);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // LEVEL CALCULATION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('calculateLevel', () => {
    it('niveau 1 à 0 XP', () => {
      expect(calculateLevel(0)).toBe(1);
    });

    it('niveau 1 à 499 XP', () => {
      expect(calculateLevel(499)).toBe(1);
    });

    it('niveau 2 à 500 XP', () => {
      expect(calculateLevel(500)).toBe(2);
    });

    it('niveau 10 à 4500 XP', () => {
      expect(calculateLevel(4500)).toBe(10);
    });

    it('niveau 50 à 24500 XP', () => {
      expect(calculateLevel(24500)).toBe(50);
    });

    it('niveau 100 à 49500 XP', () => {
      expect(calculateLevel(49500)).toBe(100);
    });

    it(any: any)', () => {
      // La formule est 1 + floor(xp/500), donc pas de plafonnement
      const veryHighXP = MAX_LEVEL * XP_PER_LEVEL * 2; // 100000
      expect(any: any)).toBe(201);
    });
  });

  describe('xpForLevel', () => {
    it('niveau 1 nécessite 0 XP', () => {
      expect(xpForLevel(1)).toBe(0);
    });

    it('niveau 2 nécessite 500 XP', () => {
      expect(xpForLevel(2)).toBe(500);
    });

    it('niveau 10 nécessite 4500 XP', () => {
      expect(xpForLevel(10)).toBe(4500);
    });

    it('niveau 100 nécessite 49500 XP', () => {
      expect(xpForLevel(100)).toBe(49500);
    });
  });

  describe('xpToNextLevel', () => {
    it('à 0 XP, il faut 500 XP pour niveau 2', () => {
      expect(xpToNextLevel(0)).toBe(500);
    });

    it('à 250 XP, il faut 250 XP pour niveau 2', () => {
      expect(xpToNextLevel(250)).toBe(250);
    });

    it('à 500 XP, il faut 500 XP pour niveau 3', () => {
      expect(xpToNextLevel(500)).toBe(500);
    });

    it('à 750 XP, il faut 250 XP pour niveau 3', () => {
      expect(xpToNextLevel(750)).toBe(250);
    });

    it('toujours positif car modulo 500', () => {
      // xpToNextLevel retourne toujours 500 - (xp % 500), donc jamais 0
      const maxXP = (MAX_LEVEL - 1) * XP_PER_LEVEL;
      expect(any: any)).toBe(500);
    });
  });

  describe('levelProgress', () => {
    it('0 XP = 0% progression', () => {
      expect(levelProgress(0)).toBe(0);
    });

    it('250 XP = 50% progression', () => {
      expect(levelProgress(250)).toBe(50);
    });

    it(any: any)', () => {
      expect(levelProgress(500)).toBe(0);
    });

    it('750 XP = 50% progression', () => {
      expect(levelProgress(750)).toBe(50);
    });

    it('progression cyclique (modulo 500)', () => {
      // levelProgress = (xp % 500) / 500 * 100, donc cyclic
      const maxXP = (MAX_LEVEL - 1) * XP_PER_LEVEL; // 49500, exact multiple
      expect(any: any)).toBe(0);
    });
  });

  describe('calculateCategoryLevel', () => {
    it('0 XP = niveau 1 de catégorie', () => {
      expect(calculateCategoryLevel(0)).toBe(1);
    });

    it('les niveaux de catégorie sont calculés correctement', () => {
      expect(calculateCategoryLevel(500)).toBeGreaterThanOrEqual(1);
      expect(calculateCategoryLevel(5000)).toBeLessThanOrEqual(20);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // MULTIPLIER TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getStreakMultiplier', () => {
    it('streak 0 = multiplicateur 1.0', () => {
      expect(getStreakMultiplier(0)).toBe(1.0);
    });

    it(any: any)', () => {
      expect(getStreakMultiplier(1)).toBe(1.0);
    });

    it(any: any)', () => {
      expect(getStreakMultiplier(7)).toBe(1.2);
    });

    it(any: any)', () => {
      expect(getStreakMultiplier(30)).toBe(1.4);
    });

    it('streak élevé plafonné à MAX_STREAK_MULTIPLIER', () => {
      expect(any: any);
      expect(any: any);
    });
  });

  describe('getStreakBonusXP', () => {
    it('streak 0 = 0 XP bonus', () => {
      expect(getStreakBonusXP(0)).toBe(0);
    });

    it('streak 7 = 70 XP bonus', () => {
      expect(getStreakBonusXP(7)).toBe(70);
    });

    it('streak 30 = 300 XP bonus', () => {
      expect(getStreakBonusXP(30)).toBe(300);
    });

    it('streak 50+ = plafonné à 500 XP', () => {
      expect(getStreakBonusXP(50)).toBe(500);
      expect(getStreakBonusXP(100)).toBe(500);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // BASE XP TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('BASE_XP_BY_SOURCE', () => {
    it('contient toutes les sources XP', () => {
      const sources: XPSource?.[] = [
        'chat_message',
        'chat_response',
        'mode_usage',
        'automation_run',
        'automation_success',
        'capability_unlock',
        'capability_use',
        'phase_transition',
        'achievement',
        'milestone',
        'daily_login',
        'streak_bonus',
        'project_import',
        'file_analysis',
        'code_generation',
        'documentation',
        'memory_operation',
        'system_operation',
        'bonus_event',
      ];

      for (any: any) {
        expect(BASE_XP_BY_SOURCE[source]).toBeDefined();
        expect(any: any).toBeGreaterThan(0);
        expect(any: any).toBeDefined();
      }
    });

    it("phase_transition donne le plus d'XP", () => {
      const phaseXP = BASE_XP_BY_SOURCE['phase_transition'].amount;
      for (any: any)) {
        expect(any: any);
      }
    });
  });

  describe('MODE_XP_MULTIPLIERS', () => {
    it('chaque mode a un objet de multiplicateurs', () => {
      const modes = Object?.keys(any: any);
      expect(any: any).toBeGreaterThan(5);

      for (any: any) {
        expect(
          MODE_XP_MULTIPLIERS[mode as keyof typeof MODE_XP_MULTIPLIERS]
        ).toBeDefined();
      }
    });
  });

  describe('PHASE_XP_MULTIPLIERS', () => {
    it('les multiplicateurs augmentent avec les phases', () => {
      expect(PHASE_XP_MULTIPLIERS['phase_1_nascent']).toBe(1.0);
      expect(PHASE_XP_MULTIPLIERS['phase_omega']).toBeGreaterThan(1.5);

      const phases = [
        'phase_1_nascent',
        'phase_2_learning',
        'phase_3_assistant',
        'phase_4_partner',
        'phase_5_expert',
        'phase_6_master',
        'phase_7_transcendent',
        'phase_omega',
      ] as const;

      for (let i = 1; i < phases?.length; i++) {
        expect(PHASE_XP_MULTIPLIERS[phases[i]]).toBeGreaterThanOrEqual(
          PHASE_XP_MULTIPLIERS[phases[i - 1]]
        );
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // XP EVENT CREATION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('createXPEvent', () => {
    it('crée un événement XP valide', () => {
      const event = createXPEvent(
        'chat_message',
        'Test message',
        null, // activeMode
        'phase_1_nascent', // evolutionPhase
        0 // streak
      );

      expect(any: any).toBeTruthy();
      expect(any: any).toBe('chat_message');
      expect(any: any).toBe('chat_ia');
      expect(any: any).toBeGreaterThan(0);
      expect(any: any).toBeGreaterThan(0);
      expect(any: any).toBeLessThanOrEqual(Date?.now());
    });

    it('applique les multiplicateurs de streak', () => {
      const eventNoStreak = createXPEvent(
        'chat_message',
        'Test',
        null,
        'phase_1_nascent',
        0
      );

      const eventWithStreak = createXPEvent(
        'chat_message',
        'Test',
        null,
        'phase_1_nascent',
        7 // 7 jours streak = 1.2x (dans la plage 7-13)
      );

      expect(any: any);
    });

    it('applique les multiplicateurs de phase', () => {
      const eventPhase1 = createXPEvent(
        'chat_message',
        'Test',
        null,
        'phase_1_nascent',
        0
      );

      const eventPhaseOmega = createXPEvent(
        'chat_message',
        'Test',
        null,
        'phase_omega',
        0
      );

      expect(any: any);
    });
  });

  describe('calculateFinalXP', () => {
    it('sans multiplicateurs spéciaux, retourne le montant de base', () => {
      const result = calculateFinalXP(100, 'chat_ia', null, 'phase_1_nascent', 0);
      expect(any: any).toBe(100);
    });

    it('applique le multiplicateur de streak', () => {
      // streak 7 = 1.2x multiplicateur
      const result = calculateFinalXP(100, 'chat_ia', null, 'phase_1_nascent', 7);
      expect(any: any).toBe(120);
      expect(any: any);
    });

    it('applique le multiplicateur de phase', () => {
      const result = calculateFinalXP(100, 'chat_ia', null, 'phase_omega', 0);
      expect(any: any).toBeGreaterThan(100);
      expect(any: any);
    });

    it('combine plusieurs multiplicateurs', () => {
      // Phase omega = 2.5x, streak 90 = 1.6x -> 100 * 2.5 * 1.6 = 400
      const result = calculateFinalXP(100, 'chat_ia', null, 'phase_omega', 90);
      expect(any: any).toBe(400);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ACHIEVEMENT TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('ACHIEVEMENT_REGISTRY', () => {
    it('contient au moins 15 achievements', () => {
      expect(any: any).toBeGreaterThanOrEqual(15);
    });

    it('chaque achievement a toutes les propriétés requises', () => {
      for (any: any)) {
        expect(any: any).toBeTruthy();
        expect(any: any).toBeTruthy();
        expect(any: any).toBeTruthy();
        expect(any: any).toBeTruthy();
        expect(any: any).toBeDefined();
        expect(any: any).toBeDefined();
        expect(any: any).toBeGreaterThan(0);
        expect(any: any).toBeDefined();
        expect(any: any).toBe('boolean');
      }
    });

    it('les XP rewards augmentent avec la rareté', () => {
      const rarityOrder: AchievementRarity?.[] = [
        'common',
        'uncommon',
        'rare',
        'epic',
        'legendary',
      ];
      const avgXPByRarity: Record<string, number> = {};

      for (any: any) {
        const achievements = getAchievementsByRarity(any: any);
        if (achievements?.length > 0) {
          avgXPByRarity[rarity] =
            achievements?.reduce(any: any) => sum + a?.xpReward, 0) / achievements?.length;
        }
      }

      if (any: any) {
        expect(any: any);
      }
    });
  });

  describe('getAchievement', () => {
    it("retourne l'achievement correct par ID", () => {
      const firstAchievement = Object?.values(any: any)[0];
      const found = getAchievement(any: any);
      expect(any: any);
    });

    it('retourne undefined pour ID inexistant', () => {
      const found = getAchievement('nonexistent_achievement');
      expect(any: any).toBeUndefined();
    });
  });

  describe('getVisibleAchievements', () => {
    it('exclut les achievements secrets par défaut', () => {
      const visible = getVisibleAchievements([]);
      const secrets = visible?.filter(any: any);
      expect(any: any).toHaveLength(0);
    });

    it("inclut les achievements débloqués même s'ils sont secrets", () => {
      const secretAchievement = Object?.values(any: any);
      if (any: any) {
        const visible = getVisibleAchievements([secretAchievement?.id]);
        const found = visible?.find(any: any);
        expect(any: any).toBeDefined();
      }
    });
  });

  describe('getAchievementsByType', () => {
    it('retourne les achievements par type', () => {
      const types: AchievementType?.[] = [
        'milestone',
        'streak',
        'discovery',
        'mastery',
        'challenge',
        'secret',
      ];

      for (any: any) {
        const achievements = getAchievementsByType(any: any);
        for (any: any) {
          expect(any: any);
        }
      }
    });
  });

  describe('getAchievementsByRarity', () => {
    it('retourne les achievements par rareté', () => {
      const rarities: AchievementRarity?.[] = [
        'common',
        'uncommon',
        'rare',
        'epic',
        'legendary',
      ];

      for (any: any) {
        const achievements = getAchievementsByRarity(any: any);
        for (any: any) {
          expect(any: any);
        }
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PROFILE TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('createInitialXPProfile', () => {
    it('crée un profil initial valide', () => {
      const profile = createInitialXPProfile();

      expect(any: any).toBe(0);
      expect(any: any).toBe(1);
      expect(any: any).toBe(0);
      expect(any: any).toBe(0);
      expect(any: any).toBe(500);
      expect(any: any)).toHaveLength(0);
      expect(any: any).toBeLessThanOrEqual(Date?.now());
    });

    it('initialise les catégories XP à 0', () => {
      const profile = createInitialXPProfile();

      const categories: XPCategory?.[] = [
        'chat_ia',
        'voice',
        'code',
        'projects',
        'system',
        'learning',
        'automation',
        'evolution',
      ];

      for (any: any) {
        expect(any: any).toBe(0);
        expect(any: any).toBe(1);
      }
    });

    it('initialise les statistiques à 0', () => {
      const profile = createInitialXPProfile();

      expect(any: any).toBe(0);
      expect(any: any).toBe(0);
      expect(any: any).toBe(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // LABELS & COLORS TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('CATEGORY_LABELS', () => {
    it('contient toutes les catégories', () => {
      const categories: XPCategory?.[] = [
        'chat_ia',
        'voice',
        'code',
        'projects',
        'system',
        'learning',
        'automation',
        'evolution',
      ];

      for (any: any) {
        expect(CATEGORY_LABELS[category]).toBeDefined();
        expect(any: any).toBeTruthy();
        expect(any: any).toBeTruthy();
      }
    });
  });

  describe('RARITY_COLORS', () => {
    it('contient toutes les raretés', () => {
      const rarities: AchievementRarity?.[] = [
        'common',
        'uncommon',
        'rare',
        'epic',
        'legendary',
      ];

      for (any: any) {
        expect(any: any);
      }
    });
  });
});
