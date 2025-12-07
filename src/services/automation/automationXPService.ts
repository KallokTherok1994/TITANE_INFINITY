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
} from '@/config/automationXP.config';

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

type XPEventCallback = (event: XPEvent) => void;
type AutomationEventCallback = (event: AutomationEvent) => void;
type AchievementEventCallback = (event: AchievementEvent) => void;

// ═══════════════════════════════════════════════════════════════════════════
// SERVICE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

class AutomationXPService {
  private static instance: AutomationXPService;

  private xpState: UserXPState;
  private automationState: AutomationSystemState;
  private rewardsState: RewardsState;
  private actionLog: Map<XPActionId, number[]>; // timestamps des actions

  private xpListeners: XPEventCallback[] = [];
  private automationListeners: AutomationEventCallback[] = [];
  private achievementListeners: AchievementEventCallback[] = [];

  private initialized: boolean = false;
  private automationExecutor: ReturnType<typeof setInterval> | null = null;

  private constructor() {
    this.xpState = { ...INITIAL_USER_XP_STATE };
    this.automationState = {
      ...INITIAL_AUTOMATION_STATE,
      automations: new Map(INITIAL_AUTOMATION_STATE.automations),
      running_automations: new Set(),
    };
    this.rewardsState = {
      ...INITIAL_REWARDS_STATE,
      achievements: new Map(Object.entries(ACHIEVEMENTS)),
      daily_rewards: [...DAILY_REWARDS],
    };
    this.actionLog = new Map();

    this.loadState();
  }

  public static getInstance(): AutomationXPService {
    if (!AutomationXPService.instance) {
      AutomationXPService.instance = new AutomationXPService();
    }
    return AutomationXPService.instance;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALISATION
  // ═══════════════════════════════════════════════════════════════════════════

  public async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      this.loadState();
      await this.syncWithBackend();
      this.startAutomationExecutor();
      this.checkDailyReset();

      this.initialized = true;
      console.log('[AutomationXPService] ✅ Initialized');
    } catch (error) {
      console.error('[AutomationXPService] ❌ Init failed:', error);
    }
  }

  private loadState(): void {
    try {
      // XP State
      const storedXP = localStorage.getItem(STORAGE_KEY_XP);
      if (storedXP) {
        this.xpState = { ...INITIAL_USER_XP_STATE, ...JSON.parse(storedXP) };
      }

      // Rewards State
      const storedRewards = localStorage.getItem(STORAGE_KEY_REWARDS);
      if (storedRewards) {
        const parsed = JSON.parse(storedRewards);
        this.rewardsState = {
          ...this.rewardsState,
          ...parsed,
          achievements: new Map(Object.entries(parsed.achievements || ACHIEVEMENTS)),
          daily_rewards: parsed.daily_rewards || [...DAILY_REWARDS],
        };
      }

      // Action Log
      const storedLog = localStorage.getItem(STORAGE_KEY_ACTION_LOG);
      if (storedLog) {
        const parsed = JSON.parse(storedLog) as Record<string, number[]>;
        const newLog = new Map<XPActionId, number[]>();
        for (const [key, value] of Object.entries(parsed)) {
          newLog.set(key as XPActionId, value);
        }
        this.actionLog = newLog;
      }
    } catch (error) {
      console.warn('[AutomationXPService] Failed to load state:', error);
    }
  }

  private saveState(): void {
    try {
      localStorage.setItem(STORAGE_KEY_XP, JSON.stringify(this.xpState));
      localStorage.setItem(
        STORAGE_KEY_REWARDS,
        JSON.stringify({
          ...this.rewardsState,
          achievements: Object.fromEntries(this.rewardsState.achievements),
        })
      );
      localStorage.setItem(
        STORAGE_KEY_ACTION_LOG,
        JSON.stringify(Object.fromEntries(this.actionLog))
      );
    } catch (error) {
      console.warn('[AutomationXPService] Failed to save state:', error);
    }
  }

  private async syncWithBackend(): Promise<void> {
    try {
      await secureInvoke('xp_sync_state', {
        total_xp: this.xpState.total_xp,
        level: this.xpState.level,
        streak: this.xpState.current_streak,
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
    if (!action) {
      console.warn(`[AutomationXPService] Unknown action: ${actionId}`);
      return 0;
    }

    // Vérifier cooldown
    if (!this.checkCooldown(actionId)) {
      return 0;
    }

    // Vérifier limite quotidienne
    if (!this.checkDailyLimit(actionId)) {
      return 0;
    }

    // Calculer XP avec multiplicateurs
    const streakMultiplier = getStreakMultiplier(this.xpState.current_streak);
    const xpGained = calculateXP(actionId, this.xpState.multiplier, streakMultiplier);

    const previousLevel = this.xpState.level;
    this.xpState.total_xp += xpGained;
    this.xpState.daily_xp_earned += xpGained;
    this.xpState.last_activity = Date.now();

    // Mettre à jour niveau
    const newLevel = getLevelFromXP(this.xpState.total_xp);
    if (newLevel !== previousLevel) {
      this.handleLevelUp(previousLevel, newLevel);
    }

    // Mettre à jour progression
    this.xpState.level = newLevel;
    this.xpState.level_progress = getLevelProgress(this.xpState.total_xp);
    this.xpState.xp_to_next_level = getXPToNextLevel(this.xpState.total_xp);

    // Enregistrer action
    this.logAction(actionId);

    // Vérifier achievements
    this.checkAchievements(actionId);

    // Sauvegarder et notifier
    this.saveState();
    this.notifyXPEvent({
      type: 'xp_gained',
      timestamp: Date.now(),
      amount: xpGained,
      action_id: actionId,
      multiplier_applied: this.xpState.multiplier * streakMultiplier,
    });

    return xpGained;
  }

  private checkCooldown(actionId: XPActionId): boolean {
    const action = XP_ACTIONS[actionId];
    if (!action.cooldown_ms) return true;

    const logs = this.actionLog.get(actionId) || [];
    if (logs.length === 0) return true;

    const lastAction = logs[logs.length - 1];
    return Date.now() - lastAction >= action.cooldown_ms;
  }

  private checkDailyLimit(actionId: XPActionId): boolean {
    const action = XP_ACTIONS[actionId];
    if (!action.max_daily) return true;

    const today = new Date().toDateString();
    const logs = this.actionLog.get(actionId) || [];
    const todayActions = logs.filter(ts => new Date(ts).toDateString() === today);

    return todayActions.length < action.max_daily;
  }

  private logAction(actionId: XPActionId): void {
    const logs = this.actionLog.get(actionId) || [];
    logs.push(Date.now());

    // Garder seulement les dernières 24h
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const recentLogs = logs.filter(ts => ts > cutoff);

    this.actionLog.set(actionId, recentLogs);
  }

  private handleLevelUp(previousLevel: UserLevel, newLevel: UserLevel): void {
    console.log(`[AutomationXPService] 🎉 Level up: ${previousLevel} → ${newLevel}`);

    this.notifyXPEvent({
      type: 'level_up',
      timestamp: Date.now(),
      amount: 0,
      previous_level: previousLevel,
      new_level: newLevel,
    });

    // Ajouter XP bonus pour level up
    const levelConfig = LEVEL_CONFIGS[newLevel];
    if (levelConfig) {
      // Notifier pour les unlocks
      levelConfig.unlocks.forEach(unlock => {
        console.log(`[AutomationXPService] 🔓 Unlocked: ${unlock}`);
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
    const now = Date.now();
    const lastActivity = this.xpState.last_activity;
    const oneDayMs = 24 * 60 * 60 * 1000;

    if (!lastActivity) {
      // Première activité
      this.xpState.current_streak = 1;
    } else if (now - lastActivity > oneDayMs * 2) {
      // Streak cassé (plus de 48h)
      this.xpState.current_streak = 1;
    } else if (now - lastActivity > oneDayMs) {
      // Nouveau jour, streak continue
      this.xpState.current_streak += 1;
      this.addXP('streak_daily');

      if (this.xpState.current_streak === 7) {
        this.addXP('streak_weekly');
      }
    }

    // Mettre à jour le plus long streak
    if (this.xpState.current_streak > this.xpState.longest_streak) {
      this.xpState.longest_streak = this.xpState.current_streak;
    }

    this.saveState();
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // GESTION ACHIEVEMENTS
  // ═══════════════════════════════════════════════════════════════════════════════

  private checkAchievements(_actionId: XPActionId): void {
    this.rewardsState.achievements.forEach((achievement, id) => {
      if (achievement.unlocked) return;

      const progress = this.calculateAchievementProgress(achievement);
      achievement.progress = progress;

      if (progress >= 100 && !achievement.unlocked) {
        this.unlockAchievement(id);
      }
    });
  }

  private calculateAchievementProgress(achievement: Achievement): number {
    const { type, target, current } = achievement.criteria;

    let value = current || 0;

    switch (type) {
      case 'chat_messages':
        value = this.getActionCount('chat_message');
        break;
      case 'voice_interactions':
        value = this.getActionCount('voice_interaction');
        break;
      case 'automations_created':
        value = this.automationState.automations.size;
        break;
      case 'streak_days':
        value = this.xpState.current_streak;
        break;
      case 'level_reach':
        value = Object.keys(LEVEL_CONFIGS).indexOf(this.xpState.level) + 1;
        break;
    }

    return Math.min(100, Math.round((value / target) * 100));
  }

  private getActionCount(actionId: XPActionId): number {
    return (this.actionLog.get(actionId) || []).length;
  }

  private unlockAchievement(achievementId: string): void {
    const achievement = this.rewardsState.achievements.get(achievementId);
    if (!achievement || achievement.unlocked) return;

    achievement.unlocked = true;
    achievement.unlocked_at = Date.now();
    achievement.progress = 100;

    this.rewardsState.total_achievements_unlocked += 1;
    this.rewardsState.total_xp_from_achievements += achievement.xp_reward;
    this.xpState.achievements_unlocked.push(achievementId);

    // Ajouter XP de l'achievement
    this.xpState.total_xp += achievement.xp_reward;
    this.xpState.level = getLevelFromXP(this.xpState.total_xp);

    this.saveState();

    this.notifyAchievementEvent({
      type: 'unlocked',
      timestamp: Date.now(),
      achievement_id: achievementId,
      achievement_name: achievement.name,
      xp_earned: achievement.xp_reward,
    });

    console.log(`[AutomationXPService] 🏆 Achievement unlocked: ${achievement.name}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GESTION DAILY REWARDS
  // ═══════════════════════════════════════════════════════════════════════════

  private checkDailyReset(): void {
    const now = Date.now();
    if (now >= this.rewardsState.next_daily_reset) {
      this.resetDaily();
    }
  }

  private resetDaily(): void {
    this.xpState.daily_xp_earned = 0;
    this.xpState.daily_limit_reached = false;
    this.rewardsState.next_daily_reset = getNextDailyReset();

    // Nettoyer l'action log (garder seulement 24h)
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    this.actionLog.forEach((logs, actionId) => {
      this.actionLog.set(
        actionId,
        logs.filter(ts => ts > cutoff)
      );
    });

    this.saveState();
  }

  public claimDailyReward(): DailyReward | null {
    const dayIndex = this.rewardsState.current_day_streak % 7;
    const reward = this.rewardsState.daily_rewards[dayIndex];

    if (!reward || reward.claimed) {
      return null;
    }

    reward.claimed = true;
    reward.claimed_at = Date.now();

    // Appliquer la récompense
    switch (reward.reward.type) {
      case 'xp':
        this.xpState.total_xp += reward.reward.value as number;
        break;
      case 'multiplier':
        this.xpState.multiplier = reward.reward.value as number;
        // Le multiplicateur expire après 24h - géré par setTimeout
        setTimeout(
          () => {
            this.xpState.multiplier = 1.0;
            this.saveState();
          },
          24 * 60 * 60 * 1000
        );
        break;
    }

    this.rewardsState.current_day_streak += 1;
    this.saveState();

    return reward;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GESTION AUTOMATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  private startAutomationExecutor(): void {
    if (this.automationExecutor) return;

    // Vérifier les automations toutes les minutes
    this.automationExecutor = setInterval(() => {
      this.processScheduledAutomations();
    }, 60000);
  }

  private async processScheduledAutomations(): Promise<void> {
    if (this.automationState.is_paused) return;

    const _now = new Date();

    for (const [id, automation] of this.automationState.automations) {
      if (!automation.enabled) continue;
      if (automation.trigger.type !== 'scheduled') continue;
      if (this.automationState.running_automations.has(id)) continue;

      // Vérifier si l'automation doit s'exécuter
      // TODO: Implémenter le parsing cron
    }
  }

  public async triggerAutomation(automationId: string): Promise<AutomationRunResult> {
    const automation = this.automationState.automations.get(automationId);

    if (!automation) {
      return {
        automation_id: automationId,
        success: false,
        started_at: Date.now(),
        completed_at: Date.now(),
        duration_ms: 0,
        actions_executed: 0,
        actions_failed: 0,
        xp_earned: 0,
        error: 'Automation not found',
        outputs: {},
      };
    }

    // Vérifier niveau requis
    const userLevelIndex = Object.keys(LEVEL_CONFIGS).indexOf(this.xpState.level);
    const requiredLevelIndex = Object.keys(LEVEL_CONFIGS).indexOf(
      automation.requires_level
    );

    if (userLevelIndex < requiredLevelIndex) {
      return {
        automation_id: automationId,
        success: false,
        started_at: Date.now(),
        completed_at: Date.now(),
        duration_ms: 0,
        actions_executed: 0,
        actions_failed: 0,
        xp_earned: 0,
        error: `Level ${automation.requires_level} required`,
        outputs: {},
      };
    }

    this.automationState.running_automations.add(automationId);
    this.addXP('automation_trigger');

    this.notifyAutomationEvent({
      type: 'started',
      timestamp: Date.now(),
      automation_id: automationId,
      automation_name: automation.name,
      trigger_type: automation.trigger.type,
    });

    const startTime = Date.now();
    let actionsExecuted = 0;
    let actionsFailed = 0;
    const outputs: Record<string, unknown> = {};

    try {
      for (const action of automation.actions) {
        try {
          if (action.delay_ms) {
            await new Promise(resolve => setTimeout(resolve, action.delay_ms));
          }

          // Exécuter l'action via backend
          const result = await secureInvoke('automation_execute_action', {
            action_type: action.type,
            config: action.config,
          });

          outputs[action.type] = result;
          actionsExecuted++;
        } catch (error) {
          actionsFailed++;
          if (!action.retry_on_failure) {
            throw error;
          }
        }
      }

      const result: AutomationRunResult = {
        automation_id: automationId,
        success: true,
        started_at: startTime,
        completed_at: Date.now(),
        duration_ms: Date.now() - startTime,
        actions_executed: actionsExecuted,
        actions_failed: actionsFailed,
        xp_earned: automation.xp_reward,
        outputs,
      };

      automation.run_count++;
      automation.success_count++;
      automation.last_run = Date.now();
      automation.updated_at = Date.now();

      this.addXP('automation_complete');
      this.automationState.last_run_results.push(result);
      this.automationState.total_runs++;
      this.automationState.total_successes++;

      this.notifyAutomationEvent({
        type: 'completed',
        timestamp: Date.now(),
        automation_id: automationId,
        automation_name: automation.name,
        trigger_type: automation.trigger.type,
        result,
      });

      return result;
    } catch (error) {
      automation.run_count++;
      automation.failure_count++;
      automation.updated_at = Date.now();

      this.automationState.total_runs++;
      this.automationState.total_failures++;

      const result: AutomationRunResult = {
        automation_id: automationId,
        success: false,
        started_at: startTime,
        completed_at: Date.now(),
        duration_ms: Date.now() - startTime,
        actions_executed: actionsExecuted,
        actions_failed: actionsFailed,
        xp_earned: 0,
        error: String(error),
        outputs,
      };

      this.notifyAutomationEvent({
        type: 'failed',
        timestamp: Date.now(),
        automation_id: automationId,
        automation_name: automation.name,
        trigger_type: automation.trigger.type,
        result,
      });

      return result;
    } finally {
      this.automationState.running_automations.delete(automationId);
      this.saveState();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GETTERS
  // ═══════════════════════════════════════════════════════════════════════════

  public getXPState(): UserXPState {
    return { ...this.xpState };
  }

  public getAutomationState(): AutomationSystemState {
    return {
      ...this.automationState,
      automations: new Map(this.automationState.automations),
      running_automations: new Set(this.automationState.running_automations),
    };
  }

  public getRewardsState(): RewardsState {
    return {
      ...this.rewardsState,
      achievements: new Map(this.rewardsState.achievements),
      daily_rewards: [...this.rewardsState.daily_rewards],
    };
  }

  public getAutomation(id: string): Automation | undefined {
    return this.automationState.automations.get(id);
  }

  public getAchievement(id: string): Achievement | undefined {
    return this.rewardsState.achievements.get(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LISTENERS
  // ═══════════════════════════════════════════════════════════════════════════

  public onXPEvent(callback: XPEventCallback): () => void {
    this.xpListeners.push(callback);
    return () => {
      this.xpListeners = this.xpListeners.filter(cb => cb !== callback);
    };
  }

  public onAutomationEvent(callback: AutomationEventCallback): () => void {
    this.automationListeners.push(callback);
    return () => {
      this.automationListeners = this.automationListeners.filter(cb => cb !== callback);
    };
  }

  public onAchievementEvent(callback: AchievementEventCallback): () => void {
    this.achievementListeners.push(callback);
    return () => {
      this.achievementListeners = this.achievementListeners.filter(cb => cb !== callback);
    };
  }

  private notifyXPEvent(event: XPEvent): void {
    this.xpListeners.forEach(cb => {
      try {
        cb(event);
      } catch (e) {
        console.error(e);
      }
    });
  }

  private notifyAutomationEvent(event: AutomationEvent): void {
    this.automationListeners.forEach(cb => {
      try {
        cb(event);
      } catch (e) {
        console.error(e);
      }
    });
  }

  private notifyAchievementEvent(event: AchievementEvent): void {
    this.achievementListeners.forEach(cb => {
      try {
        cb(event);
      } catch (e) {
        console.error(e);
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CLEANUP
  // ═══════════════════════════════════════════════════════════════════════════

  public dispose(): void {
    if (this.automationExecutor) {
      clearInterval(this.automationExecutor);
      this.automationExecutor = null;
    }
    this.saveState();
  }

  public reset(): void {
    this.xpState = { ...INITIAL_USER_XP_STATE };
    this.rewardsState = {
      ...INITIAL_REWARDS_STATE,
      achievements: new Map(Object.entries(ACHIEVEMENTS)),
      daily_rewards: [...DAILY_REWARDS],
    };
    this.actionLog.clear();
    this.saveState();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT SINGLETON
// ═══════════════════════════════════════════════════════════════════════════

export const automationXPService = AutomationXPService.getInstance();
export { AutomationXPService };
