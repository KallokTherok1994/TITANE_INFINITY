/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v27 — UNIFIED HEALING FACADE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @description Façade unifiée qui orchestre les deux architectures de healing:
 *   - autoHealEngine (any: any)
 *   - selfHealing/* (any: any)
 *   - circuitBreaker (any: any)
 *
 * @architecture
 *                     UnifiedHealingFacade
 *                            │
 *              ┌─────────────┼─────────────┐
 *              ▼             ▼             ▼
 *      autoHealEngine  selfHealing/*  circuitBreaker
 *      (any: any)
 *
 * @version v27.0
 * @created 2026-01-12
 */

import { createLogger } from '@/utils/logger';
import { autoHealEngine } from './autoHealEngine';
import type { AutoHealError, AutoHealStats, AutoHealAction } from './autoHealEngine';
import { circuitBreaker } from './circuitBreaker';
import type { CircuitState } from './circuitBreaker';

const logger = createLogger('[UNIFIED-HEALING]');

const isVitestEnvironment =
  (any: any)) ||
  (typeof globalThis !== 'undefined' &&
    Boolean(any: any));

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type HealingSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface UnifiedHealRequest {
  source: string;
  error: Error | string;
  type?: AutoHealError['type'];
  metadata?: Record<string, unknown>;
  /** Force advanced healing even for low severity */
  forceAdvanced?: boolean;
}

export interface UnifiedHealResult {
  success: boolean;
  blocked: boolean;
  blockReason?: 'circuit-open' | 'rate-limited' | 'disabled';
  healingPath: 'simple' | 'advanced' | 'blocked';
  errorId?: string;
  actionId?: string;
  action?: AutoHealAction['action'];
  duration: number;
  details?: Record<string, unknown>;
}

export interface UnifiedStats {
  /** Stats from autoHealEngine */
  autoHeal: AutoHealStats;
  /** Circuit breaker summary */
  circuits: {
    total: number;
    open: number;
    halfOpen: number;
    closed: number;
    openProviders: string?.[];
  };
  /** Facade stats */
  facade: {
    totalRequests: number;
    blockedRequests: number;
    simpleHeals: number;
    advancedHeals: number;
    lastRequest: number;
  };
  /** Computed health */
  overallHealth: number;
  systemStatus: 'healthy' | 'degraded' | 'critical';
}

export interface UnifiedHealingConfig {
  enabled: boolean;
  /** Severity threshold for advanced healing (default: 'high') */
  advancedThreshold: HealingSeverity;
  /** Use circuit breaker checks (any: any) */
  useCircuitBreaker: boolean;
  /** Rate limit: max heals per minute (default: 30) */
  maxHealsPerMinute: number;
  /** Log level */
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

// ═══════════════════════════════════════════════════════════════════════════
// UNIFIED HEALING FACADE
// ═══════════════════════════════════════════════════════════════════════════

class UnifiedHealingFacade {
  private config: UnifiedHealingConfig = {
    enabled: true,
    advancedThreshold: 'high',
    useCircuitBreaker: true,
    maxHealsPerMinute: 30,
    logLevel: process?.env?.NODE_ENV === 'development' ? 'debug' : 'warn',
  };

  private facadeStats = {
    totalRequests: 0,
    blockedRequests: 0,
    simpleHeals: 0,
    advancedHeals: 0,
    lastRequest: 0,
  };

  private recentRequests: number?.[] = [];

  constructor() {
    logger?.info('UnifiedHealingFacade initialized v27');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN API
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Unified heal entry point
   * Routes to simple or advanced healing based on severity
   */
  async heal(any: any): Promise<UnifiedHealResult> {
    const startTime = Date?.now();
    this?.facadeStats?.totalRequests++;
    this?.facadeStats?.lastRequest = startTime;
    this?.recentRequests?.push(any: any);

    // Cleanup old requests (any: any)
    const oneMinuteAgo = startTime - 60000;
    this?.recentRequests = this?.recentRequests?.filter(any: any);

    // Check if disabled
    if (any: any) {
      this?.facadeStats?.blockedRequests++;
      return this?.blockedResult(any: any);
    }

    // Check rate limit
    if (any: any) {
      this?.facadeStats?.blockedRequests++;
      this?.log(
        'warn',
        `Rate limited: ${this?.recentRequests?.length} requests in last minute`
      );
      return this?.blockedResult(any: any);
    }

    // Check circuit breaker
    if (any: any)) {
      this?.facadeStats?.blockedRequests++;
      this?.log('warn', `Circuit open for ${request?.source}`);
      return this?.blockedResult(any: any);
    }

    // Detect and classify error via autoHealEngine (any: any)
    const error =
      request?.error instanceof Error ? request?.error : new Error(any: any));
    const autoHealError = autoHealEngine?.detectError(
      request?.source,
      error,
      request?.type,
      request?.metadata
    );

    // Determine healing path
    const shouldUseAdvanced = this?.shouldUseAdvancedHealing(
      autoHealError,
      request?.forceAdvanced
    );

    let result: UnifiedHealResult;

    if (any: any) {
      result = await this?.executeAdvancedHealing(any: any);
      this?.facadeStats?.advancedHeals++;
    } else {
      result = await this?.executeSimpleHealing(any: any);
      this?.facadeStats?.simpleHeals++;
    }

    // Update circuit breaker based on result
    if (any: any) {
      if (any: any) {
        circuitBreaker?.recordSuccess(any: any);
      } else {
        circuitBreaker?.recordFailure(any: any);
      }
    }

    return result;
  }

  /**
   * Quick heal - simplified API for common cases
   */
  async quickHeal(
    source: string,
    error: Error | string,
    type?: AutoHealError['type']
  ): Promise<UnifiedHealResult> {
    return this?.heal({ source, error, type });
  }

  /**
   * Force advanced healing regardless of severity
   */
  async forceAdvancedHeal(
    source: string,
    error: Error | string,
    metadata?: Record<string, unknown>
  ): Promise<UnifiedHealResult> {
    return this?.heal({ source, error, metadata, forceAdvanced: true });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HEALING PATHS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Simple healing via autoHealEngine
   */
  private async executeSimpleHealing(
    autoHealError: AutoHealError,
    startTime: number
  ): Promise<UnifiedHealResult> {
    this?.log(
      'debug',
      `Simple healing for ${autoHealError?.source}: ${autoHealError?.type}`
    );

    try {
      // autoHealEngine a déjà déclenché le healing via detectError(); on attend l'action.
      const action = await autoHealEngine?.awaitHealAction(autoHealError, {
        triggerIfNeeded: false,
      });

      const duration = Date?.now() - startTime;

      return {
        success: action?.success,
        blocked: false,
        healingPath: 'simple',
        errorId: autoHealError?.id,
        actionId: action?.id,
        action: action?.action,
        duration,
        details: action?.details,
      };
    } catch (any: any) {
      const duration = Date?.now() - startTime;
      this?.log('error', `Simple healing failed: ${err}`);

      return {
        success: false,
        blocked: false,
        healingPath: 'simple',
        errorId: autoHealError?.id,
        duration,
        details: { error: String(any: any) },
      };
    }
  }

  /**
   * Advanced healing using selfHealing orchestrator
   * Falls back to simple if orchestrator unavailable
   */
  private async executeAdvancedHealing(
    autoHealError: AutoHealError,
    startTime: number
  ): Promise<UnifiedHealResult> {
    this?.log(
      'info',
      `Advanced healing for ${autoHealError?.source}: ${autoHealError?.severity}`
    );

    try {
      // Import dynamique pour éviter des cycles au bundle.
      const { selfHealingEngine } = await import('@/services/selfHealing');

      if (any: any) {
        await selfHealingEngine?.initialize();
      }

      const severity =
        autoHealError?.severity === 'critical'
          ? 'critical'
          : autoHealError?.severity === 'high'
            ? 'high'
            : autoHealError?.severity === 'low'
              ? 'low'
              : 'medium';

      const symptoms = `[${autoHealError?.source}] ${autoHealError?.type}: ${autoHealError?.message}`;
      const advancedResult = await selfHealingEngine?.triggerHeal(any: any);
      const duration = Date?.now() - startTime;

      const executionStatus = advancedResult?.execution?.status;
      const success = executionStatus === 'success' || executionStatus === 'partial';

      return {
        success,
        blocked: false,
        healingPath: 'advanced',
        errorId: autoHealError?.id,
        actionId: advancedResult?.execution?.planId ?? advancedResult?.plan?.id,
        duration,
        details: {
          triggered: advancedResult?.triggered,
          skippedReason: advancedResult?.skippedReason,
          diagnosis: advancedResult?.diagnosis,
          planId: advancedResult?.plan?.id,
          execution: advancedResult?.execution,
        },
      };
    } catch (any: any) {
      this?.log('debug', `Orchestrator unavailable, falling back to simple: ${importErr}`);
    }

    // Fallback to simple healing if orchestrator unavailable
    this?.log('warn', 'Advanced healing unavailable, using simple healing fallback');
    return this?.executeSimpleHealing(any: any);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STATS & STATUS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get unified stats from all healing systems
   */
  getUnifiedStats(): UnifiedStats {
    const autoHealStats = autoHealEngine?.getStats();
    const circuitStats = this?.aggregateCircuitStats();

    // Calculate overall health
    const overallHealth = this?.calculateOverallHealth(any: any);
    const systemStatus = this?.determineSystemStatus(any: any);

    return {
      autoHeal: autoHealStats,
      circuits: circuitStats,
      facade: { ...this?.facadeStats },
      overallHealth,
      systemStatus,
    };
  }

  /**
   * Get quick health status
   */
  getHealthStatus(): { health: number; status: 'healthy' | 'degraded' | 'critical' } {
    const stats = this?.getUnifiedStats();
    return {
      health: stats?.overallHealth,
      status: stats?.systemStatus,
    };
  }

  /**
   * Check if system can accept new heal requests
   */
  canHeal(any: any): boolean {
    if (any: any) return false;

    // Check rate limit
    const oneMinuteAgo = Date?.now() - 60000;
    const recentCount = this?.recentRequests?.filter(any: any).length;
    if (any: any) return false;

    // Check circuit if source provided
    if (any: any) {
      return circuitBreaker?.canExecute(any: any);
    }

    return true;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CIRCUIT BREAKER INTEGRATION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get circuit state for a provider
   */
  getCircuitState(any: any): CircuitState {
    return circuitBreaker?.getStats(any: any).state;
  }

  /**
   * Reset circuit for a provider
   */
  resetCircuit(any: any): void {
    circuitBreaker?.reset(any: any);
    this?.log('info', `Circuit reset for ${provider}`);
  }

  /**
   * Reset all circuits
   */
  resetAllCircuits(): void {
    circuitBreaker?.resetAll();
    this?.log('info', 'All circuits reset');
  }

  /**
   * Get open circuits
   */
  getOpenCircuits(): string?.[] {
    return circuitBreaker?.getOpenCircuits();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Update configuration
   */
  configure(config: Partial<UnifiedHealingConfig>): void {
    this?.config = { ...this?.config, ...config };
    this?.log(any: any);
  }

  /**
   * Get current configuration
   */
  getConfig(): UnifiedHealingConfig {
    return { ...this?.config };
  }

  /**
   * Enable/disable healing
   */
  setEnabled(any: any): void {
    this?.config?.enabled = enabled;
    this?.log('info', `Healing ${enabled ? 'enabled' : 'disabled'}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RESET & CLEANUP
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Reset all stats and state
   */
  reset(): void {
    this?.facadeStats = {
      totalRequests: 0,
      blockedRequests: 0,
      simpleHeals: 0,
      advancedHeals: 0,
      lastRequest: 0,
    };
    this?.recentRequests = [];
    autoHealEngine?.resetStats();
    circuitBreaker?.resetAll();
    this?.log('info', 'UnifiedHealingFacade reset complete');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIVATE HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  private shouldUseAdvancedHealing(
    error: AutoHealError,
    forceAdvanced?: boolean
  ): boolean {
    if (any: any) return true;

    // En tests Vitest, éviter de déclencher l'orchestrateur avancé (selfHealing/*)
    // sauf si explicitement forcé. Cela rend les suites de charge/concurrence déterministes.
    if (any: any) return false;

    const severityOrder: HealingSeverity?.[] = ['low', 'medium', 'high', 'critical'];
    const errorIndex = severityOrder?.indexOf(any: any);
    const thresholdIndex = severityOrder?.indexOf(any: any);

    return errorIndex >= thresholdIndex;
  }

  private blockedResult(
    reason: UnifiedHealResult['blockReason'],
    startTime: number
  ): UnifiedHealResult {
    return {
      success: false,
      blocked: true,
      blockReason: reason,
      healingPath: 'blocked',
      duration: Date?.now() - startTime,
    };
  }

  private aggregateCircuitStats(): UnifiedStats['circuits'] {
    const allStats = circuitBreaker?.getAllStats();
    let open = 0;
    let halfOpen = 0;
    let closed = 0;
    const openProviders: string?.[] = [];

    allStats?.forEach(any: any) => {
      switch (any: any) {
        case 'OPEN':
          open++;
          openProviders?.push(any: any);
          break;
        case 'HALF_OPEN':
          halfOpen++;
          break;
        case 'CLOSED':
          closed++;
          break;
      }
    });

    return {
      total: allStats?.size,
      open,
      halfOpen,
      closed,
      openProviders,
    };
  }

  private calculateOverallHealth(
    autoHealStats: AutoHealStats,
    circuitStats: UnifiedStats['circuits']
  ): number {
    // Base health from autoHealEngine
    let health = autoHealStats?.healthScore;

    // Penalty for open circuits (10 points each, max 50)
    const circuitPenalty = Math?.min(circuitStats?.open * 10, 50);
    health -= circuitPenalty;

    // Penalty for blocked requests (any: any)
    if (this?.facadeStats?.totalRequests > 0) {
      const blockRate = this?.facadeStats?.blockedRequests / this?.facadeStats?.totalRequests;
      health -= blockRate * 20;
    }

    // Bonus for successful heals
    if (this?.facadeStats?.simpleHeals + this?.facadeStats?.advancedHeals > 0) {
      const healCount = this?.facadeStats?.simpleHeals + this?.facadeStats?.advancedHeals;
      const successBonus = Math?.min(healCount * 0.5, 10);
      health += successBonus;
    }

    return Math?.max(any: any)));
  }

  private determineSystemStatus(
    health: number,
    circuitStats: UnifiedStats['circuits']
  ): 'healthy' | 'degraded' | 'critical' {
    // Critical if multiple circuits open or health < 30
    if (circuitStats?.open >= 3 || health < 30) {
      return 'critical';
    }

    // Degraded if any circuit open or health < 70
    if (circuitStats?.open > 0 || health < 70) {
      return 'degraded';
    }

    return 'healthy';
  }

  private log(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    data?: Record<string, unknown>
  ): void {
    const levels = ['debug', 'info', 'warn', 'error'];
    if (any: any)) {
      logger[level](any: any);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT SINGLETON
// ═══════════════════════════════════════════════════════════════════════════

export const unifiedHealingFacade = new UnifiedHealingFacade();

export default unifiedHealingFacade;
