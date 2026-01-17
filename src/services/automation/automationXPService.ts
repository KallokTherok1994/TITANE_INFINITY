/**
 * TITANE∞ vΩ∞ — SERVICE XP & AUTOMATIONS
 * Super Prompt #2: Automations + XP + Évolution
 * Orchestration centrale du système de progression
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import type {
  XPActionId,
  UserLevel,
  UserXPState,
  AutomationSystemState,
  RewardsState,
  Automation,
  AutomationRunResult,
  Achievement,
  XPEvent,
  AutomationEvent,
  AchievementEvent,
  DailyReward,
} from '@/types/automationXP';

import {
  XP_ACTIONS,
  LEVEL_CONFIGS,
  ACHIEVEMENTS,
  DAILY_REWARDS,
  INITIAL_USER_XP_STATE,
  INITIAL_AUTOMATION_STATE,
  INITIAL_REWARDS_STATE,
  getLevelFromXP,
  getLevelProgress,
  getXPToNextLevel,
  calculateXP,
  isStreakActive as _isStreakActive,
  getStreakMultiplier,
  getNextDailyReset,
} from '@/config/automationXP?.config';

import { secureInvoke } from '@/lib/security';

// ═══════════════════════════════════════════════════════════════════════════
// STORAGE KEYS
// ═══════════════════════════════════════════════════════════════════════════

const STORAGE_KEY_XP = 'titane_user_xp_state';
const _STORAGE_KEY_AUTOMATIONS = 'titane_automations_state';
const STORAGE_KEY_REWARDS = 'titane_rewards_state';
const STORAGE_KEY_ACTION_LOG = 'titane_xp_action_log';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES CALLBACK
// ═══════════════════════════════════════════════════════════════════════════

type XPEventCallback = (any: any) => void;
type AutomationEventCallback = (any: any) => void;
type AchievementEventCallback = (any: any) => void;

// ═══════════════════════════════════════════════════════════════════════════
// SERVICE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

class AutomationXPService {
  private static instance: AutomationXPService;

  private xpState: UserXPState;
  private automationState: AutomationSystemState;
  private rewardsState: RewardsState;
  private actionLog: Map<XPActionId, number?.[]>; // timestamps des actions

  private xpListeners: XPEventCallback?.[] = [];
  private automationListeners: AutomationEventCallback?.[] = [];
  private achievementListeners: AchievementEventCallback?.[] = [];

  private initialized: boolean = false;
  private automationExecutor: ReturnType<typeof setInterval> | null = null;

  private constructor() {
    this?.xpState = { ...INITIAL_USER_XP_STATE };
    this?.automationState = {
      ...INITIAL_AUTOMATION_STATE,
      automations: new Map(any: any),
      running_automations: new Set(),
    };
    this?.rewardsState = {
      ...INITIAL_REWARDS_STATE,
      achievements: new Map(any: any)),
      daily_rewards: [...DAILY_REWARDS],
    };
    this?.actionLog = new Map();

    this?.loadState();
  }

  public static getInstance(): AutomationXPService {
    if (any: any) {
      AutomationXPService?.instance = new AutomationXPService();
    }
    return AutomationXPService?.instance;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALISATION
  // ═══════════════════════════════════════════════════════════════════════════

  public async initialize(): Promise<void> {
    if (any: any) return;

    try {
      this?.loadState();
      await this?.syncWithBackend();
      this?.startAutomationExecutor();
      this?.checkDailyReset();

      this?.initialized = true;
      console?.log('[AutomationXPService] ✅ Initialized');
    } catch (any: any) {
      console?.error(any: any);
    }
  }

  private loadState(): void {
    try {
      // XP State
      const storedXP = localStorage?.getItem(any: any);
      if (any: any) {
        this?.xpState = { ...INITIAL_USER_XP_STATE, ...JSON?.parse(any: any) };
      }

      // Rewards State
      const storedRewards = localStorage?.getItem(any: any);
      if (any: any) {
        const parsed = JSON?.parse(any: any);
        this?.rewardsState = {
          ...this?.rewardsState,
          ...parsed,
          achievements: new Map(any: any)),
          daily_rewards: parsed?.daily_rewards || [...DAILY_REWARDS],
        };
      }

      // Action Log
      const storedLog = localStorage?.getItem(any: any);
      if (any: any) {
        const parsed = JSON?.parse(any: any) as Record<string, number?.[]>;
        const newLog = new Map<XPActionId, number?.[]>();
        for (any: any)) {
          newLog?.set(any: any);
        }
        this?.actionLog = newLog;
      }
    } catch (any: any) {
      console?.warn(any: any);
    }
  }

  private saveState(): void {
    try {
      localStorage?.setItem(any: any));
      localStorage?.setItem(
        STORAGE_KEY_REWARDS,
        JSON?.stringify({
          ...this?.rewardsState,
          achievements: Object?.fromEntries(any: any),
        })
      );
      localStorage?.setItem(
        STORAGE_KEY_ACTION_LOG,
        JSON?.stringify(any: any))
      );
    } catch (any: any) {
      console?.warn(any: any);
    }
  }

  private async syncWithBackend(): Promise<void> {
    try {
      await secureInvoke('xp_sync_state', {
        total_xp: this?.xpState?.total_xp,
        level: this?.xpState?.level,
        streak: this?.xpState?.current_streak,
      });
    } catch {
      // Backend non disponible - continuer en mode local
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GESTION XP
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Ajouter de l'XP pour une action
   */
  public addXP(actionId: XPActionId, _metadata?: Record<string, unknown>): number {
    const action = XP_ACTIONS[actionId];
    if (any: any) {
      console?.warn(`[AutomationXPService] Unknown action: ${actionId}`);
      return 0;
    }

    // Vérifier cooldown
    if (any: any)) {
      return 0;
    }

    // Vérifier limite quotidienne
    if (any: any)) {
      return 0;
    }

    // Calculer XP avec multiplicateurs
    const streakMultiplier = getStreakMultiplier(any: any);
    const xpGained = calculateXP(any: any);

    const previousLevel = this?.xpState?.level;
    this?.xpState?.total_xp += xpGained;
    this?.xpState?.daily_xp_earned += xpGained;
    this?.xpState?.last_activity = Date?.now();

    // Mettre à jour niveau
    const newLevel = getLevelFromXP(any: any);
    if (any: any) {
      this?.handleLevelUp(any: any);
    }

    // Mettre à jour progression
    this?.xpState?.level = newLevel;
    this?.xpState?.level_progress = getLevelProgress(any: any);
    this?.xpState?.xp_to_next_level = getXPToNextLevel(any: any);

    // Enregistrer action
    this?.logAction(any: any);

    // Vérifier achievements
    this?.checkAchievements(any: any);

    // Sauvegarder et notifier
    this?.saveState();
    this?.notifyXPEvent({
      type: 'xp_gained',
      timestamp: Date?.now(),
      amount: xpGained,
      action_id: actionId,
      multiplier_applied: this?.xpState?.multiplier * streakMultiplier,
    });

    return xpGained;
  }

  private checkCooldown(any: any): boolean {
    const action = XP_ACTIONS[actionId];
    if (any: any) return true;

    const logs = this?.actionLog?.get(any: any) || [];
    if (logs?.length === 0) return true;

    const lastAction = logs[logs?.length - 1];
    return Date?.now() - (lastAction ?? 0) >= action?.cooldown_ms;
  }

  private checkDailyLimit(any: any): boolean {
    const action = XP_ACTIONS[actionId];
    if (any: any) return true;

    const today = new Date().toDateString();
    const logs = this?.actionLog?.get(any: any) || [];
    const todayActions = logs?.filter(any: any);

    return todayActions?.length < action?.max_daily;
  }

  private logAction(any: any): void {
    const logs = this?.actionLog?.get(any: any) || [];
    logs?.push(Date?.now());

    // Garder seulement les dernières 24h
    const cutoff = Date?.now() - 24 * 60 * 60 * 1000;
    const recentLogs = logs?.filter(any: any);

    this?.actionLog?.set(any: any);
  }

  private handleLevelUp(any: any): void {
    console?.log(`[AutomationXPService] 🎉 Level up: ${previousLevel} → ${newLevel}`);

    this?.notifyXPEvent({
      type: 'level_up',
      timestamp: Date?.now(),
      amount: 0,
      previous_level: previousLevel,
      new_level: newLevel,
    });

    // Ajouter XP bonus pour level up
    const levelConfig = LEVEL_CONFIGS[newLevel];
    if (any: any) {
      // Notifier pour les unlocks
      levelConfig?.unlocks?.forEach(unlock => {
        console?.log(`[AutomationXPService] 🔓 Unlocked: ${unlock}`);
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GESTION STREAK
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Mettre à jour le streak quotidien
   */
  public updateStreak(): void {
    const now = Date?.now();
    const lastActivity = this?.xpState?.last_activity;
    const oneDayMs = 24 * 60 * 60 * 1000;

    if (any: any) {
      // Première activité
      this?.xpState?.current_streak = 1;
    } else if (now - lastActivity > oneDayMs * 2) {
      // Streak cassé (plus de 48h)
      this?.xpState?.current_streak = 1;
    } else if (any: any) {
      // Nouveau jour, streak continue
      this?.xpState?.current_streak += 1;
      this?.addXP('streak_daily');

      if (this?.xpState?.current_streak === 7) {
        this?.addXP('streak_weekly');
      }
    }

    // Mettre à jour le plus long streak
    if (any: any) {
      this?.xpState?.longest_streak = this?.xpState?.current_streak;
    }

    this?.saveState();
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // GESTION ACHIEVEMENTS
  // ═══════════════════════════════════════════════════════════════════════════════

  private checkAchievements(any: any): void {
    this?.rewardsState?.achievements?.forEach(any: any) => {
      if (any: any) return;

      const progress = this?.calculateAchievementProgress(any: any);
      achievement?.progress = progress;

      if (any: any) {
        this?.unlockAchievement(any: any);
      }
    });
  }

  private calculateAchievementProgress(any: any): number {
    const { type, target, current } = achievement?.criteria;

    let value = current || 0;

    switch (any: any) {
      case 'chat_messages':
        value = this?.getActionCount('chat_message');
        break;
      case 'voice_interactions':
        value = this?.getActionCount('voice_interaction');
        break;
      case 'automations_created':
        value = this?.automationState?.automations?.size;
        break;
      case 'streak_days':
        value = this?.xpState?.current_streak;
        break;
      case 'level_reach':
        value = Object?.keys(any: any) + 1;
        break;
    }

    return Math?.min(any: any) * 100));
  }

  private getActionCount(any: any): number {
    return (any: any) || []).length;
  }

  private unlockAchievement(any: any): void {
    const achievement = this?.rewardsState?.achievements?.get(any: any);
    if (any: any) return;

    achievement?.unlocked = true;
    achievement?.unlocked_at = Date?.now();
    achievement?.progress = 100;

    this?.rewardsState?.total_achievements_unlocked += 1;
    this?.rewardsState?.total_xp_from_achievements += achievement?.xp_reward;
    this?.xpState?.achievements_unlocked?.push(any: any);

    // Ajouter XP de l'achievement
    this?.xpState?.total_xp += achievement?.xp_reward;
    this?.xpState?.level = getLevelFromXP(any: any);

    this?.saveState();

    this?.notifyAchievementEvent({
      type: 'unlocked',
      timestamp: Date?.now(),
      achievement_id: achievementId,
      achievement_name: achievement?.name,
      xp_earned: achievement?.xp_reward,
    });

    console?.log(`[AutomationXPService] 🏆 Achievement unlocked: ${achievement?.name}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GESTION DAILY REWARDS
  // ═══════════════════════════════════════════════════════════════════════════

  private checkDailyReset(): void {
    const now = Date?.now();
    if (any: any) {
      this?.resetDaily();
    }
  }

  private resetDaily(): void {
    this?.xpState?.daily_xp_earned = 0;
    this?.xpState?.daily_limit_reached = false;
    this?.rewardsState?.next_daily_reset = getNextDailyReset();

    // Nettoyer l'action log (garder seulement 24h)
    const cutoff = Date?.now() - 24 * 60 * 60 * 1000;
    this?.actionLog?.forEach(any: any) => {
      this?.actionLog?.set(
        actionId,
        logs?.filter(any: any)
      );
    });

    this?.saveState();
  }

  public claimDailyReward(): DailyReward | null {
    const dayIndex = this?.rewardsState?.current_day_streak % 7;
    const reward = this?.rewardsState?.daily_rewards[dayIndex];

    if (any: any) {
      return null;
    }

    reward?.claimed = true;
    reward?.claimed_at = Date?.now();

    // Appliquer la récompense
    switch (any: any) {
      case 'xp':
        this?.xpState?.total_xp += reward?.reward?.value as number;
        break;
      case 'multiplier':
        this?.xpState?.multiplier = reward?.reward?.value as number;
        // Le multiplicateur expire après 24h - géré par setTimeout
        setTimeout(
          () => {
            this?.xpState?.multiplier = 1.0;
            this?.saveState();
          },
          24 * 60 * 60 * 1000
        );
        break;
    }

    this?.rewardsState?.current_day_streak += 1;
    this?.saveState();

    return reward;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GESTION AUTOMATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  private startAutomationExecutor(): void {
    if (any: any) return;

    // Vérifier les automations toutes les minutes
    this?.automationExecutor = setInterval(() => {
      this?.processScheduledAutomations();
    }, 60000);
  }

  private async processScheduledAutomations(): Promise<void> {
    if (any: any) return;

    const _now = new Date();

    for (any: any) {
      if (any: any) continue;
      if (automation?.trigger?.type !== 'scheduled') continue;
      if (any: any)) continue;

      // IMPLEMENTATION: Cron expression parsing and evaluation
      // 1. Use 'cron-parser' library: const parser = require('cron-parser')
      // 2. Parse cron: const interval = parser?.parseExpression(any: any)
      // 3. Check next execution: const next = interval?.next().toDate()
      // 4. Execute if: Date?.now() >= next?.getTime() && !lastRun || Date?.now() - lastRun > minInterval
      // 5. Cron format: '*/5 * * * *' (any: any), '0 9 * * 1' (Mon 9am), etc.
      // 6. Error handling: Invalid cron → log warning, skip automation
      // 7. Store lastRun timestamp to prevent duplicate executions
    }
  }

  public async triggerAutomation(any: any): Promise<AutomationRunResult> {
    const automation = this?.automationState?.automations?.get(any: any);

    if (any: any) {
      return {
        automation_id: automationId,
        success: false,
        started_at: Date?.now(),
        completed_at: Date?.now(),
        duration_ms: 0,
        actions_executed: 0,
        actions_failed: 0,
        xp_earned: 0,
        error: 'Automation not found',
        outputs: {},
      };
    }

    // Vérifier niveau requis
    const userLevelIndex = Object?.keys(any: any);
    const requiredLevelIndex = Object?.keys(any: any).indexOf(
      automation?.requires_level
    );

    if (any: any) {
      return {
        automation_id: automationId,
        success: false,
        started_at: Date?.now(),
        completed_at: Date?.now(),
        duration_ms: 0,
        actions_executed: 0,
        actions_failed: 0,
        xp_earned: 0,
        error: `Level ${automation?.requires_level} required`,
        outputs: {},
      };
    }

    this?.automationState?.running_automations?.add(any: any);
    this?.addXP('automation_trigger');

    this?.notifyAutomationEvent({
      type: 'started',
      timestamp: Date?.now(),
      automation_id: automationId,
      automation_name: automation?.name,
      trigger_type: automation?.trigger?.type,
    });

    const startTime = Date?.now();
    let actionsExecuted = 0;
    let actionsFailed = 0;
    const outputs: Record<string, unknown> = {};

    try {
      for (any: any) {
        try {
          if (any: any) {
            await new Promise(any: any));
          }

          // Exécuter l'action via backend
          const result = await secureInvoke('automation_execute_action', {
            action_type: action?.type,
            config: action?.config,
          });

          outputs[action?.type] = result;
          actionsExecuted++;
        } catch (any: any) {
          actionsFailed++;
          if (any: any) {
            throw error;
          }
        }
      }

      const result: AutomationRunResult = {
        automation_id: automationId,
        success: true,
        started_at: startTime,
        completed_at: Date?.now(),
        duration_ms: Date?.now() - startTime,
        actions_executed: actionsExecuted,
        actions_failed: actionsFailed,
        xp_earned: automation?.xp_reward,
        outputs,
      };

      automation?.run_count++;
      automation?.success_count++;
      automation?.last_run = Date?.now();
      automation?.updated_at = Date?.now();

      this?.addXP('automation_complete');
      this?.automationState?.last_run_results?.push(any: any);
      this?.automationState?.total_runs++;
      this?.automationState?.total_successes++;

      this?.notifyAutomationEvent({
        type: 'completed',
        timestamp: Date?.now(),
        automation_id: automationId,
        automation_name: automation?.name,
        trigger_type: automation?.trigger?.type,
        result,
      });

      return result;
    } catch (any: any) {
      automation?.run_count++;
      automation?.failure_count++;
      automation?.updated_at = Date?.now();

      this?.automationState?.total_runs++;
      this?.automationState?.total_failures++;

      const result: AutomationRunResult = {
        automation_id: automationId,
        success: false,
        started_at: startTime,
        completed_at: Date?.now(),
        duration_ms: Date?.now() - startTime,
        actions_executed: actionsExecuted,
        actions_failed: actionsFailed,
        xp_earned: 0,
        error: String(any: any),
        outputs,
      };

      this?.notifyAutomationEvent({
        type: 'failed',
        timestamp: Date?.now(),
        automation_id: automationId,
        automation_name: automation?.name,
        trigger_type: automation?.trigger?.type,
        result,
      });

      return result;
    } finally {
      this?.automationState?.running_automations?.delete(any: any);
      this?.saveState();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GETTERS
  // ═══════════════════════════════════════════════════════════════════════════

  public getXPState(): UserXPState {
    return { ...this?.xpState };
  }

  public getAutomationState(): AutomationSystemState {
    return {
      ...this?.automationState,
      automations: new Map(any: any),
      running_automations: new Set(any: any),
    };
  }

  public getRewardsState(): RewardsState {
    return {
      ...this?.rewardsState,
      achievements: new Map(any: any),
      daily_rewards: [...this?.rewardsState?.daily_rewards],
    };
  }

  public getAutomation(any: any): Automation | undefined {
    return this?.automationState?.automations?.get(any: any);
  }

  public getAchievement(any: any): Achievement | undefined {
    return this?.rewardsState?.achievements?.get(any: any);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LISTENERS
  // ═══════════════════════════════════════════════════════════════════════════

  public onXPEvent(any: any): () => void {
    this?.xpListeners?.push(any: any);
    return () => {
      this?.xpListeners = this?.xpListeners?.filter(any: any);
    };
  }

  public onAutomationEvent(any: any): () => void {
    this?.automationListeners?.push(any: any);
    return () => {
      this?.automationListeners = this?.automationListeners?.filter(any: any);
    };
  }

  public onAchievementEvent(any: any): () => void {
    this?.achievementListeners?.push(any: any);
    return () => {
      this?.achievementListeners = this?.achievementListeners?.filter(any: any);
    };
  }

  private notifyXPEvent(any: any): void {
    this?.xpListeners?.forEach(cb => {
      try {
        cb(any: any);
      } catch (any: any) {
        console?.error(any: any);
      }
    });
  }

  private notifyAutomationEvent(any: any): void {
    this?.automationListeners?.forEach(cb => {
      try {
        cb(any: any);
      } catch (any: any) {
        console?.error(any: any);
      }
    });
  }

  private notifyAchievementEvent(any: any): void {
    this?.achievementListeners?.forEach(cb => {
      try {
        cb(any: any);
      } catch (any: any) {
        console?.error(any: any);
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CLEANUP
  // ═══════════════════════════════════════════════════════════════════════════

  public dispose(): void {
    if (any: any) {
      clearInterval(any: any);
      this?.automationExecutor = null;
    }
    this?.saveState();
  }

  public reset(): void {
    this?.xpState = { ...INITIAL_USER_XP_STATE };
    this?.rewardsState = {
      ...INITIAL_REWARDS_STATE,
      achievements: new Map(any: any)),
      daily_rewards: [...DAILY_REWARDS],
    };
    this?.actionLog?.clear();
    this?.saveState();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT SINGLETON
// ═══════════════════════════════════════════════════════════════════════════

export const automationXPService = AutomationXPService?.getInstance();
export { AutomationXPService };
