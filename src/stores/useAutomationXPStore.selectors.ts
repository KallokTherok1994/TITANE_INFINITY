/**
 * TITANE∞ v32.0.0 — AutomationXP Store Selectors
 * Optimized selectors with shallow equality for useAutomationXPStore
 * Prevents unnecessary rerenders by selecting only needed slices
 */

import { useShallow } from 'zustand/react/shallow';
import { useAutomationXPStore } from './useAutomationXPStore';

// ═══════════════════════════════════════════════════════════════
// PRIMITIVE SELECTORS (Single Value)
// ═══════════════════════════════════════════════════════════════

export const useXPState = () => useAutomationXPStore(state => state.xp);
export const useAutomations = () => useAutomationXPStore(state => state.automations);
export const useAchievements = () => useAutomationXPStore(state => state.achievements);
export const useCanClaimDaily = () => useAutomationXPStore(state => state.canClaimDaily);
export const useShowLevelUpModal = () =>
  useAutomationXPStore(state => state.showLevelUpModal);
export const useShowAchievementToast = () =>
  useAutomationXPStore(state => state.showAchievementToast);

// ═══════════════════════════════════════════════════════════════
// COMPOSITE SELECTORS (Multiple Values with Shallow Equality)
// ═══════════════════════════════════════════════════════════════

export const useAutomationXPSnapshot = () =>
  useAutomationXPStore(
    useShallow(state => ({
      xp: state.xp,
      automations: state.automations,
      achievements: state.achievements,
      canClaimDaily: state.canClaimDaily,
      runningAutomations: state.runningAutomations,
    }))
  );

export const useAutomationXPUIState = () =>
  useAutomationXPStore(
    useShallow(state => ({
      showLevelUpModal: state.showLevelUpModal,
      showAchievementToast: state.showAchievementToast,
      currentAchievementToast: state.currentAchievementToast,
      xpAnimationQueue: state.xpAnimationQueue,
    }))
  );

// ═══════════════════════════════════════════════════════════════
// ACTION SELECTORS (Actions Only)
// ═══════════════════════════════════════════════════════════════

export const useAutomationXPActions = () =>
  useAutomationXPStore(
    useShallow(state => ({
      addXP: state.addXP,
      triggerAutomation: state.triggerAutomation,
      claimDailyReward: state.claimDailyReward,
      dismissLevelUpModal: state.dismissLevelUpModal,
      dismissAchievementToast: state.dismissAchievementToast,
      refreshState: state.refreshState,
      reset: state.reset,
    }))
  );
