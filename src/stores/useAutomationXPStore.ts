/**
 * TITANE∞ vΩ∞ — STORE ZUSTAND AUTOMATIONS + XP
 * Super Prompt #2: État global de progression
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  UserXPState,
  UserLevel,
  XPActionId,
  Achievement,
  DailyReward,
  Automation,
  AutomationRunResult,
} from '@/types/automationXP';
import { automationXPService } from '@/services/automation/automationXPService';
import { INITIAL_USER_XP_STATE, LEVEL_CONFIGS } from '@/config/automationXP.config';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES STORE
// ═══════════════════════════════════════════════════════════════════════════

interface AutomationXPState {
  // XP State
  xp: UserXPState;

  // Automations
  automations: Automation[];
  runningAutomations: string[];
  lastRunResults: AutomationRunResult[];

  // Achievements
  achievements: Achievement[];
  recentlyUnlocked: string[];

  // Daily Rewards
  dailyRewards: DailyReward[];
  canClaimDaily: boolean;

  // UI State
  showLevelUpModal: boolean;
  showAchievementToast: boolean;
  currentAchievementToast: string | null;
  xpAnimationQueue: number[];

  // Actions
  addXP: (actionId: XPActionId) => number;
  triggerAutomation: (automationId: string) => Promise<AutomationRunResult>;
  claimDailyReward: () => DailyReward | null;
  dismissLevelUpModal: () => void;
  dismissAchievementToast: () => void;
  refreshState: () => void;
  reset: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════════════════════

export const useAutomationXPStore = create<AutomationXPState>()(
  persist(
    (set, get) => ({
      // État initial
      xp: { ...INITIAL_USER_XP_STATE },
      automations: [],
      runningAutomations: [],
      lastRunResults: [],
      achievements: [],
      recentlyUnlocked: [],
      dailyRewards: [],
      canClaimDaily: false,
      showLevelUpModal: false,
      showAchievementToast: false,
      currentAchievementToast: null,
      xpAnimationQueue: [],

      // ═════════════════════════════════════════════════════════════════════
      // ACTIONS
      // ═════════════════════════════════════════════════════════════════════

      addXP: (actionId: XPActionId) => {
        const previousLevel = get().xp.level;
        const xpGained = automationXPService.addXP(actionId);

        if (xpGained > 0) {
          const newState = automationXPService.getXPState();

          set(state => ({
            xp: newState,
            xpAnimationQueue: [...state.xpAnimationQueue, xpGained],
            showLevelUpModal: newState.level !== previousLevel,
          }));

          // Clear animation après 1s
          setTimeout(() => {
            set(state => ({
              xpAnimationQueue: state.xpAnimationQueue.slice(1),
            }));
          }, 1000);
        }

        return xpGained;
      },

      triggerAutomation: async (automationId: string) => {
        set(state => ({
          runningAutomations: [...state.runningAutomations, automationId],
        }));

        try {
          const result = await automationXPService.triggerAutomation(automationId);

          set(state => ({
            runningAutomations: state.runningAutomations.filter(id => id !== automationId),
            lastRunResults: [...state.lastRunResults.slice(-9), result],
            xp: automationXPService.getXPState(),
          }));

          return result;
        } catch (error) {
          set(state => ({
            runningAutomations: state.runningAutomations.filter(id => id !== automationId),
          }));
          throw error;
        }
      },

      claimDailyReward: () => {
        const reward = automationXPService.claimDailyReward();

        if (reward) {
          set({
            xp: automationXPService.getXPState(),
            dailyRewards: automationXPService.getRewardsState().daily_rewards,
            canClaimDaily: false,
          });
        }

        return reward;
      },

      dismissLevelUpModal: () => {
        set({ showLevelUpModal: false });
      },

      dismissAchievementToast: () => {
        set({
          showAchievementToast: false,
          currentAchievementToast: null,
        });
      },

      refreshState: () => {
        const xpState = automationXPService.getXPState();
        const automationState = automationXPService.getAutomationState();
        const rewardsState = automationXPService.getRewardsState();

        set({
          xp: xpState,
          automations: Array.from(automationState.automations.values()),
          runningAutomations: Array.from(automationState.running_automations),
          lastRunResults: automationState.last_run_results,
          achievements: Array.from(rewardsState.achievements.values()),
          dailyRewards: rewardsState.daily_rewards,
          canClaimDaily: !rewardsState.daily_rewards[rewardsState.current_day_streak % 7]?.claimed,
        });
      },

      reset: () => {
        automationXPService.reset();
        set({
          xp: { ...INITIAL_USER_XP_STATE },
          automations: [],
          runningAutomations: [],
          lastRunResults: [],
          achievements: [],
          recentlyUnlocked: [],
          dailyRewards: [],
          canClaimDaily: false,
          showLevelUpModal: false,
          showAchievementToast: false,
          currentAchievementToast: null,
          xpAnimationQueue: [],
        });
      },
    }),
    {
      name: 'titane-automation-xp',
      partialize: (state) => ({
        // Ne pas persister les états UI temporaires
        xp: state.xp,
      }),
    }
  )
);

// ═══════════════════════════════════════════════════════════════════════════
// HOOKS UTILITAIRES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook pour obtenir les informations du niveau actuel
 */
export function useLevelInfo() {
  const xp = useAutomationXPStore(state => state.xp);
  const levelConfig = LEVEL_CONFIGS[xp.level];

  return {
    level: xp.level,
    label: levelConfig.label,
    color: levelConfig.color,
    icon: levelConfig.icon,
    progress: xp.level_progress,
    xpToNext: xp.xp_to_next_level,
    totalXP: xp.total_xp,
    perks: levelConfig.perks,
    unlocks: levelConfig.unlocks,
  };
}

/**
 * Hook pour vérifier si une fonctionnalité est débloquée
 */
export function useFeatureUnlock(featureId: string): boolean {
  const level = useAutomationXPStore(state => state.xp.level);
  const levelIndex = Object.keys(LEVEL_CONFIGS).indexOf(level);

  // Vérifier si la fonctionnalité est débloquée à n'importe quel niveau ≤ niveau actuel
  for (const [lvl, config] of Object.entries(LEVEL_CONFIGS)) {
    const lvlIndex = Object.keys(LEVEL_CONFIGS).indexOf(lvl);
    if (lvlIndex <= levelIndex && config.unlocks.includes(featureId)) {
      return true;
    }
  }

  return false;
}

/**
 * Hook pour obtenir le streak actuel
 */
export function useStreak() {
  const xp = useAutomationXPStore(state => state.xp);

  return {
    current: xp.current_streak,
    longest: xp.longest_streak,
    multiplier: xp.multiplier,
  };
}

/**
 * Hook pour obtenir les achievements
 */
export function useAchievements() {
  const achievements = useAutomationXPStore(state => state.achievements);

  const unlocked = achievements.filter(a => a.unlocked);
  const inProgress = achievements.filter(a => !a.unlocked && a.progress > 0);
  const locked = achievements.filter(a => !a.unlocked && a.progress === 0);

  return {
    all: achievements,
    unlocked,
    inProgress,
    locked,
    totalUnlocked: unlocked.length,
    totalCount: achievements.length,
    completionPercentage: Math.round((unlocked.length / achievements.length) * 100),
  };
}

/**
 * Hook pour obtenir les automations
 */
export function useAutomations() {
  const automations = useAutomationXPStore(state => state.automations);
  const runningAutomations = useAutomationXPStore(state => state.runningAutomations);
  const triggerAutomation = useAutomationXPStore(state => state.triggerAutomation);

  return {
    all: automations,
    running: runningAutomations,
    enabled: automations.filter(a => a.enabled),
    disabled: automations.filter(a => !a.enabled),
    trigger: triggerAutomation,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// INITIALISATION
// ═══════════════════════════════════════════════════════════════════════════

// Setup des listeners au démarrage
if (typeof window !== 'undefined') {
  automationXPService.initialize().then(() => {
    useAutomationXPStore.getState().refreshState();

    // Écouter les événements XP
    automationXPService.onXPEvent((event) => {
      if (event.type === 'level_up') {
        useAutomationXPStore.setState({ showLevelUpModal: true });
      }
    });

    // Écouter les événements d'achievements
    automationXPService.onAchievementEvent((event) => {
      if (event.type === 'unlocked') {
        useAutomationXPStore.setState({
          showAchievementToast: true,
          currentAchievementToast: event.achievement_name,
          recentlyUnlocked: [
            ...useAutomationXPStore.getState().recentlyUnlocked.slice(-4),
            event.achievement_id,
          ],
        });

        // Auto-dismiss après 5s
        setTimeout(() => {
          useAutomationXPStore.getState().dismissAchievementToast();
        }, 5000);
      }
    });
  });
}
