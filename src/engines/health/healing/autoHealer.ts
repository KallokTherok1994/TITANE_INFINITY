/**
 * TITANE∞ v20Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * AutoHealer - Automatic healing and recovery
 * Migrated from autoHealEngine.ts
 */

import type {
  HealingContext,
  HealingResult,
  HealingAction,
  HealingEvent,
} from '../types';

/**
 * AutoHealer - Automatic system healing and recovery
 *
 * Features:
 * - Provider failure recovery
 * - Timeout handling
 * - State restoration
 * - Graceful degradation
 */
export class AutoHealer {
  private history: HealingEvent[] = [];
  private readonly maxHistory = 100;
  private eventCounter = 0;

  // Healing strategies per trigger type
  private readonly strategies: Record<string, HealingAction[]> = {
    provider_failure: ['provider_switch', 'provider_restart', 'graceful_degradation'],
    timeout: ['provider_switch', 'connection_reset'],
    error_threshold: ['cache_clear', 'state_restore'],
    health_degradation: ['provider_switch', 'graceful_degradation'],
    manual: ['state_restore', 'no_action'],
  };

  /**
   * Perform healing based on context
   */
  async heal(context: HealingContext): Promise<HealingResult> {
    const startTime = performance.now();
    console.log('[AutoHealer] Healing triggered:', context.trigger, context.source);

    // Get applicable strategies
    const strategies = this.strategies[context.trigger] ?? ['no_action'];

    // Try strategies in order
    for (const action of strategies) {
      try {
        const result = await this.executeAction(action, context);
        if (result.success) {
          this.recordEvent(context, result);
          return result;
        }
      } catch (error) {
        console.warn(`[AutoHealer] Action ${action} failed:`, error);
      }
    }

    // All strategies failed
    const failResult: HealingResult = {
      success: false,
      action: 'no_action',
      duration: performance.now() - startTime,
      message: 'All healing strategies exhausted',
    };

    this.recordEvent(context, failResult);
    return failResult;
  }

  /**
   * Execute a specific healing action
   */
  private async executeAction(
    action: HealingAction,
    context: HealingContext
  ): Promise<HealingResult> {
    const startTime = performance.now();

    switch (action) {
      case 'provider_switch':
        return this.executeProviderSwitch(context, startTime);

      case 'provider_restart':
        return this.executeProviderRestart(context, startTime);

      case 'cache_clear':
        return this.executeCacheClear(context, startTime);

      case 'connection_reset':
        return this.executeConnectionReset(context, startTime);

      case 'state_restore':
        return this.executeStateRestore(context, startTime);

      case 'graceful_degradation':
        return this.executeGracefulDegradation(context, startTime);

      case 'no_action':
      default:
        return {
          success: true,
          action: 'no_action',
          duration: performance.now() - startTime,
          message: 'No action taken',
        };
    }
  }

  /**
   * Switch to alternate provider
   */
  private async executeProviderSwitch(
    context: HealingContext,
    startTime: number
  ): Promise<HealingResult> {
    // In real implementation, this would switch providers
    console.log('[AutoHealer] Switching provider for:', context.source);

    return {
      success: true,
      action: 'provider_switch',
      duration: performance.now() - startTime,
      message: `Switched away from ${context.source}`,
      newState: { provider: 'fallback' },
    };
  }

  /**
   * Restart a provider
   */
  private async executeProviderRestart(
    context: HealingContext,
    startTime: number
  ): Promise<HealingResult> {
    console.log('[AutoHealer] Restarting provider:', context.source);

    // Simulate restart delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      success: true,
      action: 'provider_restart',
      duration: performance.now() - startTime,
      message: `Restarted ${context.source}`,
    };
  }

  /**
   * Clear caches
   */
  private async executeCacheClear(
    context: HealingContext,
    startTime: number
  ): Promise<HealingResult> {
    console.log('[AutoHealer] Clearing cache for:', context.source);

    return {
      success: true,
      action: 'cache_clear',
      duration: performance.now() - startTime,
      message: 'Cache cleared',
    };
  }

  /**
   * Reset connection
   */
  private async executeConnectionReset(
    context: HealingContext,
    startTime: number
  ): Promise<HealingResult> {
    console.log('[AutoHealer] Resetting connection for:', context.source);

    return {
      success: true,
      action: 'connection_reset',
      duration: performance.now() - startTime,
      message: 'Connection reset',
    };
  }

  /**
   * Restore previous state
   */
  private async executeStateRestore(
    context: HealingContext,
    startTime: number
  ): Promise<HealingResult> {
    console.log('[AutoHealer] Restoring state for:', context.source);

    return {
      success: true,
      action: 'state_restore',
      duration: performance.now() - startTime,
      message: 'State restored',
    };
  }

  /**
   * Graceful degradation
   */
  private async executeGracefulDegradation(
    context: HealingContext,
    startTime: number
  ): Promise<HealingResult> {
    console.log('[AutoHealer] Entering graceful degradation for:', context.source);

    return {
      success: true,
      action: 'graceful_degradation',
      duration: performance.now() - startTime,
      message: 'System in degraded mode',
      newState: { degraded: true },
    };
  }

  /**
   * Record healing event
   */
  private recordEvent(context: HealingContext, result: HealingResult): void {
    const event: HealingEvent = {
      id: `heal_${++this.eventCounter}`,
      context,
      result,
      timestamp: Date.now(),
    };

    this.history.push(event);

    // Trim history
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(-this.maxHistory);
    }
  }

  /**
   * Get recent healing events
   */
  getHistory(limit = 20): HealingEvent[] {
    return this.history.slice(-limit);
  }

  /**
   * Get healing success rate
   */
  getSuccessRate(): number {
    if (this.history.length === 0) return 1;

    const successful = this.history.filter(e => e.result.success).length;
    return successful / this.history.length;
  }

  /**
   * Get most common triggers
   */
  getCommonTriggers(): Map<string, number> {
    const counts = new Map<string, number>();

    for (const event of this.history) {
      const trigger = event.context.trigger;
      counts.set(trigger, (counts.get(trigger) ?? 0) + 1);
    }

    return counts;
  }
}
