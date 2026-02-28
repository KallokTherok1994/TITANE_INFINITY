import { describe, expect, it } from 'vitest';

import { ResilienceEngine, type ExecutionRequest } from '../resilienceEngine';

function request(overrides?: Partial<ExecutionRequest>): ExecutionRequest {
  return {
    requestId: 'req-1',
    lane: 'provider',
    nowMs: 1000,
    attempt: 0,
    ...overrides,
  };
}

describe('ResilienceEngine', () => {
  it('enforces timeout and bounded retries with backoff', () => {
    const engine = new ResilienceEngine();

    const firstAttempt = engine.begin(request({ attempt: 0 }));
    const secondAttempt = engine.begin(request({ requestId: 'req-2', attempt: 1 }));
    const thirdAttempt = engine.begin(request({ requestId: 'req-3', attempt: 2 }));

    expect(firstAttempt.allowed).toBe(true);
    expect(firstAttempt.timeoutMs).toBeGreaterThan(0);
    expect(firstAttempt.retryAllowed).toBe(true);
    expect(secondAttempt.nextBackoffMs).toBeGreaterThan(firstAttempt.nextBackoffMs);
    expect(thirdAttempt.retryAllowed).toBe(false);
  });

  it('enforces bulkheads limits by lane', () => {
    const engine = new ResilienceEngine({
      bulkheads: {
        provider: { lane: 'provider', maxInFlight: 1 },
        tools: { lane: 'tools', maxInFlight: 1 },
        memory: { lane: 'memory', maxInFlight: 1 },
      },
    });

    const firstPlan = engine.begin(request({ requestId: 'bulk-1' }));
    const secondPlan = engine.begin(request({ requestId: 'bulk-2' }));

    expect(firstPlan.allowed).toBe(true);
    expect(secondPlan.allowed).toBe(false);
    expect(secondPlan.reasons).toContain('BULKHEAD_LIMIT_REACHED');
  });

  it('opens breaker after threshold and blocks until cooldown', () => {
    const engine = new ResilienceEngine();

    engine.complete(request({ requestId: 'f1', nowMs: 1000 }), false, 'TIMEOUT');
    engine.complete(request({ requestId: 'f2', nowMs: 1500 }), false, 'TIMEOUT');
    const stateAfterThirdFail = engine.complete(
      request({ requestId: 'f3', nowMs: 2000 }),
      false,
      'TIMEOUT'
    );

    expect(stateAfterThirdFail.open).toBe(true);

    const blockedPlan = engine.begin(request({ requestId: 'blocked', nowMs: 2500 }));
    expect(blockedPlan.allowed).toBe(false);
    expect(blockedPlan.reasons).toContain('BREAKER_OPEN');

    const reopenedPlan = engine.begin(
      request({ requestId: 'cooldown-ok', nowMs: 23001 })
    );
    expect(reopenedPlan.allowed).toBe(true);
  });

  it('does not allow infinite retry loops', () => {
    const engine = new ResilienceEngine();

    for (let attemptIndex = 0; attemptIndex <= 6; attemptIndex += 1) {
      const plan = engine.begin(
        request({
          requestId: `retry-${attemptIndex}`,
          attempt: attemptIndex,
          nowMs: 3000 + attemptIndex * 10,
        })
      );

      if (attemptIndex >= 2) {
        expect(plan.retryAllowed).toBe(false);
      }
    }
  });
});
