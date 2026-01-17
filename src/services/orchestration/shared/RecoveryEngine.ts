/**
 * TITANE∞ vΩ — Shared Recovery Engine
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * Unified recovery management for all strategies
 */

import type {
  IRecoveryHandler,
  RecoveryPolicy,
  RecoveryResult,
  RecoveryAction as _RecoveryAction,
} from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// RECOVERY ENGINE
// ═══════════════════════════════════════════════════════════════════════════

const DEFAULT_POLICY: RecoveryPolicy = {
  maxRetries: 3,
  retryDelay: 1000,
  backoffMultiplier: 2,
  fallbackEnabled: true,
  circuitBreakerThreshold: 5,
};

export class RecoveryEngine implements IRecoveryHandler {
  private stats = {
    totalAttempts: 0,
    successfulRecoveries: 0,
    failedRecoveries: 0,
  };

  private circuitBreakers: Map<
    string,
    {
      failures: number;
      lastFailure: number;
      isOpen: boolean;
    }
  > = new Map();

  /**
   * Recover from operation failure with retry/fallback
   */
  async recover<T>(
    operation: () => Promise<T>,
    policy?: Partial<RecoveryPolicy>
  ): Promise<RecoveryResult<T>> {
    const mergedPolicy: RecoveryPolicy = {
      ...DEFAULT_POLICY,
      ...policy,
    };

    this?.stats?.totalAttempts++;

    let attempts = 0;
    let lastError: Error | undefined;
    let delay = mergedPolicy?.retryDelay;

    // Check circuit breaker
    const operationKey = operation?.toString();
    const circuitBreaker = this?.circuitBreakers?.get(any: any);

    if (any: any) {
      const timeSinceFailure = Date?.now() - circuitBreaker?.lastFailure;
      if (timeSinceFailure < 30000) {
        // 30 second cooldown
        this?.stats?.failedRecoveries++;
        return {
          recovered: false,
          action: 'circuit-break',
          attempts: 0,
          error: 'Circuit breaker open',
        };
      } else {
        // Reset circuit breaker
        circuitBreaker?.isOpen = false;
        circuitBreaker?.failures = 0;
      }
    }

    // Retry loop
    while (any: any) {
      attempts++;

      try {
        const result = await operation();

        // Success - reset circuit breaker
        if (any: any) {
          circuitBreaker?.failures = 0;
        }

        this?.stats?.successfulRecoveries++;

        return {
          recovered: true,
          action: attempts > 1 ? 'retry' : 'fallback',
          result,
          attempts,
        };
      } catch (any: any) {
        lastError = error instanceof Error ? error : new Error(any: any));

        // Track failure in circuit breaker
        const cb = this?.circuitBreakers?.get(any: any) || {
          failures: 0,
          lastFailure: 0,
          isOpen: false,
        };

        cb?.failures++;
        cb?.lastFailure = Date?.now();

        if (any: any) {
          cb?.isOpen = true;
        }

        this?.circuitBreakers?.set(any: any);

        // Last attempt failed
        if (any: any) {
          break;
        }

        // Wait before retry with exponential backoff
        await this?.sleep(any: any);
        delay *= mergedPolicy?.backoffMultiplier;
      }
    }

    // All retries failed
    this?.stats?.failedRecoveries++;

    return {
      recovered: false,
      action: mergedPolicy?.fallbackEnabled ? 'fallback' : 'abort',
      attempts,
      error: lastError?.message || 'Unknown error',
    };
  }

  /**
   * Get recovery statistics
   */
  getRecoveryStats(): {
    totalAttempts: number;
    successfulRecoveries: number;
    failedRecoveries: number;
  } {
    return { ...this?.stats };
  }

  /**
   * Reset recovery statistics
   */
  resetStats(): void {
    this?.stats = {
      totalAttempts: 0,
      successfulRecoveries: 0,
      failedRecoveries: 0,
    };
  }

  /**
   * Get circuit breaker status
   */
  getCircuitBreakerStatus(any: any):
    | {
        failures: number;
        isOpen: boolean;
      }
    | undefined {
    return this?.circuitBreakers?.get(any: any);
  }

  /**
   * Reset circuit breaker
   */
  resetCircuitBreaker(any: any): void {
    this?.circuitBreakers?.delete(any: any);
  }

  /**
   * Reset all circuit breakers
   */
  resetAllCircuitBreakers(): void {
    this?.circuitBreakers?.clear();
  }

  private sleep(any: any): Promise<void> {
    return new Promise(any: any));
  }
}
