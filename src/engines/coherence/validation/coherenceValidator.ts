/**
 * TITANE∞ v20Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * CoherenceValidator - System coherence validation
 * Migrated logic from singularityKernel.ts
 */

import type {
  SystemState,
  ValidationResult,
  ValidationIssue,
  CoherenceContext,
} from '../types';

/**
 * CoherenceValidator - Validates system-wide coherence
 *
 * Checks:
 * - Engine state consistency
 * - Provider health thresholds
 * - Memory state integrity
 * - Cross-component alignment
 */
export class CoherenceValidator {
  private readonly MIN_COHERENCE_SCORE = 0.6;
  private readonly MIN_PROVIDER_HEALTH = 0.3;
  private readonly MAX_ERROR_RATE = 0.2;

  /**
   * Validate system state coherence
   */
  validate(state: SystemState): ValidationResult {
    const issues: ValidationIssue[] = [];
    const suggestions: string[] = [];
    let coherenceScore = 1.0;

    // 1. Validate engine states
    const engineIssues = this.validateEngines(state);
    issues.push(...engineIssues);
    coherenceScore -= engineIssues.length * 0.05;

    // 2. Validate provider health
    const providerIssues = this.validateProviders(state);
    issues.push(...providerIssues);
    coherenceScore -= providerIssues.length * 0.08;

    // 3. Validate memory state
    const memoryIssues = this.validateMemory(state);
    issues.push(...memoryIssues);
    coherenceScore -= memoryIssues.length * 0.03;

    // 4. Generate suggestions
    if (coherenceScore < 0.8) {
      suggestions.push('Consider triggering system healing');
    }
    if (providerIssues.length > 2) {
      suggestions.push('Multiple providers unhealthy - check network/API keys');
    }
    if (memoryIssues.length > 0) {
      suggestions.push('Memory state issues detected - consider cleanup');
    }

    // Clamp score
    coherenceScore = Math.max(0, Math.min(1, coherenceScore));

    return {
      valid:
        coherenceScore >= this.MIN_COHERENCE_SCORE &&
        issues.filter(i => i.severity === 'error').length === 0,
      coherenceScore,
      issues,
      suggestions,
    };
  }

  /**
   * Enforce coherence constraints
   */
  enforce(context: CoherenceContext): void {
    // Log enforcement for debugging
    console.log('[CoherenceValidator] Enforcing coherence:', {
      mode: context.mode,
      constraints: context.constraints?.length ?? 0,
    });

    // In strict mode, throw on violations
    if (context.mode === 'strict' && context.constraints) {
      for (const constraint of context.constraints) {
        if (!this.validateConstraint(constraint)) {
          throw new Error(`Coherence constraint violation: ${constraint.type}`);
        }
      }
    }
  }

  /**
   * Validate engine states
   */
  private validateEngines(state: SystemState): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    state.engines.forEach((engine, id) => {
      // Check for error state
      if (engine.status === 'error') {
        issues.push({
          severity: 'error',
          code: 'ENGINE_ERROR',
          message: `Engine ${id} is in error state`,
          source: id,
        });
      }

      // Check for stale engines (no activity in 5 minutes)
      const staleThreshold = 5 * 60 * 1000;
      if (
        engine.status === 'active' &&
        Date.now() - engine.lastActivity > staleThreshold
      ) {
        issues.push({
          severity: 'warning',
          code: 'ENGINE_STALE',
          message: `Engine ${id} has no recent activity`,
          source: id,
        });
      }

      // Check error rate
      if (engine.metrics.requestCount > 0) {
        const errorRate = engine.metrics.errorCount / engine.metrics.requestCount;
        if (errorRate > this.MAX_ERROR_RATE) {
          issues.push({
            severity: 'warning',
            code: 'ENGINE_HIGH_ERROR_RATE',
            message: `Engine ${id} has high error rate: ${(errorRate * 100).toFixed(1)}%`,
            source: id,
          });
        }
      }
    });

    return issues;
  }

  /**
   * Validate provider health
   */
  private validateProviders(state: SystemState): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    state.providers.forEach((provider, id) => {
      // Check health threshold
      if (provider.health < this.MIN_PROVIDER_HEALTH) {
        issues.push({
          severity: 'error',
          code: 'PROVIDER_UNHEALTHY',
          message: `Provider ${id} health is critically low: ${(provider.health * 100).toFixed(0)}%`,
          source: id,
        });
      } else if (provider.health < 0.6) {
        issues.push({
          severity: 'warning',
          code: 'PROVIDER_DEGRADED',
          message: `Provider ${id} health is degraded: ${(provider.health * 100).toFixed(0)}%`,
          source: id,
        });
      }

      // Check availability
      if (!provider.available) {
        issues.push({
          severity: 'warning',
          code: 'PROVIDER_UNAVAILABLE',
          message: `Provider ${id} is currently unavailable`,
          source: id,
        });
      }

      // Check latency (>5s is concerning)
      if (provider.latency > 5000) {
        issues.push({
          severity: 'warning',
          code: 'PROVIDER_HIGH_LATENCY',
          message: `Provider ${id} has high latency: ${provider.latency}ms`,
          source: id,
        });
      }
    });

    return issues;
  }

  /**
   * Validate memory state
   */
  private validateMemory(state: SystemState): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Check STM overflow
    if (state.memory.stmCount > 20) {
      issues.push({
        severity: 'warning',
        code: 'MEMORY_STM_OVERFLOW',
        message: 'Short-term memory exceeds recommended limit',
        source: 'memory',
      });
    }

    // Check total memory size (500MB warning)
    if (state.memory.totalSize > 500 * 1024 * 1024) {
      issues.push({
        severity: 'warning',
        code: 'MEMORY_HIGH_USAGE',
        message: `Memory usage is high: ${(state.memory.totalSize / 1024 / 1024).toFixed(0)}MB`,
        source: 'memory',
      });
    }

    return issues;
  }

  /**
   * Validate a single constraint
   */
  private validateConstraint(constraint: { type: string; value: unknown }): boolean {
    switch (constraint.type) {
      case 'tone':
        return typeof constraint.value === 'string';
      case 'topic':
        return typeof constraint.value === 'string';
      case 'length':
        return typeof constraint.value === 'number' && constraint.value > 0;
      case 'format':
        return typeof constraint.value === 'string';
      default:
        return true;
    }
  }
}
