/**
 * 🧪 TITANE∞ UnifiedHealingFacade — Tests P1
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('@/services/selfHealing', () => {
  return {
    selfHealingEngine: {
      getState: () => ({ initialized: true }),
      initialize: vi.fn(async () => {}),
      triggerHeal: vi.fn(async () => ({
        triggered: true,
        skippedReason: null,
        diagnosis: { summary: 'mock-diagnosis' },
        plan: { id: 'plan_mock_1' },
        execution: { status: 'success', planId: 'plan_mock_1' },
      })),
    },
  };
});

import { unifiedHealingFacade } from '../unifiedHealingFacade';
import { autoHealEngine } from '../autoHealEngine';
import { circuitBreaker } from '../circuitBreaker';

describe('UnifiedHealingFacade', () => {
  beforeEach(() => {
    unifiedHealingFacade.configure({
      enabled: true,
      useCircuitBreaker: false,
      maxHealsPerMinute: 30,
      advancedThreshold: 'high',
      logLevel: 'error',
    });
    autoHealEngine.resetStats();
    circuitBreaker.resetAll();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('should block when disabled', async () => {
    unifiedHealingFacade.configure({ enabled: false });

    const result = await unifiedHealingFacade.heal({
      source: 'test-provider',
      error: 'boom',
      type: 'validation',
    });

    expect(result.blocked).toBe(true);
    expect(result.healingPath).toBe('blocked');
    expect(result.blockReason).toBe('disabled');
  });

  test('should block when rate-limited', async () => {
    unifiedHealingFacade.configure({ enabled: true, maxHealsPerMinute: 0 });

    const result = await unifiedHealingFacade.heal({
      source: 'test-provider',
      error: 'boom',
      type: 'validation',
    });

    expect(result.blocked).toBe(true);
    expect(result.healingPath).toBe('blocked');
    expect(result.blockReason).toBe('rate-limited');
  });

  test('should perform simple healing and await action', async () => {
    vi.useFakeTimers();

    const promise = unifiedHealingFacade.heal({
      source: 'test-provider',
      error: new Error('timeout'),
      type: 'timeout',
    });

    // Le pipeline interne utilise des timeouts simulés (200-1000ms) selon l'action.
    await vi.advanceTimersByTimeAsync(2000);

    const result = await promise;

    expect(result.blocked).toBe(false);
    expect(result.healingPath).toBe('simple');
    expect(result.errorId).toBeDefined();
    expect(result.actionId).toBeDefined();
    expect(typeof result.duration).toBe('number');
  });

  test('should perform advanced healing when forced', async () => {
    unifiedHealingFacade.configure({ useCircuitBreaker: false, enabled: true });

    const result = await unifiedHealingFacade.forceAdvancedHeal(
      'test-provider',
      new Error('boom'),
      { test: 'advanced-path' }
    );

    expect(result.blocked).toBe(false);
    expect(result.healingPath).toBe('advanced');
    expect(result.success).toBe(true);
    expect(result.actionId).toBeDefined();
  });
});
